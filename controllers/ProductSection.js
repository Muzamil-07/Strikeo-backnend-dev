const { OkResponse, BadRequestResponse } = require("express-http-response");
const Product = require("../models/Product.js");
const Order = require("../models/Order.js");

const { getProductId } = require("../utils/stringsNymber.js");
const { Category } = require("../models/Category.js");

const bestSellers = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Step 1: Aggregate Orders by Company to find which companies have more orders
    const companyOrders = await Order.aggregate([
      { $group: { _id: "$company", totalOrders: { $sum: 1 } } },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
    ]);

    // Step 2: Get product IDs from these companies
    // const companyProductIds = await Product.find({
    //   company: { $in: companyOrders.map((order) => order._id) },
    //   isActive: true,
    //   status: "Published",
    // }).select("_id");

    // const productIds = companyProductIds.map((product) => product._id);

    // Step 3: Query Products based on the most popular companies
    const query = {
      company: { $in: companyOrders.map(getProductId) },
      isActive: true,
      status: "Published",
    };

    const options = {
      populate: [
        { path: "company", select: "name" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
        { path: "subSubCategory" },
      ],
      // sort: { company: 1 },
      select: [
        "name",
        "variants",
        "images",
        "subCategory",
        "subSubCategory",
        "inventory",
        "pricing",
        "publishedAt",
        "isActive",
        "brand",
        "sku",
        "seo.slug",
        "weight",
        "weightUnit",
        "category",
        "company",
      ],
      sort: { publishedAt: -1 },
      page: parseInt(page),
      limit: parseInt(limit),
      allowDiskUse: true,
    };

    const products = await Product.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: products.totalDocs,
        products: products.docs,
        totalPages: products.totalPages,
        currentPage: products.page,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse(error));
  }
};

const relatedToRecentViewProducts = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Step 1: Aggregate products by the number of orders
    const productOrders = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: parseInt(limit) },
    ]);

    // Step 2: Extract product IDs from the aggregated result
    const popularProductIds = productOrders.map(getProductId);

    // Step 3: Query the products collection for the most ordered products
    const query = {
      _id: { $in: popularProductIds },
      isActive: true,
      status: "Published",
    };

    const options = {
      populate: [
        { path: "company", select: "name" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
        { path: "subSubCategory" },
      ],
      select: [
        "name",
        "variants",
        "images",
        "subCategory",
        "subSubCategory",
        "inventory",
        "pricing",
        "publishedAt",
        "isActive",
        "brand",
        "sku",
        "seo.slug",
        "weight",
        "weightUnit",
        "category",
        "company",
      ],
      page: parseInt(page),
      limit: parseInt(limit),
      allowDiskUse: true,
    };

    const products = await Product.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: products.totalDocs,
        products: products.docs,
        totalPages: products.totalPages,
        currentPage: products.page,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse(error));
  }
};

const justForYou = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const query = {
      isActive: true,
      status: "Published",
    };

    const options = {
      populate: [
        { path: "company", select: "name" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
        { path: "subSubCategory" },
      ],
      sort: { publishedAt: -1, "pricing.salePrice": 1 },
      select: [
        "name",
        "variants",
        "images",
        "subCategory",
        "subSubCategory",
        "inventory",
        "pricing",
        "publishedAt",
        "isActive",
        "brand",
        "sku",
        "seo.slug",
        "weight",
        "weightUnit",
        "category",
        "company",
      ],
      page: parseInt(page),
      limit: parseInt(limit),
      allowDiskUse: true,
    };

    const products = await Product.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: products.totalDocs,
        products: products.docs,
        totalPages: products.totalPages,
        currentPage: products.page,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse(error));
  }
};
const featureCategories = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Step 1: Aggregate the number of products per category
    const categoryCounts = await Product.aggregate([
      { $match: { isActive: true, status: "Published" } }, // Filter active and published products
      { $group: { _id: "$category", productCount: { $sum: 1 } } }, // Group by category and count products
      { $sort: { productCount: -1 } }, // Sort by product count in descending order
      { $limit: 10 }, // Limit to top 10 categories
    ]);

    // Step 2: Fetch the category details
    const categoryIds = categoryCounts.map(getProductId);

    // Step 3: Get products for these categories
    const query = {
      category: { $in: categoryIds },
      isActive: true,
      status: "Published",
    };

    const options = {
      populate: [
        { path: "company", select: "name" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
        { path: "subSubCategory" },
      ],
      select: [
        "name",
        "variants",
        "images",
        "subCategory",
        "subSubCategory",
        "inventory",
        "pricing",
        "publishedAt",
        "isActive",
        "brand",
        "sku",
        "seo.slug",
        "weight",
        "weightUnit",
        "category",
        "company",
      ],
      page: parseInt(page),
      limit: parseInt(limit),
      allowDiskUse: true,
    };

    const products = await Product.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: products.totalDocs,
        products: products.docs,
        totalPages: products.totalPages,
        currentPage: products.page,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse(error));
  }
};

const bestSellersInHomeAndDecor = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Aggregate Orders by Company to find which companies have more orders
    const companyOrders = await Order.aggregate([
      { $group: { _id: "$company", totalOrders: { $sum: 1 } } },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 },
    ]);
    const category = await Category.findOne({
      name: new RegExp("Home and Décor", "i"),
    });
    const query = {
      $or: [
        {
          company: { $in: companyOrders.map(getProductId) },
        },
        { ...(category && { category: getProductId(category) }) },
      ],
      //   company: { $in: companyOrders.map(getProductId) },
      //   ...(category && { category: getProductId(category) }),
      isActive: true,
      status: "Published",
    };

    const options = {
      populate: [
        { path: "company", select: "name" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
        { path: "subSubCategory" },
      ],
      select: [
        "name",
        "variants",
        "images",
        "subCategory",
        "subSubCategory",
        "inventory",
        "pricing",
        "publishedAt",
        "isActive",
        "brand",
        "sku",
        "seo.slug",
        "weight",
        "weightUnit",
        "category",
        "company",
      ],
      page: parseInt(page),
      limit: parseInt(limit),
      allowDiskUse: true,
    };

    const products = await Product.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: products.totalDocs,
        products: products.docs,
        totalPages: products.totalPages,
        currentPage: products.page,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse(error));
  }
};
const popularProductsInApparel = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    // Aggregate products by the number of orders in Apparel category
    const productOrders = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.product", totalOrders: { $sum: 1 } } },
      { $sort: { totalOrders: -1 } },
      { $limit: parseInt(limit) },
    ]);

    const popularProductIds = productOrders.map(getProductId);
    const category = await Category.findOne({
      name: new RegExp("Automotive", "i"),
    });
    const query = {
      $or: [
        {
          _id: { $in: popularProductIds },
        },
        { ...(category && { category: getProductId(category) }) },
      ],
      //   _id: { $in: popularProductIds },
      //   ...(category && { category: getProductId(category) }),
      isActive: true,
      status: "Published",
    };

    const options = {
      populate: [
        { path: "company", select: "name" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
        { path: "subSubCategory" },
      ],
      select: [
        "name",
        "variants",
        "images",
        "subCategory",
        "subSubCategory",
        "inventory",
        "pricing",
        "publishedAt",
        "isActive",
        "brand",
        "sku",
        "seo.slug",
        "weight",
        "weightUnit",
        "category",
        "company",
      ],
      page: parseInt(page),
      limit: parseInt(limit),
      allowDiskUse: true,
    };

    const products = await Product.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: products.totalDocs,
        products: products.docs,
        totalPages: products.totalPages,
        currentPage: products.page,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse(error));
  }
};

module.exports = {
  bestSellers,
  popularProductsInApparel,
  bestSellersInHomeAndDecor,
  featureCategories,
  relatedToRecentViewProducts,
  justForYou,
};
