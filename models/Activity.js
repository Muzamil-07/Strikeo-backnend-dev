const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");
const ActivitySchema = new mongoose.Schema(
	{
		employeeName: {
			type: String,
			required: true,
		},
		company: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Company",
			required: true,
		},
		type: {
			type: String,
			enum: [
				"Viewed Product",
				"Created Product",
				"Updated Product",
				"Viewed Order",
				"Updated Order",
				"Viewed Employee",
				"Created Employee",
				"Updated Employee",
				"Viewed Sales",
			],
		},
		"Viewed Product": {
			name: {
				type: String,
			},
			category: {
				type: String,
			},
			message: {
				type: String,
			},
		},
		"Created Product": {
			name: {
				type: String,
			},
			category: {
				type: String,
			},
			message: {
				type: String,
			},
		},
		"Updated Product": {
			name: {
				type: String,
			},
			category: {
				type: String,
			},
			message: {
				type: String,
			},
		},
		"Viewed Order": {
			orderNo: {
				type: String,
			},
			message: {
				type: String,
			},
		},
		"Updated Order": {
			orderNo: {
				type: String,
			},
			message: {
				type: String,
			},
		},
		"Viewed Employee": {
			name: {
				type: String,
			},
			message: {
				type: String,
			},
		},
		"Created Employee": {
			name: {
				type: String,
			},
			message: {
				type: String,
			},
		},
		"Updated Employee": {
			name: {
				type: String,
			},
			message: {
				type: String,
			},
		},
	},
	{ timestamps: true }
);
ActivitySchema.plugin(uniqueValidator, { message: "is already taken." });
ActivitySchema.plugin(mongoosePaginate);
ActivitySchema.methods.toJSON = function () {
	const profile = {
		id: this._id,
		employeeName: this.employeeName,
		company: this.company,
		type: this.type,
		"Viewed Product": this["Viewed Product"],
		"Created Product": this["Created Product"],
		"Updated Product": this["Updated Product"],
		"Viewed Order": this["Viewed Order"],
		"Updated Order": this["Updated Order"],
		"Viewed Employee": this["Viewed Employee"],
		"Created Employee": this["Created Employee"],
		"Updated Employee": this["Updated Employee"],
		createdAt: this.createdAt,
	};
	return profile;
};
module.exports = mongoose.model("Activity", ActivitySchema);
