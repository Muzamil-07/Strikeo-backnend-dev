const fetch = require("node-fetch");
const dotenv = require("dotenv");
const PathaoToken = require("../models/PathaoToken");
dotenv.config();

const PATHAO_BASE_URL = process.env.PATHAO_BASE_URL;
const PATHAO_CLIENT_ID = process.env.PATHAO_CLIENT_ID;
const PATHAO_CLIENT_SECRET = process.env.PATHAO_CLIENT_SECRET;
const PATHAO_EMAIL = process.env.PATHAO_EMAIL;
const PATHAO_PASSWORD = process.env.PATHAO_PASSWORD;
const GRANT_TYPE = process.env.GRANT_TYPE;

// Helper function to handle API requests with fetch
const fetchRequest = async (url, method, headers, body = null) => {
  const options = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Unknown error occurred", {
        cause: errorData,
      });
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error(`Fetch Error: ${error?.message}`, { cause: error });
  }
};

// Function to issue an access token
const issueAccessToken = async () => {
  const credentials = {
    client_id: PATHAO_CLIENT_ID,
    client_secret: PATHAO_CLIENT_SECRET,
    username: PATHAO_EMAIL,
    password: PATHAO_PASSWORD,
    grant_type: GRANT_TYPE,
  };

  const response = await fetchRequest(
    `${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
    "POST",
    { "Content-Type": "application/json" },
    credentials
  );

  return response;
};

// Function to issue a refresh token
const issueRefreshToken = async (refreshToken) => {
  const credentials = {
    client_id: PATHAO_CLIENT_ID,
    client_secret: PATHAO_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  };
  const response = await fetchRequest(
    `${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
    "POST",
    { "Content-Type": "application/json" },
    credentials
  );

  return response;
};

// Function to get the access token from the database or refresh it
const getAccessTokenFromDb = async () => {
  try {
    const token = await PathaoToken.findOne({
      client_id: PATHAO_CLIENT_ID,
      client_secret: PATHAO_CLIENT_SECRET,
    });

    if (token) {
      const currentTime = Date.now();
      const tokenExpiryTime =
        token.issued_at.getTime() + token.expires_in * 1000;

      if (currentTime >= tokenExpiryTime) {
        // Token is expired
        console.error(
          "Pathao token session has expired. Please refresh to continue."
        );
        throw new Error(
          "The access session has expired. Please contact to support"
        );
      } else {
        // Token is still valid
        return token.access_token; // Return the existing valid access token
      }
    } else {
      // No token found in DB
      console.error("Pathao token not found in the database for this client.");
      throw new Error("No access session found. Please contact to support");
    }
  } catch (error) {
    console.error(
      "Something went wrong while processing the request. Please try again later."
    );
    throw error;
  }
};

// Generic API request function for creating orders, stores, etc.
const apiRequest = async (endpoint, method, body = null) => {
  try {
    const accessToken = await getAccessTokenFromDb(); // Fetch valid access token from DB or issue one
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
    return fetchRequest(`${PATHAO_BASE_URL}${endpoint}`, method, headers, body);
  } catch (error) {
    console.error("Error during API request:", error);
    throw error;
  }
};

// Exported functions for API interactions
module.exports = {
  issueAccessToken,
  issueRefreshToken,
  createOrder: (orderData) =>
    apiRequest("/aladdin/api/v1/orders", "POST", orderData),
  createBulkOrder: (orders) =>
    apiRequest("/aladdin/api/v1/orders/bulk", "POST", { orders }),
  getOrderInfo: (consignmentId) =>
    apiRequest(`/aladdin/api/v1/orders/${consignmentId}/info`, "GET"),
  createStore: (storeData) =>
    apiRequest("/aladdin/api/v1/stores", "POST", storeData),
  getStores: () => apiRequest("/aladdin/api/v1/stores", "GET"),
  getCities: () => apiRequest("/aladdin/api/v1/city-list", "GET"),
  getZonesInCity: (cityId) =>
    apiRequest(`/aladdin/api/v1/cities/${cityId}/zone-list`, "GET"),
  getAreasInZone: (zoneId) =>
    apiRequest(`/aladdin/api/v1/zones/${zoneId}/area-list`, "GET"),
  priceCalculation: (body) =>
    apiRequest("/aladdin/api/v1/merchant/price-plan", "POST", body),
};
