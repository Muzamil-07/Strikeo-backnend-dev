// pathaoService.js
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

const PATHAO_BASE_URL = process.env.PATHAO_BASE_URL;
const PATHAO_CLIENT_ID = process.env.PATHAO_CLIENT_ID;
const PATHAO_CLIENT_SECRET = process.env.PATHAO_CLIENT_SECRET;
const PATHAO_EMAIL = process.env.PATHAO_EMAIL;
const PATHAO_PASSWORD = process.env.PATHAO_PASSWORD;
const GRANT_TYPE = process.env.GRANT_TYPE;

let accessToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI3MTk0IiwianRpIjoiOTAyMjgzMWQ1NjBmZmY5Zjc4NzJmOTlkMWM5OWRlOWNmOGZjMjQ0N2U0MThkYmVhMTA3ZWI5NGQ5M2QwYWJmNGVjZjQyZDRlNDczNWNlYzkiLCJpYXQiOjE3MjYzNTkwOTMuNzQyNjgxLCJuYmYiOjE3MjYzNTkwOTMuNzQyNjg1LCJleHAiOjE3MzQxMzUwOTMuNzI1MTQ0LCJzdWIiOiIyMzcxOTEiLCJzY29wZXMiOltdfQ.Z7-LISmCzoUmIBZ2R4wKJnuBo-m5FVytO3-Co243UWKgFTd4a7CaechO-aWss5QfNnoW_7kLKjHj7pQO6gn6mN0rx25KP9Ynf3F5MgmWY-6DES4rfjnF1fggzFlnnA0NJP2pJn79H5ezW_AG3ksair_xuOyet90EAjRBhlZPWXyqjpjNuBmDFzlahnvgWPW-wAFXgSmfpY7gdgNuqsZjppHhNPBv3cms-d0pKhMSVXsbbhxwFEoJNg4kFjjx28hYkuCftDzS7ORt8D-wr4Yj0MLgwAIt8a9t5pV9fLaT16PK84z9kieBvMRBJm5TIYB5XZISfy4cSsIXY5OSzn9s3BiM5xWNraqDz3iFaW1onCjWfLqTHsnyoAyrfjJc8No_rFY8aDb8zJiFvvhH47rRfDudMCA8EKkgcKV6uxYzBDXu01vSR-TAi0KKO1ajmfzwMHbz7TKF2OYo2YILQa_rWyK563zBlAsHPUR2VjFTCU89T4SBmzvuHjiSVuIvDCzMhmrfCTy8rE77gl39BP6wshMLYuyGQ1TskEgCt3YgOAsAHRD-7cBDEANx69KXTvzAwPIqXt7OdPQZyjjduyMMFzc84ZbvYpltpoj9tP2ZxF4JouJCtjiih-iqKwA3z_1iDzoQWUGF_jPh79KqU06RUACaJuFGHDOYOs2c2zE3tf0";

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
      console.error(errorData);
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

  accessToken = response.access_token; // Update access token
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

  accessToken = response.access_token; // Update access token
  return response;
};

// Generic API request function for creating orders, stores, etc.
const apiRequest = async (endpoint, method, body = null) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
  return fetchRequest(`${PATHAO_BASE_URL}${endpoint}`, method, headers, body);
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
