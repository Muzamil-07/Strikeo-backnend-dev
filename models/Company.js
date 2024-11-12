const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const uniqueValidator = require("mongoose-unique-validator");

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    principalPOB: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    postalAddress: {
      type: String,
      required: true,
    },
    warehouse: {
      type: mongoose.Types.ObjectId,
      ref: "Warehouse",
      required: [true, "Warehouse is required for company"],
    },
    website: {
      type: String,
    },
    logo: {
      type: String,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

CompanySchema.plugin(uniqueValidator, { message: "is already taken." });
CompanySchema.plugin(mongoosePaginate);

const autoPopulate = function (next) {
  this.populate("warehouse", "name location storage isActive");
  next();
};

CompanySchema.pre("findOne", autoPopulate);
CompanySchema.pre("find", autoPopulate);

CompanySchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    contact: this.contact,
    country: this.country,
    city: this.city,
    zipCode: this.zipCode,
    address: this.address,
    principalPOB: this.principalPOB,
    postalAddress: this.postalAddress,
    website: this.website,
    logo: this.logo,
    registrationDate: this.registrationDate,
    warehouse: this.warehouse,
  };
};

module.exports = mongoose.model("Company", CompanySchema);
