const {
  OkResponse,
  BadRequestResponse,
  NotFoundResponse,
} = require("express-http-response");
const validateAgentData = require("../utils/AgentValidator.js");
const Vendor = require("../models/Vendor.js");
const Agent = require("../models/Agent.js");
const User = require("../models/User.js");
const filterObjectBySchema = require("../utils/filterObject.js");

const { sendEmail } = require("../utils/mailer.js");
const Role = require("../models/Role.js");
const { default: mongoose } = require("mongoose");
const { getProductId } = require("../utils/stringsNymber.js");
const Order = require("../models/Order.js");

const getAllAgents = async (req, res, next) => {
  try {
    const { page, all, search, country, city } = req.query;
    const roleType = req.user.role.type;

    const limit = 8;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const agentRole = await Role.findOne({
      type: "Agent",
    });

    const roleQueries = {
      Vendor: {
        query: {
          isVerified: true,
          isActive: true,
          role: agentRole.id,
          "deliveryRegions.country": { $regex: new RegExp(country, "i") },
          "deliveryRegions.city": { $regex: new RegExp(city, "i") },
        },
        selectOps: {
          firstName: 1,
          lastName: 1,
        },
      },
      StrikeO: {
        query: {
          role: agentRole.id,
          ...(search
            ? {
                $or: [
                  { firstName: { $regex: search, $options: "i" } },
                  { lastName: { $regex: search, $options: "i" } },
                  { email: { $regex: search, $options: "i" } },
                ],
              }
            : {}),
        },
      },
    };
    const { query, populateOps, selectOps } = roleQueries[roleType];

    const options = {
      sort: { createdAt: -1 },
      select: selectOps,
      offset,
      limit,
    };

    const agents = await Agent.paginate(query, options);

    return next(
      new OkResponse({
        agents: agents.docs,
        totalAgents: agents.totalDocs,
        totalPages: agents.totalPages,
        hasPrevPage: agents.hasPrevPage,
        hasNextPage: agents.hasNextPage,
        currentPage: agents.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const getAgentById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Agent ID is required"));

  try {
    const agent = await Agent.findById(id);

    if (!agent) return next(new BadRequestResponse("Agent not found"));

    return next(new OkResponse(agent));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const createAgent = async (req, res, next) => {
  const validationError = validateAgentData({ ...req.body, isAgent: true });
  if (validationError) return next(new BadRequestResponse(validationError));

  try {
    const { contact = "" } = req.body;

    const agentRole = await Role.findOne({
      type: "Agent",
    });

    if (!agentRole) return next(new BadRequestResponse("Agent role not found"));

    const isAgentExists = await Agent.findOne({ email: contact.email });
    if (isAgentExists)
      return next(new BadRequestResponse("Agent already exists"));

    const agentSchema = {
      firstName: true,
      lastName: true,
      alias: true,
      gender: true,
      country: true,
      region: true,
      zone: true,
      area: true,
      dob: true,
      contact: true,
      emergencyContact: true,
      profileImage: true,
      city: true,
      zipCode: true,
      // New field: Regions the agent can deliver to
      deliveryRegions: [
        {
          country: true,
          state: true,
          city: true,
          zone: true,
          area: true,
          zipCodes: true, // Array of supported zip codes
        },
      ],
      // warehouse: true,
      availability: {
        days: true,
        startTime: true,
        endTime: true,
      },
      vehicle: {
        type: true,
        capacity: true,
      },
    };
    // Filter the payload based on the schema
    const updatePayload = await filterObjectBySchema(
      { ...req?.body },
      agentSchema
    );

    const agent = new Agent({
      ...updatePayload,
      role: agentRole.id,
    });

    if (agent) {
      const createdAgent = JSON.parse(JSON.stringify(agent));
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const reset_token = {
        token,
        link: `${process.env.BACKEND_URL}/agent/create-password?email=${createdAgent?.contact?.email}&token=${token}`,
        // 1-week expiration for the password generation token
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };

      // Send email if the agent was successfully updated
      if (createdAgent?.contact?.email) {
        await sendEmail(
          { ...createdAgent, reset_token, userType: "Agent" },
          "Create Password",
          {
            createPassword: true,
          }
        );
        agent.reset_token = reset_token;
      }
      await agent.save();
    }
    return next(new OkResponse(agent));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const updateAgentById = async (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id))
    return next(new BadRequestResponse("Agent ID is required"));

  try {
    const { contact, password = "" } = req.body;

    // Fetch agent by ID
    const agent = await Agent.findById(id);
    if (!agent) return next(new BadRequestResponse("Agent not found"));

    const agentSchema = {
      firstName: true,
      lastName: true,
      alias: true,
      gender: true,
      country: true,
      region: true,
      zone: true,
      area: true,
      dob: true,
      contact: {
        phone: true,
        secondaryPhone: true,
        email: true,
        address: true,
      },
      emergencyContact: {
        phone: true,
        name: true,
      },
      profileImage: true,
      city: true,
      zipCode: true,
      deliveryRegions: [
        {
          country: true,
          state: true,
          city: true,
          zone: true,
          area: true,
          zipCodes: true,
        },
      ],
      availability: {
        days: true,
        startTime: true,
        endTime: true,
      },
      vehicle: {
        type: true,
        capacity: true,
      },
    };
    // Filter the payload based on the schema
    const updatePayload = await filterObjectBySchema(req.body, agentSchema);

    let isEmailChanged = false;

    // Check for email change
    if (contact?.email && agent.contact.email !== contact.email) {
      isEmailChanged = true;
      const existingUser = await Agent.findByEmail(contact.email);
      if (existingUser)
        return next(new BadRequestResponse("New email is already in use"));
    }

    // Update the fields from the filtered payload
    Object.keys(updatePayload).forEach((key) => {
      agent[key] = updatePayload[key];
    });

    // Password handling
    if (password) {
      if (!agent.validPassword(password) && !isEmailChanged) {
        agent.new_password = password;
        sendEmail(agent, "Password Reset", { updatePassword: true });
      }
      agent.hash = password;
      agent.setPassword();
    }

    // Handle email verification process if email has changed and the agent is not verified
    if (isEmailChanged && !agent.isVerified) {
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      agent.reset_token = {
        token,
        link: `${process.env.BACKEND_URL}/agent/create-password?email=${contact.email}&token=${token}`,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1-week expiration
      };
      sendEmail(agent, "Create Password", { createPassword: true });
    }

    await agent.save();

    // Notify verified agent about email change
    if (isEmailChanged && agent.isVerified) {
      sendEmail(
        {
          ...agent.toObject(),
          loginURL: `${process.env.BACKEND_URL}/agent/login`,
        },
        "Change Email",
        { changeEmail: true }
      );
    }

    return next(new OkResponse(agent));
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const toggleAgentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate payload
    if (typeof isActive !== "boolean") {
      return next(new BadRequestResponse({ message: "Invalid status value" }));
    }

    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return next(new BadRequestResponse({ message: "Invalid agent ID" }));
    }

    // Update the agent's isActive status
    const updatedAgent = await Agent.findByIdAndUpdate(
      id,
      { isActive: isActive ? true : false },
      { new: true }
    );

    if (!updatedAgent) {
      return next(new NotFoundResponse({ message: "Agent not found" }));
    }

    return next(
      new OkResponse({
        message: `Successfully ${
          updatedAgent?.isActive ? "Unblocked" : "Blocked"
        }`,
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const deleteAgentById = async (req, res, next) => {
  const { id } = req.params; // Assuming you're using :id in the route

  // Validate ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return next(new BadRequestResponse({ message: "Invalid agent ID" }));
  }

  // Find the agent by ID and delete
  const agent = await Agent.findByIdAndDelete(id);

  // If the agent does not exist
  if (!agent) {
    return next(new NotFoundResponse({ message: "Agent not found" }));
  }

  return next(
    new OkResponse({
      message: "Agent deleted successfully",
    })
  );
};

const createPassword = async (req, res, next) => {
  const { email, token, password } = req.body;

  try {
    if (!email || !token || !password) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const agent = await Agent.findByEmail(email);

    if (!agent) {
      return next(new BadRequestResponse("Agent not found!"));
    }

    if (agent.isVerified) {
      return next(new BadRequestResponse("Agent already verified!"));
    }

    if (!agent.reset_token || agent.reset_token.token !== token) {
      return next(new BadRequestResponse("Invalid token!"));
    }

    if (agent.reset_token.expires < Date.now()) {
      return next(new BadRequestResponse("Session expired!"));
    }

    agent.hash = password;
    agent.reset_token = null;

    agent.setPassword();
    agent.isVerified = true;

    await agent.save();

    return next(new OkResponse("Password reset successfully!"));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};
const agentLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const agent = await Agent.findByEmail(email).populate("role");

    if (!agent) {
      return next(new BadRequestResponse("User not found"));
    }

    if (!agent.isActive) {
      return next(new BadRequestResponse("You've been blocked by Admin!"));
    }

    if (!agent.isVerified) {
      return next(new BadRequestResponse("Please verify your account!"));
    }
    if (!agent.validPassword(password)) {
      return next(new BadRequestResponse(`Invalid email or password`));
    }

    return next(new OkResponse(agent.toAuthJSON()));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};
const getAgent = async (req, res, next) => {
  const id = getProductId(req.user);

  try {
    if (!id || !mongoose.isValidObjectId(id)) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const agent = await Agent.findById(id).populate("role");

    if (!agent) {
      return next(new NotFoundResponse("Agent not found"));
    } else {
      return next(new OkResponse(agent));
    }
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const getOrdersByAgentID = async (req, res, next) => {
  try {
    const {
      page = 1,
      search = "",
      status,
      limit = 10,
      user,
      agent: agentID,
      completed,
    } = req.query;
    // Role-based parameter validation
    if (!agentID || !mongoose.isValidObjectId(agentID)) {
      return next(new BadRequestResponse("Missing required parameters"));
    }
    const roleType = req.user.role.type;
    const orderNumber = search ? new RegExp(search, "i") : undefined;
    const completedFilter = completed ? JSON.parse(completed) : false;

    // Validation for completed filter
    if (completed && typeof completedFilter !== "boolean") {
      return next(
        new BadRequestResponse("Completion Filter should be a Boolean")
      );
    }

    // Permission-based dynamic query construction
    const roleConfig = {
      Agent: {
        query: {
          agent: agentID,
          isConfirmed: true,
          ...(completedFilter ? { isCompleted: completedFilter } : {}),
          ...(orderNumber ? { orderNumber } : {}),
          ...(user ? { customer: user } : {}),
          ...(status ? { status } : {}),
        },
        populateOps: [
          { path: "company", select: "name" },
          { path: "payment", select: "status method" },
        ],
        selectOps: {
          company: 1,
          orderNumber: 1,
          status: 1,
          isCompleted: 1,
          isConfirmed: 1,
          payment: 1,
          customerBill: 1,
          "shippingDetails.shippingCost": 1,
          items: 1,
        },
      },
    }[roleType];

    // Calculate pagination offset
    const offset = (parseInt(page, 10) - 1) * limit;

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
      select: roleConfig.selectOps,
      populate: roleConfig.populateOps,
    };

    const orders = await Order.paginate(roleConfig.query, options);

    return next(
      new OkResponse({
        totalOrders: orders.totalDocs,
        orders: orders.docs,
        totalPages: orders.totalPages,
        hasPrevPage: orders.hasPrevPage,
        hasNextPage: orders.hasNextPage,
        currentPage: orders.page,
      })
    );
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};
const VendorController = {
  getAllAgents,
  getAgentById,
  createAgent,
  createPassword,
  updateAgentById,
  toggleAgentStatus,
  deleteAgentById,
  agentLogin,
  getAgent,
  getOrdersByAgentID,
};

module.exports = VendorController;
