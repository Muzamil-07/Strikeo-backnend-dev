const { OkResponse, BadRequestResponse } = require("express-http-response");
const pathaoService = require("../utils/PathaoService");

// Issue an Access Token
async function issueAccessToken(req, res, next) {
  try {
    const response = await pathaoService.issueAccessToken();
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to issue access token", {
        details: error.message,
      })
    );
  }
}

// Issue a Refresh Token
async function issueRefreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body;
    const response = await pathaoService.issueRefreshToken(refresh_token);
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to refresh token", {
        details: error.message,
      })
    );
  }
}

// Create a New Order
async function createOrder(req, res, next) {
  try {
    const response = await pathaoService.createOrder(req.body);
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to create new order", {
        details: error.message,
      })
    );
  }
}

// Create Bulk Orders
async function createBulkOrder(req, res, next) {
  try {
    const response = await pathaoService.createBulkOrder(req.body.orders);
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to create bulk orders", {
        details: error.message,
      })
    );
  }
}

// Get Order Short Info
async function getOrderInfo(req, res, next) {
  try {
    const { consignmentId } = req.params;
    const response = await pathaoService.getOrderInfo(consignmentId);
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to retrieve order info", {
        details: error.message,
      })
    );
  }
}

// Create a New Store
async function createStore(req, res, next) {
  try {
    const response = await pathaoService.createStore(req.body);
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to create store", {
        details: error.message,
      })
    );
  }
}

// Get Stores
async function getStores(req, res, next) {
  try {
    const response = await pathaoService.getStores();
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to retrieve stores", {
        details: error.message,
      })
    );
  }
}

// Get Cities
async function getCities(req, res, next) {
  try {
    const response = await pathaoService.getCities();
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to retrieve cities", {
        details: error.message,
      })
    );
  }
}

// Get Zones inside a particular City
async function getZonesInCity(req, res, next) {
  try {
    const { cityId } = req.params;
    const response = await pathaoService.getZonesInCity(cityId);
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to retrieve zones", {
        details: error.message,
      })
    );
  }
}

// Get Areas inside a particular Zone
async function getAreasInZone(req, res, next) {
  try {
    const { zoneId } = req.params;
    const response = await pathaoService.getAreasInZone(zoneId);
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to retrieve areas", {
        details: error,
      })
    );
  }
}

// Price Calculation
async function priceCalculation(req, res, next) {
  try {
    const response = await pathaoService.priceCalculation(req.body);
    return next(new OkResponse(response?.data));
  } catch (error) {
    next(
      new BadRequestResponse("Failed to calculate price", {
        details: error,
      })
    );
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
