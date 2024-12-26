import express from "express";
import * as orderRoomController from "../../controllers/order-room-detail.controller";

const router = express.Router();

router.get("/", orderRoomController.getAll);
router.post("/add", orderRoomController.create);
router.put("/update/:id", orderRoomController.update);
router.delete("/remove/:id", orderRoomController.deleteById);
router.get("/searchById/:id", orderRoomController.findById);

router.post("/change-room", orderRoomController.changeRoom);

router.get("/available-rooms", orderRoomController.getAvailableRooms);


export default router;
