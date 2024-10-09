const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { SECRET_KEY: secret } = process.env;

const StrikeOSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
		},
		lastName: {
			type: String,
		},
		username: {
			type: String,
		},
		email: {
			type: String,
			unique: true,
			match: [/\S+@\S+\.\S+/, "is invalid"],
		},
		profileImage: {
			type: String,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		role: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Role",
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

StrikeOSchema.plugin(uniqueValidator, { message: "is already taken." });

const autoPopulate = function (next) {
	this.populate("role");
	next();
};

StrikeOSchema.pre("findOne", autoPopulate);
StrikeOSchema.pre("find", autoPopulate);

StrikeOSchema.methods.setPassword = function () {
	this.salt = bcrypt.genSaltSync();
	this.hash = bcrypt.hashSync(this.hash, this.salt);
};

StrikeOSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.hash);
};

StrikeOSchema.methods.generateJWT = function () {
	return jwt.sign(
		{
			id: this.id,
			email: this.email,
			username: this.username,
			profileImage: this.profileImage,
		},
		secret,
		{ expiresIn: "2d" }
	);
};

StrikeOSchema.methods.toAuthJSON = function () {
	return {
		id: this._id,
		firstName: this.firstName,
		lastName: this.lastName,
		email: this.email,
		username: this.username,
		profileImage: this.profileImage,
		role: this.role,
		token: this.generateJWT(),
	};
};

StrikeOSchema.methods.toJSON = function () {
	return {
		id: this._id,
		firstName: this.firstName,
		lastName: this.lastName,
		email: this.email,
		username: this.username,
		profileImage: this.profileImage,
		role: this.role,
	};
};

module.exports = mongoose.model("StrikeO", StrikeOSchema);
