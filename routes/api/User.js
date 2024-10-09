const express = require("express");
const passport = require("passport");
const UserController = require("../../controllers/User.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.get(
  "/auth/google",
  (req, res, next) => {
    req.session.lastQuery = req.query;
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: process.env.BACKEND_URL + "/api/user/auth/failed",
  }),
  UserController.googleAuth
);
router.get(
  "/auth/facebook",
  (req, res, next) => {
    // console.log("redirecting user for logging in", req.session, req.query);
    req.session.lastQuery = req.query;
    // req.session.save();
    next();
  },
  passport.authenticate("facebook", { scope: ["public_profile", "email"] })
);
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: process.env.BACKEND_URL + "/api/user/auth/failed",
  }),
  UserController.facebookAuth
);
router.get("/auth/failed", UserController.authFailed);

router.get("/all", auth.verifyToken, auth.isAdmin, UserController.getAllUsers);

// User Auth V2
router.post("/contactForm", UserController.sendUserContactUsFormMail);
router.post("/sendOTP", UserController.sendUserOTP);
router.post("/verify-OTP", UserController.verifyUserOTP);
router.post("/signup-password", UserController.userSignup);
router.post("/user-login", UserController.userLogin);
router.post("/user-forgotPassword", UserController.forgotUserPassword);
router.post("/user-verifyForgot", UserController.verifyResetUserPassword);
router.post("/user-resetPassword", UserController.resetUserPassword);
router.put(
  "/user-updateProfile",
  auth.verifyToken,
  auth.isAdminOrUser,
  UserController.updateUserProfile
);
router.put(
  "/change-billingAddress/:id",
  auth.verifyToken,
  auth.isAdminOrUser,
  UserController.changeBillingAddess
);
router.put(
  "/delete-billingAddress/:id",
  auth.verifyToken,
  auth.isAdminOrUser,
  UserController.deleteBillingAddress
);

//--------//
router.post("/signup", UserController.signup);
router.post("/login", UserController.login);
router.post("/verify-email", UserController.verifyEmail);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);
router.put(
  "/update-profile",
  auth.verifyToken,
  auth.isAdminOrUser,
  UserController.updateProfile
);
router.put(
  "/update-BillAddress",
  auth.verifyToken,
  auth.isAdminOrUser,
  UserController.updateBillingAddess
);
router.get("/orders", auth.verifyToken, UserController.getUserOrders);
router.get("/orders/:id", auth.verifyToken, UserController.getUserOrderById);
router.get(
  "/order-query",
  auth.verifyToken,
  UserController.getUserOrderByQuery
);
router.get("/context", auth.verifyToken, UserController.getContext);
router.get("/favourites", auth.verifyToken, UserController.getFavourites);
router.post(
  "/favourites/add/:id",
  auth.verifyToken,
  UserController.addToFavourites
);
router.post(
  "/favourites/remove/:id",
  auth.verifyToken,
  UserController.removeFromFavourites
);
router.get("/", auth.verifyToken, UserController.getUser);

module.exports = router;
