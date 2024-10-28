/** @format */

const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");

const ChatbotHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: ["user", "vendor", "others"],
    },
    messageType: {
      type: String,
      required: true,
      default: "text",
      enum: ["text", "image", "audio"],
    },

    userMessage: {
      type: String,
      required: true,
      default: "",
    },
    botResponse: String,
    botPrompt: {
      type: Array,
      default: [], // Default to an empty array
    },
  },
  { timestamps: true }
);

const autoPopulate = function (next) {
  "I am here";
  this.populate("user", "firstName lastName email _id profileImage"); // Automatically populate the 'user' field with 'name', 'email', and '_id'
  next();
};

ChatbotHistorySchema.pre("findOne", autoPopulate);
ChatbotHistorySchema.pre("find", autoPopulate);

ChatbotHistorySchema.plugin(uniqueValidator, { message: "is already taken." });
ChatbotHistorySchema.plugin(mongoosePaginate);

ChatbotHistorySchema.methods.toJSON = function () {
  return {
    id: this._id,
    user: this.user,
    userMessage: this.userMessage,
    botResponse: this.botResponse,
    messageType: this.messageType,
    type: this.type,
    botPrompt: this.botPrompt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("ChatbotHistory", ChatbotHistorySchema);
