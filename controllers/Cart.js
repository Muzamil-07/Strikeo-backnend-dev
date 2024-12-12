const { OkResponse, BadRequestResponse } = require("express-http-response");
const Cart = require("../models/Cart.js");
const { getMin0Number } = require("../utils/stringsNymber.js");
const {
  processIncomingProducts,
  calculateTotalBill,
  isMatchingProductOrVariant,
} = require("../utils/Cart.js");

const getCart = async (req, res, next) => {
  const { id: owner } = req.user;

  if (!owner) return next(new BadRequestResponse("User ID is required"));

  try {
    let cart = await Cart.findOne({ owner });

    if (!cart) return next(new BadRequestResponse("Cart not found"));
    cart = await cart.populate("items.product.category");

    return next(new OkResponse(cart));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, variantSKU, quantity } = req.body;

    // Input validations
    if (!productId)
      return next(new BadRequestResponse("Product ID is required"));
    if (!getMin0Number(quantity) || getMin0Number(quantity) < 1)
      return next(new BadRequestResponse("Quantity must be greater than 0"));

    // Fetch the cart for the logged-in user
    const cart = await Cart.findOne({ owner: req.user.id });
    if (!cart) {
      return next(new BadRequestResponse("Cart not found"));
    }

    // Clone items from the cart for manipulation
    const tempItems = JSON.parse(JSON.stringify(cart.items));
    
    // Process incoming products and update tempItems
    const { updatedItems, missedProductIds } = await processIncomingProducts(
      [{ productId, variantSKU, quantity }],
      tempItems
    );

    // Update the cart with new items and bill
    const updatedBill = await calculateTotalBill(updatedItems);
    cart.items = updatedItems;
    cart.bill = updatedBill;

    // Save the updated cart
    await cart.save();
    await cart.populate([
      {
        path: "items.product",
        populate: [
          { path: "category", selecte: "name" },
          { path: "company", select: "name" },
        ],
      },
    ]);

    return next(new OkResponse({ cart, missedProductIds }));
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const addToCartInBulk = async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return next(
        new BadRequestResponse(
          "Products array is required and should not be empty"
        )
      );
    }

    // Fetch the cart for the logged-in user
    const cart = await Cart.findOne({ owner: req.user.id });
    if (!cart) {
      return next(new BadRequestResponse("Cart not found"));
    }

    // Clone items from the cart for manipulation
    const tempItems = JSON.parse(JSON.stringify(cart.items));

    // Process incoming products and update tempItems
    const { updatedItems, missedProductIds } = await processIncomingProducts(
      products,
      tempItems
    );

    // Calculate the total bill based on updated tempItems with populated products
    const updatedBill = await calculateTotalBill(updatedItems);

    // Update the cart with new items and bill
    cart.items = updatedItems;
    cart.bill = updatedBill;

    // Save the updated cart
    await cart.save();
    await cart.populate([
      {
        path: "items.product",
        populate: [
          { path: "category", selecte: "name" },
          { path: "company", select: "name" },
        ],
      },
    ]);

    return next(new OkResponse({ cart, missedProductIds }));
  } catch (error) {
    console.error(error);
    if (error instanceof BadRequestResponse) {
      return next(error);
    }
    return next(
      new BadRequestResponse("Something went wrong while bulk add to cart")
    );
  }
};

const updateCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ owner: req?.user?.id });

    if (!cart) return next(new BadRequestResponse("Cart not found"));

    const { items = [], bill = 0 } = {
      ...req.body,
    };

    cart.items = items;
    await cart.save();
    await cart.populate([
      {
        path: "items.product",
        populate: [
          { path: "category", selecte: "name" },
          { path: "company", select: "name" },
        ],
      },
    ]);
    if (bill) cart.bill = await calculateTotalBill(cart.items);

    await cart.save();

    return next(new OkResponse(cart));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Failed to update cart")
    );
  }
};

const updateItemQuantity = async (req, res, next) => {
  const { productId, variantSKU, quantity, flag } = req.body;
  try {
    if (!productId)
      return next(new BadRequestResponse("Product ID is required"));
    if (!getMin0Number(quantity))
      return next(new BadRequestResponse("Quantity is required"));

    const cart = await Cart.findOne({ owner: req.user.id });
    if (!cart) return next(new BadRequestResponse("Cart not found"));

    if (!flag || (flag !== "+" && flag !== "-")) {
      return next(
        new BadRequestResponse("Flag is required and must be either '+' or '-'")
      );
    }
    let tempItems = [...cart?.items];
    // Use utility function to find the item in the cart
    const itemIndex = tempItems.findIndex((item) => {
      const { isMatchingProduct, isMatchingVariant } =
        isMatchingProductOrVariant(item, productId, variantSKU);

      // Handle case where variantSKU is null (i.e., only updating the product)
      if (!variantSKU) {
        // Look for the base product (where variantSKU is null)
        return isMatchingProduct && !item.variantSKU;
      }

      // If variantSKU is provided, match both product and variant
      return isMatchingProduct && isMatchingVariant;
    });

    if (itemIndex === -1) {
      return next(new BadRequestResponse("Item not found in the cart"));
    }

    // Update the quantity based on the flag
    if (flag === "+") {
      tempItems[itemIndex].quantity += getMin0Number(quantity);
    } else if (flag === "-") {
      // Subtract quantity but ensure it doesn't go below 1
      tempItems[itemIndex].quantity = Math.max(
        1,
        tempItems[itemIndex].quantity - getMin0Number(quantity)
      );
    }

    // Recalculate the cart bill after updating the quantity
    cart.items = tempItems;
    cart.bill = await calculateTotalBill(cart.items);

    // Save the updated cart
    await cart.save();

    return next(new OkResponse(cart));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const selectUnselectItem = async (req, res, next) => {
  const { productId, variantSKU, flag = false, isAll = false } = req.body;
  try {
    // Validate inputs
    if (isAll === undefined && !productId) {
      return next(new BadRequestResponse("Product ID is required"));
    }

    if (typeof flag !== "boolean" || typeof isAll !== "boolean") {
      return next(new BadRequestResponse("Flag must be true or false"));
    }

    const cart = await Cart.findOne({ owner: req.user.id });
    if (!cart) return next(new BadRequestResponse("Cart not found"));

    let tempItems = [...cart?.items];

    if (isAll) {
      // Select or unselect all items
      tempItems = tempItems.map((item) => ({ ...item, selected: flag }));
    } else {
      // Find the item index using utility function
      const itemIndex = tempItems.findIndex((item) => {
        const { isMatchingProduct, isMatchingVariant } =
          isMatchingProductOrVariant(item, productId, variantSKU);

        // Handle case where variantSKU is null (i.e., only updating the product)
        if (!variantSKU) {
          return isMatchingProduct && !item.variantSKU;
        }

        // If variantSKU is provided, match both product and variant
        return isMatchingProduct && isMatchingVariant;
      });

      if (itemIndex === -1) {
        return next(new BadRequestResponse("Item not found in the cart"));
      }

      // Update the selection based on the flag
      tempItems[itemIndex].selected = flag;
    }

    // Recalculate the cart totals after updating the selection
    cart.items = tempItems;
    cart.bill = await calculateTotalBill(cart.items);

    // Save the updated cart
    await cart.save();

    return next(new OkResponse(cart));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const removeFromCart = async (req, res, next) => {
  const { productId, variantSKU } = req.body;
  try {
    if (!productId)
      return next(new BadRequestResponse("Product ID is required"));

    const cart = await Cart.findOne({ owner: req?.user?.id });
    if (!cart) return next(new BadRequestResponse("Cart not found"));

    let tempItems = [...cart.items];

    // Use utility function to determine which items to keep or remove
    tempItems = tempItems.filter((item) => {
      const { isMatchingProduct, isMatchingVariant } =
        isMatchingProductOrVariant(item, productId, variantSKU);

      // Handle case where variantSKU is null (i.e., only updating the product)
      if (!variantSKU) {
        return !(isMatchingProduct && !item.variantSKU);
      }

      // If variantSKU is provided, match both product and variant
      return !(isMatchingProduct && isMatchingVariant);
    });

    // Update the bill after removing items
    cart.items = tempItems;
    cart.bill = await calculateTotalBill(tempItems);

    // Save the updated cart
    await cart.save();

    return next(new OkResponse(cart));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const removeFromCartInBulk = async (req, res, next) => {
  try {
    const { products: itemsToRemove = [] } = req.body; // Expecting an array of { productId, variantSKU }

    if (!itemsToRemove || !Array.isArray(itemsToRemove))
      return next(
        new BadRequestResponse("products are required and should be an array")
      );

    const cart = await Cart.findOne({ owner: req.user.id });
    if (!cart) return next(new BadRequestResponse("Cart not found"));

    let tempItems = [...cart.items];

    // Use utility function to filter items to keep after bulk removal
    tempItems = tempItems.filter((item) => {
      // Check if any of the items to remove match the current item
      const shouldRemove = itemsToRemove.some((removeItem) => {
        const { isMatchingProduct, isMatchingVariant } =
          isMatchingProductOrVariant(
            item,
            removeItem?.productId,
            removeItem?.variantSKU
          );

        // Handle case where variantSKU is null (i.e., only updating the product)
        if (!removeItem?.variantSKU) {
          return isMatchingProduct && !item.variantSKU; // Remove if product matches and item has no variant
        }

        // If variantSKU is provided, match both product and variant
        return isMatchingProduct && isMatchingVariant; // Remove if both product and variant match
      });

      // Keep the item if it is not marked for removal
      return !shouldRemove;
    });

    // Recalculate the cart bill after removing items
    cart.items = tempItems;
    cart.bill = await calculateTotalBill(tempItems);

    // Save the updated cart
    await cart.save();

    return next(new OkResponse(cart));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const OrderController = {
  addToCartInBulk,
  getCart,
  addToCart,
  updateCart,
  updateItemQuantity,
  selectUnselectItem,
  removeFromCartInBulk,
  removeFromCart,
};

module.exports = OrderController;
