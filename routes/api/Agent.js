const express = require("express");
const AgentController = require("../../controllers/Agent.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.post("/create-password", AgentController.createPassword);
router.post("/login", AgentController.agentLogin);
router.get("/verify", auth.verifyToken, AgentController.getAgent);
router.get(
  "/orders",
  auth.verifyToken,
  auth.isAdminOrAgent,
  AgentController.getOrdersByAgentID
);

router.use(auth.verifyToken, auth.isAdminOrVendor);
router.get("/", AgentController.getAllAgents);
router.get("/:id", AgentController.getAgentById);

router.use(auth.verifyToken, auth.isAdmin);
router.post("/", AgentController.createAgent);
router.put("/:id", AgentController.updateAgentById);
router.delete("/:id", AgentController.deleteAgentById);

router.put(
  "/blocking/:id",
  auth.verifyToken,
  auth.isAdmin,
  AgentController.toggleAgentStatus
);

module.exports = router;
