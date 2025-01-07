/**
 * Validates a phone number.
 * @param {string} phone - Phone number to validate.
 */
const validatePhoneNumber = (phone) => {
  const regex = /^\+\d{1,15}$/;
  if (!phone || !regex.test(phone)) {
    throw new Error(
      "Invalid phone number. Must be in international format (+1234567890)."
    );
  }
};

/**
 * Validates a string input.
 * @param {string} value - The value to validate.
 * @param {string} fieldName - Name of the field being validated.
 */
const validateString = (value, fieldName) => {
  if (!value || typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} cannot be empty.`);
  }
};

/**
 * Validates a URL input.
 * @param {string} url - The URL to validate.
 */
const validateUrl = (url) => {
  try {
    new URL(url);
  } catch {
    throw new Error("Invalid URL format.");
  }
};

module.exports = {
  validatePhoneNumber,
  validateString,
  validateUrl,
};
