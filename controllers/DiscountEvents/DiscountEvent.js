const {
  OkResponse,
  BadRequestResponse,
  NotFoundResponse,
} = require("express-http-response");
const DiscountEvent = require("../../models/DiscountEvent.js");
const mongoose = require("mongoose");
const filterObjectBySchema = require("../../utils/filterObject.js");

const discountEventSchemaFields = {
  name: true,
  description: true,
  images: true,
  promoCodes: true,
  startDate: true,
  endDate: true,
};

const getPublicDiscountEvents = async (req, res, next) => {
  try {
    const limit = 10; // Set default limit

    // Query for active, non-expired discount events
    const query = {
      isActive: true,
      endDate: { $gte: new Date() },
    };

    // Fetch paginated discount events
    const discountEvents = await DiscountEvent.find(query)
      .select("-updatedAt -__v")
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("promoCodes");

    // Respond with the results
    return next(
      new OkResponse({
        discountEvents,
      })
    );
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const getAllDiscountEvents = async (req, res, next) => {
  try {
    const { page, all, search } = req.query;

    const limit = 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const query = {
      ...(search ? { name: { $regex: search, $options: "i" } } : {}),
    };

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
    };

    const discountEvents = await DiscountEvent.paginate(query, options);

    return next(
      new OkResponse({
        discountEvents: discountEvents.docs,
        totalDiscountEvents: discountEvents.totalDocs,
        totalPages: discountEvents.totalPages,
        hasPrevPage: discountEvents.hasPrevPage,
        hasNextPage: discountEvents.hasNextPage,
        currentPage: discountEvents.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const getDiscountEventById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Event ID is required"));

  try {
    const discountEvent = await DiscountEvent.findById(id).populate(
      "promoCodes"
    );

    if (!discountEvent) return next(new NotFoundResponse("Event not found"));

    return next(new OkResponse(discountEvent));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const createDiscountEvent = async (req, res, next) => {
  try {
    const createPayload = await filterObjectBySchema(
      req.body,
      discountEventSchemaFields
    );

    const discountEvent = new DiscountEvent(createPayload);
    await discountEvent.save();

    return next(new OkResponse(discountEvent));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const updateDiscountEventById = async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next(new BadRequestResponse("Event ID is required"));

  try {
    const discountEvent = await DiscountEvent.findById(id);

    if (!discountEvent) return next(new NotFoundResponse("Event not found"));

    const updatePayload = await filterObjectBySchema(
      req.body,
      discountEventSchemaFields
    );

    const updatedDiscountEvent = await DiscountEvent.updateOne(
      { _id: id },
      { ...updatePayload },
      { new: true, runValidators: true }
    );

    return next(new OkResponse(updatedDiscountEvent));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const toggleDiscountEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return next(new BadRequestResponse("Invalid status value"));
    }

    if (!mongoose.isValidObjectId(id)) {
      return next(new BadRequestResponse("Invalid event ID"));
    }

    const updatedDiscountEvent = await DiscountEvent.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedDiscountEvent) {
      return next(new NotFoundResponse("Event not found"));
    }

    return next(
      new OkResponse({
        message: `Successfully ${
          updatedDiscountEvent.isActive ? "Activated" : "Deactivated"
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

const deleteDiscountEventById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new BadRequestResponse("Invalid event ID"));
  }

  const discountEvent = await DiscountEvent.findByIdAndDelete(id);

  if (!discountEvent) {
    return next(new NotFoundResponse("Event not found"));
  }

  return next(
    new OkResponse({
      message: "Event deleted successfully",
    })
  );
};

module.exports = {
  getPublicDiscountEvents,
  getAllDiscountEvents,
  getDiscountEventById,
  createDiscountEvent,
  updateDiscountEventById,
  toggleDiscountEventStatus,
  deleteDiscountEventById,
};
