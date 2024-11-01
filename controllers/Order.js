const { OkResponse, BadRequestResponse } = require("express-http-response");
const validateAddress = require("../utils/AddressValidator.js");
const Cart = require("../models/Cart.js");
const User = require("../models/User.js");
const Product = require("../models/Product.js");
const Company = require("../models/Company");
const Order = require("../models/Order.js");
const Activity = require("../models/Activity.js");

const { default: mongoose } = require("mongoose");
const Agent = require("../models/Agent.js");
const { createMessageBody } = require("../utils/message.js");

const { getProductId } = require("../utils/stringsNymber.js");
const { createSingleOrder, groupItemsByCompany } = require("../utils/Order.js");
const { cartFormatForSelectedItems } = require("../utils/Cart.js");
const {
  handleOrderCreateFailedNotify,
  vendorUserOrderNotification,
  customerOrderStatusNotification,
  orderAdminNotification,
} = require("../utils/mailer.js");
const Vendor = require("../models/Vendor.js");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require("twilio")(accountSid, authToken);

const getOrders = async (req, res, next) => {
  try {
    const { page, search, status, limit, user, company, completed } = req.query;
    const roleType = req.user.role.type;
    const orderNumber = new RegExp(search, "i");

    if (
      (roleType === "Vendor" && !company) ||
      (roleType === "User" && !req.user.id)
    ) {
      return next(new BadRequestResponse("Missing required parameters"));
    }
    //Permission based dynamic query
    const { query, populateOps, selectOps } = {
      Vendor: {
        query: {
          isConfirmed: true,
          ...(search ? { orderNumber } : {}),
          ...(company ? { company } : {}),
          ...(status ? { status } : {}),
        },
        populateOps: "customer payment",
        selectOps: {
          orderNumber: 1,
          shippingDetails: 1,
          orderedAt: 1,
          items: 1,
          status: 1,
          vendorBill: 1,
        },
      },
      User: {
        query: {
          customer: req.user.id,
          ...(completed ? { isCompleted: completed === "true" } : {}),
          ...(search ? { orderNumber } : {}),
        },
        populateOps: "company payment",
        selectOps: {},
      },
      StrikeO: {
        query: {
          isConfirmed: true,
          ...(completed ? { isCompleted: completed === "true" } : {}),
          ...(search ? { orderNumber } : {}),
          ...(user ? { customer: user } : {}),
          ...(company ? { company } : {}),
          ...(status ? { status } : {}),
        },
        populateOps: [
          {
            path: "company",
            select: "name",
          },
          {
            path: "customer",
            select: "firstName lastName",
          },
          {
            path: "payment",
            select: "status method",
          },
        ],
        selectOps: {},
      },
    }[roleType];

    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
      select: selectOps,
      populate: populateOps,
    };

    const orders = await Order.paginate(query, options);

    return next(
      new OkResponse({
        totalOrders: orders.totalDocs,
        orders: orders.docs,
        totalPages: orders.totalPages,
        hasPrevPage: orders.hasPrevPage,
        hasNextPage: orders.hasNextPage,
        currentPage: orders.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const roleType = req.user.role.type;

    const roleQueries = {
      Vendor: {
        query: {
          isConfirmed: true,
          company: req?.user?.company?._id,
          _id: orderId,
        },
        populateOps: [
          {
            path: "items.product",
            select: "costPrice brand name",
          },
          {
            path: "company",
          },
          {
            path: "agent",
            select: "firstName lastName contact.phone vehicle availability",
          },
          {
            path: "payment",
            select: "status method",
          },
        ],
        selectOps: {
          // orderNumber: 1,
          // shippingDetails: 1,
          // orderedAt: 1,
        },
      },
      User: {
        query: {
          customer: req.user.id,
          id: orderId,
        },
        populateOps: [
          {
            path: "company",
          },
          {
            path: "items.review",
            select: "rating description reviewDate",
          },
          {
            path: "payment",
            select: "status method",
          },
        ],
        selectOps: {},
      },
      StrikeO: {
        query: {
          isConfirmed: true,
          _id: orderId,
        },
        populateOps: [
          {
            path: "company",
            // select: "name",
          },
          {
            path: "customer",
            // select: "firstName lastName",
          },
          {
            path: "items.product",
            // select: "name",
          },
          {
            path: "agent",
            select: "firstName lastName contact.phone vehicle availability",
          },
          {
            path: "payment",
            select: "status method",
          },
        ],
        selectOps: {},
      },
    };
    const { query, populateOps, selectOps } = roleQueries[roleType];
    const order = await Order.findOne(query)
      .select(selectOps)
      .populate(populateOps);
    if (!order) {
      return next(new BadRequestResponse("Order not found"));
    }
    return next(new OkResponse(order));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

// const createOrderPrev = async (req, res, next) => {
//   const validationError = validateAddress(req.body);
//   const userId = req?.user?.id || req?.user?._id;
//   if (validationError) return next(new BadRequestResponse(validationError));

//   try {
//     if (!userId) return next(new BadRequestResponse("User not found"));

//     const cart = await Cart.findOne({ owner: userId });
//     if (!cart) return next(new BadRequestResponse("Cart not found"));

//     if (cart.items.length === 0)
//       return next(new BadRequestResponse("Cart is empty"));

//     const {
//       selectedItems = [],
//       selectedPayableAmount = 0,
//       // totalSelectedItems,
//       // selectedQty,
//       // selectedDiscount,
//       // selectedTotalPrice,
//       // totalRemainingItems,
//       remainingItems,
//       // remainingQty,
//       // remainingDiscount,
//       // remainingTotalPrice,
//       remainingPayableAmount,
//     } = await cartFormatForSelectedItems(JSON.parse(JSON.stringify(cart)));
//     if (selectedItems?.length === 0 || selectedPayableAmount <= 0)
//       return next(
//         new BadRequestResponse("Selected items not found in your cart")
//       );

//     const orders = selectedItems?.map((item) => {
//       const tempItem = {
//         ...item,
//         product: new mongoose.Types.ObjectId(item.product.id),
//       };
//       return {
//         company: new mongoose.Types.ObjectId(item.product.company),
//         product: new mongoose.Types.ObjectId(item.product.id),
//         items: tempItem,
//       };
//     });

//     const payment = new Payment({
//       paymentId: `cod-${uuidv4()}`,
//       customer: userId,
//       amount: selectedPayableAmount,
//       method: "cash",
//     });

//     const order = new Order({
//       customer: userId,
//       orders,
//       bill: selectedPayableAmount,
//       shippingDetails: req.body,
//       payment: new mongoose.Types.ObjectId(payment?._id || payment?.id),
//     });

//     payment.order = new mongoose.Types.ObjectId(order?._id || order?.id);
//     await payment.save();

//     const token =
//       Math.random().toString(36).substring(2, 15) +
//       Math.random().toString(36).substring(2, 15);

//     order.confirm_token = {
//       token,
//       link: `${process.env.BACKEND_URL}/api/order/confirm?user=${userId}&token=${token}&order=${order.id}`,
//       expires: Date.now() + 3600000, // 1 hour
//     };
//     await order.save();

//     confirmOrder(
//       { ...req.user, confirm_token: order.confirm_token },
//       { items: selectedItems, bill: selectedPayableAmount, owner: cart?.owner },
//       req.body?.email
//     );

//     cart.items = remainingItems;
//     cart.bill = remainingPayableAmount;

//     await cart.save();

//     return next(new OkResponse(order));
//   } catch (error) {
//     console.log(error, error.message);
//     return next(
//       new BadRequestResponse(
//         error?.message === "Out of stock"
//           ? "Out of stock"
//           : "Failed to place order"
//       )
//     );
//   }
// };

const createOrder = async (req, res, next) => {
  const validationError = validateAddress(req.body);
  if (validationError) return next(new BadRequestResponse(validationError));

  const userId = getProductId(req?.user);
  if (!userId) return next(new BadRequestResponse("User not found"));

  try {
    const cart = await Cart.findOne({ owner: userId });
    if (!cart) return next(new BadRequestResponse("Cart not found"));

    if (cart.items.length === 0) {
      return next(new BadRequestResponse("Cart is empty"));
    }

    const { selectedItems = [], selectedPayableAmount } =
      await cartFormatForSelectedItems(JSON.parse(JSON.stringify(cart)));

    if (selectedItems.length === 0) {
      return next(
        new BadRequestResponse("Selected items not found in your cart")
      );
    }
    if (selectedPayableAmount <= 0) {
      return next(
        new BadRequestResponse(
          "The payable amount for selected items must be greater than zero."
        )
      );
    }

    // Group items by company using async utility
    const orders = await groupItemsByCompany(selectedItems, req?.user?.email);
    // Check if there are no orders to process
    if (orders.length === 0) {
      // Handle the case where no valid items are available
      return next(
        new BadRequestResponse(
          "No valid items to process. All items were either out of stock or could not be found."
        )
      );
    }
    const completedOrders = [];
    const failedOrders = [];
    let successfullyCreatedItems = [];
    let successfullyCreatedAmount = 0;

    for (const orderData of orders) {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const order = await createSingleOrder(
          orderData,
          userId,
          req.body,
          session,
          req?.user
        );

        // If order creation was successful
        if (order) {
          completedOrders.push(orderData);

          // Track successful items and amounts
          successfullyCreatedItems.push(...orderData.items);
          successfullyCreatedAmount += orderData.totalAmount;
        } else {
          failedOrders.push(orderData); // Push failed order data if creation fails
        }

        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();

        orderData.message =
          "Unfortunately, we are unable to place your order for the following items.";
        orderData.failureReason =
          error?.message || "Service Unable to perform action";
        await handleOrderCreateFailedNotify(req?.user?.email, orderData);
        // Push order data to failed array in case of failure
        failedOrders.push(orderData);
        console.log(
          `Failed to create order for items from company ${orderData?.company}: ${error.message}`
        );
      } finally {
        session.endSession();
      }
    }

    // After processing all orders, update cart with successfully created orders
    if (successfullyCreatedItems.length > 0) {
      const updatedItems = cart.items.filter((item) => {
        // Get the ObjectId of the current item
        const itemId = getProductId(item);

        // Check if the item should be removed by looking for a matching ObjectId
        const shouldRemove = successfullyCreatedItems.some((removeItem) => {
          const removeItemId = getProductId(removeItem);
          // Compare ObjectIds directly
          return itemId === removeItemId;
        });

        // Keep items that are NOT marked for removal
        return !shouldRemove;
      });

      // Update cart items and bill for successful orders
      cart.items = updatedItems;
      cart.bill = cart.bill - successfullyCreatedAmount;
      await cart.save();
    }

    // Send both completed and failed orders in response
    return next(
      new OkResponse({
        message: "Order processing completed",
        completedOrders, // Successfully created order IDs
        failedOrders, // Failed order data
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse("Failed to place order: " + error.message)
    );
  }
};

const confirmUserOrder = async (req, res, next) => {
  const { user: id, token, order: orderId } = { ...req.query };

  if (!id || !token || !orderId) {
    console.log("Check failed: Missing required query params.");
    return res.redirect(
      `${process.env.FRONTEND_URL}/checkout/order?success=false`
    );
  }

  try {
    const user = await User.findById(id);
    const order = await Order.findOne({ _id: orderId, customer: id });
    ///Vendor Data
    const { firstName, lastName, contact } = await Vendor.findOne({
      company: order.company,
    });
    const { email } = contact;

    //Customer Data
    const {
      firstName: customerFirstName,
      lastName: customerLastName,
      email: customerEmail,
    } = user;

    if (!user || !order) {
      console.log("Check failed: User or order not found.");
      return res.redirect(
        `${process.env.FRONTEND_URL}/checkout/order?success=false`
      );
    }

    if (order?.confirm_token?.token !== token) {
      console.log("Check failed: Token mismatch.");
      return res.redirect(
        `${process.env.FRONTEND_URL}/checkout/order?success=false`
      );
    }

    if (order?.confirm_token?.expires < Date.now()) {
      console.log("Check failed: Token expired.");
      return res.redirect(
        `${process.env.FRONTEND_URL}/checkout/order?success=false`
      );
    }

    if (!order.statusHistory) {
      order.statusHistory = new Map();
    }
    order.statusHistory.set("Processing", new Date());
    order.confirm_token = null;
    order.isConfirmed = true;

    await order.save({ validateModifiedOnly: true });
    await user.save();

    const { orderNumber, items, vendorBill, shippingDetails, customerBill } =
      order;

    ///Email send to vendor after customer is confirmed the order
    await vendorUserOrderNotification(
      orderNumber,
      items,
      email,
      vendorBill,
      shippingDetails
    );

    ///Send the order notification to Strikeo Admin Email Address
    //After user's confirmation
    const orderInfo = {
      customerName: `${customerFirstName} ${customerLastName}`,
      customerEmail,
      customerBill,
      shippingDetails: shippingDetails,
      //Vendor Info
      vendorName: `${firstName} ${lastName}`,
      vendorEmail: email,
      orderNumber,
      vendorBill,
      items,
      status: "Confirmed", //Only for message sending conditionally, never effect on any data
    };
    await orderAdminNotification(orderInfo);

    return res.redirect(
      `${process.env.FRONTEND_URL}/checkout/order?success=true&order=${order?.orderNumber}&bill=${order?.customerBill}`
    );
  } catch (error) {
    console.log("While confirming order => ", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/checkout/order?success=false`
    );
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const roleType = req.user.role.type;
    const { status, agent, order: userOrder } = req.body;

    if (agent) {
      if (!mongoose.isValidObjectId(agent))
        return next(new BadRequestResponse("Agent ID is not valid"));

      const incomingAgent = await Agent.exists({ _id: agent });
      if (!incomingAgent)
        return next(new BadRequestResponse("Selected agent not found"));
    }

    const updateOps = {
      Vendor: {
        query: {
          _id: orderId,
          company: req.user.company,
        },
        update: {
          $set: {
            status: status,
            ...(agent && { agent }),
            [`statusHistory.${status}`]: new Date(), // Dynamically set the new status with the current date
          },
        },
      },
      StrikeO: {
        query: { _id: orderId },
        update: {
          $set: {
            ...req.body,
            [`statusHistory.${status}`]: new Date(), // Dynamically set the new status with the current date
          },
        },
      },
    }[roleType];

    if (!updateOps) {
      return next(new BadRequestResponse("Permission denied"));
    }

    const updatedRes = await Order.findOneAndUpdate(
      updateOps.query,
      updateOps.update,
      { new: true }
    ).populate([
      { path: "agent", select: "firstName lastName contact" },
      { path: "company", select: "warehouse name contact" },
    ]);

    const updatedOrder = JSON.parse(JSON.stringify(updatedRes));
    if (!updatedOrder) {
      return next(new BadRequestResponse("Order not found"));
    }
    const selectedAgent = updatedOrder?.agent;
    if (agent && !selectedAgent) {
      return next(new BadRequestResponse("Selected agent not found"));
    }

    if (selectedAgent) {
      if (!selectedAgent?.contact?.phone?.trim()) {
        return next(new BadRequestResponse("Agent's contact phone not found"));
      }

      try {
        const messageBody = createMessageBody(updatedOrder, selectedAgent);
        const message = await twilioClient.messages.create({
          body: messageBody,
          from: "whatsapp:" + process.env.TWILIO_PHONE,
          to: "whatsapp:" + selectedAgent?.contact?.phone,
        });
        console.log(
          "Message sent to agent on WhatsApp successfully!",
          message.apiVersion
        );
      } catch (error) {
        console.log(error, "Error in sending agent WhatsApp message!");
        return next(
          new BadRequestResponse(
            error?.message || "Failed to notify agent. Please try again."
          )
        );
      }
    }

    if (roleType === "Vendor") {
      if (agent && String(agent) !== getProductId(userOrder?.agent)) {
        const activity = new Activity({
          employeeName: req.user.firstName + " " + req.user.lastName,
          company: req.user.company.id,
          type: "Updated Order",
          "Updated Order": {
            orderNo: updatedOrder?.orderNumber,
            message: `assigned order no. ${updatedOrder?.orderNumber} to ${selectedAgent?.firstName} ${selectedAgent?.lastName}`,
          },
        });
        await activity.save();
      }
      if (status !== userOrder?.status) {
        const activity = new Activity({
          employeeName: req.user.firstName + " " + req.user.lastName,
          company: req.user.company.id,
          type: "Updated Order",
          "Updated Order": {
            orderNo: updatedOrder?.orderNumber,
            message: `updated order no. ${updatedOrder?.orderNumber} status to ${status}`,
          },
        });
        await activity.save();
      }
    }

    ///Order Status Changing: Customer Email Notification
    // orderUpdateStatusForCustomTemplate
    const {
      orderNumber,
      items,
      customer,
      customerBill,
      vendorBill,
      shippingDetails,
      company,
    } = updatedOrder;
    const orderUser = await User.findById(customer);
    ///Vendor Data
    const { firstName, lastName, contact } = await Vendor.findOne({
      company: company.id,
    });

    const { email } = contact; ///Vendor Email

    const {
      firstName: customerFirstName,
      lastName: customerLastName,
      email: customerEmail,
    } = orderUser;

    //Notify user when order status changes
    await customerOrderStatusNotification(
      orderNumber,
      items,
      customerEmail,
      customerBill,
      status
    );

    ///Send the order notification to Strikeo Admin Email Address
    //If vendor changed order status
    if (roleType === "Vendor") {
      const orderInfo = {
        customerName: `${customerFirstName} ${customerLastName}`,
        customerEmail,
        customerBill,
        shippingDetails,
        //Vendor Info
        vendorName: `${firstName} ${lastName}`,
        vendorEmail: email,
        orderNumber,
        vendorBill,
        items,
        status,
      };
      await orderAdminNotification(orderInfo);
    }

    return next(new OkResponse(updatedOrder, "Order updated successfully!"));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const getVendorStats = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const userId = new mongoose.Types.ObjectId(req?.user?.company);
    const query = {
      isConfirmed: true,
      company: userId,
      orderedAt: { $gte: new Date(from), $lte: new Date(to) },
    };

    // Combine the summary, status counts, and date-wise order count in a single aggregation
    const summaryAggregation = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalVendorBill: { $sum: "$vendorBill" },
          totalItemsSold: { $sum: { $sum: "$items.quantity" } },
          uniqueCustomers: { $addToSet: "$customer" },
        },
      },
    ]);

    const summary = summaryAggregation.length > 0 ? summaryAggregation[0] : {};
    const totalOrders = summary.totalOrders || 0;
    const totalRevenue = summary.totalVendorBill || 0;
    const totalItemsSold = summary.totalItemsSold || 0;
    const customerCount = summary.uniqueCustomers
      ? summary.uniqueCustomers.length
      : 0;

    // Fetch recent orders
    const recentOrders = await Order.find(query)
      .sort({ orderedAt: -1 })
      .limit(5)
      .populate("items.product", "name variants")
      .select({
        orderNumber: 1,
        orderedAt: 1,
        vendorBill: 1,
        items: 1,
      })
      .lean(); // Use lean() for better performance

    // Hot selling products
    const hotSellingProducts = await Order.aggregate([
      { $match: query },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },
    ]);

    const productIds = hotSellingProducts.map(
      (product) => new mongoose.Types.ObjectId(product?._id)
    );
    const productDetailsArray = await Product.find({ _id: { $in: productIds } })
      .select("name inventory.stock images brand")
      .lean();

    const hotSellingProductDetails = hotSellingProducts.map((product) => {
      const productDetails = productDetailsArray.find(
        (pd) => getProductId(pd) === getProductId(product)
      );
      return {
        name: productDetails ? productDetails.name : "",
        amount: productDetails ? productDetails.inventory.stock : 0,
        image: productDetails ? productDetails.images[0] : null,
        brand: productDetails ? productDetails.brand : "",
        totalSold: product.totalQuantity,
      };
    });

    // Get status counts
    const getStatusCounts = await Order.aggregate([
      { $match: query },
      { $unwind: "$status" }, // Unwind to group by status
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = getStatusCounts.reduce((acc, status) => {
      acc[status._id] = status.count;
      return acc;
    }, {});

    // Get date-wise order count
    const getDateWiseOrderCount = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderedAt" } },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          orderCount: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    return next(
      new OkResponse({
        totalOrders,
        totalRevenue,
        customerCount,
        statusCounts,
        totalItemsSold,
        recentOrders,
        hotSellingProducts: hotSellingProductDetails,
        dateWiseOrderCount: getDateWiseOrderCount,
      })
    );
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const OrderController = {
  getVendorStats,
  createOrder,
  getOrders,
  getOrderById,
  confirmUserOrder,
  updateOrder,
};

module.exports = OrderController;
