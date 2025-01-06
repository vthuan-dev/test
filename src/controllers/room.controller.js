import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import orderModel from "../models/order.model";
import roomModel from "../models/room.model";

export const getAll = async (req, res) => {
  try {
    const { query } = req;

    const { isPagination, ...pagination } = await getPagination(
      roomModel,
      query
    );

    const product = await roomModel.read(query, isPagination);

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
  try {
    const body = req.body;
    // const { error } = AuthValidator.validatorRegister(req.body);
    // if (error) {
    //   return responseError(res, error);
    // }
    // status: 0: trống - 1: đang sử dụng
    const result = await roomModel.create({ ...body, status: "INACTIVE" });

    const response = {
      data: result,
      message: "Tạo mới thành công",
    };
    responseSuccess(res, response);
  } catch (error) {
    return responseError(res, error);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const updatedCategory = await roomModel.update("id", id, body);
    const response = {
      message: "Cập nhật dữ liệu thành công",
      data: updatedCategory,
    };
    return responseSuccess(res, response);
  } catch (error) {
    return responseError(res, error);
  }
};

export const findById = async (req, res) => {
  try {
    const { id } = req.params;

    // SQL query to fetch the room and associated desktops
    const query = `
      SELECT room.id AS room_id, room.room_name, room.status AS room_status, room.position,
             room.image_url, room.capacity, room.price AS room_price, room.description AS room_description,
             desktop.id AS desktop_id, desktop.desktop_name, desktop.price, 
             desktop.status, desktop.description
      FROM cybergame.room
      LEFT JOIN cybergame.desktop ON room.id = desktop.room_id
      WHERE room.id = ?;
    `;

    // Execute the SQL query
    const [result] = await roomModel.connection.promise().query(query, [id]);

    // Check if room exists
    if (!result || result.length === 0) {
      return responseError(res, {
        message: "Không tìm thấy phòng",
        statusCode: 404
      });
    }

    // Format the response data
    const roomData = {
      room_id: result[0].room_id,
      room_name: result[0].room_name,
      status: result[0].room_status,
      position: result[0].position,
      image_url: result[0].image_url,
      capacity: result[0].capacity,
      price: result[0].room_price,
      description: result[0].room_description,
      desktops: result
        .filter(item => item.desktop_id !== null)  // Lọc bỏ các bản ghi không có desktop
        .map((desktop) => ({
          desktop_id: desktop.desktop_id,
          desktop_name: desktop.desktop_name,
          price: desktop.price,
          status: desktop.status,
          description: desktop.description || ''  // Đảm bảo description không null
        }))
    };

    return responseSuccess(res, {
      message: "Lấy dữ liệu thành công",
      data: roomData
    });

  } catch (error) {
    console.error("Error:", error);
    return responseError(res, {
      message: "Lỗi khi lấy thông tin phòng",
      error: error.message,
      statusCode: 500
    });
  }
};

export const deleteById = async (req, res) => {
  let connection;
  try {
    connection = await roomModel.connection.promise();
    const { id } = req.params;
    await connection.beginTransaction();

    // 1. Kiểm tra phòng tồn tại
    const [rooms] = await connection.query(
      'SELECT * FROM room WHERE id = ?',
      [id]
    );

    if (!rooms.length) {
      await connection.rollback();
      return responseError(res, {
        message: "Không tìm thấy phòng",
        statusCode: 404
      });
    }

    // 2. Kiểm tra các ràng buộc
    const checkQuery = `
      SELECT 
        (SELECT COUNT(*) FROM room_order_detail rod
         JOIN orders o ON rod.order_id = o.id
         WHERE rod.room_id = ? 
         AND o.status IN ('PENDING', 'CHECKED_IN')
         AND rod.end_time > NOW()) as activeBookings,
        (SELECT COUNT(*) FROM cart 
         WHERE room_id = ?) as cartItems
    `;

    const [[usage]] = await connection.query(checkQuery, [id, id]);

    if (usage.activeBookings > 0 || usage.cartItems > 0) {
      await connection.rollback();
      return responseError(res, {
        message: "Không thể xóa phòng vì đang được sử dụng hoặc có trong giỏ hàng",
        statusCode: 400
      });
    }

    // 3. Thực hiện xóa theo thứ tự
    const deleteQueries = [
      'DELETE FROM extend_room_requests WHERE room_order_id IN (SELECT id FROM room_order_detail WHERE room_id = ?)',
      'DELETE FROM cart WHERE room_id = ?',
      'DELETE FROM desktop WHERE room_id = ?',
      'DELETE FROM room_order_detail WHERE room_id = ?',
      'DELETE FROM room WHERE id = ?'
    ];

    for (const query of deleteQueries) {
      await connection.query(query, [id]);
    }

    await connection.commit();
    
    return responseSuccess(res, {
      message: "Xóa phòng thành công",
      data: { id }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error deleting room:", error);
    return responseError(res, {
      message: "Lỗi khi xóa phòng",
      error: error.message,
      statusCode: 500
    });
  }
};

export const getAllRoomCountDesktop = async (req, res) => {
  try {
    console.log(1);

    // Câu truy vấn SQL
    const query = `
      SELECT room.id, room.room_name, room.capacity, COUNT(desktop.room_id) AS desktop_count
      FROM cybergame.room
      LEFT JOIN cybergame.desktop ON room.id = desktop.room_id
      GROUP BY room.id, room.room_name, room.capacity;
    `;

    const [result] = await roomModel.connection.promise().query(query);

    const data = {
      message: "Lấy dữ liệu thành công",
      data: result,
    };
    return responseSuccess(res, data);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getAllTimeLine = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.room_name,
        r.capacity,
        COUNT(DISTINCT d.id) AS desktop_count,
        GROUP_CONCAT(
          DISTINCT
          CASE 
            WHEN rod.start_time IS NOT NULL 
            AND o.status IN ('CONFIRMED', 'CHECKED_IN')
            AND rod.end_time > NOW() 
            THEN
              CONCAT(
                DATE_FORMAT(rod.start_time, '%d-%m-%Y %H:%i'), 
                ' - ',
                DATE_FORMAT(rod.end_time, '%d-%m-%Y %H:%i')
              )
          END
          ORDER BY rod.start_time ASC
          SEPARATOR ';'
        ) AS booking_times,
        IF(
          EXISTS (
            SELECT 1 
            FROM room_order_detail rod2
            JOIN orders o2 ON rod2.order_id = o2.id
            WHERE rod2.room_id = r.id
            AND o2.status IN ('CONFIRMED', 'CHECKED_IN')
            AND rod2.end_time > NOW()
          ),
          'ACTIVE',
          'INACTIVE'
        ) as status
      FROM room r
      LEFT JOIN desktop d ON r.id = d.room_id
      LEFT JOIN room_order_detail rod ON r.id = rod.room_id
      LEFT JOIN orders o ON rod.order_id = o.id
      GROUP BY r.id, r.room_name, r.capacity
      ORDER BY r.id;
    `;

    console.log("Executing query...");
    const [result] = await roomModel.connection.promise().query(query);
    console.log("Raw database result:", result);

    const processedResult = result.map(room => ({
      ...room,
      booking_times: room.booking_times ? room.booking_times.split(';').filter(Boolean) : []
    }));

    console.log("Processed result:", processedResult);

    const data = {
      message: "Lấy dữ liệu thành công",
      data: processedResult,
    };
    return responseSuccess(res, data);
  } catch (error) {
    console.error("Error in getAllTimeLine:", error);
    return responseError(res, {
      message: "Lỗi khi lấy thông tin đặt phòng",
      error: error.message
    });
  }
};

export const getAllRoomsWithOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Lấy thông tin phân trang từ query params
  const offset = (page - 1) * limit; // Tính toán offset cho phân trang

  try {
    const query = `
      SELECT 
        r.id AS room_id,
        r.room_name,
        r.status AS room_status,
        r.position,
        r.image_url,
        r.capacity,
        r.price,
        r.description,
        
        o.id AS order_id,
        o.user_id,
        o.total_money AS total_amount,
        o.created_at AS order_date,
        o.status AS order_status,
        
        u.username,
        u.email,
        u.is_vip,
        u.vip_end_date,
        
        rod.start_time AS room_start_time,
        rod.end_time AS room_end_time,
        rod.total_time AS room_total_time,
        rod.total_price AS room_total_price

      FROM room r
      LEFT JOIN room_order_detail rod ON r.id = rod.room_id
      LEFT JOIN orders o ON rod.order_id = o.id AND o.status = 'CHECKED_IN'  -- Lọc theo trạng thái CHECKED_IN
      LEFT JOIN \`user\` u ON o.user_id = u.id

      LIMIT ? OFFSET ?;  -- Phân trang
    `;

    const [rows] = await roomModel.connection
      .promise()
      .query(query, [parseInt(limit, 10), parseInt(offset, 10)]);

    // Lấy tổng số phòng để tính toán phân trang
    const totalQuery = `SELECT COUNT(*) AS total FROM room;`;
    const [[{ total }]] = await roomModel.connection
      .promise()
      .query(totalQuery);

    const response = rows.map((row) => ({
      room_id: row.room_id,
      room_name: row.room_name,
      room_status: row.room_status,
      position: row.position,
      image_url: row.image_url,
      capacity: row.capacity,
      price: row.price,
      description: row.description,
      order: row.order_id
        ? {
            order_id: row.order_id,
            user_id: row.user_id,
            total_amount: row.total_amount,
            order_date: row.order_date,
            order_status: row.order_status,
            user: {
              username: row.username,
              email: row.email,
              is_vip: row.is_vip,
              vip_end_date: row.vip_end_date,
            },
            room_details: {
              start_time: row.room_start_time,
              end_time: row.room_end_time,
              total_time: row.room_total_time,
              total_price: row.room_total_price,
            },
          }
        : null, // Nếu không có đơn, trả về null
    }));

    // Tính toán phân trang
    const pagination = {
      total_items: total,
      total_pages: Math.ceil(total / limit),
      current_page: Number(page),
      limit: Number(limit),
    };

    const data = {
      message: "Lấy dữ liệu thành công",
      data: response,
      pagination,
    };

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi", error });
  }
};

export const checkRoomInUse = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT COUNT(*) as count
      FROM room_order_detail rod
      JOIN orders o ON rod.order_id = o.id
      WHERE rod.room_id = ? 
      AND o.status IN ('PENDING', 'CHECKED_IN')
      AND (
        NOW() BETWEEN rod.start_time AND rod.end_time
        OR rod.start_time > NOW()
      )
    `;

    const [[result]] = await roomModel.connection
      .promise()
      .query(query, [id]);

    return responseSuccess(res, {
      message: "Kiểm tra trạng thái phòng thành công",
      data: {
        isInUse: result.count > 0
      }
    });

  } catch (error) {
    console.error("Check room in use error:", error);
    return responseError(res, error);
  }
};

export const getRoomDetailForClient = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        r.id AS room_id, 
        r.room_name,
        r.image_url,
        r.capacity,
        r.price AS room_price,
        r.description AS room_description,
        r.status AS room_status,
        d.id AS desktop_id,
        d.desktop_name,
        d.description AS desktop_description,
        d.price AS desktop_price,
        d.status AS desktop_status
      FROM room r
      LEFT JOIN desktop d ON r.id = d.room_id
      WHERE r.id = ?
    `;

    const [result] = await roomModel.connection.promise().query(query, [id]);

    if (!result || result.length === 0) {
      return responseError(res, {
        message: "Không tìm thấy phòng",
        statusCode: 404
      });
    }

    // Format response
    const roomData = {
      room_id: result[0].room_id,
      room_name: result[0].room_name,
      image_url: result[0].image_url,
      capacity: result[0].capacity,
      price: result[0].room_price,
      description: result[0].room_description,
      status: result[0].room_status,
      total_desktops: result.filter(item => item.desktop_id !== null).length,
      desktops: result
        .filter(item => item.desktop_id !== null)
        .map(desktop => {
          // Xử lý specifications
          let specifications = [];
          try {
            // Kiểm tra nếu là JSON string
            if (desktop.desktop_description && desktop.desktop_description.startsWith('[')) {
              specifications = JSON.parse(desktop.desktop_description);
            } else if (desktop.desktop_description) {
              // Nếu là string thường thì split theo dấu phẩy
              specifications = desktop.desktop_description.split(',').map(spec => spec.trim());
            }
          } catch (e) {
            console.error('Error parsing specifications:', e);
            specifications = desktop.desktop_description ? [desktop.desktop_description] : [];
          }

          return {
            desktop_id: desktop.desktop_id,
            desktop_name: desktop.desktop_name,
            price: desktop.desktop_price,
            status: desktop.desktop_status,
            specifications: specifications
          };
        })
    };

    return responseSuccess(res, {
      message: "Lấy thông tin phòng thành công",
      data: roomData
    });

  } catch (error) {
    console.error("Error:", error);
    return responseError(res, {
      message: "Lỗi khi lấy thông tin phòng",
      error: error.message,
      statusCode: 500
    });
  }
};
