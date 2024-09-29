import express from "express";
import * as cartController from "../../controllers/order.controller";

const router = express.Router();
router.post("/add", cartController.create);
router.put("/update/:id", cartController.update);
router.delete("/remove/:id", cartController.deleteById);
router.get("/searchById/:id", cartController.findById);
router.get("", cartController.getAll);

export default router;
