import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import orderRoomModel from "../models/order-room.model";
import dayjs from "dayjs";

export const getAll = async (req, res) => {
  try {
    const { query } = req;

    const { isPagination, ...pagination } = await getPagination(
      orderRoomModel,
      query
    );

    const product = await orderRoomModel.read(query, isPagination);

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

    const category = await orderRoomModel.findOne({
      category_name: body.category_name,
    });

    if (category) {
      return responseError(res, {
        message: "Danh mục đã tồn tại",
      });
    }

    const result = await orderRoomModel.create(body);

    const response = {
      data: result,
      message: "Tạo mới sản phẩm thành công",
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
    const updatedCategory = await orderRoomModel.update("id", id, body);
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
    const category = await orderRoomModel.findOne({ id });

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
    const category = await orderRoomModel.delete(id);
    const data = {
      message: "Xóa dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const getTimeLineOrderRoom = async (req, res) => {
  try {
    const { roomIds } = req.body;

    // Check if roomIds is an array and not empty
    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      return responseError(res, { message: "Room IDs are required." });
    }

    // Format roomIds as a string for the SQL IN clause
    const roomIdsString = roomIds.join(",");

    // Prepare the SQL query with parameterized values
    const query = `
  SELECT * 
  FROM cybergame.room_order_detail AS orderRoom
  JOIN orders ON orders.id = orderRoom.order_id
  WHERE orderRoom.room_id IN (${roomIdsString})
    AND orderRoom.start_time >= NOW()
`;

    // Execute the query
    const result = await orderRoomModel.connection.promise().query(query);
    console.log("🚀 ~ getTimeLineOrderRoom ~ result:", result);

    const data = {
      message: "Data fetched successfully",
      data: result[0],
    };
    return responseSuccess(res, data);
  } catch (error) {
    console.error(error);
    return responseError(res, error);
  }
};

export const changeRoom = async (req, res) => {
  let connection;
  try {
    connection = await orderRoomModel.connection.promise();
    
    const { orderId, orderDetailId, oldRoomId, newRoomId, startTime, endTime } = req.body;

    // Validate input
    if (!orderId || !orderDetailId || !oldRoomId || !newRoomId || !startTime || !endTime) {
      return responseError(res, {
        message: "Thiếu thông tin bắt buộc"
      });
    }

    // Validate thời gian
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Format date để so sánh ngày
    const startDay = new Date(start).setHours(0,0,0,0);
    const today = new Date(now).setHours(0,0,0,0);

    // Chỉ kiểm tra nếu là cùng ngày
    if (startDay === today && start < now) {
      return responseError(res, {
        message: "Không thể đổi phòng cho thời gian đã qua"
      });
    }

    if (start >= end) {
      return responseError(res, {
        message: "Thời gian không hợp lệ"
      });
    }

    await connection.beginTransaction();

    // 1. Kiểm tra xem chi tiết đặt phòng có tồn tại không
    const [orderDetails] = await connection.query(
      'SELECT * FROM room_order_detail WHERE id = ? AND order_id = ?',
      [orderDetailId, orderId]
    );

    console.log("Found order details:", orderDetails);

    if (!orderDetails.length) {
      await connection.rollback();
      return responseError(res, {
        message: "Không tìm thấy chi tiết đặt phòng",
        debug: { orderDetailId, orderId }
      });
    }

    // 2. Kiểm tra conflicts
    const [conflicts] = await connection.query(`
      SELECT * FROM room_order_detail 
      WHERE room_id = ? 
      AND id != ?
      AND order_id != ?
      AND (
        (start_time < ? AND end_time > ?)
        OR (start_time < ? AND end_time > ?)
        OR (start_time >= ? AND end_time <= ?)
      )
    `, [
      newRoomId,
      orderDetailId,
      orderId,
      endTime, startTime,
      endTime, startTime,
      startTime, endTime
    ]);

    if (conflicts.length > 0) {
      await connection.rollback();
      return responseError(res, {
        message: "Phòng đã có người đặt trong khoảng thời gian này"
      });
    }

    // 3. Lấy giá phòng mới
    const [rooms] = await connection.query(
      'SELECT price FROM room WHERE id = ?',
      [newRoomId]
    );

    if (!rooms.length) {
      await connection.rollback();
      return responseError(res, {
        message: "Không tìm thấy thông tin phòng mới"
      });
    }

    // 4. Tính toán tổng tiền mới
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);
    const hours = Math.ceil((endDateTime - startDateTime) / (1000 * 60 * 60));
    const newTotalPrice = hours * rooms[0].price;

    // 5. Cập nhật room_order_detail
    const [updateResult] = await connection.query(`
      UPDATE room_order_detail 
      SET room_id = ?,
          total_price = ?,
          start_time = ?,
          end_time = ?
      WHERE id = ? AND order_id = ?
    `, [newRoomId, newTotalPrice, startTime, endTime, orderDetailId, orderId]);

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return responseError(res, {
        message: "Cập nhật thất bại"
      });
    }

    // 6. Cập nhật tổng tiền trong orders
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
    `, [orderId]);

    await connection.commit();

    return responseSuccess(res, {
      message: "Đổi phòng thành công",
      data: {
        orderId,
        orderDetailId,
        oldRoomId,
        newRoomId,
        newTotalPrice,
        startTime,
        endTime
      }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error("Error in changeRoom:", error);
    return responseError(res, error);
  }
};

export const getAvailableRooms = async (req, res) => {
  try {
    const connection = await orderRoomModel.connection.promise();
    
    // Sửa lại query để lấy đúng thông tin phòng và chi tiết đặt phòng
    const [rooms] = await connection.query(`
      SELECT 
        r.id as room_id,           -- ID của phòng
        r.room_name,
        r.price,
        r.status,
        rod.id as order_detail_id, -- ID của room_order_detail
        rod.start_time,
        rod.end_time,
        rod.order_id,              -- Thêm order_id để kiểm tra
        EXISTS (
          SELECT 1 
          FROM room_order_detail rod2 
          WHERE rod2.room_id = r.id 
          AND NOW() BETWEEN rod2.start_time AND rod2.end_time
        ) as is_occupied
      FROM room r
      LEFT JOIN room_order_detail rod ON r.id = rod.room_id
      WHERE r.status != 'INACTIVE'
      ORDER BY r.id ASC
    `);

    // Format lại response để phù hợp với cấu trúc dữ liệu
    const formattedRooms = rooms.map(room => ({
      id: room.order_detail_id,    // ID của room_order_detail (có thể null)
      room_id: room.room_id,       // ID của room (không null)
      name: room.room_name,
      price: room.price,
      start_time: room.start_time,
      end_time: room.end_time,
      order_id: room.order_id,
      status: room.is_occupied ? 'Có người đặt' : 'Trống',
      originalStatus: room.status
    }));

    return responseSuccess(res, {
      message: "Lấy danh sách phòng thành công",
      data: formattedRooms
    });

  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng:", error);
    return responseError(res, error);
  }
};
