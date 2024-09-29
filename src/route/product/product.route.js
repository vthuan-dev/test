import express from "express";
import * as productController from "../../controllers/product.controller";

const router = express.Router();
router.post("/add", productController.create);
router.put("/update/:id", productController.update);
router.delete("/remove/:id", productController.deleteById);
router.get("/searchById/:id", productController.findById);
router.get("", productController.getAll);

export default router;
