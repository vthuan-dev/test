import express from "express";
import * as desktopController from "../../controllers/desktop.controller";

const router = express.Router();
router.post("/add", desktopController.create);
router.put("/update/:id", desktopController.update);
router.delete("/remove/:id", desktopController.deleteById);
router.get("/searchById/:id", desktopController.findById);
router.get("", desktopController.getAll);

export default router;
