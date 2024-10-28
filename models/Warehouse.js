const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");

const CapacityUnits = ["cubic meters"];

const WarehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Added trim
    },
    // Location Details
    location: {
      addressLine: { type: String, required: true, trim: true }, // Added trim
      city: { type: String, required: true, trim: true }, // Added trim
      region: { type: String, required: true, trim: true }, // Added trim
      country: {
        type: String,
        enum: ["Bangladesh"], // Expandable for future needs
        default: "Bangladesh",
        trim: true, // Added trim
      },
      zipCode: { type: String, required: true, trim: true }, // Added trim
      geoCoordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    // Capacity and Storage
    storage: {
      type: {
        type: String,
        enum: ["ambient", "cold", "hazardous"], // Different types of storage
        default: "ambient",
        trim: true, // Added trim
      },
      totalCapacity: {
        value: { type: Number, required: true }, // Numeric value
      },
      currentCapacity: {
        value: { type: Number, default: 0 }, // Numeric value
      },
      capacityUnit: {
        type: String,
        enum: CapacityUnits,
        default: "cubic meters",
        trim: true, // Added trim
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

WarehouseSchema.plugin(uniqueValidator, { message: "is already taken." });
WarehouseSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Warehouse", WarehouseSchema);
