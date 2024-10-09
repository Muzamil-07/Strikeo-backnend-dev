const { OkResponse, BadRequestResponse } = require("express-http-response");
const Top10Brands = require("../models/Top10Brands");
const Brand = require("../models/Brand");

// Get all brands with pagination, search, and dynamic sorting using mongoose-paginate-v2
exports.getBrands = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", sort = "createdAt" } = req.query;

    // Define a search query for the brand name, if provided
    const searchQuery = search
      ? { name: { $regex: search, $options: "i" } } // Case-insensitive search for the brand name
      : {};

    // Define the sort object dynamically based on the `sort` query parameter
    const sortQuery = {};
    sortQuery[sort] = -1; // Default to descending order (use 1 for ascending if needed)

    // Pagination options for mongoose-paginate-v2
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { ...sortQuery }, // Apply dynamic sorting
    };

    // Fetch paginated brands with search and sorting
    const brands = await Brand.paginate(searchQuery, options);

    return next(
      new OkResponse({
        totalProducts: brands.totalDocs,
        brands: brands.docs,
        totalPages: brands.totalPages,
        currentPage: brands.page - 1,
        hasPrevPage: brands.hasPrevPage,
        hasNextPage: brands.hasNextPage,
        currentPage: brands.page,
      })
    );
  } catch (error) {
    console.error("Error fetching brands:", error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};
// Get all brands with sorting
exports.getAllBrands = async (req, res, next) => {
  try {
    const brands = await Brand.aggregate([
      {
        $addFields: {
          isAlphabetic: { $regexMatch: { input: "$name", regex: /^[a-zA-Z]/ } },
          isNumeric: { $regexMatch: { input: "$name", regex: /^\d/ } },
        },
      },
      {
        $sort: {
          isAlphabetic: -1, // Alphabetic names first
          isNumeric: 1, // Numeric names after
          name: 1, // Alphabetic sorting (case insensitive)
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ]);

    return next(new OkResponse(brands));
  } catch (error) {
    console.error("Error fetching brands:", error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

// Get top 10 brands by subsubcategory
exports.getTop10Brands = async (req, res, next) => {
  try {
    const { subSubCategoryId } = req.params;

    // Validate the presence of subSubCategoryId
    if (!subSubCategoryId) {
      return next(new BadRequestResponse("SubSubCategory ID is required"));
    }

    // Fetch the top 10 brands for the given subsubcategory
    const topBrandsEntry = await Top10Brands.findOne({
      subSubCategory: subSubCategoryId,
    });

    if (!topBrandsEntry) {
      return next(new OkResponse([]));
    }

    // Populate the brands only if topBrandsEntry is found
    await topBrandsEntry.populate("brands", "name _id");

    return next(new OkResponse(topBrandsEntry.brands)); // Return top 10 brands
  } catch (error) {
    console.error("Error fetching top 10 brands:", error);
    return next(
      new BadRequestResponse(
        "Something went wrong while fetching top 10 brands"
      )
    );
  }
};

// Get a single brand by ID
exports.getBrandById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate the presence of brand ID
    if (!id) {
      return next(new BadRequestResponse("Brand ID is required"));
    }

    const brand = await Brand.findById(id);
    return next(new OkResponse(brand)); // Using OkResponse for success
  } catch (error) {
    console.error("Error fetching brand:", error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

// Create a new brand
exports.createBrand = async (req, res, next) => {
  try {
    const { name, company } = req.body;

    // Validate the presence of brand name
    if (!name || !company) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    // Check if the brand already exists
    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return next(new BadRequestResponse("Brand already exists"));
    }

    const newBrand = new Brand({ name, company });
    await newBrand.save();

    return next(new OkResponse(newBrand)); // Using OkResponse for success
  } catch (error) {
    console.error("Error creating brand:", error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

// Update an existing brand
exports.updateBrand = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    // Validate the presence of brand ID and name
    if (!id) {
      return next(new BadRequestResponse("Brand ID is required"));
    }
    if (!name) {
      return next(new BadRequestResponse("Brand name is required"));
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return next(new BadRequestResponse("Brand not found"));
    }

    brand.name = name;
    await brand.save();

    return next(new OkResponse(brand)); // Using OkResponse for success
  } catch (error) {
    console.error("Error updating brand:", error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

// Delete a brand
exports.deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate the presence of brand ID
    if (!id) {
      return next(new BadRequestResponse("Brand ID is required"));
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return next(new BadRequestResponse("Brand not found"));
    }

    await brand.remove();
    return next(new OkResponse({ message: "Brand deleted" })); // Using OkResponse for success
  } catch (error) {
    console.error("Error deleting brand:", error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};
