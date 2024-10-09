const mongoose = require("mongoose");

const jobStateSchema = new mongoose.Schema(
  {
    jobName: { type: String, required: true, unique: true },
    lastSubSubCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSubCategory",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobState", jobStateSchema);
