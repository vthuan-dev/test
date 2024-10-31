import { roles } from "../config/roles";
import { getPagination } from "../helpers/getPagination";
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
    const { query } = req;

    const { isPagination, ...pagination } = await getPagination(
      usersModel,
      query
    );

    const users = await usersModel.read(res, isPagination);

    const data = {
      message: "Lấy danh sách thành công.",
      data: users,
      pagination,
    };

    responseSuccess(res, data);
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

export const getAllUser = async (req, res) => {
  try {
    let conditions = [];
    const { name, is_vip, page = 1, pageSize = 10 } = req.query;

    // Điều kiện lọc cho name và is_vip
    if (name) {
      conditions.push(`username LIKE '%${name}%'`);
    }
    if (is_vip !== undefined) {
      conditions.push(`is_vip = ${is_vip}`);
    }

    // Câu điều kiện WHERE nếu có các điều kiện lọc
    const searchable =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Câu truy vấn SQL để lấy dữ liệu phân trang
    const offset = (page - 1) * pageSize;
    const limit = `LIMIT ${pageSize} OFFSET ${offset}`;
    const query = `SELECT * FROM user ${searchable} ORDER BY created_at DESC ${limit}`;
    console.log("🚀 ~ query:", query);

    // Thực hiện truy vấn để lấy dữ liệu
    const result = await new Promise((resolve, reject) => {
      usersModel.connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result || []);
        }
      });
    });

    // Câu truy vấn SQL để lấy tổng số bản ghi
    const countQuery = `SELECT COUNT(*) AS total FROM user ${searchable}`;
    const totalCountResult = await new Promise((resolve, reject) => {
      usersModel.connection.query(countQuery, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result[0]?.total || 0);
        }
      });
    });

    // Tính toán tổng số trang
    const totalPages = Math.ceil(totalCountResult / pageSize);

    // Gửi dữ liệu phản hồi thành công
    const data = {
      message: "Lấy dữ liệu thành công",
      data: result,
      pagination: {
        totalCount: totalCountResult,
        totalPages,
        currentPage: Number(page),
        pageSize: Number(pageSize),
      },
    };

    return responseSuccess(res, data); // Giả sử responseSuccess là một hàm gửi phản hồi thành công
  } catch (error) {
    console.log("error: ", error);
    return res.status(400).json({ message: "Đã có lỗi xảy ra!!!", error });
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params; // Lấy id từ tham số đường dẫn

    // Kiểm tra nếu id không được cung cấp
    if (!id) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    // Câu truy vấn SQL để lấy thông tin chi tiết người dùng
    const query = `SELECT * FROM user WHERE id = ?`;
    console.log("🚀 ~ query:", query);

    // Thực hiện truy vấn để lấy thông tin người dùng
    const result = await new Promise((resolve, reject) => {
      usersModel.connection.query(query, [id], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result[0] || null); // Chỉ lấy một người dùng
        }
      });
    });

    // Kiểm tra xem người dùng có tồn tại hay không
    if (!result) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Gửi dữ liệu phản hồi thành công
    const data = {
      message: "Lấy dữ liệu thành công",
      data: result,
    };

    return responseSuccess(res, data);
  } catch (error) {
    console.log("error: ", error);
    return res.status(500).json({ message: "Đã có lỗi xảy ra!!!", error });
  }
};
