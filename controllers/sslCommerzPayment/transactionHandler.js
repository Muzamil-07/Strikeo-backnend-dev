const mongoose = require("mongoose");
const Cart = require("../../models/Cart");
const Payment = require("../../models/Payment");
const Order = require("../../models/Order");
const Billing = require("../../models/Billing");
const {
  sslczNotification,
  handleOrderCreateFailedNotify,
} = require("../../utils/mailer");
const { tranStatusFormat } = require("./initDataProcess");
const {
  cartFormatForSelectedItems,
  isMatchingProductOrVariant,
} = require("../../utils/Cart");
const { groupItemsByCompany } = require("../../utils/Order");
const { getProductId } = require("../../utils/stringsNymber");

const handlePaymentFail = async (data, ipn_Payload) => {
  const payment = await Payment.findOne({
    paymentId: ipn_Payload?.tran_id,
  });

  if (!payment) {
    await sslczNotification(
      {
        name: "Hi " + tempUser?.firstName,
        intro: `We couldn't locate your payment with Transaction ID: "${ipn_Payload?.tran_id}".`,
        action: {
          instructions: `If you have any questions or need assistance, please don't hesitate to contact us.`,
          button: {
            color: "#3869D4",
            text: "Contact Us",
            link: `mailto:${process.env.SMTP_USER}`,
          },
        },
      },
      tempUser?.email
    );
    throw Error(
      `Payment not found => transaction id => ${ipn_Payload?.tran_id}`
    );
  }

  const tempUser = JSON.parse(JSON.stringify(payment?.customer));
  // saving sslcz payload others info
  payment.risk_title = ipn_Payload?.risk_title;
  payment.discount_amount = ipn_Payload?.discount_amount;
  payment.card_type = ipn_Payload?.card_type;
  payment.card_no = ipn_Payload?.card_no;
  payment.card_issuer = ipn_Payload?.card_issuer;
  payment.card_brand = ipn_Payload?.card_brand;
  payment.card_issuer_country = ipn_Payload?.card_issuer_country;
  payment.tran_date = ipn_Payload?.tran_date;
  payment.bank_tran_id = ipn_Payload?.bank_tran_id;
  payment.store_amount = ipn_Payload?.store_amount;
  payment.val_id = ipn_Payload?.val_id;
  payment.sslcz_status = ipn_Payload?.status;
  payment.currency_type = ipn_Payload?.currency_type;
  payment.currency_amount = ipn_Payload?.currency_amount;
  payment.status = "Failed";
  payment.error = ipn_Payload?.error;
  payment.validationStatus = data?.status;
  await payment.save();

  if (data?.status === "INVALID_TRANSACTION") {
    transactionMessage =
      "Your transaction is invalid. Please check your payment details and try again.";
  } else {
    transactionMessage =
      "There was an issue with your payment with status: " + data?.status;
  }

  await sslczNotification(
    {
      name: "Hi " + tempUser?.firstName,
      intro: `Your payment has been ${data?.email_status}! ${transactionMessage}`,
      action: {
        instructions: `If you have any questions, feel free to reach out with Transaction ID: "${ipn_Payload?.tran_id}"`,
        button: {
          color: "#3869D4",
          text: "Contact Us",
          link: `mailto:${process.env.SMTP_USER}`,
        },
      },
    },
    tempUser?.email
  );

  throw Error(
    `Payment failed with validation status => ${data?.status}, Payload staus => ${ipn_Payload?.status}`
  );
};

const captureTransaction = async (data, ipn_Payload) => {
  if (!tranStatusFormat(data?.status)) {
    await handlePaymentFail(data, ipn_Payload);
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const payment = await Payment.findOne({ paymentId: data?.tran_id }).session(
    session
  );
  if (!payment) {
    throw Error(`Payment not found with status => ${data?.status}`);
  }

  if (data?.currency_type !== payment?.currency) {
    throw Error(`Payment currency_type not matched => ${data?.currency_type}`);
  }

  data.amount = String(data?.amount).split(".")[0];
  if (data?.amount !== String(payment?.amount)) {
    throw Error(`Payment amount not matched => ${data?.amount}`);
  }

  const user = payment?.customer
    ? JSON.parse(JSON.stringify(payment?.customer))
    : null;

  const activeBillingAddress = await Billing.findById(
    user?.activeBillingAddress
  ).session(session);

  if (!activeBillingAddress) {
    throw Error(`Active billing address not found`);
  }
  const cart = await Cart.findOne({ owner: getProductId(user) }).session(
    session
  );
  if (!cart) {
    throw Error(`Cart not found`);
  }

  if (cart?.items?.length === 0) {
    throw Error("Cart is empty");
  }

  const { selectedItems = [] } = await cartFormatForSelectedItems(
    JSON.parse(JSON.stringify(cart))
  );
  if (selectedItems?.length <= 0) {
    throw Error("Selected items not found in your cart");
  }

  // saving sslcz payload others info
  payment.status = "Paid";
  payment.risk_title = data?.risk_title;
  payment.discount_amount = data?.discount_amount;
  payment.card_type = data?.card_type;
  payment.card_no = data?.card_no;
  payment.card_issuer = data?.card_issuer;
  payment.card_brand = data?.card_brand;
  payment.card_issuer_country = data?.card_issuer_country;
  payment.tran_date = data?.tran_date;
  payment.bank_tran_id = data?.bank_tran_id;
  payment.store_amount = data?.store_amount;
  payment.val_id = data?.val_id;
  payment.sslcz_status = data?.status;
  payment.currency_type = data?.currency_type;
  payment.currency_amount = data?.currency_amount;
  payment.error = ipn_Payload?.error;
  payment.validationStatus = data?.status;
  await payment.save({ session });
  // Group items by company using the utility function
  const orders = await groupItemsByCompany(selectedItems, user?.email);

  // Check if there are no orders to process
  if (orders.length === 0) {
    // Handle the case where no valid items are available
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    return {
      message:
        "No valid items to process. All items were either out of stock or could not be found.",
      completedOrders: [],
      failedOrders: [],
    };
  }

  const completedOrders = [];
  const failedOrders = [];
  let successfullyCreatedItems = [];
  let successfullyCreatedAmount = 0;

  // Process grouped orders
  for (const orderData of orders) {
    try {
      // Save order and track successes/failures
      const order = new Order({
        customer: getProductId(user),
        company: orderData?.company,
        items: orderData.items, // Include all items for this order
        customerBill: orderData.totalAmount,
        payment: getProductId(payment),
        shippingDetails: activeBillingAddress,
        isConfirmed: true,
      });

      await order.save({ session });
      completedOrders.push(order._id);
      successfullyCreatedItems.push(...orderData.items); // Track successfully created items
      successfullyCreatedAmount += orderData.totalAmount; // Accumulate successful order amounts
    } catch (error) {
      orderData.message =
        "Unfortunately, we are unable to place your order for the following items.";
      orderData.failureReason =
        error?.message || "Service Unable to perform action";
      await handleOrderCreateFailedNotify(user?.email, orderData);
      failedOrders.push(orderData);
      console.log(
        `Failed to create order for items from company ${orderData?.company}: ${error.message}`
      );
    }
  }

  // After processing all orders, update cart with successfully created orders
  if (successfullyCreatedItems.length > 0) {
    // Update payment status and remove the successfully created amount
    // payment.amount = successfullyCreatedAmount; // Deduct only the successful amount
    payment.orders = completedOrders;
    await payment.save({ session });

    const updatedItems = cart.items.filter((item) => {
      // This will return true if the item should be removed
      const shouldRemove = successfullyCreatedItems.some((removeItem) => {
        const { isMatchingProduct, isMatchingVariant } =
          isMatchingProductOrVariant(
            item,
            removeItem?.product,
            removeItem?.variantSKU
          );

        // If there's no variant SKU, check if the products match and if the item doesn't have a variant SKU
        if (!removeItem?.variantSKU) {
          return isMatchingProduct && !item.variantSKU;
        }

        // Otherwise, check if both product and variant match
        return isMatchingProduct && isMatchingVariant;
      });

      // Return items that are NOT marked for removal
      return !shouldRemove;
    });

    // Update cart items and bill for successful orders
    cart.items = updatedItems;
    cart.bill = cart.bill - successfullyCreatedAmount;
    await cart.save();

    // Send email notification
    await sslczNotification(
      {
        name: `Hi ${user?.firstName}`,
        intro: `Your payment has been ${data?.email_status} with (${completedOrders?.length}) orders!`,
        action: {
          instructions: "Please review your orders.",
          button: {
            color: "#3869D4",
            text: "View Orders",
            link: `${process.env.FRONTEND_URL}/profile/orders`,
          },
        },
      },
      user?.email
    );
  }

  // Commit transaction
  await session.commitTransaction();
  session.endSession();

  // Return response
  return {
    message: "Order processing completed",
    completedOrders,
    failedOrders,
  };
};

module.exports = { captureTransaction };
