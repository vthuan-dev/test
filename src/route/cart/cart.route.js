import express from "express";
import * as cartController from "../../controllers/cart.controller";

const router = express.Router();
router.post("/add", cartController.create);
router.put("/update/:id", cartController.update);
router.delete("/remove/:id", cartController.deleteRecord);
router.get("/searchById/:id", cartController.getById);
router.get("", cartController.getAll);

export default router;
