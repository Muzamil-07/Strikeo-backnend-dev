const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const PATHAO_BASE_URL = process.env.PATHAO_BASE_URL;
const PATHAO_CLIENT_ID = process.env.PATHAO_CLIENT_ID;
const PATHAO_CLIENT_SECRET = process.env.PATHAO_CLIENT_SECRET;
const PATHAO_EMAIL = process.env.PATHAO_EMAIL;
const PATHAO_PASSWORD = process.env.PATHAO_PASSWORD;
const GRANT_TYPE = process.env.GRANT_TYPE;

let accessToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI3MTk0IiwianRpIjoiOTAyMjgzMWQ1NjBmZmY5Zjc4NzJmOTlkMWM5OWRlOWNmOGZjMjQ0N2U0MThkYmVhMTA3ZWI5NGQ5M2QwYWJmNGVjZjQyZDRlNDczNWNlYzkiLCJpYXQiOjE3MjYzNTkwOTMuNzQyNjgxLCJuYmYiOjE3MjYzNTkwOTMuNzQyNjg1LCJleHAiOjE3MzQxMzUwOTMuNzI1MTQ0LCJzdWIiOiIyMzcxOTEiLCJzY29wZXMiOltdfQ.Z7-LISmCzoUmIBZ2R4wKJnuBo-m5FVytO3-Co243UWKgFTd4a7CaechO-aWss5QfNnoW_7kLKjHj7pQO6gn6mN0rx25KP9Ynf3F5MgmWY-6DES4rfjnF1fggzFlnnA0NJP2pJn79H5ezW_AG3ksair_xuOyet90EAjRBhlZPWXyqjpjNuBmDFzlahnvgWPW-wAFXgSmfpY7gdgNuqsZjppHhNPBv3cms-d0pKhMSVXsbbhxwFEoJNg4kFjjx28hYkuCftDzS7ORt8D-wr4Yj0MLgwAIt8a9t5pV9fLaT16PK84z9kieBvMRBJm5TIYB5XZISfy4cSsIXY5OSzn9s3BiM5xWNraqDz3iFaW1onCjWfLqTHsnyoAyrfjJc8No_rFY8aDb8zJiFvvhH47rRfDudMCA8EKkgcKV6uxYzBDXu01vSR-TAi0KKO1ajmfzwMHbz7TKF2OYo2YILQa_rWyK563zBlAsHPUR2VjFTCU89T4SBmzvuHjiSVuIvDCzMhmrfCTy8rE77gl39BP6wshMLYuyGQ1TskEgCt3YgOAsAHRD-7cBDEANx69KXTvzAwPIqXt7OdPQZyjjduyMMFzc84ZbvYpltpoj9tP2ZxF4JouJCtjiih-iqKwA3z_1iDzoQWUGF_jPh79KqU06RUACaJuFGHDOYOs2c2zE3tf0';

// Helper function to handle API requests with fetch
const fetchRequest = async (url, method, headers, body = null) => {
  const options = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(url, options);
  return response.json();
};

// Issue an Access Token
async function issueAccessToken(req, res) {
  try {
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
      'POST',
      {
        'Content-Type': 'application/json',
      },
      {
        client_id: PATHAO_CLIENT_ID,
        client_secret: PATHAO_CLIENT_SECRET,
        username: PATHAO_EMAIL,
        password: PATHAO_PASSWORD,
        grant_type: GRANT_TYPE,
      }
    );

    accessToken = response.access_token;
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to issue access token', details: error.message });
  }
}

// Issue a Refresh Token
async function issueRefreshToken(req, res) {
  try {
    const { refresh_token } = req.body;
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`,
      'POST',
      {
        'Content-Type': 'application/json',
      },
      {
        client_id: PATHAO_CLIENT_ID,
        client_secret: PATHAO_CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token',
      }
    );

    accessToken = response.access_token;
    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to refresh token', details: error.message });
  }
}

// Create a New Order
async function createOrder(req, res) {
  try {
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/orders`,
      'POST',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      req.body
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to create new order', details: error.message });
  }
}

// Create Bulk Orders
async function createBulkOrder(req, res) {
  try {
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/orders/bulk`,
      'POST',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      { orders: req.body.orders }
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to create bulk orders', details: error.message });
  }
}

// Get Order Short Info
async function getOrderInfo(req, res) {
  try {
    const { consignmentId } = req.params;
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/orders/${consignmentId}/info`,
      'GET',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to retrieve order info', details: error.message });
  }
}

// Create a New Store
async function createStore(req, res) {
  try {
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/stores`,
      'POST',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      req.body
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to create store', details: error.message });
  }
}

// Get Stores
async function getStores(req, res) {
  try {
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/stores`,
      'GET',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to retrieve stores', details: error.message });
  }
}

// Get Cities
async function getCities(req, res) {
  try {
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/city-list`,
      'GET',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to retrieve cities', details: error.message });
  }
}

// Get Zones inside a particular City
async function getZonesInCity(req, res) {
  try {
    const { cityId } = req.params;
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/cities/${cityId}/zone-list`,
      'GET',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to retrieve zones', details: error.message });
  }
}

// Get Areas inside a particular Zone
async function getAreasInZone(req, res) {
  try {
    const { zoneId } = req.params;
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/zones/${zoneId}/area-list`,
      'GET',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to retrieve areas', details: error.message });
  }
}

// Price Calculation
async function priceCalculation(req, res) {
    console.log(req.body)
  try {
    const response = await fetchRequest(
      `${PATHAO_BASE_URL}/aladdin/api/v1/merchant/price-plan`,
      'POST',
      {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      req.body
    );

    res.status(200).json(response);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to calculate price', details: error.message });
  }
}

module.exports = {
  issueAccessToken,
  issueRefreshToken,
  createOrder,
  createBulkOrder,
  getOrderInfo,
  createStore,
  getStores,
  getCities,
  getZonesInCity,
  getAreasInZone,
  priceCalculation,
};
