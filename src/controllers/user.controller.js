import { roles } from "../config/roles";
import { responseError, responseSuccess } from "../helpers/response";

import usersModel from "../models/users.model";

export const login = async (req, res) => {
  try {
    res.status(200).json({ message: "Login success", error });
  } catch (error) {
    res.status(200).json({ message: "Login failed", error });
  }
};

export const getAll = async (req, res) => {
  try {
    return await usersModel.read(res);
  } catch (error) {
    return responseError(res, error);
  }
};

export const create = async (req, res) => {
  try {
    const { password, ...remainBody } = req.body;

    const hashPassword = await usersModel.bcryptPassword(password);

    const data = {
      ...remainBody,
      password: hashPassword,
      is_vip: 1,
      user_type: roles.USER,
    };

    const user = await usersModel.create(data);
    return responseSuccess(res, user);
  } catch (error) {
    return responseError(res, error);
  }
};

export const findById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await usersModel.findOne(res, "id", id);

    const data = {
      message: "Lấy dữ liệu thành công",
      data: await user,
    };
    console.log(data);
    return responseSuccess(res, data);
  } catch (error) {
    return responseError(res, error);
  }
};

export const authorization = () => {
  try {
  } catch (error) {
    res.status(400).json({ message: "wrong Token", error });
  }
};
