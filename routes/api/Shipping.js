const express = require('express');
const router = express.Router();
const ShippingController = require('../../controllers/Shipping');

// Issue an Access Token
router.post('/issue-token', ShippingController.issueAccessToken);
``
// Issue a Refresh Token
router.post('/refresh-token', ShippingController.issueRefreshToken);

// Create a New Store
router.post('/stores', ShippingController.createStore);

// Get Stores
// router.get('/stores', getStores);
// Create a New Order
router.post('/orders', ShippingController.createOrder);

// // Create Bulk Orders
// router.post('/orders/bulk', createBulkOrder);

// // Get Order Short Info
// router.get('/orders/:consignmentId/info', getOrderInfo);
``
// Get Cities
router.get('/cities', ShippingController.getCities);

// Get Zones inside a particular City
router.get('/cities/:cityId/zones', ShippingController.getZonesInCity);

// Get Areas inside a particular Zone
router.get('/zones/:zoneId/areas', ShippingController.getAreasInZone);

// Price Calculation
router.post('/price-calculation', ShippingController.priceCalculation);

module.exports = router;
