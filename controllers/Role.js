const { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");
const Role = require("../models/Role.js");

const getAllRolesForAdmin = async (req, res, next) => {
	try {
		const { page, all, name, limit= 10,type='Vendor' } = req.query;

		if (all) {
			const roles = await Role.find({});
			return next(new OkResponse(roles));
		} else {
			const offset = page ? (parseInt(page) - 1) * limit : 0;

			const query = {
				type: {
					$eq: type,
				},
				name: {
					$nin :['SuperAdmin','Admin'] 
				}
			};
			if (name) query.name = new RegExp(name, "i");

			const options = {
				sort: { createdAt: -1 },
				offset,
				limit,
			};

			const roles = await Role.paginate(query, options);

			return next(
				new OkResponse({
					totalCategories: roles.totalDocs,
					roles: roles.docs,
					totalPages: roles.totalPages,
					currentPage: roles.page - 1,
					hasPrevPage: roles.hasPrevPage,
					hasNextPage: roles.hasNextPage,
					currentPage: roles.page,
				})
			);
		}
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const getAllRolesForVendor = async (req, res, next) => {
	try {
		const { page, all, name } = req.query;

		const limit = 8;
		const offset = page ? (parseInt(page) - 1) * limit : 0;

		const query = {
			type: {
				$eq: "Vendor",
				$ne: "Admin",
			},
			name: {
				$nin :['SuperAdmin','Admin'] 
			},
			isActive: true,
		};
		if (name) query.name = new RegExp(name, "i");

		const options = {
			sort: { createdAt: -1 },
			offset,
			limit,
		};

		const roles = await Role.paginate(query, options);

		return next(
			new OkResponse({
				totalRoles: roles.totalDocs,
				roles: roles.docs,
				totalPages: roles.totalPages,
				currentPage: roles.page - 1,
				hasPrevPage: roles.hasPrevPage,
				hasNextPage: roles.hasNextPage,
				currentPage: roles.page,
			})
		);
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const getRoleById = async (req, res, next) => {
	const { id } = { ...req.params };

	if (!id) return next(new BadRequestResponse("Role ID is required"));

	try {
		const role = await Role.findById(id);

		if (!role) return next(new BadRequestResponse("Role not found"));

		return next(new OkResponse(role));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const createRole = async (req, res, next) => {
	const { name, vendorPermissions,strikeOPermissions } = { ...req.body };

	if (!name) return next(new BadRequestResponse("Role name is required"));

	if (!vendorPermissions && !strikeOPermissions) return next(new BadRequestResponse("Permissions are required"));

	const data = { name }

	let filteredPermissions = [];
  const exceptingPermissions = [
    "View Vendor Roles",
    "Edit Vendor Role",
    "Add Vendor Role",
    "Enale/Disable Vendor Role",
    "View StrikeO Roles",
    "Edit StrikeO Role",
    "Add StrikeO Role",
    "Enale/Disable StrikeO Role",
  ];

  if (strikeOPermissions && strikeOPermissions?.length > 0) {
    filteredPermissions = strikeOPermissions.filter(
      (o) => !exceptingPermissions.includes(o)
    );
    data.strikeOPermissions = filteredPermissions;
    data.type = "StrikeO";
  }

  if (vendorPermissions && vendorPermissions?.length > 0) {
    filteredPermissions = vendorPermissions.filter(
      (o) => !exceptingPermissions.includes(o)
    );
    data.vendorPermissions = filteredPermissions;
  }

	try {
		const role = new Role({...data});
		await role.save();

		return next(new OkResponse(role));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse(error?.message||"Failed to create role"));
	}
};

const updateRoleById = async (req, res, next) => {
	const { id } = { ...req.params };

	if (!id) return next(new BadRequestResponse("Role ID is required"));

	try {
		const role = await Role.findById(id);

		if (!role) return next(new BadRequestResponse("Role not found"));

		const { name, vendorPermissions,strikeOPermissions, isActive } = { ...req.body };

		if (name) role.name = name;

		let filteredPermissions = [];
  const exceptingPermissions = [
    "View Vendor Roles",
    "Edit Vendor Role",
    "Add Vendor Role",
    "Enale/Disable Vendor Role",
    "View StrikeO Roles",
    "Edit StrikeO Role",
    "Add StrikeO Role",
    "Enale/Disable StrikeO Role",
  ];

  if (strikeOPermissions && strikeOPermissions?.length > 0) {
    filteredPermissions = strikeOPermissions.filter(
      (o) => !exceptingPermissions.includes(o)
    );
    role.strikeOPermissions = filteredPermissions;
   
  }

  if (vendorPermissions && vendorPermissions?.length > 0) {
    filteredPermissions = vendorPermissions.filter(
      (o) => !exceptingPermissions.includes(o)
    );
    role.vendorPermissions = filteredPermissions;
  }

		if (isActive !== undefined) role.isActive = isActive;

		await role.save();

		return next(new OkResponse(role));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const deleteRoleById = async (req, res, next) => {
	const { id } = { ...req.params };

	if (!id) return next(new BadRequestResponse("Category ID is required"));

	try {
		await Role.findByIdAndDelete(id);
		return next(new OkResponse("Role deleted successfully"));
	} catch (error) {
		console.log(error);
		return next(new BadRequestResponse("Something went wrong"));
	}
};

const RoleController = {
	getAllRolesForAdmin,
	getAllRolesForVendor,
	getRoleById,
	createRole,
	updateRoleById,
	deleteRoleById,
};

module.exports = RoleController;
