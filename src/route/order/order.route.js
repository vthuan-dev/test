import express from "express";
import * as orderController from "../../controllers/order.controller";
import * as paymentController from "../../controllers/payment.controller";

const router = express.Router();
router.post("/add", orderController.create);
router.put("/update/:id", orderController.update);
router.delete("/remove/:id", orderController.deleteById);
router.get("/searchById/:id", orderController.findById);
router.get("", orderController.getAll);
router.get("/detail/:id", orderController.detailOrder);
router.get("/statistic-product", orderController.statisticProductOrder);
router.get("/statistic-room", orderController.statisticRoomOrder);
router.get("/statistic-total-price", orderController.statisticTotalPrice);

router.post("/add/payment", paymentController.createPayment);
router.post("/save/payment", paymentController.savePayment);

export default router;
