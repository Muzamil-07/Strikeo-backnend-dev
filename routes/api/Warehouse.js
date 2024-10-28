const express = require("express");
const WarehouseController = require("../../controllers/Warehouses/Warehouses.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

// Middleware for verifying token and checking roles
router.use(auth.verifyToken, auth.isAdmin);
router.get("/", WarehouseController.getAllWarehouses);
router.get("/:id", WarehouseController.getWarehouseById);

router.use(auth.verifyToken, auth.isAdmin);
router.post("/", WarehouseController.createWarehouse);
router.put("/:id", WarehouseController.updateWarehouseById);
router.delete("/:id", WarehouseController.deleteWarehouseById);
router.put("/blocking/:id", WarehouseController.toggleWarehouseStatus);

module.exports = router;
