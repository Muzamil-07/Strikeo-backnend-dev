const { BadRequestResponse, OkResponse } = require("express-http-response");
const Order = require("../../models/Order");
const User = require("../../models/User");

const getUserForThird = async (req, res, next) => {
  const email = req.query?.email || req?.payload?.email;

  try {
    if (!email) {
      return next(new BadRequestResponse("Email is missing."));
    }

    const user = await User.findOne({ email }).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    if (!user) {
      return next(new UnauthorizedResponse("User not found"));
    }
    const last3Orders = await Order.find({
      customer: user._id,
    })
      .populate([
        { path: "payment", select: "status method error" },
        { path: "company" },
      ])
      .sort({ createdAt: -1 })
      .limit(3);
    return next(new OkResponse({ user, last3Orders }));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};
const getUserOrdersForThird = async (req, res, next) => {
  const email = req.query?.email || req?.payload?.email;
  const limit = req.query?.limit || req?.payload?.limit || 10;

  try {
    if (!email) {
      return next(new BadRequestResponse("Email is missing."));
    }

    // Find user by email
    const user = await User.findOne({ email }, { _id: 1 });

    if (!user) {
      return next(new BadRequestResponse("User not found."));
    }

    // Build order query using user._id as customer
    const query = {
      customer: user?._id || user?.id,
      //   isConfirmed: true,
    };

    const options = {
      limit: parseInt(limit, 10), // Convert limit to integer
      sort: { createdAt: -1 },
      populate: [
        { path: "company" },
        {
          path: "items.product",
          populate: { path: "reviews", match: { user: user._id } },
        },
        { path: "payment" },
      ],
      select: {},
    };

    // Fetch paginated orders
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

const getUserOrderStatusForThird = async (req, res, next) => {
  const email = req.query?.email || req?.payload?.email;
  const orderNumber = req.query?.orderNumber || req?.payload?.orderNumber;

  try {
    // Check if both email and orderNumber are provided
    if (!email || !orderNumber) {
      return next(
        new BadRequestResponse("Email and order number are required.")
      );
    }

    // Find the user by email
    const user = await User.findOne({ email }, { _id: 1 });

    if (!user) {
      return next(new BadRequestResponse("User not found."));
    }

    // Find the order by customer ID and order number
    const order = await Order.findOne({
      customer: user._id,
      orderNumber: orderNumber,
    }).select("status orderNumber orderedAt");

    if (!order) {
      return next(new BadRequestResponse("Order not found."));
    }

    // Return the order status
    return next(new OkResponse(order));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong."));
  }
};

module.exports = {
  getUserForThird,
  getUserOrdersForThird,
  getUserOrderStatusForThird,
};
