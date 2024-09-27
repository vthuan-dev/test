import { responseError, responseSuccess } from "../helpers/response";
import orderModel from "../models/order.model";

export const create = async (req, res) => {
  try {
    const data = req.body;

    return await orderModel.create(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const getAll = async (req, res) => {
  try {
    return await orderModel.read(res);
  } catch (error) {
    return responseError(res, error);
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    return await orderModel.find("id", id);
  } catch (error) {
    return responseError(res, error);
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedProject = await orderModel.update("id", id, data);
    return responseSuccess(res, updatedProject);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi trong quá trình cập nhật dữ liệu", error });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    return await orderModel.delete(res, id);
  } catch (error) {
    return responseError(res, error);
  }
};
