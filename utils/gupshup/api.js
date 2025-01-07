const fetch = require("node-fetch");

/**
 * Makes an API request to Gupshup.
 * @param {string} endpoint - Gupshup API endpoint.
 * @param {string} method - HTTP method (GET or POST).
 * @param {URLSearchParams} body - Form-urlencoded body for POST requests.
 * @returns {Promise<object>} - Gupshup API response.
 */
const fetchRequest = async (endpoint, method, body) => {
  const GUPSHUP_BASE_URL = process.env.GUPSHUP_API_URL;
  const GUPSHUP_API_KEY = process.env.GUPSHUP_API_KEY;

  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        apikey: GUPSHUP_API_KEY,
      },
    };

    if (method === "POST" && body) {
      options.body = body;
    }
    const response = await fetch(`${GUPSHUP_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gupshup API request failed.");
    }

    return data;
  } catch (error) {
    console.error("Error in Gupshup API request:", error.message);
    throw new Error(`Gupshup API Error: ${error.message}`);
  }
};

module.exports = fetchRequest;
