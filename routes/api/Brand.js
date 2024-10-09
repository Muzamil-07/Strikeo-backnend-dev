const express = require("express");
const BrandController = require("../../controllers/Brand");
const auth = require("../../middleware/auth");

const router = express.Router();

// Other brand routes
router.get(
  "/",
  auth.verifyToken,
  auth.isAdminOrVendor,
  BrandController.getBrands
);
router.get(
  "/all",
  auth.verifyToken,
  auth.isAdminOrVendor,
  BrandController.getAllBrands
);
router.get(
  "/:id",
  auth.verifyToken,
  auth.isAdminOrVendor,
  BrandController.getBrandById
);
router.post(
  "/",
  auth.verifyToken,
  auth.isAdminOrVendor,
  BrandController.createBrand
);
// router.put("/:id", auth.verifyToken, BrandController.updateBrand);
// router.delete("/:id", auth.verifyToken, BrandController.deleteBrand);

// Top 10 brands route
router.get("/top/:subSubCategoryId", BrandController.getTop10Brands);

module.exports = router;
