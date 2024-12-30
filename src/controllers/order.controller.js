import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import cartModel from "../models/cart.model";
import orderModel from "../models/order.model";
import orderDetailModel from "../models/order-detail.model";
import orderRoomModel from "../models/order-room.model";
import { ORDER_STATUS, ORDER_TYPE } from "../config/constant";
import { getBillNotify, getOrderSuccessNotify } from "../helpers/emailTemplate";
import { sendMail } from "../helpers/sendMail";
import { calculateRoomPrice } from "../helpers/calculatePrice";

// Chỉ định nghĩa PAYMENT_STATUS
const PAYMENT_STATUS = {
  UNPAID: 0,
  PAID: 1,
  FAILED: 2
};

// Hàm kiểm tra xung đột thời gian
const checkRoomTimeConflict = async (connection, roomId, startTime, endTime, excludeOrderId = null) => {
  let query = `
    SELECT rod.* 
    FROM room_order_detail rod
    JOIN orders o ON rod.order_id = o.id
    WHERE rod.room_id = ?
    AND o.status NOT IN ('CANCELLED', 'COMPLETED')
    AND (
      (? < rod.end_time AND ? > rod.start_time)
      OR
      (? < rod.end_time AND ? > rod.start_time)
      OR
      (? <= rod.start_time AND ? >= rod.end_time)
    )
  `;
  
  const params = [roomId, startTime, startTime, endTime, endTime, startTime, endTime];
  
  if (excludeOrderId) {
    query += ' AND rod.order_id != ?';
    params.push(excludeOrderId);
  }

  const [conflicts] = await connection.query(query, params);
  return conflicts;
};

export const getAll = async (req, res) => {
  try {
    const { query } = req;

    const { isPagination, ...pagination } = await getPagination(
      orderModel,
      query
    );

    const queryWithOrder = {
      ...query,
      orderBy: "created_at DESC"
    };

    const product = await orderModel.read(queryWithOrder, isPagination);

    const data = {
      message: "Lấy danh sách thành công.",
      data: product,
      pagination,
    };
    responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const create = async (req, res) => {
  const connection = await orderModel.connection.promise();
  await connection.beginTransaction();

  try {
    const { rooms, products, username, email, payment_method, ...remainBody } = req.body;
    
    // Kiểm tra xung đột thời gian cho tất cả các phòng
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        const conflicts = await checkRoomTimeConflict(
          connection,
          room.room_id,
          room.start_time,
          room.end_time
        );

        if (conflicts.length > 0) {
          await connection.rollback();
          return responseError(res, {
            message: `Phòng ${room.room_name || room.room_id} đã được đặt trong khoảng thời gian này`,
            conflicts: conflicts
          });
        }
      }
    }

    // Tạo order với trạng thái phù hợp dựa vào phương thức thanh toán
    const orderStatus = payment_method === 2 ? 'PENDING_PAYMENT' : 'CONFIRMED';
    const paymentStatus = payment_method === 2 ? 'UNPAID' : 'PAID';

    // Tạo đơn hàng mới
    const result = await orderModel.create({
      ...remainBody,
      status: orderStatus,
      payment_status: paymentStatus,
      payment_method: payment_method
    });

    const order_id = result?.insertId;
    let totalOrderPrice = 0;

    // 1. Xử lý đặt phòng
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        try {
          // Lấy thông tin phòng và user
          const [roomInfo] = await connection.query(`
            SELECT price, room_name FROM room WHERE id = ?
          `, [room.room_id]);

          if (!roomInfo.length) {
            throw new Error(`Không tìm thấy phòng với ID ${room.room_id}`);
          }

          // Tính giá phòng
          const { totalHours, totalPrice } = calculateRoomPrice({
            startTime: room.start_time,
            endTime: room.end_time,
            roomPrice: roomInfo[0].price
          });

          totalOrderPrice += totalPrice;

          // Lưu chi tiết đặt phòng
          await connection.query(`
            INSERT INTO room_order_detail 
            (order_id, room_id, start_time, end_time, total_time, total_price)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            order_id,
            room.room_id,
            room.start_time,
            room.end_time,
            totalHours,
            totalPrice
          ]);
        } catch (error) {
          await connection.rollback();
          return responseError(res, {
            message: `Lỗi khi xử lý phòng: ${error.message}`
          });
        }
      }
    }

    // 2. Xử lý đặt sản phẩm
    if (products && products.length > 0) {
      for (const product of products) {
        const [productInfo] = await connection.query(
          'SELECT price FROM product WHERE id = ?',
          [product.product_id]
        );

        if (!productInfo.length) {
          await connection.rollback();
          return responseError(res, {
            message: `Không tìm thấy sản phẩm với ID ${product.product_id}`
          });
        }

        const productPrice = productInfo[0].price * product.quantity;
        totalOrderPrice += productPrice;

        await connection.query(`
          INSERT INTO order_detail 
          (order_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
        `, [
          order_id,
          product.product_id,
          product.quantity,
          productInfo[0].price
        ]);
      }
    }

    // 3. Cập nhật tổng tiền
    await connection.query(
      'UPDATE orders SET total_money = ? WHERE id = ?',
      [totalOrderPrice, order_id]
    );

    await connection.commit();

    // Gửi email
    const sendEmail = {
      order_id,
      username,
      total: totalOrderPrice,
      email
    };
    await sendMail(getOrderSuccessNotify(sendEmail));

    // Trả về response với thông tin đầy đủ
    return responseSuccess(res, {
      message: "Tạo mới hóa đơn thành công",
      data: {
        insertId: result.insertId,
        order_id: result.insertId,
        total_money: totalOrderPrice,
        status: orderStatus,
        payment_status: paymentStatus,
        payment_method: payment_method
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Create order error:", error);
    return responseError(res, error);
  }
};

export const getDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [orders] = await orderModel.connection.promise().query(`
      SELECT 
        o.id as order_id,
        o.order_date,
        o.status as order_status,
        o.total_money as total_amount,
        
        u.username,
        u.email,
        u.is_vip,
        u.vip_end_date,
        
        rod.id as order_detail_id,
        rod.room_id,
        r.room_name,
        rod.start_time,
        rod.end_time,
        rod.total_time,
        rod.total_price,
        
        p.product_name,
        p.price as unit_price,
        od.quantity,
        od.price as product_total_price,
        c.category_name as category
      FROM orders o
      LEFT JOIN user u ON o.user_id = u.id 
      LEFT JOIN room_order_detail rod ON o.id = rod.order_id
      LEFT JOIN room r ON rod.room_id = r.id
      LEFT JOIN order_detail od ON o.id = od.order_id
      LEFT JOIN product p ON od.product_id = p.id
      LEFT JOIN category c ON p.category_id = c.id
      WHERE o.id = ?
    `, [id]);

    if (!orders.length) {
      return responseError(res, { message: "Không tìm thấy đơn hàng" });
    }

    const firstOrder = orders[0];
    const data = {
      order_id: firstOrder.order_id,
      order_date: firstOrder.order_date,
      order_status: firstOrder.order_status,
      total_amount: firstOrder.total_amount,
      user: {
        username: firstOrder.username,
        email: firstOrder.email,
        is_vip: firstOrder.is_vip,
        vip_end_date: firstOrder.vip_end_date
      },
      products: orders
        .filter(order => order.product_name)
        .map(order => ({
          product_name: order.product_name,
          unit_price: order.unit_price,
          quantity: order.quantity,
          total_price: order.product_total_price,
          category: order.category
        })),
      rooms: orders
        .filter(order => order.room_id)
        .map(order => ({
          id: order.order_detail_id,
          room_id: order.room_id,
          room_name: order.room_name,
          start_time: order.start_time,
          end_time: order.end_time,
          total_time: order.total_time,
          total_price: order.total_price
        }))
    };

    return responseSuccess(res, {
      message: "Lấy dữ liệu thành công",
      data: data
    });

  } catch (error) {
    console.error("Get order detail error:", error);
    return responseError(res, error);
  }
};

export const getDetailByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await orderModel.connection.promise();

    // Query lấy thông tin đơn hàng và sản phẩm
    const [results] = await connection.query(`
      SELECT 
        o.*,
        u.username, u.email, u.phone, u.is_vip,
        od.id as order_detail_id,
        od.quantity as order_quantity,
        od.price as order_detail_price,
        p.id as product_id,
        p.product_name,
        p.image_url as product_image_url,
        p.description as product_description,
        c.category_name,
        r.id as room_order_detail_id,
        r.room_id,
        rm.room_name,
        rm.image_url as room_image_url,
        rm.status as room_status,
        rm.position as room_position,
        r.start_time,
        r.end_time,
        r.total_time,
        r.total_price as room_total_price
      FROM orders o
      LEFT JOIN user u ON o.user_id = u.id
      LEFT JOIN order_detail od ON o.id = od.order_id
      LEFT JOIN product p ON od.product_id = p.id
      LEFT JOIN category c ON p.category_id = c.id
      LEFT JOIN room_order_detail r ON o.id = r.order_id
      LEFT JOIN room rm ON r.room_id = rm.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [id]);

    // Format lại response
    const orders = results.reduce((acc, row) => {
      const orderIndex = acc.findIndex(o => o.id === row.id);
      
      if (orderIndex === -1) {
        // Tạo order mới
        const newOrder = {
          id: row.id,
          order_date: row.order_date,
          order_status: row.status,
          total_money: row.total_money,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          description: row.description,
          order_details: [],
          room_order_details: []
        };

        // Thêm product detail nếu có
        if (row.order_detail_id) {
          newOrder.order_details.push({
            id: row.order_detail_id,
            product_id: row.product_id,
            product_name: row.product_name,
            image_url: row.product_image_url,
            description: row.product_description,
            category: row.category_name,
            quantity: row.order_quantity,
            price: row.order_detail_price
          });
        }

        // Thêm room detail nếu có
        if (row.room_order_detail_id) {
          newOrder.room_order_details.push({
            id: row.room_order_detail_id,
            room_id: row.room_id,
            room_name: row.room_name,
            image_url: row.room_image_url,
            room_status: row.room_status,
            room_position: row.room_position,
            room_description: row.room_description,
            start_time: row.start_time,
            end_time: row.end_time,
            total_time: row.total_time,
            total_price: row.room_total_price
          });
        }

        acc.push(newOrder);
      } else {
        // Order đã tồn tại, thêm details nếu chưa có
        if (row.order_detail_id && !acc[orderIndex].order_details.find(d => d.id === row.order_detail_id)) {
          acc[orderIndex].order_details.push({
            id: row.order_detail_id,
            product_id: row.product_id,
            product_name: row.product_name,
            image_url: row.product_image_url,
            description: row.product_description,
            category: row.category_name,
            quantity: row.order_quantity,
            price: row.order_detail_price
          });
        }

        if (row.room_order_detail_id && !acc[orderIndex].room_order_details.find(d => d.id === row.room_order_detail_id)) {
          acc[orderIndex].room_order_details.push({
            id: row.room_order_detail_id,
            room_id: row.room_id,
            room_name: row.room_name,
            image_url: row.room_image_url,
            room_status: row.room_status,
            room_position: row.room_position,
            room_description: row.room_description,
            start_time: row.start_time,
            end_time: row.end_time,
            total_time: row.total_time,
            total_price: row.room_total_price
          });
        }
      }

      return acc;
    }, []);

    return responseSuccess(res, {
      message: "Lấy danh sách đơn hàng thành công",
      data: orders
    });

  } catch (error) {
    console.error("Get orders error:", error);
    return responseError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const {status} = body
    const updatedCategory = await orderModel.update("id", id, {status});
    const response = {
      message: "Cập nhật dữ liệu thành công",
      data: updatedCategory,
    };

    if(body.status ==="CANCELLED"){
      const resp = await sendMail(getBillNotify(body));
    }
    return responseSuccess(res, response);
  } catch (error) {
    return responseError(res, error);
  }
};

export const findById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await orderModel.findOne({ id });

    if (!category) {
      return responseNotFound(res);
    }

    const data = {
      message: "Lấy dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await orderModel.delete(id);
    const data = {
      message: "Xóa dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const statisticProductOrder = async (req, res) => {
  try {
    const response = await orderModel.statisticProduct();
    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const statisticRoomOrder = async (req, res) => {
  try {
    const response = await orderModel.statisticRoom();
    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const statisticTotalPrice = async (req, res) => {
  try {
    const body = req.body;
    const response = await orderModel.statisticTotalPrice(body?.startDate,body?.endDate);
    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const detailOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const query = `
      SELECT 
        o.id AS order_id,
        o.created_at as order_date,
        o.status AS order_status,
        o.total_money AS total_amount,  -- total amount of the order
        o.status,  -- payment status of the order
        
        u.username,
        u.email,
        u.is_vip,
        u.vip_end_date,
        
        p.product_name,
        p.price AS unit_price,  -- unit price of the product
        od.quantity AS product_quantity,
        (od.quantity * p.price) AS product_total_price,
        c.category_name AS product_category,

        r.room_name,
        rod.start_time AS room_start_time,
        rod.end_time AS room_end_time,
        rod.total_time AS room_total_time,
        rod.total_price AS room_total_price  -- total price for the room

      FROM orders o
      JOIN \`user\` u ON o.user_id = u.id
      LEFT JOIN order_detail od ON o.id = od.order_id
      LEFT JOIN product p ON od.product_id = p.id
      LEFT JOIN category c ON p.category_id = c.id
      LEFT JOIN room_order_detail rod ON o.id = rod.order_id
      LEFT JOIN room r ON rod.room_id = r.id

      WHERE o.id = ?;
    `;

    const [rows] = await orderModel.connection
      .promise()
      .query(query, [orderId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const response = {
      order_id: rows[0].order_id,
      order_date: rows[0].order_date,
      order_status: rows[0].order_status,
      total_amount: rows[0].total_amount,
      payment_status: rows[0].payment_status, // Add payment status
      user: {
        username: rows[0].username,
        email: rows[0].email,
        is_vip: rows[0].is_vip,
        vip_end_date: rows[0].vip_end_date,
      },
      products: rows
        .filter((row) => row.product_name)
        .map((row) => ({
          product_name: row.product_name,
          unit_price: row.unit_price, // Ensure unit price is included
          quantity: row.product_quantity,
          total_price: row.product_total_price,
          category: row.product_category,
        })),
      rooms: rows
        .filter((row) => row.room_name)
        .map((row) => ({
          room_name: row.room_name,
          start_time: row.room_start_time,
          end_time: row.room_end_time,
          total_time: row.room_total_time,
          total_price: row.room_total_price, // Ensure room total price is included
        })),
    };

    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
    };
    return responseSuccess(res, data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "An error occurred", error });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await orderModel.connection.promise();

    const [results] = await connection.query(`
      SELECT 
        o.id as order_id,
        o.total_money,
        o.order_date,
        o.status as order_status,
        o.payment_method,
        o.payment_status,
        o.description as order_description,
        
        -- User info
        u.username,
        u.email,
        u.phone,
        u.is_vip,
        
        -- Product details
        od.id as order_detail_id,
        od.quantity as order_quantity,
        od.price as order_detail_price,
        p.id as product_id,
        p.product_name,
        p.image_url as product_image,
        p.description as product_description,
        c.category_name,
        
        -- Room details
        rod.id as room_order_detail_id,
        rod.room_id,
        rod.start_time,
        rod.end_time,
        rod.total_time,
        rod.total_price as room_total_price,
        r.room_name,
        r.image_url as room_image,
        r.status as room_status,
        r.position as room_position
        
      FROM orders o
      LEFT JOIN user u ON o.user_id = u.id
      LEFT JOIN order_detail od ON o.id = od.order_id
      LEFT JOIN product p ON od.product_id = p.id
      LEFT JOIN category c ON p.category_id = c.id
      LEFT JOIN room_order_detail rod ON o.id = rod.order_id
      LEFT JOIN room r ON rod.room_id = r.id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
    `, [id]);

    const orders = results.reduce((acc, row) => {
      const orderIndex = acc.findIndex(o => o.id === row.order_id);
      
      if (orderIndex === -1) {
        // Tạo order mới
        const newOrder = {
          id: row.order_id,
          total_money: row.total_money,
          order_date: row.order_date,
          order_status: row.order_status,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          description: row.order_description,
          user: {
            username: row.username,
            email: row.email,
            phone: row.phone,
            is_vip: row.is_vip
          },
          order_details: [],
          room_order_details: []
        };

        if (row.order_detail_id) {
          newOrder.order_details.push({
            id: row.order_detail_id,
            product_id: row.product_id,
            product_name: row.product_name,
            product_image: row.product_image,
            description: row.product_description,
            category: row.category_name,
            quantity: row.order_quantity,
            price: row.order_detail_price
          });
        }

        if (row.room_order_detail_id) {
          newOrder.room_order_details.push({
            id: row.room_order_detail_id,
            room_id: row.room_id,
            room_name: row.room_name,
            room_image: row.room_image,
            room_status: row.room_status,
            room_position: row.room_position,
            start_time: row.start_time,
            end_time: row.end_time,
            total_time: row.total_time,
            total_price: row.room_total_price
          });
        }

        acc.push(newOrder);
      } else {
        // Thêm details vào order đã tồn tại
        if (row.order_detail_id && !acc[orderIndex].order_details.find(d => d.id === row.order_detail_id)) {
          acc[orderIndex].order_details.push({
            id: row.order_detail_id,
            product_id: row.product_id,
            product_name: row.product_name,
            product_image: row.product_image,
            description: row.product_description,
            category: row.category_name,
            quantity: row.order_quantity,
            price: row.order_detail_price
          });
        }

        if (row.room_order_detail_id && !acc[orderIndex].room_order_details.find(d => d.id === row.room_order_detail_id)) {
          acc[orderIndex].room_order_details.push({
            id: row.room_order_detail_id,
            room_id: row.room_id,
            room_name: row.room_name,
            room_image: row.room_image,
            room_status: row.room_status,
            room_position: row.room_position,
            start_time: row.start_time,
            end_time: row.end_time,
            total_time: row.total_time,
            total_price: row.room_total_price
          });
        }
      }

      return acc;
    }, []);

    return responseSuccess(res, {
      message: "Lấy danh sách đơn hàng thành công",
      data: orders
    });

  } catch (error) {
    console.error("Get orders error:", error);
    return responseError(res, error);
  }
};

export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await orderModel.connection.promise();

    // Query lấy thông tin đơn hàng và user
    const [orders] = await connection.query(`
      SELECT o.*, 
        u.username, 
        u.email,
        u.phone,
        u.is_vip, 
        u.vip_end_date
      FROM orders o
      LEFT JOIN user u ON o.user_id = u.id 
      WHERE o.id = ?
    `, [id]);

    // Query lấy thông tin sản phẩm
    const [products] = await connection.query(`
      SELECT 
        od.id,
        od.quantity,
        od.price as unit_price,
        p.product_name,
        p.image_url,
        c.category_name as category,
        (od.quantity * od.price) as total_price
      FROM order_detail od
      JOIN product p ON od.product_id = p.id
      LEFT JOIN category c ON p.category_id = c.id
      WHERE od.order_id = ?
    `, [id]);

    // Query lấy thông tin phòng
    const [rooms] = await connection.query(`
      SELECT 
        rod.id,
        rod.room_id,
        r.room_name,
        rod.start_time,
        rod.end_time,
        rod.total_time,
        rod.total_price
      FROM room_order_detail rod
      JOIN room r ON rod.room_id = r.id
      WHERE rod.order_id = ?
    `, [id]);

    if (!orders.length) {
      return responseError(res, { message: "Không tìm thấy đơn hàng" });
    }

    const response = {
      order_id: orders[0].id,
      order_date: orders[0].order_date,
      order_status: orders[0].status,
      total_amount: orders[0].total_money,
      payment_method: orders[0].payment_method,
      payment_status: orders[0].payment_status,
      description: orders[0].description,
      user: {
        username: orders[0].username,
        email: orders[0].email,
        phone: orders[0].phone,
        is_vip: orders[0].is_vip,
        vip_end_date: orders[0].vip_end_date
      },
      rooms: rooms.map(room => ({
        id: room.id,
        room_id: room.room_id,
        room_name: room.room_name,
        start_time: room.start_time,
        end_time: room.end_time,
        total_time: room.total_time,
        total_price: room.total_price
      })),
      products: products.map(product => ({
        id: product.id,
        product_name: product.product_name,
        image_url: product.image_url,
        category: product.category,
        quantity: Number(product.quantity),
        price: Number(product.unit_price),
        total_price: Number(product.total_price)
      }))
    };

    return responseSuccess(res, {
      message: "Lấy dữ liệu thành công",
      data: response
    });

  } catch (error) {
    console.error("Get order detail error:", error);
    return responseError(res, error);
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, isPagination = false } = req.query;
    const offset = (page - 1) * limit;

    // Sửa lại query để tính tổng tiền chính xác
    const query = `
      SELECT 
        o.*,
        u.fullname as user_name,
        u.email as user_email,
        (
          SELECT SUM(rod.total_price)
          FROM room_order_detail rod
          WHERE rod.order_id = o.id
        ) + COALESCE(
          (
            SELECT SUM(od.price * od.quantity)
            FROM order_detail od
            WHERE od.order_id = o.id
          ), 0
        ) as calculated_total
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC, o.id DESC
      ${isPagination === 'true' ? `LIMIT ${limit} OFFSET ${offset}` : ''}
    `;

    const [orders] = await orderModel.connection.promise().query(query);

    // Cập nhật total_money nếu khác với calculated_total
    for (const order of orders) {
      if (order.total_money !== order.calculated_total) {
        await orderModel.connection.promise().query(
          'UPDATE orders SET total_money = ? WHERE id = ?',
          [order.calculated_total, order.id]
        );
        order.total_money = order.calculated_total;
      }
    }

    // Tính toán phân trang nếu cần
    let totalItems;
    if (isPagination === 'true') {
      const [countResult] = await orderModel.connection.promise().query(
        'SELECT COUNT(*) as total FROM orders'
      );
      totalItems = countResult[0].total;
    }

    return responseSuccess(res, {
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
      pagination: isPagination === 'true' ? {
        totalPage: Math.ceil(totalItems / limit),
        currentPage: +page,
        pageSize: +limit,
        totalRow: totalItems
      } : undefined
    });

  } catch (error) {
    console.error("Get all orders error:", error);
    return responseError(res, error);
  }
};

export const extendRoomTime = async (req, res) => {
  const connection = await orderModel.connection.promise();
  await connection.beginTransaction();

  try {
    const { room_order_id, order_id, additional_hours } = req.body;
    console.log('Received extend request:', req.body);

    // Kiểm tra và lấy thông tin đặt phòng
    const [orderDetails] = await connection.query(
      `SELECT rod.*, r.price as room_price, o.status as order_status, 
              o.payment_status, r.room_name
       FROM room_order_detail rod
       JOIN orders o ON rod.order_id = o.id
       JOIN room r ON rod.room_id = r.id
       WHERE rod.id = ? AND o.id = ?`,
      [room_order_id, order_id]
    );
    console.log('Order details:', orderDetails);

    if (!orderDetails.length) {
      await connection.rollback();
      return responseError(res, { message: "Không tìm thấy thông tin đặt phòng" });
    }

    const orderDetail = orderDetails[0];

    // Tính thời gian mới
    const currentEndTime = new Date(orderDetail.end_time);
    const newEndTime = new Date(currentEndTime.getTime() + (additional_hours * 60 * 60 * 1000));

    // Kiểm tra xung đột thời gian
    const conflicts = await checkRoomTimeConflict(
      connection,
      orderDetail.room_id,
      currentEndTime,
      newEndTime,
      order_id
    );

    if (conflicts.length > 0) {
      await connection.rollback();
      return responseError(res, { 
        message: "Phòng đã được đặt trong khoảng thời gian này",
        conflicts 
      });
    }

    // Tính giá gia hạn
    const additionalPrice = additional_hours * orderDetail.room_price;

    // Tạo yêu cầu gia hạn
    const [result] = await connection.query(
      `INSERT INTO extend_room_requests 
       (order_id, room_order_id, additional_hours, additional_price, request_status, payment_status)
       VALUES (?, ?, ?, ?, 'PENDING', 'UNPAID')`,
      [order_id, room_order_id, additional_hours, additionalPrice]
    );

    await connection.commit();

    // Emit socket event sau khi tạo yêu cầu thành công
    if (req.io) {
      req.io.emit('new_extend_request', {
        id: result.insertId,
        order_id,
        room_name: orderDetail.room_name,
        created_at: new Date()
      });
    }

    return responseSuccess(res, {
      message: "Yêu cầu gia hạn đã được gửi thành công",
      data: {
        id: result.insertId,
        room_name: orderDetail.room_name,
        additional_hours,
        additional_price: additionalPrice
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error in extendRoomTime:", error);
    return responseError(res, error);
  }
};

// Thêm hàm tính giá
const calculateTotalPrice = (startTime, endTime, roomPrice, isVip, vipEndDate) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const totalHours = Math.ceil((end - start) / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;
  
  let totalPrice = 0;
  
  // 1. Tính giá theo ngày
  if (days > 0) {
    let dailyRate = roomPrice * 24;
    if (days >= 30) {
      dailyRate *= 0.7; // Giảm 30% cho thuê >= 30 ngày
    } else if (days >= 7) {
      dailyRate *= 0.75; // Giảm 25% cho thuê >= 7 ngày
    } else {
      dailyRate *= 0.8; // Giảm 20% cho thuê theo ngày
    }
    totalPrice += days * dailyRate;
  }

  // 2. Tính giá giờ lẻ
  if (remainingHours > 0) {
    let hourlyRate = roomPrice;
    if (remainingHours >= 5) {
      hourlyRate *= 0.95; // Giảm 5% nếu thuê từ 5 giờ trở lên
    }
    totalPrice += remainingHours * hourlyRate;
  }

  // 3. Áp dụng giảm giá VIP
  if (isVip && new Date(vipEndDate) > new Date()) {
    totalPrice *= 0.9; // Giảm thêm 10% cho VIP
  }

  return {
    totalHours,
    totalPrice: Math.round(totalPrice / 1000) * 1000 // Làm tròn đến 1000
  };
};

// Thêm API mới để admin duyệt yêu cầu
export const approveExtendRoom = async (req, res) => {
  const connection = await orderModel.connection.promise();
  await connection.beginTransaction();

  try {
    const { request_id, status } = req.body;

    // 1. Lấy thông tin yêu cầu và chi tiết đặt phòng
    const [requests] = await connection.query(`
      SELECT 
        er.*,
        rod.start_time,
        rod.end_time,
        rod.total_time,
        rod.total_price,
        rod.room_id,
        r.price as room_price,
        r.room_name,
        o.total_money as order_total,
        o.id as order_id,
        u.is_vip,
        u.vip_end_date
      FROM extend_room_requests er
      JOIN room_order_detail rod ON er.room_order_id = rod.id
      JOIN room r ON rod.room_id = r.id
      JOIN orders o ON er.order_id = o.id
      JOIN user u ON o.user_id = u.id
      WHERE er.id = ? AND er.request_status = 'PENDING'
    `, [request_id]);

    if (!requests.length) {
      return responseError(res, { message: "Không tìm thấy yêu cầu gia hạn hoặc yêu cầu đã được xử lý" });
    }

    const request = requests[0];

    // 2. Nếu APPROVED, thực hiện cập nhật
    if (status === 'APPROVED') {
      const currentEndTime = new Date(request.end_time);
      const additionalTime = request.additional_hours * 60 * 60 * 1000;
      const newEndTime = new Date(currentEndTime.getTime() + additionalTime);

      const { totalHours, totalPrice } = calculateTotalPrice(
        request.start_time,
        newEndTime,
        request.room_price,
        request.is_vip,
        request.vip_end_date
      );

      // Cập nhật room_order_detail
      await connection.query(`
        UPDATE room_order_detail 
        SET 
          end_time = ?,
          total_time = ?,
          total_price = ?
        WHERE id = ?
      `, [newEndTime, totalHours, totalPrice, request.room_order_id]);

      // Cập nhật tổng tiền orders (bao gồm cả sản phẩm)
      await connection.query(`
        UPDATE orders o
        SET total_money = (
          SELECT SUM(total_price) 
          FROM room_order_detail rod 
          WHERE rod.order_id = o.id
        ) + COALESCE((
          SELECT SUM(price * quantity)
          FROM order_detail od
          WHERE od.order_id = o.id
        ), 0)
        WHERE o.id = ?
      `, [request.order_id]);
    }

    // 5. Cập nhật trạng thái yêu cầu
    await connection.query(`
      UPDATE extend_room_requests 
      SET 
        request_status = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [status, request_id]);

    await connection.commit();

    // 6. Query lại dữ liệu sau khi cập nhật để kiểm tra
    const [updatedData] = await connection.query(`
      SELECT 
        rod.end_time,
        rod.total_time,
        rod.total_price,
        o.total_money,
        r.room_name
      FROM room_order_detail rod
      JOIN orders o ON rod.order_id = o.id
      JOIN room r ON rod.room_id = r.id
      WHERE rod.id = ?
    `, [request.room_order_id]);

    return responseSuccess(res, {
      message: status === 'APPROVED' ? "Đã duyệt và cập nhật thời gian gia hạn" : "Đã từ chối yêu cầu gia hạn",
      data: status === 'APPROVED' ? updatedData[0] : null
    });

  } catch (error) {
    await connection.rollback();
    console.error("Approve extend room error:", error);
    return responseError(res, error);
  }
};

export const getExtendRequests = async (req, res) => {
  try {
    const { order_id } = req.params;
    const connection = await orderModel.connection.promise();

    // Lấy danh sách yêu cầu và tính tổng tiền chưa thanh toán
    const [results] = await connection.query(`
      SELECT 
        er.*,
        rod.start_time,
        rod.end_time,
        r.room_name,
        (
          SELECT SUM(additional_price)
          FROM extend_room_requests
          WHERE order_id = er.order_id
          AND request_status = 'APPROVED'
          AND payment_status = 'UNPAID'
        ) as total_unpaid_amount
      FROM extend_room_requests er
      JOIN room_order_detail rod ON er.room_order_id = rod.id
      JOIN room r ON rod.room_id = r.id
      WHERE er.order_id = ?
      ORDER BY er.created_at DESC
    `, [order_id]);

    // Lấy tổng tiền chưa thanh toán từ bản ghi đầu tiên
    const unpaidAmount = results.length > 0 ? results[0].total_unpaid_amount || 0 : 0;

    // Map lại kết quả để loại bỏ trường total_unpaid_amount từ các bản ghi
    const requests = results.map(({ total_unpaid_amount, ...rest }) => rest);

    return responseSuccess(res, {
      message: "Lấy danh sách yêu cầu gia hạn thành công",
      data: requests,
      unpaidAmount
    });

  } catch (error) {
    console.error("Get extend requests error:", error);
    return responseError(res, error);
  }
};

export const updateExtendPaymentStatus = async (req, res) => {
  const connection = await orderModel.connection.promise();
  try {
    const { request_id } = req.body;

    if (!request_id) {
      return responseError(res, { message: "Thiếu thông tin yêu cầu" });
    }

    await connection.query(`
      UPDATE extend_room_requests 
      SET 
        payment_status = 'PAID',
        updated_at = NOW()
      WHERE id = ?
    `, [request_id]);

    return responseSuccess(res, {
      message: "Đã cập nhật trạng thái thanh toán"
    });
  } catch (error) {
    console.error("Update extend payment status error:", error);
    return responseError(res, error);
  }
};

export const getPendingExtendRequests = async (req, res) => {
  try {
    const [requests] = await orderModel.connection.promise().query(
      `SELECT er.*, r.room_name, o.status as order_status
       FROM extend_room_requests er
       JOIN room_order_detail rod ON er.room_order_id = rod.id
       JOIN room r ON rod.room_id = r.id
       JOIN orders o ON er.order_id = o.id
       WHERE er.request_status = 'PENDING'
       ORDER BY er.created_at DESC`
    );

    return responseSuccess(res, {
      message: "Lấy danh sách yêu cầu gia hạn thành công",
      data: requests
    });

  } catch (error) {
    console.error("Get pending extend requests error:", error);
    return responseError(res, error);
  }
};

export const statisticRoomDetail = async (req, res) => {
  try {
    const connection = await orderModel.connection.promise();
    
    const query = `
      SELECT 
        r.id AS room_id,
        r.room_name,
        r.status AS room_status,
        COUNT(DISTINCT rod.order_id) AS total_bookings, -- Đếm tất cả lượt đặt
        COALESCE(SUM(rod.total_time), 0) AS total_hours,
        COALESCE(SUM(rod.total_price), 0) AS total_revenue,
        (
          SELECT 
            CONCAT(
              DATE_FORMAT(rod2.start_time, '%H:%i %d/%m/%Y'),
              ' - ',
              DATE_FORMAT(rod2.end_time, '%H:%i %d/%m/%Y')
            )
          FROM room_order_detail rod2
          JOIN orders o2 ON rod2.order_id = o2.id
          WHERE rod2.room_id = r.id 
          AND o2.status = 'CHECKED_IN'
          AND NOW() BETWEEN rod2.start_time AND rod2.end_time
          LIMIT 1
        ) AS current_booking
      FROM room r
      LEFT JOIN room_order_detail rod ON r.id = rod.room_id
      LEFT JOIN orders o ON rod.order_id = o.id
      GROUP BY r.id, r.room_name, r.status
      ORDER BY total_bookings DESC; -- Sắp xếp theo số lượt đặt
    `;

    const [statistics] = await connection.query(query);

    const formattedStats = statistics.map(stat => ({
      ...stat,
      total_revenue: Number(stat.total_revenue) || 0,
      total_hours: Number(stat.total_hours) || 0,
      total_bookings: Number(stat.total_bookings) || 0,
      current_status: stat.current_booking ? 'Đang sử dụng' : 
                     (stat.room_status === 'AVAILABLE' ? 'Trống' : 'Không khả dụng')
    }));

    // Tính toán phần trăm
    const totalRevenue = formattedStats.reduce((sum, stat) => sum + stat.total_revenue, 0);
    const totalBookings = formattedStats.reduce((sum, stat) => sum + stat.total_bookings, 0);

    formattedStats.forEach(stat => {
      stat.revenue_percentage = totalRevenue ? ((stat.total_revenue / totalRevenue) * 100).toFixed(2) : "0.00";
      stat.booking_percentage = totalBookings ? ((stat.total_bookings / totalBookings) * 100).toFixed(2) : "0.00";
    });

    return responseSuccess(res, {
      message: "Lấy thống kê chi tiết phòng thành công",
      data: {
        statistics: formattedStats,
        summary: {
          total_revenue: totalRevenue,
          total_bookings: totalBookings,
          total_rooms: formattedStats.length
        }
      }
    });

  } catch (error) {
    console.error("Statistic room detail error:", error);
    return responseError(res, error);
  }
};

// Thêm hàm mới để cập nhật trạng thái sau khi thanh toán VNPay thành công
export const updateOrderAfterPayment = async (req, res) => {
  const connection = await orderModel.connection.promise();
  try {
    const { orderId } = req.params;
    const { vnp_ResponseCode, vnp_TransactionStatus } = req.query;

    await connection.beginTransaction();

    if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
      // Thanh toán thành công - luôn set status là PAID
      await connection.query(
        `UPDATE orders 
         SET status = ?, 
             payment_status = ?,
             updated_at = NOW() 
         WHERE id = ?`,
        ['PAID', 'PAID', orderId]
      );

      await connection.commit();
      return res.redirect(`/payment-success?orderId=${orderId}`);
    } else {
      // Thanh toán thất bại
      await connection.query(
        `UPDATE orders 
         SET status = ?, 
             payment_status = ?,
             updated_at = NOW() 
         WHERE id = ?`,
        ['PENDING_PAYMENT', 'FAILED', orderId]
      );

      await connection.commit();
      return res.redirect(`/payment-failed?orderId=${orderId}`);
    }

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Update order payment status error:", error);
    return res.redirect('/payment-error');
  }
};
