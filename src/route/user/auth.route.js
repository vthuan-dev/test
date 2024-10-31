import express from "express";
import {
  create,
  findById,
  getAll,
  login,
  authorization,
  getAllUser,
  getUserDetail,
} from "../../controllers/user.controller";
import checkAuth from "../../middlewares/checkAuth";
import verifyToken from "../../middlewares/authenticateToken";

const authRoute = express.Router();

authRoute.get("/", getAll);
authRoute.post("/register", create);
authRoute.post("/login", checkAuth, login);
authRoute.post("/verifyToken", verifyToken, authorization);
authRoute.get("/get-all-user", getAllUser);
authRoute.get("/find-by-id/:id", getUserDetail);

export default authRoute;
