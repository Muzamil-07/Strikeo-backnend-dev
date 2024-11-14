const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");
const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["Vendor", "StrikeO", "User", "Agent"],
      default: "Vendor",
    },
    vendorPermissions: [
      {
        type: String,
        enum: [
          "View Products",
          "View Product Details",
          "Create Products",
          "Update Products",
          "Enable/Disable Product",
          // "Delete Products",
          "View Orders",
          "View Order Details",
          "Update Orders",
          "View Employees",
          "View Employee Details",
          "Create Employees",
          "Update Employees",
          "Block/Unblock Employees",
          // "Delete Employees",
          "View Sales",
        ],
      },
    ],
    strikeOPermissions: [
      {
        type: String,
        enum: [
          "View Vendors",
          "Vendor Block/Unblock",
          "View Vendor Details",
          "View Vendor Orders",
          "View Vendor Company",
          "Edit Vendor Details",
          "Edit Vendor Orders",
          "Edit Vendor Company",
          "Create Vendors",
          "View Review Products",
          "View Review Product Details",
          "Edit Review Products",
          "Publish Review Products",
          "Reject Review Product",
          "View Published Products",
          "View Published Product Details",
          "Edit Published Products",
          "Enable/Disable Published Product",
          "View Categories",
          "Create Category",
          "Delete Category",
          "View Category Details",
          "Edit Category Details",
          "Category Enable/Disable",
          "View Vendor Roles",
          "Edit Vendor Role",
          "Add Vendor Role",
          "Enable/Disable Vendor Role",
          "View StrikeO Roles",
          "Edit StrikeO Role",
          "Add StrikeO Role",
          "Enable/Disable StrikeO Role",
          "View Users",
          "Edit User",
          "User Block/Unblock",
          "View User Details",
          "Edit User Details",
          "View User Orders",
          "View User Order Details",
          "Edit User Orders",
          "View Sales",
          "Add Sales",
          "View Sales Details",
          "Edit Sales",
          "View Sales Income Statement",
          "Edit Sales Income Statement",
          "View Sales Balance Sheet",
          "Edit Sales Balance Sheet",
          "View Sales Cash Flow Statement",
          "Edit Sales Cash Flow Statement",
          "View Agents",
          "View Agent Details",
          "Edit Agent",
          "Create Agent",
          "Agent Block/Unblock",
          "View Analytics",
        ],
      },
    ],
    agentPermissions: [
      {
        type: String,
        enum: ["View Orders", "View Order Details", "Edit Order"],
      },
    ],
    adminPermissions: [
      {
        //TODO: Implement Admin Permissions
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
RoleSchema.index({ name: 1 });
RoleSchema.plugin(uniqueValidator, { message: "is already taken." });
RoleSchema.plugin(mongoosePaginate);
RoleSchema.methods.toJSON = function () {
  const profile = {
    id: this._id,
    name: this.name,
    type: this.type,
    isActive: this.isActive,
  };

  if (this.type === "Vendor") {
    profile.vendorPermissions = this.vendorPermissions;
  }
  if (this.type === "StrikeO") {
    profile.strikeOPermissions = this.strikeOPermissions;
  }
  if (this.type === "Agent") {
    profile.agentPermissions = this.agentPermissions;
  }
  // You can add conditions for 'User' and 'Agent' types if needed

  return profile;
};
module.exports = mongoose.model("Role", RoleSchema);
