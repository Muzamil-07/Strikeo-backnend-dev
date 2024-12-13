const {
  BadRequestResponse,
  OkResponse,
  UnauthorizedResponse,
} = require("express-http-response");
const OrdersSummary = require("../../models/OrdersSummary");
const mongoose = require("mongoose");

const getOrderSummaries = async (req, res, next) => {
  try {
    const { page = 1, search = "", limit = 10, user, company } = req.query;

    const roleType = req.user.role.type;

    // Validate role-based access
    if (roleType !== "StrikeO") {
      return next(new UnauthorizedResponse("Unauthorized access to summaries"));
    }

    // if (user && !mongoose.isValidObjectId(user)) {
    //   return next(new BadRequestResponse("Invalid user ID format"));
    // }

    // if (company && !mongoose.isValidObjectId(company)) {
    //   return next(new BadRequestResponse("Invalid company ID format"));
    // }

    // const matchStage = {
    //   ...(user ? { customer: mongoose.Types.ObjectId(user) } : {}),
    //   ...(company
    //     ? { "orders.company": mongoose.Types.ObjectId(company) }
    //     : {}),
    // };

    const customerNameFilter = search
      ? {
          $or: [
            { "customer.firstName": new RegExp(search, "i") },
            { "customer.lastName": new RegExp(search, "i") },
          ],
        }
      : {};

    const aggregationPipeline = [
      //   { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },
      { $match: customerNameFilter },
      {
        $lookup: {
          from: "orders",
          localField: "orders",
          foreignField: "_id",
          as: "orders",
        },
      },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: (parseInt(page, 10) - 1) * parseInt(limit, 10) },
            { $limit: parseInt(limit, 10) },
            {
              $project: {
                customer: { firstName: 1, lastName: 1 },
                orders: {
                  orderNumber: 1,
                  status: 1,
                  items: 1,
                  vendorBill: 1,
                  customerBill: 1,
                  // shippingDetails: 1,
                  isConfirmed: 1,
                  isCompleted: 1,
                },
                customerBill: 1,
                vendorBill: 1,
                promotion: 1,
                shippingDetails: 1,
                createdAt: 1,
              },
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const [result] = await OrdersSummary.aggregate(
      aggregationPipeline
    ).allowDiskUse(true);
    const totalSummaries = result.totalCount[0]?.count || 0;

    // Response with summaries
    return next(
      new OkResponse({
        totalSummaries,
        summaries: result.data,
        totalPages: Math.ceil(totalSummaries / limit),
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalSummaries / limit),
        currentPage: parseInt(page, 10),
      })
    );
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

module.exports = { getOrderSummaries };
