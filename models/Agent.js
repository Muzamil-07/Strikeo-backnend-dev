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
    region: { type: String },
    city: { type: String, required: true },
    zone: { type: String, required: true },
    area: { type: String, required: true },
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
    // warehouse: {
    //   type: mongoose.Types.ObjectId,
    //   ref: "Warehouse",
    // },
    // New field: Regions the agent can deliver to
    deliveryRegions: {
      type: [
        {
          country: { type: String, required: true, enum: ["Bangladesh"] },
          state: { type: String },
          city: { type: String, required: true },
          zone: { type: String, required: true },
          area: { type: String, required: true },
          zipCodes: [String],
        },
      ],
      validate: [
        {
          validator: function (regions) {
            return regions.length <= 5;
          },
          message: "You can add a maximum of 5 delivery regions",
        },
        {
          validator: function (regions) {
            return regions.length > 0;
          },
          message: "At least one delivery region is required",
        },
      ],
    },

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
      capacity: {
        type: Number,
        min: 0,
        validate: {
          validator: Number.isFinite,
          message: "Capacity must be a positive integer or decimal.",
        },
      },
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

// const autoPopulate = function (next) {
//   this.populate("warehouse", "name location storage isActive");
//   next();
// };

// AgentSchema.pre("findOne", autoPopulate);
// AgentSchema.pre("find", autoPopulate);
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
    // region: this.region,
    zone: this.zone,
    area: this.area,
    city: this.city,
    zipCode: this.zipCode,
    dob: this.dob,
    contact: this.contact,
    emergencyContact: this.emergencyContact,
    profileImage: this.profileImage,
    isVerified: this.isVerified,
    isActive: this.isActive,
    role: this.role,
    // warehouse: this.warehouse, // Added to JSON response
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
    // region: this.region,
    zone: this.zone,
    area: this.area,
    city: this.city,
    zipCode: this.zipCode,
    dob: this.dob,
    contact: this.contact,
    emergencyContact: this.emergencyContact,
    profileImage: this.profileImage,
    isVerified: this.isVerified,
    isActive: this.isActive,
    role: this.role,
    // warehouse: this.warehouse, // Added to JSON response
    deliveryRegions: this.deliveryRegions, // Added to JSON response
    vehicle: this.vehicle,
    availability: this.availability,
  };
};

module.exports = mongoose.model("Agent", AgentSchema);
