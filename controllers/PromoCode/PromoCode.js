const {
  OkResponse,
  BadRequestResponse,
  NotFoundResponse,
} = require("express-http-response");
const PromoCode = require("../../models/PromoCode.js");
const mongoose = require("mongoose");
const filterObjectBySchema = require("../../utils/filterObject.js");
const { getProductId } = require("../../utils/stringsNymber.js");
const User = require("../../models/User.js");

const promoCodeSchemaFields = {
  name: true,
  code: true,
  discountType: true,
  discountValue: true,
  expirationDate: true,
  usageLimit: true,
  perUserLimit: true,
  minimumOrderValue: true,
};

const getAvailablePromoCodes = async (req, res, next) => {
  try {
    const { page, all, search, isActive } = req.query;

    // Convert fields query parameter to an array of field names
    if (all === "true") {
      const selectedFields = fields
        ? fields.split(",").map((field) => field.trim())
        : [];

      const aggregationPipeline = [{ $sort: { name: 1 } }];

      // Add projection only if selectedFields is not empty
      if (selectedFields?.length > 0) {
        const projection = selectedFields.reduce(
          (acc, field) => ({ ...acc, [field]: 1 }),
          {}
        );
        aggregationPipeline.push({ $project: projection });
      }

      const promoCodes = await PromoCode.aggregate(
        aggregationPipeline
      ).allowDiskUse(true);

      return next(
        new OkResponse({
          promoCodes,
          totalPromoCodes: promoCodes.length,
        })
      );
    }

    const limit = 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const query = {
      isActive: true,
      expirationDate: { $gte: new Date() },
      ...(search ? { name: { $regex: search, $options: "i" } } : {}),
    };

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
    };

    const promoCodes = await PromoCode.paginate(query, options);

    return next(
      new OkResponse({
        promoCodes: promoCodes.docs,
        totalPromoCodes: promoCodes.totalDocs,
        totalPages: promoCodes.totalPages,
        hasPrevPage: promoCodes.hasPrevPage,
        hasNextPage: promoCodes.hasNextPage,
        currentPage: promoCodes.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};
const getAllPromoCodes = async (req, res, next) => {
  try {
    const { page, all, search, isActive } = req.query;

    // Convert fields query parameter to an array of field names
    if (all === "true") {
      const selectedFields = fields
        ? fields.split(",").map((field) => field.trim())
        : [];

      const aggregationPipeline = [{ $sort: { name: 1 } }];

      // Add projection only if selectedFields is not empty
      if (selectedFields?.length > 0) {
        const projection = selectedFields.reduce(
          (acc, field) => ({ ...acc, [field]: 1 }),
          {}
        );
        aggregationPipeline.push({ $project: projection });
      }

      const promoCodes = await PromoCode.aggregate(
        aggregationPipeline
      ).allowDiskUse(true);

      return next(
        new OkResponse({
          promoCodes,
          totalPromoCodes: promoCodes.length,
        })
      );
    }

    const limit = 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const query = {
      ...(isActive === "true"
        ? { isActive: true, expirationDate: { $gte: new Date() } }
        : isActive === "false"
        ? { isActive: false }
        : {}),
      ...(search ? { name: { $regex: search, $options: "i" } } : {}),
    };

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
    };

    const promoCodes = await PromoCode.paginate(query, options);

    return next(
      new OkResponse({
        promoCodes: promoCodes.docs,
        totalPromoCodes: promoCodes.totalDocs,
        totalPages: promoCodes.totalPages,
        hasPrevPage: promoCodes.hasPrevPage,
        hasNextPage: promoCodes.hasNextPage,
        currentPage: promoCodes.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const getPromoCodeById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Promo code ID is required"));

  try {
    const promoCode = await PromoCode.findById(id);

    if (!promoCode) return next(new NotFoundResponse("Promo code not found"));

    return next(new OkResponse(promoCode));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const createPromoCode = async (req, res, next) => {
  try {
    // Filter the payload based on the schema
    const createPayload = await filterObjectBySchema(
      req.body,
      promoCodeSchemaFields
    );

    const promoCode = new PromoCode(createPayload);
    await promoCode.save();
    return next(new OkResponse(promoCode));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const updatePromoCodeById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Promo code ID is required"));

  try {
    const promoCode = await PromoCode.findById(id);

    if (!promoCode) return next(new NotFoundResponse("Promo code not found"));

    // Filter the payload based on the schema
    const updatePayload = await filterObjectBySchema(
      req.body,
      promoCodeSchemaFields
    );
    const updatedPromoCode = await PromoCode.updateOne(
      { _id: id },
      { ...updatePayload },
      { runValidators: true }
    );

    return next(new OkResponse(updatedPromoCode));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const togglePromoCodeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate payload
    if (typeof isActive !== "boolean") {
      return next(new BadRequestResponse("Invalid status value"));
    }

    // Validate ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return next(new BadRequestResponse("Invalid promo code ID"));
    }

    // Update the promo code's isActive status
    const updatedPromoCode = await PromoCode.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedPromoCode) {
      return next(new NotFoundResponse("Promo code not found"));
    }

    return next(
      new OkResponse({
        message: `Successfully ${
          updatedPromoCode.isActive ? "Activated" : "Deactivated"
        }`,
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const deletePromoCodeById = async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return next(new BadRequestResponse("Invalid promo code ID"));
  }

  // Find the promo code by ID and delete
  const promoCode = await PromoCode.findByIdAndDelete(id);

  // If the promo code does not exist
  if (!promoCode) {
    return next(new NotFoundResponse("Promo code not found"));
  }

  return next(
    new OkResponse({
      message: "Promo code deleted successfully",
    })
  );
};

// Validate Promo Code Controller
const validatePromoCode = async (req, res, next) => {
  const { code } = req.body;
  const userId = getProductId(req?.user);

  try {
    // Find the promo code by the provided code
    const promoCode = await PromoCode.findOne({ code, isActive: true }).select(
      "-createdAt -updatedAt -__v"
    );
    if (!promoCode || !promoCode?.expirationDate) {
      return next(
        new BadRequestResponse("Sorry, the promo code is not valid.")
      );
    }

    if (new Date(promoCode?.expirationDate) < new Date()) {
      return next(new BadRequestResponse("Sorry, the promo code has expired."));
    }

    // Check if the user has exceeded the usage limit for this promo code
    const userUsage = promoCode.usersRedeemed.find(
      (userRedeemed) => userRedeemed?.user?.toString() === userId.toString()
    );
    if (userUsage && userUsage.usageCount >= promoCode.perUserLimit) {
      return next(
        new BadRequestResponse(
          "You have reached the usage limit for this promo code."
        )
      );
    }

    // Apply the discount and return success response
    return next(new OkResponse(promoCode, "Promo code applied successfully!"));
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse("Internal server error."));
  }
};

const collectPromoCodeForCustomer = async (req, res, next) => {
  const { promoCodeId } = req.body;
  const customerId = getProductId(req?.user);

  if (!promoCodeId) {
    return next(new BadRequestResponse("Please provide a promo code."));
  }

  try {
    // Validate the promo code by ID
    const promoCode = await PromoCode.findOne({
      _id: promoCodeId,
      isActive: true,
      expirationDate: { $gte: new Date() },
    });

    if (!promoCode) {
      return next(
        new BadRequestResponse(
          "Sorry, this promo code is either invalid or has expired."
        )
      );
    }

    // Use MongoDB's $addToSet to collect the promo code without duplicates
    const result = await User.findByIdAndUpdate(
      customerId,
      {
        $addToSet: {
          "promotions.promoCodes": promoCodeId,
        },
      },
      { new: true }
    );

    if (!result) {
      return next(
        new NotFoundResponse(
          "We couldn't find your account. Please log in and try again."
        )
      );
    }
    return next(
      new OkResponse({
        message: `Promo code '${promoCode.code}' has been successfully collected!`,
        collectedPromoCodes: result.promotions.promoCodes,
      })
    );
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(
        "An error occurred while collecting the promo code. Please try again later."
      )
    );
  }
};
const getCollectedPromoCodesForCustomer = async (req, res, next) => {
  const customerId = getProductId(req?.user);

  try {
    if (!mongoose.isValidObjectId(customerId)) {
      return next(
        new NotFoundResponse("Please ensure you are logged in and try again.")
      );
    }
    // Populate collected promo codes for the customer
    const customer = await User.findById(customerId).select(
      "promotions.promoCodes"
    );

    if (!customer) {
      return next(
        new NotFoundResponse(
          "We couldn't find your account. Please log in and try again."
        )
      );
    }
    await customer.populate(
      "promotions.promoCodes",
      "-createdAt -updatedAt -__v"
    );
    return next(
      new OkResponse({
        collectedPromoCodes: customer?.promotions?.promoCodes || [],
        totalCount: customer?.promotions?.promoCodes?.length,
      })
    );
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(
        "An error occurred while retrieving your collected promo codes. Please try again later."
      )
    );
  }
};

const PromoCodeController = {
  getAllPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCodeById,
  togglePromoCodeStatus,
  deletePromoCodeById,
  validatePromoCode,
  collectPromoCodeForCustomer,
  getCollectedPromoCodesForCustomer,
  getAvailablePromoCodes,
};

module.exports = PromoCodeController;
