const {
  OkResponse,
  BadRequestResponse,
  NotFoundResponse,
} = require("express-http-response");
const HeroSection = require("../../models/HeroSection");
const mongoose = require("mongoose");
const filterObjectBySchema = require("../../utils/filterObject");
const heroSectionFilterSchema = {
  title: true,
  description: true,
  image: {
    url: true,
    alt: true,
  },
  cta: {
    label: true,
    link: true,
  },
};

const getPublicHeroSections = async (req, res, next) => {
  try {
    const limit = 10; // Set default limit for pagination

    // Query for active hero sections
    const query = {
      isActive: true,
    };

    // Fetch paginated hero sections, excluding unwanted fields
    const heroSections = await HeroSection.find(query)
      .select("-updatedAt -__v") // Exclude these fields
      .sort({ createdAt: -1 }) // Sort by creation date descending
      .limit(limit)
      .allowDiskUse(true);

    // Respond with the results
    return next(
      new OkResponse({
        heroSections,
      })
    );
  } catch (error) {
    console.error("Error fetching public hero sections:", error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

// Fetch all active hero sections with pagination
const getAllHeroSections = async (req, res, next) => {
  try {
    const { page, search } = req.query;

    const limit = 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const query = {
      ...(search ? { title: { $regex: search, $options: "i" } } : {}),
    };

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
      select: { updatedAt: 0, __v: 0 },
      allowDiskUse: true,
    };

    const heroSections = await HeroSection.paginate(query, options);

    return next(
      new OkResponse({
        heroSections: heroSections.docs,
        totalHeroSections: heroSections.totalDocs,
        totalPages: heroSections.totalPages,
        hasPrevPage: heroSections.hasPrevPage,
        hasNextPage: heroSections.hasNextPage,
        currentPage: heroSections.page,
      })
    );
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

// Fetch hero section by ID
const getHeroSectionById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new BadRequestResponse("Invalid section ID"));
  }

  try {
    const heroSection = await HeroSection.findById(id);

    if (!heroSection) {
      return next(new NotFoundResponse("Hero section not found"));
    }

    return next(new OkResponse(heroSection));
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

// Create a new hero section
const createHeroSection = async (req, res, next) => {
  try {
    const heroSection = new HeroSection(req.body);
    await heroSection.save();

    return next(new OkResponse(heroSection));
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Failed to create hero section")
    );
  }
};

// Update a hero section by ID
const updateHeroSectionById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new BadRequestResponse("Invalid section ID"));
  }

  try {
    // Filter the payload based on the schema
    const updatePayload = filterObjectBySchema(
      req.body,
      heroSectionFilterSchema
    );

    const updatedHeroSection = await HeroSection.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    );

    if (!updatedHeroSection) {
      return next(new NotFoundResponse("Hero section not found"));
    }

    return next(new OkResponse(updatedHeroSection));
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Failed to update hero section")
    );
  }
};

// Delete a hero section by ID
const deleteHeroSectionById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return next(new BadRequestResponse("Invalid section ID"));
  }

  try {
    const heroSection = await HeroSection.findByIdAndDelete(id);

    if (!heroSection) {
      return next(new NotFoundResponse("Hero section not found"));
    }

    return next(
      new OkResponse({
        message: "Hero section deleted successfully",
      })
    );
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Failed to delete hero section")
    );
  }
};

// Toggle hero section status
const toggleHeroSectionStatus = async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return next(new BadRequestResponse("Invalid status value"));
  }

  if (!mongoose.isValidObjectId(id)) {
    return next(new BadRequestResponse("Invalid section ID"));
  }

  try {
    const updatedHeroSection = await HeroSection.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedHeroSection) {
      return next(new NotFoundResponse("Hero section not found"));
    }

    return next(
      new OkResponse({
        message: `Hero section ${
          isActive ? "activated" : "deactivated"
        } successfully`,
      })
    );
  } catch (error) {
    console.error(error);
    return next(
      new BadRequestResponse(error?.message || "Failed to update status")
    );
  }
};

module.exports = {
  getPublicHeroSections,
  getAllHeroSections,
  getHeroSectionById,
  createHeroSection,
  updateHeroSectionById,
  deleteHeroSectionById,
  toggleHeroSectionStatus,
};
