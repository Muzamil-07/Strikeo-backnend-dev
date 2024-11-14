const {
  OkResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} = require("express-http-response");
const validateVendorData = require("../utils/VendorValidator.js");
const Company = require("../models/Company.js");
const Vendor = require("../models/Vendor.js");
const User = require("../models/User.js");

const { sendEmail } = require("../utils/mailer.js");
const Role = require("../models/Role.js");
const { default: mongoose } = require("mongoose");
const filterObjectBySchema = require("../utils/filterObject.js");

const getAllVendors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (parseInt(page) - 1) * limit;

    const searchRegex = search ? new RegExp(search, "i") : null;

    const matchStage = searchRegex
      ? {
          $match: {
            $or: [
              { firstName: { $regex: searchRegex } },
              { lastName: { $regex: searchRegex } },
              { "contact.email": { $regex: searchRegex } },
              { "company.name": { $regex: searchRegex } },
            ],
          },
        }
      : { $match: {} };

    const pipeline = [
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "company",
        },
      },
      { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "role",
        },
      },
      matchStage,
      {
        $facet: {
          vendors: [
            { $skip: offset },
            { $limit: parseInt(limit) },
            { $sort: { createdAt: -1 } },
          ],
          totalCount: [{ $count: "total" }],
        },
      },
      {
        $project: {
          vendors: 1,
          totalVendors: { $arrayElemAt: ["$totalCount.total", 0] },
        },
      },
    ];

    const result = await Vendor.aggregate(pipeline).allowDiskUse(true);

    const vendors = result[0]?.vendors || [];
    const totalVendors = result[0]?.totalVendors || 0;

    return next(
      new OkResponse({
        vendors,
        totalVendors,
        totalPages: Math.ceil(totalVendors / limit),
        hasPrevPage: page > 1,
        hasNextPage: offset + limit < totalVendors,
        currentPage: page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const getVendorById = async (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id))
    return next(new BadRequestResponse("Vendor ID is required"));

  try {
    const vendor = await Vendor.findById(id);

    if (!vendor) return next(new BadRequestResponse("Vendor not found"));

    return next(new OkResponse(vendor));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const createVendor = async (req, res, next) => {
  try {
    const { contact, company } = req.body;

    // Find the Vendor role, expected to be of type "Vendor" and name "Admin"
    const vendorRole = await Role.findOne({ type: "Vendor", name: "Admin" });
    if (!vendorRole) {
      return next(new BadRequestResponse("Vendor role not found"));
    }

    // Check if a vendor with the same email already exists
    const isVendorExists = await Vendor.exists({
      "contact.email": contact.email,
    });
    if (isVendorExists) {
      return next(new BadRequestResponse("Email already taken!"));
    }

    // Define fields allowed for the vendor schema
    const vendorSchema = {
      firstName: true,
      lastName: true,
      alias: true,
      gender: true,
      country: true,
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
    };

    // Filter the payload based on the vendorSchema
    const filteredPayload = await filterObjectBySchema(req.body, vendorSchema);

    // Create the vendor object
    const vendor = new Vendor({
      ...filteredPayload,
      role: vendorRole._id,
    });

    // Save the vendor to the database
    await vendor.save();
    return next(new OkResponse(vendor));
  } catch (error) {
    console.error("Error creating vendor:", error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const resendPasswordGenMail = async (req, res, next) => {
  const { id } = req.params;
  // const { contact, company } = req.body;
  try {
    if (!id) return next(new BadRequestResponse("Vendor ID is required"));
    const vendor = await Vendor.findById(id);

    if (!vendor) return next(new BadRequestResponse("Vendor not found"));

    if (vendor?.isVerified) {
      return next(new BadRequestResponse("Vendor already verified!"));
    }
    if (!vendor?.company || !(await Company.exists(vendor?.company))) {
      return next(
        new BadRequestResponse("Vendor has no comapny or incomplete profile!")
      );
    }

    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    vendor.reset_token = {
      token,
      link: `${process.env.BACKEND_URL}/create-password?email=${vendor?.contact.email}&token=${token}`,
      // 2 week token for password generation
      expires: Date.now() + 14 * 24 * 60 * 60 * 1000,
    };
    sendEmail(vendor, "Create Password", { createPassword: true });

    await vendor.save();
    return next(
      new OkResponse({ reset_token_expires: vendor?.reset_token?.expires })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const updateVendorById = async (req, res, next) => {
  const { id } = req.params;
  if (!id || !mongoose.isValidObjectId(id))
    return next(new BadRequestResponse("Vendor ID is required"));

  try {
    const { contact, password = "" } = req.body;

    const vendor = await Vendor.findById(id);
    if (!vendor) return next(new BadRequestResponse("Vendor not found"));

    const vendorSchema = {
      firstName: true,
      lastName: true,
      alias: true,
      gender: true,
      country: true,
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
    };

    // Filter the payload based on the schema
    const updatePayload = await filterObjectBySchema(req.body, vendorSchema);

    let isEmailChanged = false;

    // Check for email change
    if (contact?.email && vendor.contact.email !== contact.email) {
      isEmailChanged = true;
      const existingUser = await Vendor.findOne({
        "contact.email": contact.email,
      });
      if (existingUser)
        return next(new BadRequestResponse("New is Email already in use"));
    }

    // Update the fields from the filtered payload
    Object.keys(updatePayload).forEach((key) => {
      vendor[key] = updatePayload[key];
    });

    // Password handling
    if (password) {
      if (!vendor.validPassword(password) && !isEmailChanged) {
        vendor.new_password = password;
        sendEmail(vendor, "Password Reset", { updatePassword: true });
      }
      vendor.hash = password;
      vendor.setPassword();
    }

    // Handle email verification process if email has changed and the vendor is not verified
    if (isEmailChanged && !vendor.isVerified) {
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      vendor.reset_token = {
        token,
        link: `${process.env.BACKEND_URL}/create-password?email=${contact.email}&token=${token}`,
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1-week expiration
      };
      sendEmail(vendor, "Create Password", { createPassword: true });
    }

    await vendor.save();

    // Notify verified vendor about email change
    if (isEmailChanged && vendor.isVerified) {
      sendEmail(vendor, "Change Email", { changeEmail: true });
    }

    return next(new OkResponse(vendor));
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

module.exports = { updateVendorById };

const blockVendorById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Vendor ID is required"));

  try {
    const vendor = await Vendor.findById(id);

    if (!vendor) return next(new BadRequestResponse("Vendor not found"));

    vendor.isActive = false;
    await vendor.save();

    return next(new OkResponse("Vendor blocked successfully"));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const unblockVendorById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Vendor ID is required"));

  try {
    const vendor = await Vendor.findById(id);

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
  getAllVendors,
  getVendorById,
  createVendor,
  createPassword,
  updateVendorById,
  blockVendorById,
  unblockVendorById,
  resendPasswordGenMail,
};

module.exports = VendorController;
