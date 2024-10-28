// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const validateSecretKey = require("../../middleware/chatbot");
const {
  getUserForThird,
  getUserOrdersForThird,
  getUserOrderStatusForThird,
} = require("../../controllers/ChatBot/User");
const auth = require("../../middleware/auth");
const {
  sendMessage,
  getUserChatHistory,
  getAllChatbotHistory,
  openChatProtocol,
} = require("../../controllers/Chatbot");

//Send Message from user end
router.post("/send-message", auth.verifyToken, sendMessage);
router.get("/get-chat-histories", auth.verifyToken, getAllChatbotHistory);
router.get("/get-user-chat-histories", auth.verifyToken, getUserChatHistory);

// GET /api/user-info
router.get("/user-info", validateSecretKey, getUserForThird);

// GET /api/user-orders
router.get("/user-orders", validateSecretKey, getUserOrdersForThird);
router.get("/user-order-status", validateSecretKey, getUserOrderStatusForThird);

// GET /api/chatbot/open-protocol
router.get("/open-protocol", openChatProtocol);

module.exports = router;
