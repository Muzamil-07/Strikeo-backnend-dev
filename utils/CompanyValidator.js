function validateCompany(data) {
	if (data) {
		if (!data.name) {
			return "Company name is required.";
		}

		if (!data.contact) {
			return "Company contact details are required.";
		} else {
			if (!data.contact.phone) {
				return "Company phone is required.";
			}
			if (!data.contact.email) {
				return "Company email is required.";
			}
		}

		if (!data.country) {
			return "Company country is required.";
		}

		if (!data.principalPOB) {
			return "Company principal place of business is required.";
		}

		if (!data.address) {
			return "Company address is required.";
		}

		if (!data.postalAddress) {
			return "Company postal address is required.";
		}

		if (!data.city || !data.city.trim()) {
			return "Company city is required.";
		}

		if (!data.zipCode || !data.zipCode.trim()) {
			return "Company zip code is required.";
		}
	} else {
		return "Company data is required.";
	}

	return null;
}

module.exports = validateCompany;
