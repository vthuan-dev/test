import { getPagination } from "../helpers/getPagination";
import { responseError, responseSuccess } from "../helpers/response";
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
    const result = await roomModel.create({ ...body, status: "Trống" });

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
             desktop.id AS desktop_id, desktop.desktop_name, desktop.price AS desktop_price, 
             desktop.status AS desktop_status, desktop.description AS desktop_description
      FROM cybergame.room
      LEFT JOIN cybergame.desktop ON room.id = desktop.room_id
      WHERE room.id = ?;
    `;

    // Execute the SQL query
    const [result] = await roomModel.connection.promise().query(query, [id]);

    // Check if room exists
    if (!result || result.length === 0) {
      return responseNotFound(res);
    }

    // Format the response data
    const roomData = {
      room_id: result[0].room_id,
      room_name: result[0].room_name,
      room_status: result[0].room_status,
      position: result[0].position,
      image_url: result[0].image_url,
      capacity: result[0].capacity,
      room_price: result[0].room_price,
      room_description: result[0].room_description,
      desktops: result.map((desktop) => ({
        desktop_id: desktop.desktop_id,
        desktop_name: desktop.desktop_name,
        desktop_price: desktop.desktop_price,
        desktop_status: desktop.desktop_status,
        desktop_description: desktop.desktop_description,
      })).filter(desktop => desktop.desktop_id !== null), // Filter out empty desktop records
    };

    const data = {
      message: "Lấy dữ liệu thành công",
      data: roomData,
    };

    return responseSuccess(res, data);
  } catch (error) {
    console.error("Error:", error);
    return responseError(res, error);
  }
};


export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await roomModel.delete(id);
    const data = {
      message: "Xóa dữ liệu thành công",
      data: category,
    };
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
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
