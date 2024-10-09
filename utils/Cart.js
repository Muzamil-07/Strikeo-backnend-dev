const Product = require("../models/Product");
const { getNumber, getProductId } = require("./stringsNymber");

const checkStockStatus = (productInfo) => {
  const { inventory } = productInfo || {};
  if (!inventory) return false;

  if (inventory.trackInventory) {
    return getNumber(inventory.stock) > 0;
  }

  return !!inventory.inStock;
};

const cartFormatForSelectedItems = async (cart) => {
  const payload = { ...cart };
  const items = payload?.items || [];

  let selectedItems = [];
  let remainingItems = [];
  let selectedQty = 0;
  let selectedDiscount = 0;
  let selectedTotalPrice = 0;
  let remainingQty = 0;
  let remainingDiscount = 0;
  let remainingTotalPrice = 0;

  items.forEach((item) => {
    const quantity = getNumber(item?.quantity);
    const discount = getNumber(
      item?.variantDetails
        ? item?.variantDetails?.pricing?.discount
        : item?.product?.pricing?.discount
    );
    const totalPrice = getNumber(
      (item?.variantDetails
        ? item?.variantDetails?.pricing?.salePrice
        : item?.product?.pricing?.salePrice) * quantity
    );

    if (item?.selected) {
      selectedItems.push(item);
      selectedQty += quantity;
      selectedDiscount += discount;
      selectedTotalPrice += totalPrice;
    } else {
      remainingItems.push(item);
      remainingQty += quantity;
      remainingDiscount += discount;
      remainingTotalPrice += totalPrice;
    }
  });

  const selectedPayableAmount = selectedTotalPrice - selectedDiscount;
  const remainingPayableAmount = remainingTotalPrice - remainingDiscount;

  return {
    ...payload,
    totalSelectedItems: selectedItems.length || 0,
    selectedItems: selectedItems || [],
    selectedQty: selectedQty || 0,
    selectedDiscount: selectedDiscount || 0,
    selectedTotalPrice: selectedTotalPrice || 0,
    selectedPayableAmount: selectedPayableAmount || 0,
    totalRemainingItems: remainingItems.length || 0,
    remainingItems: remainingItems || [],
    remainingQty: remainingQty || 0,
    remainingDiscount: remainingDiscount || 0,
    remainingTotalPrice: remainingTotalPrice || 0,
    remainingPayableAmount: remainingPayableAmount || 0,
  };
};

// Utility to match product and variant
const isMatchingProductOrVariant = (item, productId, variantSKU = null) => {
  const isMatchingProduct = getProductId(item.product) === String(productId);
  const isMatchingVariant = variantSKU
    ? item?.variantSKU === variantSKU
    : false;

  return {
    isMatchingProduct,
    isMatchingVariant,
  };
};

const calculateTotalBill = async (tempItems) => {
  return tempItems.reduce((total, item) => {
    let itemPrice = 0;

    // Check if the product is populated
    const product = item.product; // Assuming product is populated in tempItems

    if (item.variantSKU) {
      // Find the variant price
      const variant = product?.variants?.find(
        (variant) => variant.sku === item.variantSKU
      );
      if (variant) {
        itemPrice =
          getNumber(variant?.pricing?.salePrice) -
          getNumber(variant?.pricing?.discount);
      }
    } else {
      // Use the product's main price if no variant is selected
      itemPrice =
        getNumber(product?.pricing?.salePrice) -
        getNumber(product?.pricing?.discount);
    }

    return total + itemPrice * item.quantity;
  }, 0);
};

const processIncomingProducts = async (products = [], tempItems = []) => {
  const missedProductIds = []; // Array to hold IDs of missed products

  for (const productInfo of products) {
    const { productId, variantSKU, quantity } = productInfo;

    // Check if the item already exists in the cart
    const existingItemIndex = tempItems.findIndex((item) => {
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

    if (existingItemIndex !== -1) {
      // If the product exists, update the quantity
      tempItems[existingItemIndex].quantity += getNumber(quantity) || 1;
    } else {
      try {
        // Fetch the product asynchronously
        const product = await Product.findById(productId);
        if (!product) {
          console.warn(`Product not found for ID: ${productId}`);
          missedProductIds.push(productId); // Add to missed products
          continue; // Skip to the next productInfo
        }
        const variant = product.variants.find((v) => v?.sku === variantSKU);
        if (!checkStockStatus(variant || product)) {
          console.warn(
            `Item out of stock: ${variant?.variantName || product?.name}`
          );
          missedProductIds.push(productId); // Add to missed products
          continue; // Skip to the next productInfo
        }
        // Create a new item for the cart
        const newItem = {
          product: product,
          variantSKU: variantSKU || null,
          quantity: getNumber(quantity) || 1,
          selected: true,
        };
        tempItems.push(newItem);
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        missedProductIds.push(productId); // Add to missed products
        continue; // Skip to the next productInfo
      }
    }
  }

  return { updatedItems: [...tempItems], missedProductIds };
};

module.exports = {
  processIncomingProducts,
  calculateTotalBill,
  isMatchingProductOrVariant,
  cartFormatForSelectedItems,
  checkStockStatus,
};
