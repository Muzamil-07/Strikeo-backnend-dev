const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      set: (value) => String(value).toLowerCase(),
    },
    company: { type: mongoose.Types.ObjectId, required: true, ref: "Company" },
  },
  { timestamps: true }
);
brandSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Brand", brandSchema);
