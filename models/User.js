const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoosePaginate = require("mongoose-paginate-v2");

const { SECRET_KEY: secret } = process.env;

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    username: {
      type: String,
    },
    email: {
      type: String,
      sparse: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "invalid email format",
      ],
    },
    phone: {
      type: String,
      sparse: true,
      match: [
        /^\+\d{1,3}\d{7,12}$/,
        "Invalid phone number format. Phone number must be in E.164 format.",
      ],
    },
    profileImage: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    dob: {
      type: Date,
      default: null,
    },
    country: {
      type: String,
    },
    authType: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    googleId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
    activeBillingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Billing",
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
    favouriteProducts: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FavouriteProduct",
    },
    billingAddresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Billing",
      },
    ],
    promotions: {
      promoCodes: [{ type: mongoose.Schema.Types.ObjectId, ref: "PromoCode" }],
    },
    reset_token: {
      type: {
        token: String,
        // link: String,
        expires: Date,
      },
      default: null,
    },
    verify_OTP: {
      type: {
        code: String,
        expires: Date,
      },
      default: null,
    },
    reset_OTP: {
      type: {
        code: String,
        expires: Date,
      },
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
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

// Custom validation to check at least one of email or phone is provided
UserSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    this.invalidate("email", "Email or phone number is required.");
    this.invalidate("phone", "Email or phone number is required.");
  }
  next();
});

// Create Sparse Unique Indexes for Email and Phone
UserSchema.index({ email: 1, phone: 1 }, { unique: true, sparse: true });

UserSchema.plugin(uniqueValidator, { message: "is already taken." });
UserSchema.plugin(mongoosePaginate);

UserSchema.methods.setPassword = function () {
  this.salt = bcrypt.genSaltSync();
  this.hash = bcrypt.hashSync(this.hash, this.salt);
};

UserSchema.methods.validPassword = function (password) {
  if (!this.hash) return;
  return bcrypt.compareSync(password, this.hash);
};

UserSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      id: this.id,
      email: this.email,
      username: this.username,
    },
    secret,
    { expiresIn: "2d" }
  );
};

UserSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    username: this.username,
    profileImage: this.profileImage,
    gender: this.gender,
    dob: this.dob,
    country: this.country,
    isActive: this.isActive,
    isVerified: this.isVerified,
    cart: this.cart,
    favouriteProducts: this.favouriteProducts
      ? this.favouriteProducts.toObject()
      : this.favouriteProducts,
    activeBillingAddress: this.activeBillingAddress,
    billingAddresses: this.billingAddresses,
    role: this.role,
    token: this.generateJWT(),
  };
};

UserSchema.methods.toJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    username: this.username,
    profileImage: this.profileImage,
    gender: this.gender,
    dob: this.dob,
    country: this.country,
    isActive: this.isActive,
    isVerified: this.isVerified,
    cart: this.cart,
    favouriteProducts: this.favouriteProducts,
    role: this.role,
    activeBillingAddress: this.activeBillingAddress,
    billingAddresses: this.billingAddresses,
  };
};

module.exports = mongoose.model("User", UserSchema);
