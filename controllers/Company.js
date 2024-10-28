const {
  OkResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} = require("express-http-response");
const validateCompany = require("../utils/CompanyValidator.js");
const Company = require("../models/Company.js");
const Vendor = require("../models/Vendor.js");
const User = require("../models/User.js");
const validateVendorData = require("../utils/VendorValidator.js");
const Role = require("../models/Role.js");
const { sendEmail } = require("../utils/mailer.js");
const Activity = require("../models/Activity.js");
const { default: mongoose } = require("mongoose");
const filterObjectBySchema = require("../utils/filterObject.js");

const getAllVendors = async (req, res, next) => {
  try {
    const { page, all } = req.query;

    const limit = 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const query = {
      role: "vendor",
    };

    const options = {
      sort: { name: 1 },
      offset,
      limit,
    };

    const vendors = await User.paginate(query, options);

    return next(
      new OkResponse({
        vendors: vendors.docs,
        totalVendors: vendors.totalDocs,
        totalPages: vendors.totalPages,
        hasPrevPage: vendors.hasPrevPage,
        hasNextPage: vendors.hasNextPage,
        currentPage: vendors.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};
const getAllCompanies = async (req, res, next) => {
  try {
    const { page, all, fields } = req.query;

    // Convert fields query parameter to an array of field names
    const selectedFields = fields
      ? fields.split(",").map((field) => field.trim())
      : [];

    // If `all` is true, fetch all companies without pagination
    if (all === "true") {
      const aggregationPipeline = [{ $sort: { name: 1 } }];

      // Add projection only if selectedFields is not empty
      if (selectedFields?.length > 0) {
        const projection = selectedFields.reduce(
          (acc, field) => ({ ...acc, [field]: 1 }),
          {}
        );
        aggregationPipeline.push({ $project: projection });
      }

      const companies = await Company.aggregate(aggregationPipeline);

      return next(
        new OkResponse({
          companies,
          totalCompanies: companies.length,
        })
      );
    }

    // Pagination logic
    const limit = 10;
    const offset = page ? (parseInt(page, 10) - 1) * limit : 0;

    const query = {};
    const options = {
      sort: { name: 1 },
      offset,
      limit,
      select: selectedFields.length > 0 ? selectedFields.join(" ") : undefined,
    };

    const companies = await Company.paginate(query, options);

    return next(
      new OkResponse({
        companies: companies.docs,
        totalCompanies: companies.totalDocs,
        totalPages: companies.totalPages,
        hasPrevPage: companies.hasPrevPage,
        hasNextPage: companies.hasNextPage,
        currentPage: companies.page,
      })
    );
  } catch (error) {
    console.error("Error fetching companies:", error); // More descriptive error logging
    return next(
      new BadRequestResponse(
        "Failed to retrieve companies. Please try again later."
      )
    );
  }
};

const getAllEmployees = async (req, res, next) => {
  try {
    const { page, all } = req.query;

    const limit = 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const vendorRole = await Role.findOne({
      type: "Vendor",
      name: "Admin",
    });

    const query = {
      company: req.user.company.id,
      role: { $ne: vendorRole.id },
    };

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
    };

    const employees = await Vendor.paginate(query, options);

    return next(
      new OkResponse({
        employees: employees.docs,
        totalEmployees: employees.totalDocs,
        totalPages: employees.totalPages,
        hasPrevPage: employees.hasPrevPage,
        hasNextPage: employees.hasNextPage,
        currentPage: employees.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const getEmployeeById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Employee ID is required"));

  try {
    const employee = await Vendor.findById(id);

    if (!employee) return next(new BadRequestResponse("Employee not found"));

    return next(new OkResponse(employee));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const getCompanyById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Company ID is required"));

  try {
    const company = await Company.findById(id);

    if (!company) return next(new BadRequestResponse("Company not found"));

    return next(new OkResponse(company));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const updateCompanyById = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id))
    return next(new BadRequestResponse("Company ID is required"));

  try {
    const company = await Company.findById(id);
    if (!company) return next(new BadRequestResponse("Company not found"));

    // Define allowed fields for updating the company
    const companySchema = {
      name: true,
      contact: {
        phone: true,
        email: true,
      },
      country: true,
      address: true,
      principalPOB: true,
      postalAddress: true,
      city: true,
      zipCode: true,
      description: true,
      website: true,
      warehouse: true,
      logo: true,
    };

    // Filter the payload based on the schema
    const updatePayload = await filterObjectBySchema(req.body, companySchema);

    // Update company fields with the filtered payload
    Object.entries(updatePayload).forEach(([key, value]) => {
      company[key] = value;
    });

    // Save updated company data
    await company.save();
    await company.populate("warehouse", "name");
    return next(new OkResponse(company));
  } catch (error) {
    console.error("Error updating company:", error);
    return next(
      new BadRequestResponse(error.message || "Something went wrong")
    );
  }
};

const createCompany = async (req, res, next) => {
  try {
    const { name, vendor = null } = req.body;

    // Check if a company with the same name already exists
    const companyWithSameName = await Company.exists({ name: name.trim() });
    if (companyWithSameName) {
      return next(
        new BadRequestResponse("Company already exists with this name")
      );
    }

    const companySchema = {
      name: true,
      contact: {
        phone: true,
        email: true,
      },
      country: true,
      address: true,
      principalPOB: true,
      postalAddress: true,
      city: true,
      zipCode: true,
      description: true,
      website: true,
      warehouse: true,
      logo: true,
    };

    // Filter the payload based on the schema
    const updatePayload = await filterObjectBySchema(req.body, companySchema);
    // Create the new company document
    const company = new Company({
      ...updatePayload,
    });

    // Save the company to the database
    await company.save();
    await company.populate("warehouse", "name");

    // If a vendor ID is provided, associate the vendor with the company
    if (vendor) {
      const findedVendor = await Vendor.findById(vendor);
      if (findedVendor) {
        const token =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);
        const reset_token = {
          token,
          link: `${process.env.BACKEND_URL}/create-password?email=${findedVendor.contact.email}&token=${token}`,
          // 1-week expiration for the password generation token
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };

        const updatedVendor = await Vendor.updateOne(
          { _id: vendor },
          {
            company: company._id,
            status: "completed",
            reset_token,
          }
        );

        // Send email if the vendor was successfully updated
        if (updatedVendor.modifiedCount > 0) {
          sendEmail(
            { ...findedVendor.toObject(), reset_token },
            "Create Password",
            {
              createPassword: true,
            }
          );
        }
      } else {
        console.log("Vendor not found for the provided vendor ID.");
      }
    }

    return next(new OkResponse(company));
  } catch (error) {
    console.error("Error creating company:", error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const addEmployee = async (req, res, next) => {
  const validationError = validateVendorData({
    ...req.body,
    company: req.user.company.id,
  });
  if (validationError) return next(new BadRequestResponse(validationError));

  try {
    const companyVendorRole = await Role.findOne({
      type: "Vendor",
      name: "Admin",
    });
    const isLimitReached =
      (await Vendor.countDocuments({
        company: req.user.company.id,
        role: {
          $ne: companyVendorRole.id,
        },
      })) >= 5;

    if (isLimitReached)
      return next(new BadRequestResponse("Max 5 employees can be added"));

    const {
      firstName,
      lastName,
      alias,
      gender,
      country,
      dob,
      contact,
      emergencyContact,
      profileImage,
      roleId,
    } = req.body;

    const vendorRole = await Role.findById(roleId);

    if (!vendorRole)
      return next(new BadRequestResponse("Employee role not found"));

    const isEmployeeExists = await Vendor.findOne({
      "contact.email": contact.email,
    });

    if (isEmployeeExists)
      return next(new BadRequestResponse("User already exists"));

    const vendor = new Vendor({
      firstName,
      lastName,
      gender,
      country,
      dob,
      contact,
      profileImage,
      alias,
      emergencyContact,
      company: req.user.company.id,
      role: vendorRole.id,
    });

    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    vendor.reset_token = {
      token,
      link: `${process.env.FRONTEND_URL}/create-password?email=${contact.email}&token=${token}`,
      // 1 week token for password generation
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    sendEmail(vendor, "Create Password", { createPassword: true });

    const activity = new Activity({
      employeeName: req.user.firstName + " " + req.user.lastName,
      company: req.user.company.id,
      type: "Created Employee",
      "Created Employee": {
        name: vendor.firstName + " " + vendor.lastName,
        message:
          "created new employee " +
          vendor.firstName +
          " " +
          vendor.lastName +
          " with email " +
          vendor.contact.email +
          ".",
      },
    });
    await activity.save();
    await vendor.save();
    return next(new OkResponse(vendor));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const updateEmployeeById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Employee ID is required"));

  try {
    const {
      firstName,
      lastName,
      alias,
      country,
      gender,
      dob,
      contact,
      emergencyContact,
      profileImage,
      roleId,
    } = req.body;
    const employee = await Vendor.findById(id);

    if (!employee) return next(new BadRequestResponse("Employee not found"));

    if (employee.company.id !== req.user.company.id.toString()) {
      return next(
        new UnauthorizedResponse(
          "You are not authorized to perform this action"
        )
      );
    }

    let role;

    if (roleId) role = await Role.findById(roleId);

    if (roleId && !role)
      return next(new BadRequestResponse("Employee role not found"));

    let isEmailChanged;

    if (employee.contact.email !== contact.email) {
      isEmailChanged = true;
      const isEmployeeExists = await Vendor.findOne({
        "contact.email": contact.email,
        company: req.user.company.id,
      });

      if (isEmployeeExists)
        return next(new BadRequestResponse("Employee already exists"));
    }

    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    employee.alias = alias;
    if (gender) employee.gender = gender;
    if (country) employee.country = country;
    if (dob) employee.dob = dob;
    if (contact) employee.contact = contact;
    if (emergencyContact) employee.emergencyContact = emergencyContact;
    if (profileImage) employee.profileImage = profileImage;
    if (role) employee.role = role.id;

    const activity = new Activity({
      employeeName: req.user.firstName + " " + req.user.lastName,
      company: req.user.company.id,
      type: "Updated Employee",
      "Updated Employee": {
        name: employee.firstName + " " + employee.lastName,
        message:
          "updated employee " +
          employee.firstName +
          " " +
          employee.lastName +
          " with email " +
          employee.contact.email +
          ".",
      },
    });
    await activity.save();
    await employee.save();
    if (isEmailChanged) {
      sendEmail(employee, "Change Email", { changeEmail: true });
    }
    return next(new OkResponse(employee));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const toggleEmployeeActivation = async (req, res, next) => {
  const { id } = req.params;

  try {
    const employee = await Vendor.findById(id);

    if (!employee) return next(new BadRequestResponse("Employee not found"));

    employee.isActive = !employee.isActive;

    const activityMessage = employee.isActive ? "activated" : "deactivated";
    const activity = new Activity({
      employeeName: req.user.firstName + " " + req.user.lastName,
      company: req.user.company.id,
      type: "Updated Employee",
      "Updated Employee": {
        name: employee.firstName + " " + employee.lastName,
        message:
          activityMessage +
          " employee " +
          employee.firstName +
          " " +
          employee.lastName +
          " with email " +
          employee.contact.email +
          ".",
      },
    });
    await activity.save();
    await employee.save();

    return next(new OkResponse(employee));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const getLogs = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const roleType = req.user.role.type;
    const employeeName = new RegExp(search, "i");

    // Permission based dynamic query
    const { query, populateOps } = {
      StrikeO: {
        query: {
          ...(search ? { employeeName } : {}),
        },
        populateOps: {
          path: "company",
          select: "name",
        },
      },
      Vendor: {
        query: {
          company: req.user.company,
          ...(search ? { employeeName } : {}),
        },
      },
    }[roleType];

    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
      populate: populateOps,
    };

    const activities = await Activity.paginate(query, options);

    return next(
      new OkResponse({
        totalActivities: activities.totalDocs,
        activities: activities.docs,
        totalPages: activities.totalPages,
        hasPrevPage: activities.hasPrevPage,
        hasNextPage: activities.hasNextPage,
        currentPage: activities.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const addLog = async (req, res, next) => {
  try {
    const { company, type, ...details } = req.body;

    const log = new Activity({
      employeeName: req.user.firstName + " " + req.user.lastName,
      company,
      type,
      ...details,
    });

    await log.save();

    return next(new OkResponse(log));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const CompanyController = {
  getAllCompanies,
  getAllVendors,
  createCompany,
  getCompanyById,
  updateCompanyById,
  getAllEmployees,
  addEmployee,
  updateEmployeeById,
  toggleEmployeeActivation,
  getEmployeeById,
  getLogs,
  addLog,
};

module.exports = CompanyController;
