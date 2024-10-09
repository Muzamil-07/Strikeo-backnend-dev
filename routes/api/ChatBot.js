// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const validateSecretKey = require("../../middleware/chatbot");
const {
  getUserForThird,
  getUserOrdersForThird,
  getUserOrderStatusForThird,
} = require("../../controllers/ChatBot/User");

// GET /api/user-info
router.get("/user-info", validateSecretKey, getUserForThird);

// GET /api/user-orders
router.get("/user-orders", validateSecretKey, getUserOrdersForThird);
router.get("/user-order-status", validateSecretKey, getUserOrderStatusForThird);

module.exports = router;
