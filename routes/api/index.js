const express = require("express");
const UserRoute = require("./User.js");
const CartRoute = require("./Cart.js");
const FavouriteRoute = require("./FavouriteProduct.js");
const ProductRoute = require("./Product.js");
const OrderRoute = require("./Order.js");
const CategoryRoute = require("./Category.js");
const RoleRoute = require("./Role.js");
const AdminRoute = require("./Admin.js");
const PaymentRoute = require("./Payment.js");
const VendorRoute = require("./Vendor.js");
const AgentRoute = require("./Agent.js");
const CompanyRoute = require("./Company.js");
const BrandRoute = require("./Brand.js");
const ReviewRoute = require("./Review.js");
const ShippingRoute = require("./Shipping.js");
const ChatBotRoute = require("./ChatBot.js");

const router = express.Router();

router.use("/user", UserRoute);
router.use("/cart", CartRoute);
router.use("/favouriteProduct", FavouriteRoute);
router.use("/product", ProductRoute);
router.use("/order", OrderRoute);
router.use("/payment", PaymentRoute);
router.use("/category", CategoryRoute);
router.use("/role", RoleRoute);
router.use("/admin/user", AdminRoute);
router.use("/vendor", VendorRoute);
router.use("/agent", AgentRoute);
router.use("/company", CompanyRoute);
router.use("/brand", BrandRoute);
router.use("/reviews", ReviewRoute);
router.use("/shipping", ShippingRoute);
router.use("/chatbot", ChatBotRoute);

module.exports = router;
