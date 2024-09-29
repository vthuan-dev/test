import express from "express";
import * as categoryController from "../../controllers/category.controller";

const router = express.Router();
router.post("/add", categoryController.create);
router.put("/update/:id", categoryController.update);
router.delete("/remove/:id", categoryController.deleteById);
router.get("/searchById/:id", categoryController.findById);
router.get("", categoryController.getAll);

export default router;
