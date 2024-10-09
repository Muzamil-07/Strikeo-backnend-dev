const express = require("express");
const AgentController = require("../../controllers/Agent.js");
const auth = require("../../middleware/auth.js");

const router = express.Router();

router.post("/create-password", AgentController.createPassword);

router.use(auth.verifyToken, auth.isAdminOrVendor);
router.get("/", AgentController.getAllAgents);
router.get("/:id", AgentController.getAgentById);

router.use(auth.verifyToken, auth.isAdmin);
router.post("/", AgentController.createAgent);
router.put("/:id", AgentController.updateAgentById);
router.put("/block/:id", AgentController.blockAgentById);
router.put("/unblock/:id", AgentController.unblockAgentById);

module.exports = router;
