import { responseError, responseSuccess } from "../helpers/response";
import categoryModel from "../models/category.model";

export const create = async (req, res) => {
  try {
    const data = req.body;

    return await categoryModel.create(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const getAll = async (req, res) => {
  try {
    return await categoryModel.read(res);
  } catch (error) {
    return responseError(res, error);
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    return await categoryModel.find("id", id);
  } catch (error) {
    return responseError(res, error);
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedProject = await categoryModel.update("id", id, data);
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
    return await categoryModel.delete(res, id);
  } catch (error) {
    return responseError(res, error);
  }
};
