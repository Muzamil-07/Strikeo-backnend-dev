const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");
const AgentSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		alias: {
			type: String,
		},
		gender: {
			type: String,
			enum: ["male", "female", "other"],
			required: true,
		},
		country: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},
		zipCode: {
			type: String,
			required: true,
		},
		dob: {
			type: Date,
			required: true,
		},
		contact: {
			phone: {
				type: String,
				required: true,
			},
			secondaryPhone: {
				type: String,
			},
			email: {
				type: String,
				unique: true,
				match: [/\S+@\S+\.\S+/, "is invalid"],
			},
			address: {
				type: String,
				required: true,
			},
		},
		emergencyContact: {
			phone: {
				type: String,
			},
			name: {
				type: String,
			},
		},
		profileImage: {
			type: String,
			required: true,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		role: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Role",
			required: true,
		},
		reset_token: {
			type: {
				token: String,
				link: String,
				expires: Date,
			},
			default: null,
		},
		hash: {
			type: String,
		},
		salt: {
			type: String,
		},
	},
	{ timestamps: true }
);
AgentSchema.plugin(uniqueValidator, { message: "is already taken." });
AgentSchema.plugin(mongoosePaginate);
AgentSchema.methods.generateJWT = function () {
	return jwt.sign(
		{
			id: this.id,
			firstName: this.firstName,
			lastName: this.lastName,
			email: this.contact.email,
			profileImage: this.profileImage,
		},
		secret,
		{ expiresIn: "2d" }
	);
};

AgentSchema.methods.toAuthJSON = function () {
	return {
		id: this._id,
		firstName: this.firstName,
		lastName: this.lastName,
		alias: this.alias,
		gender: this.gender,
		country: this.country,
		city: this.city,
		zipCode: this.zipCode,
		dob: this.dob,
		contact: this.contact,
		emergencyContact: this.emergencyContact,
		profileImage: this.profileImage,
		isVerified: this.isVerified,
		isActive: this.isActive,
		role: this.role,
		token: this.generateJWT(),
	};
};
AgentSchema.methods.toJSON = function () {
	const profile = {
		id: this._id,
		firstName: this.firstName,
		lastName: this.lastName,
		alias: this.alias,
		gender: this.gender,
		country: this.country,
		city: this.city,
		zipCode: this.zipCode,
		dob: this.dob,
		contact: this.contact,
		emergencyContact: this.emergencyContact,
		profileImage: this.profileImage,
		isVerified: this.isVerified,
		isActive: this.isActive,
		role: this.role,
	};
	return profile;
};
module.exports = mongoose.model("Agent", AgentSchema);
