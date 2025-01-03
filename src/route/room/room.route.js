import express from "express";
import * as roomController from "../../controllers/room.controller";

const router = express.Router();

router.get("/client/room-detail/:id", roomController.getRoomDetailForClient);
router.get("/get-by-count-desktop", roomController.getAllRoomCountDesktop);
router.get("/get-all-timeline", roomController.getAllTimeLine);
router.get("/check-in-use/:id", roomController.checkRoomInUse);
router.get("/searchById/:id", roomController.findById);
router.get("", roomController.getAll);

router.post("/add", roomController.create);
router.put("/update/:id", roomController.update);
router.delete("/:id", roomController.deleteById);

export default router;
