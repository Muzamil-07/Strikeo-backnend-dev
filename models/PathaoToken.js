const mongoose = require("mongoose");

const pathaoTokenSchema = new mongoose.Schema({
  client_id: {
    type: String,
    required: true,
  },
  client_secret: {
    type: String,
    required: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  refresh_token: {
    type: String,
    required: true,
  },
  expires_in: {
    type: Number,
    required: true,
  },
  issued_at: {
    type: Date,
    default: Date.now,
  },
});
pathaoTokenSchema.index({ client_id: 1 });
pathaoTokenSchema.index({ client_secret: 1 });

const PathaoToken = mongoose.model("PathaoToken", pathaoTokenSchema);

module.exports = PathaoToken;
