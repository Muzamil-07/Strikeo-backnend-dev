const express = require("express");
const ProductController = require("../../controllers/Product.js");
const auth = require("../../middleware/auth.js");
const {
  bestSellers,
  relatedToRecentViewProducts,
  justForYou,
  bestSellersInHomeAndDecor,
  popularProductsInApparel,
  featureCategories,
} = require("../../controllers/ProductSection.js");

const router = express.Router();

router.get("/", ProductController.getPublicProducts);

router.get("/best-sellers", bestSellers);
router.get("/related-recent-view", relatedToRecentViewProducts);
router.get("/just-for-you", justForYou);
router.get("/best-seller-home-decor", bestSellersInHomeAndDecor);
router.get("/popular-apparel", popularProductsInApparel);
router.get("/featured-categories", featureCategories);

router.get("/s/:slug", ProductController.getProductBySlug);
router.get("/related/:id", ProductController.getRelatedProducts);
router.get(
  "/relatedOncheckout/:ids",
  ProductController.getRelatedProductsOnChecout
);
router.get(
  "/authenticated",
  auth.verifyToken,
  ProductController.getAllProducts
);
router.get(
  "/filterProducts",
  auth.verifyToken,
  ProductController.filterProducts
);
router.get(
  "/reviewed",
  auth.verifyToken,
  auth.isUser,
  ProductController.getReviewedProducts
);
router.get(
  "/pending-review",
  auth.verifyToken,
  auth.isUser,
  ProductController.getPendingReviewProducts
);
router.get("/:id", ProductController.getProduct);

router.use(auth.verifyToken);
router.post(
  "/:id/review",
  auth.verifyToken,
  auth.isUser,
  ProductController.addReview
);

router.use(auth.isAdminOrVendor);

router.post("/", ProductController.createProduct);
router.put("/reject/:id", ProductController.rejectProduct);
router.put("/disable/:id", ProductController.disableProduct);
router.put("/approve/:id", ProductController.approveProduct);
router.put("/block/:id", ProductController.blockProduct);
router.put("/unblock/:id", ProductController.unblockProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

module.exports = router;
