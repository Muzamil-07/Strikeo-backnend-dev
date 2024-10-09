const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Define the Cart Schema
const CartSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        selected: { type: Boolean, default: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantSKU: {
          type: String,
          default: null,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    bill: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

CartSchema.plugin(uniqueValidator, { message: "is already taken." });

const autoPopulate = function (next) {
  this.populate("items.product");
  next();
};

CartSchema.pre("find", autoPopulate);
CartSchema.pre("findOne", autoPopulate);

CartSchema.methods.toJSON = function () {
  return {
    id: this._id,
    owner: this.owner,
    items: this.items.toObject().map((item) => {
      let variantDetails = null;
      if (item?.variantSKU) {
        variantDetails = item?.product?.variants?.find(
          (variant) => variant?.sku === item?.variantSKU
        );
      }

      return {
        ...item,
        variantDetails,
      };
    }),
    bill: this.bill,
  };
};

module.exports = mongoose.model("Cart", CartSchema);
