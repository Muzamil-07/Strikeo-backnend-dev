const { BadRequestResponse, OkResponse } = require("express-http-response");
const FavouriteProduct = require("../models/FavouriteProduct");
const { isMatchingProductOrVariant } = require("../utils/Cart");
const Product = require("../models/Product");

// Get User Favorites
const getUserFavorites = async (req, res, next) => {
  try {
    const favourites = await FavouriteProduct.findOne({ owner: req.user.id });

    return next(new OkResponse(favourites));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

// Add to Favorites
const addToFavorites = async (req, res, next) => {
  try {
    const { productId, variantSKU = null } = req.body;

    if (!productId) {
      return next(new BadRequestResponse("Product ID is required"));
    }

    // Find or create the favorites document for the user
    let favourites = await FavouriteProduct.findOne({ owner: req.user.id });
    if (!favourites) {
      favourites = new FavouriteProduct({ owner: req.user.id });
      req.user.favouriteProducts = favourites?._id;
      await req.user.save();
    }

    // Check if the item already exists in favorites
    const exists = favourites.items.some((item) => {
      const { isMatchingProduct, isMatchingVariant } =
        isMatchingProductOrVariant(item, productId, variantSKU);
      return isMatchingProduct && (isMatchingVariant || !variantSKU);
    });

    if (exists) {
      return next(new BadRequestResponse("Product is already in favorites"));
    }

    // Add the product to favorites
    const product = Product.exists({ _id: productId });
    if (!product) {
      return next(new BadRequestResponse("Product not found"));
    }

    favourites.items.push({ product: productId, variantSKU });
    await favourites.save();
    await favourites.populate("items.product");

    return next(new OkResponse(favourites));
  } catch (error) {
    console.log(error?.message);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

// Remove from Favorites
const removeFromFavorites = async (req, res, next) => {
  try {
    const { productId, variantSKU } = req.body;

    if (!productId) {
      return next(new BadRequestResponse("Product ID is required"));
    }

    const favourites = await FavouriteProduct.findOne({ owner: req.user.id });
    if (!favourites) return next(new BadRequestResponse("No favorites found"));

    // Filter out the item to remove using the utility function
    favourites.items = favourites.items.filter((item) => {
      const { isMatchingProduct, isMatchingVariant } =
        isMatchingProductOrVariant(item, productId, variantSKU);
      return !(isMatchingProduct && (isMatchingVariant || !variantSKU));
    });

    await favourites.save();

    return next(new OkResponse(favourites));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

module.exports = {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
};
