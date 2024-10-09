const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Define the Favourite Schema
const FavouriteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
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
      },
    ],
  },
  { timestamps: true }
);

FavouriteSchema.plugin(uniqueValidator, { message: "is already taken." });

const autoPopulate = function (next) {
  this.populate("items.product");
  next();
};

FavouriteSchema.pre("find", autoPopulate);
FavouriteSchema.pre("findOne", autoPopulate);

FavouriteSchema.methods.toJSON = function () {
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

module.exports = mongoose.model("FavouriteProduct", FavouriteSchema);
