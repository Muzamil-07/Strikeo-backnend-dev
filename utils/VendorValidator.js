function validateVendorData(data) {
	if (!data.firstName) {
		return "Vendor first name is required.";
	}

	if (!data.lastName) {
		return "Vendor last name is required.";
	}

	if (!data.gender || !["male", "female", "other"].includes(data.gender)) {
		return "Vendor gender is required and must be 'male', 'female', or 'other'.";
	}

	if (!data.country) {
		return "Vendor country is required.";
	}

	if (!data.dob || !Date.parse(data.dob)) {
		return "Vendor date of birth is required and must be a valid date.";
	}

	if (!data.contact || !data.contact.phone) {
		return "Vendor primary phone number is required.";
	}

	if (!data.contact || !data.contact.email) {
		return "Vendor email is required and must be a valid email address.";
	} else {
		// Trim the email field
		data.contact.email = data.contact.email.trim();
		if (!/\S+@\S+\.\S+/.test(data.contact.email)) {
			return "Vendor email is not a valid email address.";
		}
	}

	if (!data.contact || !data.contact.address) {
		return "Vendor address is required.";
	}

	if (!data.profileImage) {
		return "Vendor profile image is required.";
	}

	// if (!data.isAgent && !data.company) {
	// 	return "Vendor company is required.";
	// }

	if (data.isAgent) {
		if (!data.city?.trim()) {
			return "Vendor city is required.";
		}

		if (!data.zipCode?.trim()) {
			return "Vendor zip code is required.";
		}
	}

	return null;
}

module.exports = validateVendorData;
