const express = require("express");
const router = express.Router();
const ShippingController = require("../../controllers/Shipping");
const auth = require("../../middleware/auth");

// Issue an Access Token
router.post(
  "/issue-token",
  auth.verifyToken,
  auth.isAdmin,
  ShippingController.issueAccessToken
);
``;
// Issue a Refresh Token
router.post(
  "/refresh-token",
  auth.verifyToken,
  auth.isAdmin,
  ShippingController.issueRefreshToken
);

// Create a New Store
router.post(
  "/stores",
  auth.verifyToken,
  auth.isAdmin,
  ShippingController.createStore
);

// Get Stores
// router.get('/stores', getStores);
// Create a New Order
router.post(
  "/orders",
  auth.verifyToken,
  auth.isOptional,
  ShippingController.createOrder
);

// // Create Bulk Orders
// router.post('/orders/bulk', createBulkOrder);

// // Get Order Short Info
// router.get('/orders/:consignmentId/info', getOrderInfo);
``;
// Get Cities
router.get(
  "/cities",
  auth.verifyToken,
  auth.isOptional,
  ShippingController.getCities
);

// Get Zones inside a particular City
router.get(
  "/cities/:cityId/zones",
  auth.verifyToken,
  auth.isOptional,
  ShippingController.getZonesInCity
);

// Get Areas inside a particular Zone
router.get(
  "/zones/:zoneId/areas",
  auth.verifyToken,
  auth.isOptional,
  ShippingController.getAreasInZone
);

// Price Calculation
router.post(
  "/price-calculation",
  auth.verifyToken,
  auth.isOptional,
  ShippingController.priceCalculation
);

module.exports = router;
