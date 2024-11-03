import jwt from "jsonwebtoken";
import usersModel from "../models/users.model";

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || authHeader === "undefined") {
      return responseError(res, "Token không tồn tại.", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === null) {
      return responseError(res, "Token không tồn tại.", 401);
    }

    jwt.verify(token, process.env.SECRETKEY, async (err, data) => {
      if (err) {
        return responseError(res, "Xác thực tài khoản thất bại.", 401);
      }

      if (!data) {
        return responseError(res, "Xác thực tài khoản thất bại.", 401);
      }

      const { id } = data;

      const dataGetDB = await usersModel.findOne({
        id: id,
      });

      if (!dataGetDB) {
        return responseError(res, "Xác thực tài khoản thất bại.", 401);
      }

      if (dataGetDB.is_lock) {
        return responseError(
          res,
          "Tài khoản của bạn đang bị khóa vui lòng liên hệ với quản trị viên.",
          401
        );
      }

      req.auth = dataGetDB;
      next();
    });
  } catch (error) {
    console.log("Error:", error);
    return res.status(400).json({ message: "Token verification error" });
  }
};

export default verifyToken;
