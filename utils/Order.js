const Order = require("../models/Order"); // Adjust the path as necessary
const Payment = require("../models/Payment"); // Adjust the path as necessary
const {
  confirmOrder,
  handleOrderErrorsAndNotify,
  sslczNotification,
} = require("./mailer");
const { v4: uuidv4 } = require("uuid");
const { getProductId, getMin0Number } = require("./stringsNymber");
const groceryPricing = require("../imports/groceryPricing.json");
const {
  getCities,
  getZonesInCity,
  priceCalculation,
} = require("./pathaoService");
const OrdersSummary = require("../models/OrdersSummary");
const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const PromoCode = require("../models/PromoCode");
const { processOrdersSummaryNotifyForCustomer } = require("./ordersSummary");

const getShippingCost = async (shippingDetails, items) => {
  const { city = "", zone = "" } = shippingDetails;

  // Fetch the list of cities
  const cities = await getCities();
  const foundCity = cities?.data?.data?.find((c) => c.city_name === city);
  if (!foundCity) throw new Error("City not found");

  // Fetch the zones in the found city
  const zones = await getZonesInCity(foundCity?.city_id);
  const foundZone = zones?.data?.data?.find((z) => z.zone_name === zone);
  if (!foundZone) throw new Error("Zone not found");

  // // Fetch the areas in the found zone
  // const areas = await getAreasInZone(foundZone.id);
  // const foundArea = areas.find((a) => a.area_name === area);
  // if (!foundArea) throw new Error("Area not found");
  let missingData = "";

  if (!foundCity?.city_id) {
    missingData += "City ID ";
  }
  if (!foundZone?.zone_id) {
    missingData += "Zone ID ";
  }

  if (missingData) {
    throw new Error(
      `Missing required data: ${missingData.trim().replace(" ", ", ")}`
    );
  }

  const pricing = groceryPricing.pricing;
  let totalWeightForAPI = 0;
  let groceryShippingCost = 0;

  for (const item of items) {
    const weight = getMin0Number(
      item?.variantDetails
        ? item?.variantDetails?.weight
        : item?.product?.weight
    );
    const quantity = Math.max(1, getMin0Number(item?.quantity));
    const itemWeight = weight * quantity;

    if (itemWeight > 60) {
      continue; // Exclude items exceeding 60kg from all calculations
    }

    if (item?.product?.category?.name === "Groceries and Food Items") {
      // Grocery-specific logic
      const range = pricing.find(
        (range) => itemWeight >= range.min && itemWeight <= range.max
      );

      groceryShippingCost += getMin0Number(range?.price); // Accumulate grocery shipping cost
    } else {
      // Non-grocery items: Accumulate weight for API calculation
      totalWeightForAPI += itemWeight;
    }
  }

  // Calculate shipping cost for non-grocery items using the API
  let nonGroceryShippingCost = 0;
  if (totalWeightForAPI > 0) {
    const priceRequestBody = {
      store_id: 217213,
      item_type: 2,
      delivery_type: 48,
      item_weight: totalWeightForAPI,
      recipient_city: foundCity?.city_id,
      recipient_zone: foundZone?.zone_id,
    };

    const shippingCostResponse = await priceCalculation(priceRequestBody);
    nonGroceryShippingCost = shippingCostResponse?.data?.final_price;
  }

  // Return the combined shipping cost
  return (
    getMin0Number(groceryShippingCost) + getMin0Number(nonGroceryShippingCost)
  );
};

const handleValidateUserUsageLimitForPromoCode = async (
  userId,
  appliedPromoCode
) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID.");
  }
  const usersRedeemed = appliedPromoCode?.usersRedeemed || [];
  // Find if the user has already redeemed the promo code
  const userIndex = usersRedeemed.findIndex(
    (redeem) => redeem?.user.toString() === userId.toString()
  );

  if (userIndex >= 0) {
    // User has already redeemed the promo code, increment their usage count
    if (
      usersRedeemed[userIndex].usageCount >=
      getMin0Number(appliedPromoCode.perUserLimit)
    ) {
      throw new Error(
        "User has reached the redemption limit for this promo code."
      );
    }
    usersRedeemed[userIndex].usageCount += 1;
  } else {
    // Add new user entry to `usersRedeemed`
    usersRedeemed.push({ user: userId, usageCount: 1 });
  }
  return usersRedeemed;
};

const validatePromoCode = async (promoCode, cartTotals, userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    return {
      isValid: false,
      message: "Please Provide valid user ID.",
      discountAmount: 0,
    };
  }
  const currentDate = new Date();

  // Validate the promo code
  if (!promoCode) {
    return {
      isValid: false,
      message:
        "It seems you haven't entered a promo code. Please provide a valid code to enjoy the discount.",
      discountAmount: 0,
    };
  }

  if (!promoCode?.isActive) {
    return {
      isValid: false,
      message:
        "The promo code you entered is no longer active. Please try another code.",
      discountAmount: 0,
    };
  }

  if (new Date(promoCode?.expirationDate) < currentDate)
    return {
      isValid: false,
      message: "The promo code has expired. Please use a valid code.",
      discountAmount: 0,
    };

  // Validate overall usage limit
  if (
    getMin0Number(promoCode.usageCount) >= getMin0Number(promoCode.usageLimit)
  ) {
    return {
      isValid: false,
      message:
        "This promo code has reached its usage limit. Please try another.",
      discountAmount: 0,
    };
  }

  if (getMin0Number(promoCode?.minimumOrderValue) > getMin0Number(cartTotals))
    return {
      isValid: false,
      message: `Applied promo code requires a minimum order value of ${getMin0Number(
        promoCode?.minimumOrderValue
      ).toLocaleString()}, your order is ${getMin0Number(
        cartTotals
      ).toLocaleString()}.`,
      discountAmount: 0,
    };

  const usersRedeemed = promoCode?.usersRedeemed || [];
  // Find if the user has already redeemed the promo code
  const userIndex = usersRedeemed.findIndex(
    (redeem) => redeem?.user.toString() === userId.toString()
  );

  if (userIndex >= 0) {
    // User has already redeemed the promo code, increment their usage count
    if (
      usersRedeemed[userIndex].usageCount >=
      getMin0Number(promoCode?.perUserLimit)
    ) {
      return {
        isValid: false,
        message: `User has reached the redemption limit for this promo code.`,
        discountAmount: 0,
      };
    }
  }

  // Calculate the discount amount
  let discountAmount = 0;
  if (promoCode?.discountType === "fixed") {
    discountAmount = getMin0Number(promoCode?.discountValue);
  } else if (promoCode?.discountType === "percentage") {
    discountAmount = (
      (getMin0Number(cartTotals) * getMin0Number(promoCode?.discountValue)) /
      100
    ).toFixed(0);
  }

  // Ensure the discount amount does not exceed the cart total
  discountAmount = Math.min(discountAmount, getMin0Number(cartTotals));

  return {
    isValid: true,
    message: "Promo code applied successfully! Enjoy your discount.",
    discountAmount,
  };
};

const updatePromoCodeUsage = async (userId, appliedPromoCode) => {
  try {
    if (!mongoose.isValidObjectId(getProductId(appliedPromoCode))) {
      throw new Error("Applied Promo code data.");
    }
    const usersRedeemed = await handleValidateUserUsageLimitForPromoCode(
      userId,
      appliedPromoCode
    );
    if (
      getMin0Number(appliedPromoCode.usageCount) >=
      getMin0Number(appliedPromoCode.usageLimit)
    ) {
      throw new Error("Promo code usage limit exceeded.");
    }
    // Increment the overall usage count
    appliedPromoCode.usageCount += 1;

    // Save the updated promo code
    await PromoCode.findByIdAndUpdate(getProductId(appliedPromoCode), {
      ...appliedPromoCode,
      usersRedeemed,
    });
    console.log("Promo code usage updated successfully.");
    return appliedPromoCode;
  } catch (error) {
    // console.error("Error updating promo code usage:", error);
    throw error;
  }
};

const createOrdersSummary = async (
  customerId = "",
  completedOrders = [],
  successfullyCreatedAmount = 0,
  totalVendorBill = 0,
  totalShippingCost = 0,
  appliedPromoCode = null
) => {
  try {
    if (
      !mongoose.isValidObjectId(customerId) ||
      !completedOrders?.length ||
      !getMin0Number(successfullyCreatedAmount)
    ) {
      throw new Error("Invalid data provided for creating OrdersSummary.");
    }

    const findedUser = await User.findById(customerId, {
      promotions: 1,
      email: 1,
      // firstName: 1,
      // lastName: 1,
    }).populate("promotions.appliedPromoCode");

    appliedPromoCode = findedUser?.promotions?.appliedPromoCode;
    // Validate promo code if provided
    const { isValid, message } = await validatePromoCode(
      appliedPromoCode,
      successfullyCreatedAmount + totalShippingCost,
      customerId
    ).catch((err) => {
      console.warn(
        "Promo code validating failed. Promo code will not be added to the summary.",
        err
      );
    });

    if (!isValid) {
      console.warn(
        `Promo code is not valid. Promo code will not be added to the summary. Reason: ${message}`
      );
    }

    // Create the summary document
    const summary = new OrdersSummary({
      customer: customerId,
      orders: completedOrders,
      vendorBill: totalVendorBill,
      customerBill: successfullyCreatedAmount,
      shippingDetails: { shippingCost: totalShippingCost },
    });

    if (isValid) {
      await updatePromoCodeUsage(customerId, appliedPromoCode).catch((err) => {
        console.warn(
          "Promo code usage update failed. Promo code will be added to the summary.",
          err
        );
      });

      summary.promotion = { promoCode: appliedPromoCode };
    }

    await summary.save();
    await User.updateOne(
      { _id: customerId },
      {
        $set: { "promotions.appliedPromoCode": null },
        // $pull: { "promotions.promoCodes": getProductId(appliedPromoCode) },
      }
    );

    processOrdersSummaryNotifyForCustomer(summary, findedUser?.email);
    return summary;
  } catch (error) {
    console.error("Error creating OrdersSummary:", error);
  }
};

const createSingleOrder = async (
  orderData,
  userId,
  shippingDetails,
  session,
  user
) => {
  try {
    const shippingCost = await getShippingCost(
      shippingDetails,
      orderData.items
    );
    shippingDetails.shippingCost = shippingCost;

    const customerBillWithShipping =
      getMin0Number(orderData.totalAmount) + getMin0Number(shippingCost);

    const payment = new Payment({
      paymentId: `cod-${uuidv4()}`,
      customer: userId,
      amount: customerBillWithShipping,
      method: "cash",
    });

    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const order = new Order({
      customer: userId,
      company: getProductId(orderData.company),
      items: orderData.items,
      customerBill: orderData.totalAmount,
      vendorBill: orderData.vendorAmount,
      shippingDetails,
      payment: getProductId(payment),
    });

    order.confirm_token = {
      token,
      link: `${
        process.env.BACKEND_URL
      }/api/order/confirm?user=${userId}&token=${token}&order=${
        order?._id || order?.id
      }`,
      expires: Date.now() + 3600000, // 1 hour
    };

    await order.save({ session });
    payment.orders = [getProductId(order)];
    await payment.save();

    // Send confirmation email for this order
    confirmOrder(
      { ...user, confirm_token: order.confirm_token },
      {
        items: orderData?.items,
        bill: orderData?.totalAmount,
        owner: userId,
      },
      user?.email,
      shippingCost
    );

    return order;
  } catch (error) {
    console.log(error);
    throw new Error(
      `Failed to create order for company ${
        orderData?.company?.name || "Unnamed Company"
      }. Reason: ${error.message}`
    );
  }
};

const handleOrderUpdateNotify = async (email, removedMessages = []) => {
  // Check if there are messages to notify
  if (removedMessages.length > 0) {
    await handleOrderErrorsAndNotify(email, removedMessages); // Util function to send notifications
  }
};
const handleTransactionProcessNotify = async (
  ipn_Payload = {},
  failureReason
) => {
  try {
    const sslczPayment = await Payment.findOne({
      paymentId: ipn_Payload?.tran_id,
    });
    if (sslczPayment) {
      sslczPayment.error = failureReason;
      await sslczPayment.save();
    }

    // if (!sslczPayment) {
    //   // Payment not found notification
    //   await sslczNotification(
    //     {
    //       name: "Hi!",
    //       intro: "We could not find your payment details.",
    //       action: {
    //         instructions: `It seems there was an issue locating your payment information. Please try again or contact us for further assistance.`,
    //         button: {
    //           color: "#3869D4",
    //           text: "Contact Support",
    //           link: `mailto:${process.env.SMTP_USER}`,
    //         },
    //       },
    //       outro:
    //         "Thank you for your patience, and please let us know if you need help.",
    //     },
    //     ipn_Payload?.email || process.env.SUPPORT_EMAIL // Use payload email or fallback to support email
    //   );
    //   return;
    // }

    const user = sslczPayment?.customer
      ? JSON.parse(JSON.stringify(sslczPayment?.customer))
      : null;

    // if (!user || !user.email) {
    //   // User not found notification
    //   await sslczNotification(
    //     {
    //       name: "Hi!",
    //       intro: "We encountered an issue retrieving your account information.",
    //       action: {
    //         instructions: `We couldn't find your user details. Please reach out to us for assistance.`,
    //         button: {
    //           color: "#3869D4",
    //           text: "Contact Support",
    //           link: `mailto:${process.env.SMTP_USER}`,
    //         },
    //       },
    //       outro:
    //         "Thank you for your understanding, and we're happy to help with any questions.",
    //     },
    //     process.env.SUPPORT_EMAIL // Fallback to support email if user not found
    //   );
    //   return;
    // }

    // Standard payment issue notification
    await sslczNotification(
      {
        name: `${user?.firstName || ""}`,
        intro: "We encountered an issue while processing your payment.",
        action: {
          instructions: `We were unable to place your order due to a payment issue. Please try again or contact us if the problem persists.`,
          button: {
            color: "#3869D4",
            text: "Contact Support",
            link: `mailto:${process.env.SMTP_USER}`,
          },
        },
        outro: `Transaction ID: ${ipn_Payload?.tran_id || "N/A"}, Status: ${
          ipn_Payload?.status || "N/A"
        }`,
      },
      user?.email
    );
  } catch (error) {
    console.error("Error in Transaction failed notify =>", error);
    // // Optional: Send an error notification or log the issue for further investigation
    // await sslczNotification(
    //   {
    //     name: "Hi!",
    //     intro: "An unexpected error occurred while processing your request.",
    //     action: {
    //       instructions: `Please contact support if the issue persists.`,
    //       button: {
    //         color: "#3869D4",
    //         text: "Contact Support",
    //         link: `mailto:${process.env.SMTP_USER}`,
    //       },
    //     },
    //     outro: "We apologize for the inconvenience caused.",
    //   },
    //   process.env.SUPPORT_EMAIL // Fallback to support email in case of errors
    // );
  }
};

const groupItemsByCompany = async (selectedItems = [], userEmail) => {
  const ordersMap = new Map();

  // Arrays to track removed items for notifications
  const removedItemsOutOfStock = [];
  const inactiveItems = [];
  let notFoundCount = 0;
  const removedEmptyOrders = [];

  for (const item of selectedItems) {
    // Check if product exists and is active
    const product = item?.product;
    const variantDetails = item?.variantDetails;

    if (!product) {
      notFoundCount++; // Track not found items
      continue; // Skip to next item (removing not found items)
    }
    const quantity = getMin0Number(item.quantity);
    let isValidItem = true; // Flag to check if item is valid

    // Check for variants
    if (item?.variantSKU) {
      const variant = variantDetails;

      if (!variant) {
        notFoundCount++; // Track if variant not found
        continue; // Skip to next item (removing not found variant)
      }

      if (!variant?.isActive) {
        inactiveItems.push({
          name: `${product?.name} Variant: ${variant?.variantName}`,
          price: `${
            getMin0Number(variant?.pricing?.salePrice) -
            getMin0Number(variant?.pricing?.discount)
          } X ${quantity}`,
        });
        isValidItem = false;
        continue;
      }

      // Check stock for variants
      if (variant?.inventory?.trackInventory) {
        const variantStock = getMin0Number(variant?.inventory?.stock);

        if (quantity > variantStock || variantStock === 0) {
          if (variant?.inventory?.allowBackorders) {
            console.info(
              `* Backorders are allowed for variant SKU: ${variant?.sku}. Vendor bill will be add. *`
            );
          } else {
            // Track out-of-stock variant
            removedItemsOutOfStock.push({
              name: `${product?.name} Variant: ${variant?.variantName}`,
              price: `${
                getMin0Number(variant?.pricing?.salePrice) -
                getMin0Number(variant?.pricing?.discount)
              } X ${quantity}`,
            });
            console.info(
              `* Variant with SKU => ${variant?.sku} is out of stock. *`
            );
            isValidItem = false; // Mark item as invalid
            continue; // Skip to next item (removing out-of-stock variant)
          }
        }
      } else {
        if (!variant?.inventory?.inStock) {
          // Track out-of-stock variant
          removedItemsOutOfStock.push({
            name: `${product?.name} Variant: ${variant?.variantName}`,
            price: `${Math.max(
              0,
              getMin0Number(variant?.pricing?.salePrice) -
                getMin0Number(variant?.pricing?.discount)
            )} X ${quantity}`,
          });
          isValidItem = false; // Mark item as invalid
          continue; // Skip to next item (removing out-of-stock variant)
        } else {
          console.info(
            `* Tracking inventory is OFF but In Stock is ON for variant SKU: ${
              variant?.sku || "N/A"
            }. Vendor bill will be add. *`
          );
        }
      }
    } else {
      item.variantSnapshot = null;
      if (!product?.isActive) {
        inactiveItems.push({
          name: product?.name,
          price: `${
            getMin0Number(product?.pricing?.salePrice) -
            getMin0Number(product?.pricing?.discount)
          } X ${quantity}`,
        });
        isValidItem = false;
        continue;
      }

      // Check stock for the product if no variant
      if (product?.inventory?.trackInventory) {
        const productStock = getMin0Number(product?.inventory?.stock);

        if (quantity > productStock || productStock === 0) {
          if (product?.inventory?.allowBackorders) {
            console.info(
              `Backorders are allowed for product SKU => ${product?.sku}. Vendor bill will be add.`
            );
          } else {
            // Track out-of-stock product
            removedItemsOutOfStock.push({
              name: product?.name,
              price: `${Math.max(
                0,
                getMin0Number(product?.pricing?.salePrice) -
                  getMin0Number(product?.pricing?.discount)
              )} X ${quantity}`,
            });
            console.info(`Product with SKU => ${product?.sku} is out of stock`);
            isValidItem = false; // Mark item as invalid
            continue; // Skip to next item (removing out-of-stock product)
          }
        }
      } else {
        if (!product?.inventory?.inStock) {
          removedItemsOutOfStock.push({
            name: product?.name,
            price: `${Math.max(
              0,
              getMin0Number(product?.pricing?.salePrice) -
                getMin0Number(product?.pricing?.discount)
            )} X ${quantity}`,
          });
          isValidItem = false; // Mark item as invalid
          continue; // Skip to next item (removing out-of-stock product)
        } else {
          console.info(
            `Tracking inventory is OFF but In Stock is ON for product SKU => ${
              product?.sku || "N/A"
            }. Vendor bill will be add.`
          );
        }
      }
    }

    if (isValidItem) {
      // If valid, group items by company
      const companyId = getProductId(item?.product?.company);
      const productSnapshot = {
        name: product?.name,
        images: product?.images?.slice(0, 1),
        sku: product?.sku,
        weight: product?.weight,
        pricing: product?.pricing,
        attributes: product?.attributes,
        dimensions: product?.dimensions,
        weightUnit: product?.weightUnit,
      };
      const variantSnapshot =
        item?.variantSKU && variantDetails
          ? {
              variantName: variantDetails?.variantName,
              images: variantDetails?.images?.slice(0, 1),
              sku: variantDetails?.sku,
              pricing: variantDetails?.pricing,
              weight: variantDetails?.weight,
              weightUnit: variantDetails?.weightUnit,
              dimensions: variantDetails?.dimensions,
              color: variantDetails?.color,
              size: variantDetails?.size,
              material: variantDetails?.material,
              gender: variantDetails?.gender,
              condition: variantDetails?.condition,
            }
          : null;
      const tempItem = {
        ...item,
        product: product,
        productSnapshot,
        variantSnapshot,
      };

      let totalAmount = 0;
      let vendorAmount = 0;
      const quantity = Math.max(1, getMin0Number(item?.quantity));
      if (item?.variantDetails) {
        totalAmount =
          getMin0Number(item?.variantDetails?.pricing?.salePrice) -
          getMin0Number(item?.variantDetails?.pricing?.discount);

        vendorAmount = getMin0Number(item?.variantDetails?.pricing?.costPrice);
      } else {
        totalAmount =
          getMin0Number(item?.product?.pricing?.salePrice) -
          getMin0Number(item?.product?.pricing?.discount);

        vendorAmount = getMin0Number(item?.product?.pricing?.costPrice);
      }
      totalAmount = totalAmount * quantity;
      vendorAmount = vendorAmount * quantity;

      // Group items by company
      if (!ordersMap.has(companyId)) {
        ordersMap.set(companyId, {
          company: item?.product?.company,
          items: [tempItem],
          totalAmount,
          vendorAmount,
        });
      } else {
        const existingOrder = ordersMap.get(companyId);
        existingOrder.items.push(tempItem);
        existingOrder.totalAmount += totalAmount;
        existingOrder.vendorAmount += vendorAmount;
      }
    }
  }

  // Prepare removed messages
  const removedMessages = [];

  if (removedItemsOutOfStock.length > 0) {
    const emailMsg = {
      message: `We’re sorry, but the following items were removed from your order because they are currently out of stock:`,
      items: removedItemsOutOfStock,
    };
    console.log(emailMsg);
    removedMessages.push(emailMsg);
  }
  if (inactiveItems.length > 0) {
    const emailMsg = {
      message: `The following items are inactive and may not be available for purchase:`,
      items: inactiveItems,
    };
    console.log(emailMsg);
    removedMessages.push(emailMsg);
  }
  if (notFoundCount > 0) {
    const emailMsg = {
      message: `Unfortunately, we were unable to locate ${notFoundCount} item(s) in our inventory. They were not found.`,
    };
    console.log(emailMsg);
    removedMessages.push(emailMsg);
  }

  // Filter out empty orders and track them for notification
  const validOrders = Array.from(ordersMap.values()).filter((order) => {
    if (order.items.length === 0) {
      removedEmptyOrders.push(order?.company?.name);
      return false;
    }
    return true;
  });

  // Add a removed message for orders with no valid items
  if (removedEmptyOrders.length > 0) {
    removedMessages.push({
      message: `The (${
        removedEmptyOrders?.length
      }) orders were removed entirely because they contained no valid items. Companies: ${String(
        removedEmptyOrders
      )}`,
    });
  }

  // Check if there are no valid items in any order
  if (validOrders.length === 0) {
    const emailMsg = {
      message: `Regrettably, there are no valid items remaining in your orders. We appreciate your understanding!`,
    };
    console.log(emailMsg);
    removedMessages.push(emailMsg);
  }

  // Notify the customer
  await handleOrderUpdateNotify(userEmail, removedMessages);

  return validOrders; // Return the filtered array of valid orders
};

module.exports = {
  createOrdersSummary,
  createSingleOrder,
  groupItemsByCompany,
  handleTransactionProcessNotify,
  getShippingCost,
};
