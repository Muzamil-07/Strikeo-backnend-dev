const { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");
const validateAgentData = require("../utils/AgentValidator.js");
const Company = require("../models/Company.js");
const Vendor = require("../models/Vendor.js");
const Agent = require("../models/Agent.js");
const User = require("../models/User.js");

const { sendEmail } = require("../utils/mailer.js");
const Role = require("../models/Role.js");

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
					role: agentRole.id,
					country,
					city,
				},
				selectOps: {
					firstName: 1,
					lastName: 1,
				},
			},
			User: {
				query: {
					role: agentRole.id,
				}
			},
			StrikeO: {
				query: {
					role: agentRole.id,
					...(search?{$or : [
						{ firstName: { $regex: search, $options: "i" } },
						{ lastName: { $regex: search, $options: "i" } },
						{ email: { $regex: search, $options: "i" } },
					],}:{})
				}
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
		const { firstName, lastName, alias, gender, country, dob, contact, emergencyContact, profileImage, city, zipCode } =
			req.body;

		const agentRole = await Role.findOne({
			type: "Agent",
		});

		if (!agentRole) return next(new BadRequestResponse("Agent role not found"));

		const isAgentExists = await Agent.findOne({ email: contact.email });

		if (isAgentExists) return next(new BadRequestResponse("Agent already exists"));

		const agent = new Agent({
			firstName,
			lastName,
			gender,
			country,
			city,
			zipCode,
			dob,
			contact,
			profileImage,
			role: agentRole.id,
		});

		if (alias) agent.alias = alias;
		if (emergencyContact) agent.emergencyContact = emergencyContact;

		await agent.save();
		return next(new OkResponse(agent));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const updateAgentById = async (req, res, next) => {
	const { id } = req.params;

	if (!id) return next(new BadRequestResponse("Agent ID is required"));

	try {
		const { firstName, lastName, alias, gender, country, dob, contact, emergencyContact, profileImage, city, zipCode } =
			req.body;
		const agent = await Agent.findById(id);

		if (!agent) return next(new BadRequestResponse("Agent not found"));

		if (agent.contact.email !== contact.email) {
			const isUserExists = await Agent.findOne({
				"contact.email": contact.email,
			});

			if (isUserExists) return next(new BadRequestResponse("User already exists"));
		}

		if (firstName) agent.firstName = firstName;
		if (lastName) agent.lastName = lastName;
		agent.alias = alias;
		if (gender) agent.gender = gender;
		if (country) agent.country = country;
		if (city) agent.city = city;
		if (zipCode) agent.zipCode = zipCode;
		if (dob) agent.dob = dob;
		if (contact) agent.contact = contact;
		if (emergencyContact) agent.emergencyContact = emergencyContact;
		if (profileImage) agent.profileImage = profileImage;

		await agent.save();
		return next(new OkResponse(agent));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const blockAgentById = async (req, res, next) => {
	const { id } = req.params;

	if (!id) return next(new BadRequestResponse("Vendor ID is required"));

	try {
		const vendor = await User.findOne({ _id: id, role: "vendor" });

		if (!vendor) return next(new BadRequestResponse("Vendor not found"));

		vendor.isActive = false;
		await vendor.save();

		return next(new OkResponse("Vendor blocked successfully"));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const unblockAgentById = async (req, res, next) => {
	const { id } = req.params;

	if (!id) return next(new BadRequestResponse("Vendor ID is required"));

	try {
		const vendor = await User.findOne({ _id: id, role: "vendor" });

		if (!vendor) return next(new BadRequestResponse("Vendor not found"));

		vendor.isActive = true;
		await vendor.save();

		return next(new OkResponse("Vendor unblocked successfully"));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
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
	blockAgentById,
	unblockAgentById,
};

module.exports = VendorController;
