import { responseError, responseSuccess } from "../helpers/response";
import productModel from "../models/product.model";

export const create = async (req, res) => {
  try {
    const data = req.body;

    return await productModel.create(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const getAll = async (req, res) => {
  try {
    return await productModel.read(res);
  } catch (error) {
    return responseError(res, error);
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    return await productModel.find("id", id);
  } catch (error) {
    return responseError(res, error);
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedAt = new Date();
    const body = {
      ...data,
      updatedAt,
    };
    const updatedProject = await productModel.update("id", id, body);
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
    return await productModel.delete(res, id);
  } catch (error) {
    return responseError(res, error);
  }
};
