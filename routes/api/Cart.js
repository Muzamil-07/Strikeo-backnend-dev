const express = require("express");
const CartController = require("../../controllers/Cart.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.use(auth.verifyToken);

router.get("/", CartController.getCart);

router.post("/add", CartController.addToCart);
router.post("/add-bulk", CartController.addToCartInBulk);
router.put("/update", CartController.updateCart);
router.put("/update-qty", CartController.updateItemQuantity);
router.put("/update-select", CartController.selectUnselectItem);

router.post("/remove", CartController.removeFromCart);
router.post("/remove-bulk", CartController.removeFromCartInBulk);

module.exports = router;
