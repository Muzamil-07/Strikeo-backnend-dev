const express = require("express");
const OrderController = require("../../controllers/Order.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.get("/all", auth.verifyToken, auth.isAdmin, OrderController.getOrders);
router.get("/confirm", OrderController.confirmUserOrder);
router.use(auth.verifyToken, auth.isOptional);
router.post("/", OrderController.createOrder);
router.get("/", OrderController.getOrders);
router.use(auth.isAdminOrVendor);
router.get("/vendor/insights", OrderController.getVendorStats);
router.patch("/:id", OrderController.updateOrder);
router.get("/:id", OrderController.getOrderById);
// router.put("/:id", OrderController.updateOrder);
// router.delete("/:id", OrderController.deleteOrder);

module.exports = router;
