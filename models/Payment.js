const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    method: {
      type: String,
      enum: ["sslCommerz", "card", "cash"],
      required: true,
    },
    currency: {
      type: String,
      enum: ["BDT"],
      default: "BDT",
    },
    status: {
      type: String,
      enum: ["Pending", "Failed", "Paid"],
      default: "Pending",
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    risk_title: {
      type: String,
      default: "",
    },
    discount_amount: {
      type: String,
      default: "",
    },
    card_type: {
      type: String,
      default: "",
    },
    card_no: {
      type: String,
      default: "",
    },
    card_issuer: {
      type: String,
      default: "",
    },
    card_brand: {
      type: String,
      default: "",
    },
    card_issuer_country: {
      type: String,
      default: "",
    },
    tran_date: {
      type: Date,
      default: null,
    },
    bank_tran_id: {
      type: String,
      default: "",
    },
    store_amount: {
      type: String,
      default: "",
    },
    val_id: {
      type: String,
      default: "",
    },
    sslcz_status: {
      type: String,
      default: "",
    },
    currency_type: {
      type: String,
      default: "",
    },
    currency_amount: {
      type: String,
      default: "",
    },
    validationStatus: {
      type: String,
      default: "",
    },
    error: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

PaymentSchema.plugin(uniqueValidator, { message: "is already taken." });
PaymentSchema.plugin(mongoosePaginate);

const autoPopulate = function (next) {
  this.populate("customer");
  next();
};

PaymentSchema.pre("findOne", autoPopulate);
PaymentSchema.pre("find", autoPopulate);

PaymentSchema.methods.toJSON = function () {
  return {
    id: this._id,
    paymentId: this.paymentId,
    customer: this.customer,
    amount: this.amount,
    orders: this.orders,
    method: this.method,
    currency: this.currency,
    status: this.status,
    initiatedAt: this.initiatedAt,
    risk_title: this.risk_title,
    discount_amount: this.discount_amount,
    card_type: this.card_type,
    card_no: this.card_no,
    card_issuer: this.card_issuer,
    card_brand: this.card_brand,
    card_issuer_country: this.card_issuer_country,
    tran_date: this.tran_date,
    bank_tran_id: this.bank_tran_id,
    store_amount: this.store_amount,
    val_id: this.val_id,
    sslcz_status: this.sslcz_status,
    currency_type: this.currency_type,
    currency_amount: this.currency_amount,
    validationStatus: this.validationStatus,
    error: this.error,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Payment", PaymentSchema);
