const { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");
const User = require("../models/User.js");
const Vendor = require("../models/Vendor.js");
const Role = require("../models/Role.js");
const Admin = require("../models/StrikeO.js");
const { sendEmail } = require("../utils/mailer.js");

const login = async (req, res, next) => {
	const { email, password } = { ...req.body };

	try {
		if (!email || !password) {
			return next(new BadRequestResponse("Missing required parameters"));
		}

		const admin = await Admin.findOne({ email });
		const vendor = await Vendor.findByEmail(email);

		if (admin) {
			if (admin && !admin.validPassword(password)) {
				return next(new BadRequestResponse("Invalid password"));
			}

			return next(new OkResponse(admin.toAuthJSON()));
		} else if (vendor) {
			if (!vendor.isActive) {
				return next(new UnauthorizedResponse("Your account has been blocked"));
			}

			if (!vendor.isVerified) {
				return next(new UnauthorizedResponse("Your account has not been verified"));
			}

			if (!vendor.hash) {
				return next(new UnauthorizedResponse("You have not created your credentials yet"));
			}

			if (vendor && !vendor.validPassword(password)) {
				return next(new BadRequestResponse("Invalid password"));
			}

			return next(new OkResponse(vendor.toAuthJSON()));
		} else {
			return next(new BadRequestResponse("User not found"));
		}
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Failed to login"));
	}
};

const getAllUsers = async (req, res, next) => {
	try {
		const { page } = req.query;
		const limit = 10;
		const offset = page ? (parseInt(page) - 1) * limit : 0;

		const query = {
			role: "employee",
		};

		const options = {
			sort: { createdAt: -1 },
			populate:"activeBillingAddress",
			offset,
			limit,
		};

		const users = await User.paginate(query, options);

		return next(
			new OkResponse({
				totalCategories: users.totalDocs,
				users: users.docs,
				totalPages: users.totalPages,
				currentPage: users.page - 1,
				hasPrevPage: users.hasPrevPage,
				hasNextPage: users.hasNextPage,
				currentPage: users.page,
			})
		);
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const getUserById = async (req, res, next) => {
	const { id } = { ...req.params };

	if (!id) return next(new BadRequestResponse("User ID is required"));

	try {
		const user = await User.findById(id).populate("activeBillingAddress");

		if (!user) return next(new BadRequestResponse("User not found"));

		return next(new OkResponse(user));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const createUser = async (req, res, next) => {
	const { email, username, password, roleId } = { ...req.body };

	if (!email || !username || !password || !roleId) {
		return next(new BadRequestResponse("Missing required fields!"));
	}

	try {
		const role = await Role.findById(roleId);

		if (!role) return next(new BadRequestResponse("Role not found"));

		const emailUser = await User.findOne({ email });

		if (emailUser) return next(new BadRequestResponse("Email taken!"));

		const oldUser = await User.findOne({ username });

		if (oldUser) return next(new BadRequestResponse("Username taken!"));

		const user = new User({
			username,
			email,
			hash: password,
			role: "employee",
			roleDetails: roleId,
		});

		user.setPassword();

		await user.save();

		sendEmail({ email, password, role: role.name }, "Login Credentials", { loginCredentials: true });

		return next(new OkResponse(user));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const blockUser = async (req, res, next) => {
	const { id } = { ...req.params };

	if (!id) return next(new BadRequestResponse("User ID is required!"));

	try {
		const user = await User.findById(id);

		if (!user) {
			return next(new BadRequestResponse("User not found!"));
		}

		user.isActive = false;

		await user.save();

		return next(new OkResponse(user));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong!"));
	}
};

const unblockUser = async (req, res, next) => {
	const { id } = { ...req.params };

	if (!id) return next(new BadRequestResponse("User ID is required!"));

	try {
		const user = await User.findById(id);

		if (!user) {
			return next(new BadRequestResponse("User not found!"));
		}

		user.isActive = true;

		await user.save();

		return next(new OkResponse(user));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong!"));
	}
};

const updateUserById = async (req, res, next) => {
	const { id } = { ...req.params };

	if (!id) return next(new BadRequestResponse("User ID is required"));

	try {
		const { email, username, password, roleId } = { ...req.body };

		const user = await User.findById(id);

		if (!user) return next(new BadRequestResponse("User not found"));

		if (email) user.email = email;
		if (username) user.username = username;
		if (password) user.hash = password;
		if (roleId) user.roleDetails = roleId;

		user.setPassword();

		await user.save();

		return next(new OkResponse(user));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const deleteUserById = async (req, res, next) => {
	const { id } = { ...req.params };

	if (!id) return next(new BadRequestResponse("User ID is required"));

	try {
		await User.findByIdAndDelete(id);

		return next(new OkResponse("User deleted successfully"));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const AdminController = {
	login,
	getAllUsers,
	getUserById,
	createUser,
	updateUserById,
	deleteUserById,
	blockUser,
	unblockUser,
};

module.exports = AdminController;
