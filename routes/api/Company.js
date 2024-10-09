const express = require("express");
const CompanyController = require("../../controllers/Company.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.use(auth.verifyToken);
router.use(auth.isAdminOrVendor);
router.get("/employees", CompanyController.getAllEmployees);
router.get("/employee/:id", CompanyController.getEmployeeById);
router.get("/logs", CompanyController.getLogs);
router.post("/logs", CompanyController.addLog);
router.post("/add-employee", CompanyController.addEmployee);
router.put("/employee/:id", CompanyController.updateEmployeeById);
router.put("/employee/toggle-activation/:id", CompanyController.toggleEmployeeActivation);

router.use(auth.isAdmin);
// router.get("/", CompanyController.getAllVendors);
router.get("/:id", CompanyController.getCompanyById);

router.post("/", CompanyController.createCompany);
router.put("/:id", CompanyController.updateCompanyById);
// router.put("/block/:id", CompanyController.blockVendorById);
// router.put("/unblock/:id", CompanyController.unblockVendorById);

module.exports = router;
