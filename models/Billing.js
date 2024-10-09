const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const uniqueValidator = require("mongoose-unique-validator");

const BillingSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zone: String,
    area: String,
    country: String,
    zipCode: String,
    instruction: String,
  },
  { timestamps: true }
);

BillingSchema.plugin(uniqueValidator, { message: "is already taken." });
BillingSchema.plugin(mongoosePaginate);

BillingSchema.methods.toJSON = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    address: this.address,
    city: this.city,
    state: this.state,
    zone: this.zone,
    area: this.area,
    country: this.country,
    zipCode: this.zipCode,
    instruction: this.instruction,
  };
};

module.exports = mongoose.model("Billing", BillingSchema);
