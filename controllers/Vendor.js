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

const getAllVendors = async (req, res, next) => {
  try {
    const { page, all, search, limit = 10 } = req.query;

    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const vendorRole = await Role.findOne({
      type: "Vendor",
      name: "Admin",
    });

    const query = {
      role: vendorRole.id,
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const options = {
      sort: { createdAt: -1 },
      populate: "role",
      offset,
      limit,
    };

    const vendors = await Vendor.paginate(query, options);

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

const getVendorById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Vendor ID is required"));

  try {
    const vendor = await User.findOne({ _id: id, role: "vendor" });

    if (!vendor) return next(new BadRequestResponse("Vendor not found"));

    return next(new OkResponse(vendor));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const createVendor = async (req, res, next) => {
  const validationError = validateVendorData(req.body);
  if (validationError) return next(new BadRequestResponse(validationError));

  try {
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
      company,
    } = req.body;

    let isCompanyExists;
    if (company) {
      isCompanyExists = await Company.findById(company);
    }

    // if (!isCompanyExists)
    //   return next(new BadRequestResponse("Company not found"));

    const vendorRole = await Role.findOne({
      type: "Vendor",
      name: "Admin",
    });

    // console.log(vendorRole);
    if (!vendorRole)
      return next(new BadRequestResponse("Vendor role not found"));

    const isVendorExists = await Vendor.findOne({
      "contact.email": contact.email,
    });

    if (isVendorExists)
      return next(new BadRequestResponse("Email already taken!"));

    const vendor = new Vendor({
      firstName,
      lastName,
      gender,
      country,
      dob,
      contact,
      profileImage,
      company,
      role: vendorRole.id,
    });

    if (alias) vendor.alias = alias;
    if (emergencyContact) vendor.emergencyContact = emergencyContact;
    if (company && isCompanyExists) {
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      vendor.reset_token = {
        token,
        link: `${process.env.FRONTEND_URL}/create-password?email=${contact.email}&token=${token}`,
        // 2 week token for password generation
        expires: Date.now() + 14 * 24 * 60 * 60 * 1000,
      };
      sendEmail(vendor, "Create Password", { createPassword: true });
    }

    await vendor.save();
    return next(new OkResponse(vendor));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
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
      return next(new BadRequestResponse("User already verified!"));
    }
    if (!vendor?.company || !(await Company.exists(vendor?.company))) {
      return next(
        new BadRequestResponse("User has no comapny or incomplete profile!")
      );
    }

    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    vendor.reset_token = {
      token,
      link: `${process.env.FRONTEND_URL}/create-password?email=${vendor?.contact.email}&token=${token}`,
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

  if (!id) return next(new BadRequestResponse("Vendor ID is required"));

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
      password,
    } = req.body;
    const vendor = await Vendor.findById(id);

    if (!vendor) return next(new BadRequestResponse("Vendor not found"));

    let isEmailChanged;

    if (vendor.contact.email !== contact.email) {
      isEmailChanged = true;
      const isUserExists = await Vendor.findOne({
        "contact.email": contact.email,
      });

      if (isUserExists)
        return next(new BadRequestResponse("User already exists"));
    }
    if (firstName) vendor.firstName = firstName;
    if (lastName) vendor.lastName = lastName;
    vendor.alias = alias;
    if (gender) vendor.gender = gender;
    if (country) vendor.country = country;
    if (dob) vendor.dob = dob;
    if (contact) vendor.contact = contact;
    if (emergencyContact) vendor.emergencyContact = emergencyContact;
    if (profileImage) vendor.profileImage = profileImage;

    if (password) {
      if (!vendor.validPassword(password) && !isEmailChanged) {
        vendor.new_password = password;
        sendEmail(vendor, "Password Reset", { updatePassword: true });
      }
      vendor.hash = password;
      vendor.setPassword();
    }
    // Send verification email again if super admin has updated the vendor's email before vendor verified
    if (isEmailChanged && !vendor.isVerified) {
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      vendor.reset_token = {
        token,
        link: `${process.env.FRONTEND_URL}/create-password?email=${vendor.contact.email}&token=${token}`,
        // 1 week token for password generation
        expires: Date.now() + 14 * 24 * 60 * 60 * 1000,
      };
      sendEmail(vendor, "Create Password", { createPassword: true });
    }
    await vendor.save();
    // Send email of password change to new email of vendor
    if (isEmailChanged && vendor.isVerified) {
      sendEmail(vendor, "Change Email", { changeEmail: true });
    }
    return next(new OkResponse(vendor));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

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
