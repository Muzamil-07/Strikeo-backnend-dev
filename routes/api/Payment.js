const express = require("express");
const auth = require("../../middleware/auth.js");
const {
  init,
  validate,
  ipn_listener,
  success,
  fail,
  cancel,
} = require("../../controllers/sslCommerzPayment/controllers.js");
const router = express.Router();
//sslCommerz routes
router.post("/success", success);
router.post("/fail", fail);
router.post("/cancel", cancel);
router.post("/ipn_listener", ipn_listener);
router.post("/validate", validate);

router.post("/init", auth.verifyToken, init); // Only verifyToken here

module.exports = router;
