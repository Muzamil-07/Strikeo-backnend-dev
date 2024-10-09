const express = require("express");
const VendorController = require("../../controllers/Vendor.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.post("/create-password", VendorController.createPassword);
router.use(auth.verifyToken, auth.isAdmin);

router.get("/", VendorController.getAllVendors);
router.get("/:id", VendorController.getVendorById);

router.post("/", VendorController.createVendor);
router.put("/:id", VendorController.updateVendorById);
router.put("/resendPasswordGenMail/:id", VendorController.resendPasswordGenMail);
router.put("/block/:id", VendorController.blockVendorById);
router.put("/unblock/:id", VendorController.unblockVendorById);

module.exports = router;
