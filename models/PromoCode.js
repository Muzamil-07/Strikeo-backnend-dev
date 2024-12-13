const mongoose = require("mongoose");
const mongooseUniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");

const promoCodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: [0, "Discout value must be at least 0"],
    },
    expirationDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > Date.now();
        },
        message: "Expiration date must be in the future.",
      },
      set: (value) => new Date(value).setUTCHours(23, 59, 59, 999),
    },
    currency: { type: String, default: "BDT", enum: ["BDT"], trim: true },
    usageLimit: {
      type: Number,
      default: 1,
      min: [1, "Usage limit must be at least 1"],
    },
    perUserLimit: {
      type: Number,
      default: 1,
      min: [1, "Per-user limit must be at least 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, "Usage count must be at least 0"],
    },
    minimumOrderValue: {
      type: Number,
      required: [true, "Minimum order value is required"],
      min: [1, "Minimum order value must be at least 1"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usersRedeemed: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usageCount: {
          type: Number,
          default: 0,
          min: [0, "Usage count must be at least 0"],
        },
      },
    ],
  },
  { timestamps: true }
);

promoCodeSchema.pre(["save", "updateOne", "findOneAndUpdate"], function (next) {
  const discountType = this.discountType || this._update?.discountType;
  const discountValue = this.discountValue || this._update?.discountValue;
  const minimumOrderValue =
    this.minimumOrderValue || this._update?.minimumOrderValue;
  const usageLimit = this?.usageLimit || this?._update?.usageLimit;
  const perUserLimit = this?.perUserLimit || this?._update?.perUserLimit;
  // Discount validation logic for percentage and fixed
  if (discountType && discountValue !== undefined) {
    if (discountType === "percentage") {
      if (discountValue < 0 || discountValue > 99) {
        return next(
          new Error(
            `Percentage discount value must be between 0 and 99. Received: ${discountValue}`
          )
        );
      }
    } else if (discountType === "fixed") {
      if (discountValue < 0) {
        return next(
          new Error(
            `Fixed discount value must be 0 or greater. Received: ${discountValue}`
          )
        );
      }
    } else {
      return next(new Error(`Invalid discount type: ${discountType}`));
    }
  }

  // Minimum order value validation logic
  if (minimumOrderValue !== undefined && discountValue !== undefined) {
    if (discountType === "fixed" && minimumOrderValue <= discountValue) {
      return next(
        new Error(
          `Minimum order value (${minimumOrderValue}) must be greater than fixed discount value (${discountValue}).`
        )
      );
    }
    if (discountType === "percentage" && minimumOrderValue <= 0) {
      return next(
        new Error(
          `Minimum order value (${minimumOrderValue}) must be greater than 0 for percentage discounts.`
        )
      );
    }
  }

  // Validation for perUserLimit and usageLimit
  if (usageLimit !== undefined && perUserLimit !== undefined) {
    if (perUserLimit > usageLimit) {
      return next(
        new Error(
          `Per-user limit (${perUserLimit}) must be less than the overall usage limit (${usageLimit}).`
        )
      );
    }
  }

  next();
});

promoCodeSchema.plugin(mongooseUniqueValidator, {
  message: "is already taken.",
});
promoCodeSchema.plugin(mongoosePaginate);
promoCodeSchema.index({ code: 1, expirationDate: 1, isActive: 1 });

module.exports = mongoose.model("PromoCode", promoCodeSchema);
