const express = require("express");
const RoleController = require("../../controllers/Role.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.use(auth.verifyToken);
router.get("/vendor", RoleController.getAllRolesForVendor);

router.use(auth.isAdmin);

router.get("/admin", RoleController.getAllRolesForAdmin);
router.get("/:id", RoleController.getRoleById);

router.post("/", RoleController.createRole);

router.put("/:id", RoleController.updateRoleById);

router.delete("/:id", RoleController.deleteRoleById);

module.exports = router;
