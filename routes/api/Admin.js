const express = require("express");
const AdminController = require("../../controllers/Admin.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.post("/login", AdminController.login);
router.use(auth.verifyToken, auth.isAdmin);

router.get("/", AdminController.getAllUsers);
router.get("/:id", AdminController.getUserById);

router.post("/", AdminController.createUser);
router.put("/:id", AdminController.updateUserById);
router.delete("/:id", AdminController.deleteUserById);

router.post("/block/:id", AdminController.blockUser);
router.post("/unblock/:id", AdminController.unblockUser);

module.exports = router;
