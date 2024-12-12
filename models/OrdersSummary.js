const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");

const PromoCodeSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  code: { type: String, trim: true, required: true },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  discountValue: {
    type: Number,
    min: [0, "Discount value must be at least 0."],
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
    // Uncomment the validation if necessary
    // validate: {
    //   validator: function (v) {
    //     return v > Date.now();
    //   },
    //   message: "Expiration date must be in the future.",
    // },
  },
  currency: {
    type: String,
    default: "BDT",
    enum: ["BDT"],
    trim: true,
  },
  minimumOrderValue: {
    type: Number,
    min: [1, "Minimum order value must be at least 1."],
    required: true,
  },
});
const OrdersSummary = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orders: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          required: true,
        },
      ],
      default: [],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: "At least one order must be associated.",
      },
    },
    vendorBill: {
      type: Number,
      default: 0,
    },
    customerBill: {
      type: Number,
      required: true,
      min: 0,
    },
    promotion: {
      promoCode: {
        type: PromoCodeSchema,
        default: null,
      },
    },

    shippingDetails: {
      shippingCost: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

OrdersSummary.plugin(uniqueValidator, { message: "is already taken." });
OrdersSummary.plugin(mongoosePaginate);

OrdersSummary.index({ bill: 1 });
OrdersSummary.index({ customer: 1 });
OrdersSummary.index({ createdAt: -1 });

OrdersSummary.methods.toJSON = function () {
  return {
    id: this._id,
    customer: this.customer,
    orders: this.orders,
    customerBill: this.customerBill,
    vendorBill: this.vendorBill,
    promotion: this.promotion,
  };
};

module.exports = mongoose.model("OrdersSummary", OrdersSummary);
