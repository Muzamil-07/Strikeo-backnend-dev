const Order = require("../models/Order"); // Adjust the path as necessary
const Payment = require("../models/Payment"); // Adjust the path as necessary
const {
  confirmOrder,
  handleOrderErrorsAndNotify,
  sslczNotification,
} = require("./mailer");
const { v4: uuidv4 } = require("uuid");
const { getProductId, getNumber } = require("./stringsNymber");
const {
  getCities,
  getZonesInCity,
  priceCalculation,
} = require("./pathaoService");

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

  // Prepare the request body for price calculation
  const selectedWeight = items?.reduce(
    (acc, item) =>
      acc +
      getNumber(
        item?.variantDetails
          ? item?.variantDetails?.weight
          : item?.product?.weight
      ) *
        getNumber(item?.quantity),
    0
  );

  if (selectedWeight) {
    const priceRequestBody = {
      store_id: 217213,
      item_type: 2,
      delivery_type: 48,
      item_weight: selectedWeight,
      recipient_city: foundCity?.city_id,
      recipient_zone: foundZone?.zone_id,
    };

    // Call the price calculation API
    const shippingCostResponse = await priceCalculation(priceRequestBody);
    return shippingCostResponse?.data?.final_price;
  } else {
    return 0;
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
      getNumber(orderData.totalAmount) + getNumber(shippingCost);

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
        items: orderData.items,
        bill: orderData.totalAmount,
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
    const quantity = getNumber(item.quantity);
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
            getNumber(variant?.pricing?.salePrice) -
            getNumber(variant?.pricing?.discount)
          } X ${quantity}`,
        });
        isValidItem = false;
        continue;
      }

      // Check stock for variants
      if (variant?.inventory?.trackInventory) {
        const variantStock = getNumber(variant?.inventory?.stock);

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
                getNumber(variant?.pricing?.salePrice) -
                getNumber(variant?.pricing?.discount)
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
              getNumber(variant?.pricing?.salePrice) -
                getNumber(variant?.pricing?.discount)
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
          price: `${Math.max(
            0,
            getNumber(product?.pricing?.salePrice) -
              getNumber(product?.pricing?.discount)
          )} X ${quantity}`,
        });
        isValidItem = false;
        continue;
      }

      // Check stock for the product if no variant
      if (product?.inventory?.trackInventory) {
        const productStock = getNumber(product?.inventory?.stock);

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
                getNumber(product?.pricing?.salePrice) -
                  getNumber(product?.pricing?.discount)
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
              getNumber(product?.pricing?.salePrice) -
                getNumber(product?.pricing?.discount)
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
      const quantity = getNumber(item?.quantity);
      if (item?.variantDetails) {
        totalAmount =
          getNumber(item?.variantDetails?.pricing?.salePrice) -
          getNumber(item?.variantDetails?.pricing?.discount);

        vendorAmount = getNumber(item?.variantDetails?.pricing?.costPrice);
      } else {
        totalAmount =
          getNumber(item?.product?.pricing?.salePrice) -
          getNumber(item?.product?.pricing?.discount);

        vendorAmount = getNumber(item?.product?.pricing?.costPrice);
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
      message: `Regrettably, there are no valid items remaining in your all orders. All items were either out of stock or could not be found. We appreciate your understanding!`,
    };
    console.log(emailMsg);
    removedMessages.push(emailMsg);
  }

  // Notify the customer
  await handleOrderUpdateNotify(userEmail, removedMessages);

  return validOrders; // Return the filtered array of valid orders
};

module.exports = {
  createSingleOrder,
  groupItemsByCompany,
  handleTransactionProcessNotify,
  getShippingCost,
};
