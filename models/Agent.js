const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const AgentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    alias: { type: String },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    country: { type: String, required: true },
    region: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    dob: { type: Date, required: true },
    contact: {
      phone: { type: String, required: true },
      secondaryPhone: { type: String },
      email: {
        type: String,
        unique: true,
        match: [/\S+@\S+\.\S+/, "is invalid"],
      },
      address: { type: String, required: true },
    },
    emergencyContact: {
      phone: { type: String },
      name: { type: String },
    },
    profileImage: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    // New field: Warehouse the agent is assigned to
    warehouse: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
    },
    // New field: Regions the agent can deliver to
    deliveryRegions: [
      {
        country: String,
        state: String,
        city: String,
        zipCodes: [String], // Array of supported zip codes
      },
    ],
    availability: {
      days: {
        type: [String],
        enum: daysOfWeek,
        validate: {
          validator: function (v) {
            return v.length <= 7; // Limit to 7 days max
          },
          message: (props) => `${props?.value} exceeds the limit of 7 days!`,
        },
      },
      startTime: {
        type: String,
      },
      endTime: {
        type: String,
      },
    },
    vehicle: {
      type: { type: String, enum: ["van", "bike", "car", "truck"] },
      capacity: Number, // e.g., max weight or volume
      unit: { type: String, default: "kg", enum: ["kg"] },
    },
    reset_token: {
      type: {
        token: String,
        link: String,
        expires: Date,
      },
      default: null,
    },
    hash: { type: String },
    salt: { type: String },
  },
  { timestamps: true }
);

AgentSchema.plugin(uniqueValidator, { message: "is already taken." });
AgentSchema.plugin(mongoosePaginate);

const autoPopulate = function (next) {
  this.populate("warehouse", "name location storage isActive");
  next();
};

AgentSchema.pre("findOne", autoPopulate);
AgentSchema.pre("find", autoPopulate);
// JWT generation
AgentSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.contact.email,
      profileImage: this.profileImage,
    },
    secret,
    { expiresIn: "2d" }
  );
};

// Auth JSON
AgentSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    alias: this.alias,
    gender: this.gender,
    country: this.country,
    region: this.region,
    city: this.city,
    zipCode: this.zipCode,
    dob: this.dob,
    contact: this.contact,
    emergencyContact: this.emergencyContact,
    profileImage: this.profileImage,
    isVerified: this.isVerified,
    isActive: this.isActive,
    role: this.role,
    warehouse: this.warehouse, // Added to JSON response
    deliveryRegions: this.deliveryRegions, // Added to JSON response
    vehicle: this.vehicle,
    availability: this.availability,
    token: this.generateJWT(),
  };
};

// Basic JSON response
AgentSchema.methods.toJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    alias: this.alias,
    gender: this.gender,
    country: this.country,
    region: this.region,
    city: this.city,
    zipCode: this.zipCode,
    dob: this.dob,
    contact: this.contact,
    emergencyContact: this.emergencyContact,
    profileImage: this.profileImage,
    isVerified: this.isVerified,
    isActive: this.isActive,
    role: this.role,
    warehouse: this.warehouse, // Added to JSON response
    deliveryRegions: this.deliveryRegions, // Added to JSON response
    vehicle: this.vehicle,
    availability: this.availability,
  };
};

module.exports = mongoose.model("Agent", AgentSchema);
