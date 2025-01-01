const express = require("express");
const CategoryController = require("../../controllers/Category.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.get("/all", CategoryController.getAllCategoriesForUsers);
router.get(
  "/auth-all",
  auth.verifyToken,
  auth.isAdminOrVendor,
  CategoryController.getAllCategoriesForAdminOrVendors
);

router.get("/:id", CategoryController.getCategoryById);

router.use(auth.verifyToken, auth.isAdmin);

router.get("/", CategoryController.getPaginatedCategoriesForSuperAdmin);

router.post("/", CategoryController.createCategory);

router.patch("/:id", CategoryController.updateCategoryById);

router.delete("/:id", CategoryController.deleteCategoryById);

module.exports = router;
