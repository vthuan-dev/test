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
    if (!orderId || !orderDetailId || !oldRoomId || !startTime || !endTime) {
      return responseError(res, {
        message: "Thiếu thông tin bắt buộc"
      });
    }

    // Validate thời gian
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    const now = dayjs();

    // So sánh ngày bằng dayjs thay vì Date
    if (end.isBefore(start)) {
      return responseError(res, {
        message: "Thời gian kết thúc phải sau thời gian bắt đầu"
      });
    }

    // Chỉ kiểm tra thời gian trong quá khứ với ngày hiện tại, không kiểm tra giờ
    if (start.format('YYYY-MM-DD') < now.format('YYYY-MM-DD')) {
      return responseError(res, {
        message: "Không thể đặt thời gian trong quá khứ"
      });
    }

    await connection.beginTransaction();

    // 1. Kiểm tra xung đột thời gian
    const [conflicts] = await connection.query(`
      SELECT 
        rod.*,
        r.room_name,
        o.status as order_status
      FROM room_order_detail rod
      JOIN room r ON r.id = rod.room_id 
      JOIN orders o ON o.id = rod.order_id
      WHERE rod.room_id = ? 
        AND rod.id != ?
        AND o.status NOT IN ('CANCELLED', 'CHECKED_OUT')
        AND (
          (rod.start_time < ? AND rod.end_time > ?)  -- Kiểm tra thời gian bắt đầu
          OR (rod.start_time < ? AND rod.end_time > ?)  -- Kiểm tra thời gian kết thúc
          OR (? <= rod.start_time AND ? >= rod.end_time)  -- Kiểm tra khoảng thời gian bao phủ
        )
    `, [
      newRoomId || oldRoomId,
      orderDetailId,
      endTime, startTime,
      endTime, endTime,
      startTime, endTime
    ]);

    if (conflicts.length > 0) {
      await connection.rollback();
      return responseError(res, {
        message: "Phòng đã có người đặt trong khoảng thời gian này",
        conflicts: conflicts.map(c => ({
          ...c,
          start_time: dayjs(c.start_time).format('YYYY-MM-DD HH:mm:ss'),
          end_time: dayjs(c.end_time).format('YYYY-MM-DD HH:mm:ss')
        }))
      });
    }

    // 2. Lấy giá phòng
    const [rooms] = await connection.query(
      'SELECT price FROM room WHERE id = ?',
      [newRoomId || oldRoomId]
    );

    if (!rooms.length) {
      await connection.rollback();
      return responseError(res, {
        message: "Không tìm thấy thông tin phòng"
      });
    }

    // 3. Tính toán tổng tiền mới
    const hours = Math.ceil(
      end.diff(start, 'hour', true)  // Sử dụng diff của dayjs thay vì getTime
    );
    const newTotalPrice = hours * rooms[0].price;

    // 4. Cập nhật room_order_detail
    const updateFields = [];
    const updateValues = [];

    if (newRoomId && newRoomId !== oldRoomId) {
      updateFields.push('room_id = ?');
      updateValues.push(newRoomId);
    }

    // Format thời gian sang định dạng MySQL
    const formattedStartTime = start.format('YYYY-MM-DD HH:mm:ss');
    const formattedEndTime = end.format('YYYY-MM-DD HH:mm:ss');

    updateFields.push('start_time = ?', 'end_time = ?', 'total_time = ?', 'total_price = ?');
    updateValues.push(formattedStartTime, formattedEndTime, hours, newTotalPrice);
    updateValues.push(orderDetailId, orderId);

    const [updateResult] = await connection.query(`
      UPDATE room_order_detail 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND order_id = ?
    `, updateValues);

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return responseError(res, {
        message: "Cập nhật thất bại"
      });
    }

    // 5. Cập nhật tổng tiền trong orders
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
      message: newRoomId ? "Đổi phòng thành công" : "Cập nhật thời gian thành công",
      data: {
        orderId,
        orderDetailId,
        roomId: newRoomId || oldRoomId,
        newTotalPrice,
        startTime,
        endTime,
        totalTime: hours
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
    const { startTime, endTime } = req.query;
    const connection = await orderRoomModel.connection.promise();
    
    const [rooms] = await connection.query(`
      SELECT 
        r.id as room_id,
        r.room_name,
        r.price,
        r.status as room_status,
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM room_order_detail rod
                JOIN orders o ON o.id = rod.order_id
                WHERE rod.room_id = r.id
                AND o.status NOT IN ('CANCELLED')
                AND (
                    (rod.start_time <= ? AND rod.end_time >= ?)  -- Kiểm tra thời gian bắt đầu
                    OR (rod.start_time <= ? AND rod.end_time >= ?)  -- Kiểm tra thời gian kết thúc
                    OR (rod.start_time >= ? AND rod.end_time <= ?)  -- Kiểm tra khoảng thời gian bao phủ
                )
            ) THEN 'Có người đặt'
            ELSE 'Trống'
        END as booking_status
      FROM room r
      ORDER BY 
        CASE 
          WHEN r.room_name LIKE '%VIP%' THEN 1
          WHEN r.room_name LIKE '%Couple%' THEN 2
          WHEN r.room_name LIKE '%Tournament%' THEN 3
          ELSE 4
        END,
        r.room_name
    `, [
      startTime, startTime,
      endTime, endTime,
      startTime, endTime
    ]);

    // Format lại response
    const formattedRooms = rooms.map(room => ({
      id: room.room_id,
      room_id: room.room_id,
      name: room.room_name,
      price: room.price,
      status: room.booking_status,
      originalStatus: room.room_status
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
