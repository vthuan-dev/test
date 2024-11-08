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
