const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const heroSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      maxlength: [150, "Title cannot exceed 150 characters."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      maxlength: [350, "Description cannot exceed 350 characters."],
      trim: true,
    },
    image: {
      url: {
        type: String,
        required: [true, "Image URL is required."],
        validate: {
          validator: function (v) {
            return /^(http|https):\/\/[^ "]+$/.test(v);
          },
          message: "Invalid image URL.",
        },
      },
      alt: {
        type: String,
        // required: [true, "Alt text is required."],
        trim: true,
        default: "",
      },
    },
    cta: {
      label: {
        type: String,
        required: [true, "CTA label is required."],
        maxlength: [50, "CTA label cannot exceed 50 characters."],
      },
      link: {
        type: String,
        required: [true, "CTA link is required."],
        validate: {
          validator: function (v) {
            try {
              const url = new URL(v, process.env.FRONTEND_URL);
              return true;
            } catch (e) {
              return false;
            }
          },
          message: "Invalid CTA link.",
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for optimized queries
heroSectionSchema.index({ isActive: 1 });
heroSectionSchema.index({ title: 1 });

// Plugin for pagination
heroSectionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("HeroSection", heroSectionSchema);
