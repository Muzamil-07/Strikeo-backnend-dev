const express = require("express");
const auth = require("../../middleware/auth.js");
const {
  getAllDiscountEvents,
  getDiscountEventById,
  createDiscountEvent,
  updateDiscountEventById,
  deleteDiscountEventById,
  toggleDiscountEventStatus,
  getPublicDiscountEvents,
} = require("../../controllers/DiscountEvents/DiscountEvent.js");

const router = express.Router();

router.get("/pub/events", getPublicDiscountEvents);
// Middleware for verifying token and checking admin roles
router.use(auth.verifyToken, auth.isAdmin);

// Routes for Discount Events
router.get("/", getAllDiscountEvents); // Get all discount events
router.get("/:id", getDiscountEventById); // Get discount event by ID
router.post("/", createDiscountEvent); // Create a new discount event
router.put("/:id", updateDiscountEventById); // Update an existing discount event
router.delete("/:id", deleteDiscountEventById); // Delete a discount event
router.put("/status/:id", toggleDiscountEventStatus); // Activate/Deactivate discount event

module.exports = router;
