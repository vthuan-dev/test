import express from "express";
import {
  create,
  findById,
  getAll,
  login,
  authorization,
  getAllUser,
  getUserDetail,
  updateUser,
  changePassword,
} from "../../controllers/user.controller";
import checkAuth from "../../middlewares/checkAuth";
import verifyToken from "../../middlewares/authenticateToken";

const authRoute = express.Router();

authRoute.get("/", getAll);
authRoute.post("/create", create);
authRoute.post("/login", checkAuth, login);
authRoute.post("/verifyToken", verifyToken, authorization);
authRoute.get("/get-all-user", getAllUser);
authRoute.get("/find-by-id/:id", getUserDetail);
authRoute.put("/update-user-info/:id", updateUser);
authRoute.post("/change-password", verifyToken, changePassword);

export default authRoute;
