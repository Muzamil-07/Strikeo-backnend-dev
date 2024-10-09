/** @format */

const express = require("express");
const auth = require("../../middleware/auth.js");
const ReviewController = require("../../controllers/Review.js");

const router = express.Router();

router.get("/product/:slug", ReviewController.getReviewsByProductSlug);
router.get("/", auth.verifyToken, ReviewController.getReviews);
router.get(
  "/product-wise/:productId",
  auth.verifyToken,
  ReviewController.getReviewsByProductAndUser
);
router.post("/", auth.verifyToken, ReviewController.submitReview);
router.put("/:reviewId", auth.verifyToken, ReviewController.updateReview);
router.delete(
  "/:reviewId",
  auth.verifyToken,
  ReviewController.deleteUserReview
);
router.delete(
  "/vendor/:reviewId",
  auth.verifyToken,
  auth.isAdminOrVendor,
  ReviewController.deleteUserReviewByVendor
);
router.put(
  "/vendor/approve/:reviewId",
  auth.verifyToken,
  auth.isAdminOrVendor,
  ReviewController.approvedAndActiveReview
);

module.exports = router;
