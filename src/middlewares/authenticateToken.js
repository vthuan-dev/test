import jwt from "jsonwebtoken";
import usersModel from "../models/users.model";

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || authHeader === "undefined") {
      return res.status(401).json({ message: "Token không tồn tại." });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === null) {
      return res.status(401).json({ message: "Token không tồn tại." });
    }

    jwt.verify(token, process.env.SECRETKEY, async (err, data) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Xác thực tài khoản thất bại." });
      }

      if (!data) {
        return res
          .status(401)
          .json({ message: "Xác thực tài khoản thất bại." });
      }

      const { id } = data;

      const dataGetDB = await usersModel.findOne({
        id: id,
      });

      if (!dataGetDB) {
        return res
          .status(401)
          .json({ message: "Xác thực tài khoản thất bại." });
      }

      if (dataGetDB.is_lock) {
        return res.status(401).json({
          message:
            "Tài khoản của bạn đang bị khóa vui lòng liên hệ với quản trị viên.",
        });
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
