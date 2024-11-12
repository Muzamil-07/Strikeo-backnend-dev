const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const uniqueValidator = require("mongoose-unique-validator");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { SECRET_KEY: secret } = process.env;

const VendorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    alias: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      secondaryPhone: {
        type: String,
      },
      email: {
        type: String,
        unique: true,
        match: [/\S+@\S+\.\S+/, "is invalid"],
      },
      address: {
        type: String,
        required: true,
      },
    },
    emergencyContact: {
      phone: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    profileImage: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    reset_token: {
      type: {
        token: String,
        link: String,
        expires: Date,
      },
      default: null,
    },
    hash: {
      type: String,
    },
    salt: {
      type: String,
    },
  },
  { timestamps: true }
);

VendorSchema.plugin(uniqueValidator, { message: "is already taken." });
VendorSchema.plugin(mongoosePaginate);

const autoPopulate = function (next) {
  this.populate("company");
  this.populate("role");
  next();
};

VendorSchema.pre("findOne", autoPopulate);
VendorSchema.pre("find", autoPopulate);

VendorSchema.methods.setPassword = function () {
  this.salt = bcrypt.genSaltSync();
  this.hash = bcrypt.hashSync(this.hash, this.salt);
};

VendorSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.hash);
};

VendorSchema.statics.findByEmail = function (email) {
  return this.findOne({ "contact.email": email });
};

VendorSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.contact.email,
      company: this.company,
      profileImage: this.profileImage,
    },
    secret,
    { expiresIn: "2d" }
  );
};

VendorSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    alias: this.alias,
    gender: this.gender,
    country: this.country,
    dob: this.dob,
    contact: this.contact,
    emergencyContact: this.emergencyContact,
    profileImage: this.profileImage,
    isVerified: this.isVerified,
    isActive: this.isActive,
    company: this.company,
    isCompleted: this.isCompleted,
    role: this.role,
    token: this.generateJWT(),
  };
};

VendorSchema.methods.toJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    alias: this.alias,
    gender: this.gender,
    country: this.country,
    dob: this.dob,
    contact: this.contact,
    emergencyContact: this.emergencyContact,
    profileImage: this.profileImage,
    isVerified: this.isVerified,
    isActive: this.isActive,
    company: this.company,
    isCompleted: this.isCompleted,
    role: this.role,
    reset_token_expires: this.reset_token?.expires,
  };
};

module.exports = mongoose.model("Vendor", VendorSchema);
