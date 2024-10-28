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
          zipCodes: true, // Array of supported zip codes
        },
      ],
      warehouse: true,
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

    await agent.save();
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

  if (!id) return next(new BadRequestResponse("Agent ID is required"));

  try {
    const agent = await Agent.findById(id);

    if (!agent) return next(new BadRequestResponse("Agent not found"));

    const agentSchema = {
      firstName: true,
      lastName: true,
      alias: true,
      gender: true,
      country: true,
      region: true,
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
          zipCodes: true, // Array of supported zip codes
        },
      ],
      warehouse: true,
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
    const updatedAgent = await Agent.updateOne(
      { _id: id },
      { ...updatePayload }
    );

    return next(new OkResponse(updatedAgent));
  } catch (error) {
    console.log(error);
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

    const vendor = await Vendor.findByEmail(email);

    if (!vendor) {
      return next(new BadRequestResponse("User not found!"));
    }

    if (vendor.isVerified) {
      return next(new BadRequestResponse("User already verified!"));
    }

    if (!vendor.reset_token || vendor.reset_token.token !== token) {
      return next(new BadRequestResponse("Invalid token!"));
    }

    if (vendor.reset_token.expires < Date.now()) {
      return next(new BadRequestResponse("Token expired!"));
    }

    vendor.hash = password;
    vendor.reset_token = null;

    vendor.setPassword();
    vendor.isVerified = true;

    await vendor.save();

    return next(new OkResponse("Password reset successfully!"));
  } catch (error) {
    return next(new BadRequestResponse(error));
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
};

module.exports = VendorController;
