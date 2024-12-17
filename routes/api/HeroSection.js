const express = require("express");
const auth = require("../../middleware/auth.js");
const {
  getHeroSectionById,
  createHeroSection,
  updateHeroSectionById,
  deleteHeroSectionById,
  toggleHeroSectionStatus,
  getPublicHeroSections,
  getAllHeroSections,
} = require("../../controllers/HeroSection/HeroSection.js");

const router = express.Router();

// Public routes for Hero Sections
router.get("/pub", getPublicHeroSections); // Get all active hero sections
router.get("/pub/:id", getHeroSectionById); // Get a hero section by ID

// Middleware for verifying token and checking admin roles
router.use(auth.verifyToken, auth.isAdmin);

// Admin routes for managing Hero Sections
router.get("/", getAllHeroSections); // Get all hero sections (including inactive ones)
router.get("/:id", getHeroSectionById); // Get hero section by ID
router.post("/", createHeroSection); // Create a new hero section
router.put("/:id", updateHeroSectionById); // Update an existing hero section
router.delete("/:id", deleteHeroSectionById); // Delete a hero section
router.put("/status/:id", toggleHeroSectionStatus); // Activate/Deactivate hero section

module.exports = router;
