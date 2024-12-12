const express = require("express");
const auth = require("../../middleware/auth.js");
const {
  getAllPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCodeById,
  deletePromoCodeById,
  togglePromoCodeStatus,
  validatePromoCode,
  collectPromoCodeForCustomer,
  getCollectedPromoCodesForCustomer,
  getAvailablePromoCodes,
  deleteCollectedPromoCodeForCustomer,
  applyPromoCode,
} = require("../../controllers/PromoCode/PromoCode.js");
const router = express.Router();

router.get(
  "/collected",
  auth.verifyToken,
  auth.isUser,
  getCollectedPromoCodesForCustomer
);
router.post("/apply", auth.verifyToken, auth.isUser, applyPromoCode);
router.post(
  "/collect",
  auth.verifyToken,
  auth.isUser,
  collectPromoCodeForCustomer
);
router.delete(
  "/remove/:id",
  auth.verifyToken,
  auth.isUser,
  deleteCollectedPromoCodeForCustomer
);
// Middleware for verifying token and checking admin roles
router.use(auth.verifyToken, auth.isAdmin);

// Routes for Promo Codes
router.get("/available", getAvailablePromoCodes); // Get all promo codes
router.get("/", getAllPromoCodes); // Get all promo codes
router.get("/:id", getPromoCodeById); // Get promo code by ID
router.post("/", createPromoCode); // Create a new promo code
router.put("/:id", updatePromoCodeById); // Update an existing promo code
router.delete("/:id", deletePromoCodeById); // Delete a promo code
router.put("/status/:id", togglePromoCodeStatus); // Activate/Deactivate promo code

module.exports = router;
