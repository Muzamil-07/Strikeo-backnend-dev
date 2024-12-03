const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

// DiscountEvent Schema
const discountEventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: [360, "Description cannot exceed 360 characters"],
      trim: true,
    },
    images: {
      type: [
        {
          url: {
            type: String,
            required: [true, "Image URL is required"],
            trim: true,
          },
          alt: {
            type: String,
            default: "",
          },
        },
      ],
      validate: {
        validator: function (images) {
          return images.length > 0; // Ensures at least one image is provided
        },
        message: "At least one image is required",
      },
    },
    promoCodes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PromoCode",
        },
      ],
      validate: {
        validator: function (value) {
          console.log(value);
          return value && value.length > 0;
        },
        message: "At least one PromoCode is required",
      },
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      set: (value) => new Date(value).setUTCHours(0, 0, 0, 0),
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return this.startDate && value > this.startDate;
        },
        message: "End date must be later than the start date.",
      },
      set: (value) => new Date(value).setUTCHours(23, 59, 59, 999),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add indexes for frequent queries
discountEventSchema.index({ isActive: 1 });
discountEventSchema.index({ startDate: 1, endDate: 1 });

// Plugin for pagination
discountEventSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("DiscountEvent", discountEventSchema);
