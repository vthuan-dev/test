import express from "express";
import {
  create,
  findById,
  getAll,
  login,
  authorization,
} from "../../controllers/user.controller";
import checkAuth from "../../middlewares/checkAuth";
import verifyToken from "../../middlewares/authenticateToken";

const authRoute = express.Router();

authRoute.get("/", getAll);
authRoute.post("/register", create);
authRoute.post("/login", checkAuth, login);
authRoute.post("/verifyToken", verifyToken, authorization);

export default authRoute;
