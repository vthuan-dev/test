import express from "express";
import * as orderProductController from "../../controllers/order-product-detail.controller";

const router = express.Router();
router.post("/add", orderProductController.create);
router.put("/update/:id", orderProductController.update);
router.delete("/remove/:id", orderProductController.deleteById);
router.get("/searchById/:id", orderProductController.findById);
router.get("/", orderProductController.getAll);

export default router;
