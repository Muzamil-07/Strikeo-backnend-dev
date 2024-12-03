const Product = require("../models/Product");
const { getProductId, getMin0Number } = require("./stringsNymber");

const checkStockStatus = (productInfo) => {
  const { inventory } = productInfo || {};
  if (!inventory) return false;

  if (inventory?.trackInventory) {
    return inventory?.allowBackorders
      ? true
      : getMin0Number(inventory?.stock) > 0;
  }

  return !!inventory?.inStock;
};

const cartFormatForSelectedItems = async (payload, shippingPrice = 0) => {
  const selectedItems =
    payload?.items?.filter(
      (o) => checkStockStatus(o?.variantDetails || o?.product) && o?.selected
    ) || [];

  const selectedQty = selectedItems?.reduce(
    (acc, item) => acc + getMin0Number(item?.quantity),
    0
  );

  const selectedWeight = selectedItems?.reduce(
    (acc, item) =>
      acc +
      getMin0Number(
        item?.variantDetails
          ? item?.variantDetails?.weight
          : item?.product?.weight
      ) *
        getMin0Number(item?.quantity),
    0
  );

  // Prioritize variantDetails, fallback to product if not available
  const selectedDiscount = Math.max(
    0,
    selectedItems?.reduce(
      (acc, item) =>
        acc +
        getMin0Number(
          (item?.variantDetails
            ? item?.variantDetails?.pricing?.discount
            : item?.product?.pricing?.discount) * getMin0Number(item?.quantity)
        ),
      0
    )
  );

  const selectedTotalPrice = Math.max(
    0,
    selectedItems?.reduce(
      (acc, item) =>
        acc +
        getMin0Number(
          (item?.variantDetails
            ? item?.variantDetails?.pricing?.salePrice
            : item?.product?.pricing?.salePrice) * getMin0Number(item?.quantity)
        ),
      0
    )
  );

  const shippingCost = getMin0Number(shippingPrice);

  const selectedPayableAmount = Math.max(
    0,
    selectedTotalPrice + shippingCost - selectedDiscount
  );

  const selectedDiscountPercent = selectedTotalPrice
    ? ((selectedDiscount / selectedTotalPrice) * 100).toFixed(1)
    : 0;

  return {
    selectedItems,
    selectedQty,
    selectedWeight,
    selectedDiscount,
    selectedTotalPrice,
    selectedPayableAmount,
    selectedDiscountPercent,
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
        (variant) => variant?.sku === item.variantSKU
      );
      if (variant) {
        itemPrice =
          getMin0Number(variant?.pricing?.salePrice) -
          getMin0Number(variant?.pricing?.discount);
      }
    } else {
      // Use the product's main price if no variant is selected
      itemPrice =
        getMin0Number(product?.pricing?.salePrice) -
        getMin0Number(product?.pricing?.discount);
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
      tempItems[existingItemIndex].quantity += getMin0Number(quantity) || 1;
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
          quantity: getMin0Number(quantity) || 1,
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
