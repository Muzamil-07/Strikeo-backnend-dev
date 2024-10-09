const mongoose = require("mongoose");

const top10BrandsSchema = new mongoose.Schema(
  {
    subSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSubCategory",
      required: true,
      unique: true,
    }, // Reference to SubSubCategory
    brands: [{ type: mongoose.Schema.Types.ObjectId, ref: "Brand" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Top10Brands", top10BrandsSchema);
