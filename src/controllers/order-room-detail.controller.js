import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
import orderRoomModel from "../models/order-room.model";

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
  try {
    const { orderId, oldRoomId, newRoomId, startTime, endTime } = req.body;

    // 1. Kiểm tra đơn đặt phòng tồn tại
    const existingBooking = await orderRoomModel.findOne({
      order_id: orderId,
      room_id: oldRoomId
    });

    if (!existingBooking) {
      return responseError(res, {
        message: "Không tìm thấy thông tin đặt phòng này"
      });
    }

    // 2. Kiểm tra phòng mới có trống không
    const isNewRoomAvailable = await orderRoomModel.connection.promise().query(`
      SELECT * FROM room_order_detail 
      WHERE room_id = ? 
      AND ((start_time BETWEEN ? AND ?) 
      OR (end_time BETWEEN ? AND ?))
      AND id != ?
    `, [newRoomId, startTime, endTime, startTime, endTime, orderId]);

    if (isNewRoomAvailable[0].length > 0) {
      return responseError(res, {
        message: "Phòng mới đã có người đặt trong khoảng thời gian này"
      });
    }

    // 3. Lấy thông tin phòng mới và tính giá
    const [newRoomResult] = await orderRoomModel.connection.promise().query(
      'SELECT price FROM room WHERE id = ?',
      [newRoomId]
    );

    if (!newRoomResult || newRoomResult.length === 0) {
      return responseError(res, {
        message: "Không tìm thấy thông tin phòng mới"
      });
    }

    const roomPrice = newRoomResult[0].price;
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const totalHours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
    const newTotalPrice = totalHours * roomPrice;

    // Log để debug
    console.log('Room Price:', roomPrice);
    console.log('Total Hours:', totalHours);
    console.log('New Total Price:', newTotalPrice);

    // 4. Thực hiện đổi phòng với transaction
    const connection = await orderRoomModel.connection.promise();
    await connection.beginTransaction();

    try {
      // Cập nhật thông tin đặt phòng
      await connection.query(`
        UPDATE room_order_detail 
        SET room_id = ?,
            total_price = ?
        WHERE order_id = ? AND room_id = ?
      `, [newRoomId, newTotalPrice, orderId, oldRoomId]);

      // Cập nhật tổng tiền trong orders
      await connection.query(`
        UPDATE orders 
        SET total_money = total_money - ? + ?
        WHERE id = ?
      `, [existingBooking.total_price, newTotalPrice, orderId]);

      await connection.commit();

      return responseSuccess(res, {
        message: "Đổi phòng thành công",
        data: {
          orderId,
          newRoomId,
          oldRoomId,
          startTime,
          endTime,
          newTotalPrice
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error("Lỗi khi đổi phòng:", error);
    return responseError(res, error);
  }
};
