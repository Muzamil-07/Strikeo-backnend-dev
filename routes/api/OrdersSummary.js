const express = require("express");
const auth = require("../../middleware/auth.js");
const {
  getOrderSummaries,
} = require("../../controllers/OrdersSummary/OrdersSummary.js");

const router = express.Router();

router.use(auth.verifyToken, auth.isAdmin);
router.get("/", getOrderSummaries);

module.exports = router;
