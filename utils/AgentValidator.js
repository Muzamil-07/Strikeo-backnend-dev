function validateAgentData(data) {
	if (!data.firstName) {
		return "Agent first name is required.";
	}

	if (!data.lastName) {
		return "Agent last name is required.";
	}

	if (!data.gender || !["male", "female", "other"].includes(data.gender)) {
		return "Agent gender is required and must be 'male', 'female', or 'other'.";
	}

	if (!data.country) {
		return "Agent country is required.";
	}

	if (!data.dob || !Date.parse(data.dob)) {
		return "Agent date of birth is required and must be a valid date.";
	}

	if (!data.contact || !data.contact.phone) {
		return "Agent primary phone number is required.";
	}

	if (data?.contact.email) {
		// Trim the email field
		data.contact.email = data.contact.email.trim();
		if (!/\S+@\S+\.\S+/.test(data.contact.email)) {
			return "Agent email is not a valid email address.";
		}
	}

	if (!data.contact || !data.contact.address) {
		return "Agent address is required.";
	}

	if (!data.profileImage) {
		return "Agent profile image is required.";
	}

	if (!data.isAgent && !data.company) {
		return "Agent company is required.";
	}

	if (data.isAgent) {
		if (!data.city?.trim()) {
			return "Agent city is required.";
		}

		if (!data.zipCode?.trim()) {
			return "Agent zip code is required.";
		}
	}

	return null;
}

module.exports = validateAgentData;
