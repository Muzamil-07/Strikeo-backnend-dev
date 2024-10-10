const { OkResponse, BadRequestResponse } = require("express-http-response");
const Product = require("../models/Product.js");
const Review = require("../models/Review.js");
const Order = require("../models/Order.js");
const Activity = require("../models/Activity.js");
const {
  Category,
  SubCategory,
  SubSubCategory,
} = require("../models/Category.js");
const { default: mongoose } = require("mongoose");
const { slugify } = require("slugify-unicode");
const Brand = require("../models/Brand.js");
const filterObjectBySchema = require("../utils/filterObject.js");
const { getNumber } = require("../utils/stringsNymber.js");

const getProducts = async (req, res, next) => {
  try {
    const {
      page,
      all,
      search,
      category: categoryName,
      limit: limitPerPage,
      minPrice,
      maxPrice,
      sort = "recent",
      discount,
      brand = "",
    } = req.query;
    const query = {
      isActive: true,
      status: "Published",
    };
    if (search) {
      const nameRegex = new RegExp(search, "i");
      query.name = nameRegex;
    }
    // if (categoryName && categoryName !== "undefined") {
    //   const categoryRegex = new RegExp(categoryName, "i");

    //   const category = await SubSubCategory.findOne({ name: categoryRegex });
    //   if (category?.parentCategory) query.category = category.parentCategory;
    //   if (category?._id) query.subSubCategory = category._id;
    // }

    // Filter by  multiple subSubCategories
    if (categoryName && categoryName !== "undefined") {
      const subSubCategories = categoryName
        .split(",")
        .map((subCat) => new RegExp(subCat.trim(), "i"));

      // Find matching subSubCategories
      const matchingSubSubCategories = await SubSubCategory.find({
        name: { $in: subSubCategories },
      });

      const subSubCategoryIds = matchingSubSubCategories.map(
        (subCat) => subCat._id
      );

      if (subSubCategoryIds.length > 0) {
        query.subSubCategory = { $in: subSubCategoryIds };
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.$or = [];

      let variantPriceQuery = { "variants.pricing.salePrice": {} };
      let productPriceQuery = { "pricing.salePrice": {} };

      // Ensure minPrice and maxPrice are non-negative
      const sanitizedMinPrice =
        minPrice && getNumber(minPrice) < 0 ? 0 : getNumber(minPrice);
      const sanitizedMaxPrice =
        maxPrice && getNumber(maxPrice) < 0 ? 0 : getNumber(maxPrice);

      variantPriceQuery["variants.pricing.salePrice"].$gte = sanitizedMinPrice;
      productPriceQuery["pricing.salePrice"].$gte = sanitizedMinPrice;

      variantPriceQuery["variants.pricing.salePrice"].$lte = sanitizedMaxPrice;
      productPriceQuery["pricing.salePrice"].$lte = sanitizedMaxPrice;

      // Add to $or query
      query.$or.push(variantPriceQuery);
      query.$or.push(productPriceQuery);
    }

    // Set up sorting
    let sortOptions = {};
    if (sort) {
      if (sort === "name") {
        sortOptions = {
          name: 1,
        };
      } else if (sort === "price") {
        sortOptions = { salePrice: 1 };
      } else if (sort === "recent") {
        sortOptions = { createdAt: -1 }; // Sort by most recent (descending)
      }
    }

    // Filter by discount
    if (discount && discount === "all") {
      query.discount = { $gt: 0 };
    }
    // Filter by brand
    if (brand.trim()) {
      const brands = brand.split(",").map((subCat) => subCat.trim());

      const brandIds = await Brand.find({ name: { $in: brands } }).distinct(
        "_id"
      );
      if (brandIds) query.brand = { $in: brandIds };
    }

    if (all) {
      const products = await Product.find(query).populate(
        "category subCategory subSubCategory"
      );

      return next(
        new OkResponse({
          totalProducts: products.length,
          products,
          totalPages: 1,
          currentPage: 1,
          hasPrevPage: false,
          hasNextPage: false,
        })
      );
    }
    const limit = limitPerPage ?? 10;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const options = {
      populate: "subCategory subSubCategory category",
      sort: sortOptions,
      offset,
      limit,
    };

    const products = await Product.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: products.totalDocs,
        products: products.docs,
        totalPages: products.totalPages,
        currentPage: products.page - 1,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
        currentPage: products.page,
      })
    );
  } catch (error) {
    console.log(error, "error");
    return next(new BadRequestResponse(error));
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const {
      search,
      page,
      all,
      category: categoryName,
      company,
      limit: limitPerPage,
      status: productStatus,
    } = req.query;
    const roleType = req.user.role.type;

    let query = {
      Vendor: {
        company: req.user?.company?.id,
      },
      Strikeo: {
        company: company || {},
      },
      User: {
        isActive: true,
        status: "Published",
      },
    }[roleType];

    let sortOpt = { createdAt: -1 };

    if (categoryName && categoryName !== "undefined") {
      const categoryRegex = new RegExp(categoryName, "i");

      const category = await SubSubCategory.findOne({ name: categoryRegex });
      if (category?.parentCategory) query.category = category.parentCategory;
    }

    if (search) {
      const nameRegex = new RegExp(search, "i");
      query = { ...query, name: nameRegex };
    }

    if (all) {
      // if (categoryName) {
      //   const categoryRegex = new RegExp(categoryName, "i");

      //   const category = await Category.findOne({ name: categoryRegex });
      //   query.category = category.id;
      // }
      const products = await Product.find({ isActive: true })
        .populate({
          path: "subSubCategories",
          select: "name id",
        })
        .populate({
          path: "subCategories",
          select: "name id",
        })
        .populate({
          path: "categories",
          select: "name id",
        })
        .populate({
          path: "company",
          select: "name id country city",
        })
        .populate("reviews")
        .sort({ ...sortOpt });

      return next(new OkResponse(products));
    } else {
      const limit = limitPerPage ?? 10;
      const offset = page ? (parseInt(page) - 1) * limit : 0;

      // if (categoryName) {
      //   const categoryRegex = new RegExp(categoryName, "i");

      //   const category = await Category.findOne({ name: categoryRegex });
      //   query.category = category.id;
      // }

      if (productStatus) {
        if (productStatus === "Published") {
          query = { ...query, status: "Published" };
          sortOpt = { publishedAt: -1 };
        } else {
          query = { ...query, status: { $ne: "Published" } };
          sortOpt = { createdAt: -1 };
        }
      }

      const options = {
        populate: [
          {
            path: "reviews",
          },
          {
            path: "category",
            select: "name id",
          },
          {
            path: "subCategory",
            select: "name id",
          },
          {
            path: "subSubCategory",
            select: "name id",
          },
          {
            path: "company",
            select: "name id country city",
          },
        ],
        sort: { ...sortOpt },
        offset,
        limit,
      };
      const products = await Product.paginate(query, options);

      return next(
        new OkResponse({
          totalProducts: products.totalDocs,
          products: products.docs,
          totalPages: products.totalPages,
          currentPage: products.page - 1,
          hasPrevPage: products.hasPrevPage,
          hasNextPage: products.hasNextPage,
          currentPage: products.page,
        })
      );
    }
  } catch (error) {
    console.log(error, "error");
    return next(new BadRequestResponse(error));
  }
};

const filterProducts = async (req, res, next) => {
  const {
    search,
    category,
    page,
    limit: limitPerPage,
    status: productStatus,
  } = req.query;
  const limit = limitPerPage ?? 10;
  const offset = page ? (parseInt(page) - 1) * limit : 0;

  let queries = {};
  if (productStatus) {
    if (productStatus === "Published") {
      queries = { ...queries, status: "Published" };
    } else {
      queries = { ...queries, status: { $ne: "Published" } };
    }
  }

  if (category && category !== "undefined") {
    const categoryRegex = new RegExp(category, "i");
    const categoryId = await SubSubCategory.findOne({ name: categoryRegex });
    // .distinct(
    //   "_id"
    // );
    if (categoryId)
      queries = { ...queries, category: categoryId?.parentCategory };
  }

  if (search) {
    const nameRegex = new RegExp(search, "i");
    queries = { ...queries, name: nameRegex };
  }
  try {
    const options = {
      populate: [
        {
          path: "reviews",
        },
        {
          path: "category",
          select: "name id",
        },
        {
          path: "subCategory",
          select: "name id",
        },
        {
          path: "subSubCategory",
          select: "name id",
        },
        {
          path: "company",
          select: "name id country city",
        },
      ],
      sort: { updatedAt: -1 },
      offset,
      limit,
    };

    const products = await Product.paginate(queries, options);

    return next(
      new OkResponse({
        totalProducts: products.totalDocs,
        products: products.docs,
        totalPages: products.totalPages,
        currentPage: products.page - 1,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
        currentPage: products.page,
      })
    );
  } catch (error) {
    console.log(error, "error");
    return next(new BadRequestResponse(error));
  }
};

const getRelatedProducts = async (req, res, next) => {
  if (!req.params.id)
    return next(new BadRequestResponse("Product ID is required"));
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return next(new BadRequestResponse("Product not found"));

    const products = await Product.aggregate([
      {
        $match: {
          _id: { $ne: product.id },
          category: product.category,
          isActive: true,
          status: "Published",
        },
      },
      { $sample: { size: 3 } },
    ]);

    return next(new OkResponse(products));
  } catch (error) {
    console.log(error, "error");
    return next(new BadRequestResponse("Failed to fetch related products"));
  }
};

const getRelatedProductsOnChecout = async (req, res, next) => {
  if (!req.params.ids) {
    return next(new BadRequestResponse("Product ID is required"));
  }

  const productsIds = req.params.ids
    .split(",")
    .map((id) => new mongoose.Types.ObjectId(id));

  try {
    const limit = parseInt(req.query.limit) || 6;

    const cartProducts = await Product.find(
      { _id: { $in: productsIds } },
      { subCategory: 1 }
    );
    if (!cartProducts || cartProducts.length === 0) {
      return next(new BadRequestResponse("Products not found"));
    }

    // Extract subCategories and ensure uniqueness
    const subCategoryIds = cartProducts.map((o) => o.subCategory.toString());
    const uniqueSubCategoryIds = [...new Set(subCategoryIds)];

    // Convert to ObjectId if required
    const subCategoryObjectIds = uniqueSubCategoryIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const relatedProducts = await Product.aggregate([
      {
        $match: {
          _id: { $nin: productsIds },
          subCategory: { $in: subCategoryObjectIds },
          isActive: true,
          status: "Published",
        },
      },
      { $sample: { size: limit } },
    ]);

    return next(new OkResponse(relatedProducts));
  } catch (error) {
    console.error("Error fetching related products:", error);
    return next(new BadRequestResponse("Failed to fetch related products"));
  }
};

const getPendingReviewProducts = async (req, res, next) => {
  try {
    const productsWithNullReview = await Order.aggregate([
      {
        $match: {
          customer: new mongoose.Types.ObjectId(req.user.id),
          isCompleted: true,
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $unwind: "$orders.items",
      },
      {
        $match: {
          "orders.items.review": null,
        },
      },
      {
        $group: {
          _id: {
            orderNumber: "$orderNumber",
            product: "$orders.items.product",
          },
        },
      },
      {
        $project: {
          _id: 0,
          orderNumber: "$_id.orderNumber",
          product: "$_id.product",
        },
      },
    ]);

    const productIds = productsWithNullReview.map((result) => result.product);

    // Parallelize the queries using Promise.all
    const populatedProducts = await Promise.all(
      productIds.map((productId) => Product.findById(productId).lean())
    );

    const result = productsWithNullReview.map(
      (productWithNullReview, index) => {
        return {
          orderNumber: productWithNullReview.orderNumber,
          product: populatedProducts[index],
        };
      }
    );

    return next(new OkResponse(result));
  } catch (error) {
    console.log(error, "error");
    return next(
      new BadRequestResponse("Failed to fetch pending review products")
    );
  }
};

const getReviewedProducts = async (req, res, next) => {
  try {
    const reviewedProducts = await Review.find({ user: req.user.id })
      .populate("product")
      .populate("order", "orderNumber");
    return next(new OkResponse(reviewedProducts));
  } catch (error) {
    console.log(error, "error");
    return next(new BadRequestResponse("Failed to fetch reviewed products"));
  }
};

const addReview = async (req, res, next) => {
  const productId = req.params.id;
  if (!productId) return next(new BadRequestResponse("Product ID is required"));
  const userId = req?.user?.id || req?.user?._id;
  const { rating, description, orderNumber } = req.body;

  if (rating === undefined || !description || !orderNumber)
    return next(new BadRequestResponse("Missing required parameters"));

  try {
    const order = await Order.findOne({
      orderNumber: orderNumber,
      customer: userId,
      "orders.items.product": productId,
    });

    if (!order) return next(new BadRequestResponse("No matching order found!"));

    const reviewObj = {
      user: userId,
      rating,
      description,
      reviewedDate: Date.now(),
      order: order.id,
      product: productId,
    };

    const newReview = await Review(reviewObj).save();

    order.orders.forEach((subOrder) => {
      subOrder.items.forEach((item) => {
        if (item.product.toString() === productId.toString()) {
          item.review = newReview._id;
        }
      });
    });

    await order.save();
    return next(new OkResponse("Review added"));
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse("Failed to add review"));
  }
};

const getProduct = async (req, res, next) => {
  if (!req.params.id)
    return next(new BadRequestResponse("Product ID is required"));
  try {
    let product = await Product.findOne({ _id: req.params.id }).populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "username profileImage",
      },
    });
    if (!product) return next(new BadRequestResponse("Product not found"));

    return next(new OkResponse(product));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};
const getProductBySlug = async (req, res, next) => {
  if (!req.params.slug)
    return next(new BadRequestResponse("Product ID is required"));

  try {
    let product = await Product.findOne({
      "seo.slug": req.params.slug,
    }).populate([
      {
        path: "reviews",
        options: { limit: 10 }, // Limit the number of reviews to 10
        populate: {
          path: "user",
          select: "username profileImage",
        },
      },
      {
        path: "category",
      },
      {
        path: "subCategory",
      },
      {
        path: "subSubCategory",
      },
    ]);

    if (!product) return next(new BadRequestResponse("Product not found"));

    return next(new OkResponse(product));
  } catch (error) {
    return next(new BadRequestResponse(error.message));
  }
};

const createProduct = async (req, res, next) => {
  try {
    let { name, category, subCategory, subSubCategory } = req.body;

    // Check if Category, SubCategory, SubSubCategory exist and are active
    const isCategoryExist = await Category.findById(category);
    if (!isCategoryExist)
      return next(new BadRequestResponse("Category not found"));
    if (!isCategoryExist.isActive)
      return next(new BadRequestResponse("Category is disabled"));

    const isSubCategoryExist = await SubCategory.findById(subCategory);
    if (!isSubCategoryExist)
      return next(new BadRequestResponse("Sub-category not found"));

    const isSubSubCategoryExist = await SubSubCategory.findById(subSubCategory);
    if (!isSubSubCategoryExist)
      return next(new BadRequestResponse("Sub-subcategory not found"));

    // Check for the company if the user is a vendor
    if (req.user.role.type === "Vendor" && !req.user.company)
      return next(new BadRequestResponse("Company not found"));
    const company = req.user.company?.id;

    const productSchema = {
      name: true,
      description: true,
      category: true,
      subCategory: true,
      subSubCategory: true,
      company: true,
      // Nested pricing object
      pricing: {
        costPrice: true,
        discount: true,
        taxRate: true,
        currency: true,
        isTaxInclusive: true,
      },
      // Nested inventory object
      inventory: {
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        allowBackorders: true,
        inStock: true,
      },
      images: [
        {
          url: true,
          alt: true,
        },
      ],
      tags: true,
      brand: true,
      manufacturer: true,
      // Nested attributes object
      attributes: {
        color: true,
        size: true,
        material: true,
        gender: true,
        condition: true,
        customFields: [
          {
            name: true,
            value: true,
          },
        ],
      },
      weight: true,
      dimensions: {
        length: true,
        width: true,
        height: true,
      },
      // Nested variants array of objects
      variants: [
        {
          variantName: true,
          pricing: {
            salePrice: true,
            costPrice: true,
            discount: true,
          },
          inventory: {
            stock: true,
            lowStockThreshold: true,
            trackInventory: true,
            allowBackorders: true,
            inStock: true,
          },
          weight: true,
          dimensions: {
            length: true,
            width: true,
            height: true,
          },
          color: true,
          size: true,
          material: true,
          gender: true,
          condition: true,
          images: [
            {
              url: true,
              alt: true,
            },
          ],
        },
      ],
    };
    // Filter the payload based on the schema
    const updatePayload = await filterObjectBySchema(
      { ...req?.body, company },
      productSchema
    );

    // Create the new product with the new schema
    const product = await new Product({
      ...updatePayload,
    }).save();

    // Record an activity log for creating the product
    const activity = new Activity({
      employeeName: req.user.firstName + " " + req.user.lastName,
      company,
      type: "Created Product",
      "Created Product": {
        name,
        category: isCategoryExist.name,
        message: `Created a new product ${name} in category ${isCategoryExist.name}.`,
      },
    });
    await activity.save();

    return next(new OkResponse(product));
  } catch (error) {
    return next(
      new BadRequestResponse(error.message || "Error creating product")
    );
  }
};

const updateProduct = async (req, res, next) => {
  if (!req.params.id)
    return next(new BadRequestResponse("Product ID is required"));

  try {
    // Find the product to update
    const product = await Product.findOne({ _id: req.params.id }).populate(
      "category"
    );

    if (!product) return next(new BadRequestResponse("Product not found"));

    // Check if categories exist and are active
    const isCategoryExist = await Category.findById(req.body.category);
    if (!isCategoryExist)
      return next(new BadRequestResponse("Category not found"));
    if (!isCategoryExist.isActive)
      return next(new BadRequestResponse("Category is disabled"));

    const isSubCategoryExist = await SubCategory.findById(req.body.subCategory);
    if (!isSubCategoryExist)
      return next(new BadRequestResponse("Sub-category not found"));

    const isSubSubCategoryExist = await SubSubCategory.findById(
      req.body.subSubCategory
    );
    if (!isSubSubCategoryExist)
      return next(new BadRequestResponse("Sub-subcategory not found"));

    // const isStrikeoAdmin =
    //   req?.user?.role?.name === "SuperAdmin" &&
    //   req?.user?.role?.type === "StrikeO";

    const productSchema = {
      name: true,
      description: true,
      category: true,
      subCategory: true,
      subSubCategory: true,
      // Nested pricing object
      pricing: {
        costPrice: true,
        salePrice: true,
        discount: true,
        taxRate: true,
        currency: true,
        isTaxInclusive: true,
      },
      // Nested inventory object
      inventory: {
        stock: true,
        lowStockThreshold: true,
        trackInventory: true,
        allowBackorders: true,
        inStock: true,
      },

      images: [
        {
          url: true,
          alt: true,
        },
      ],
      tags: true,
      brand: true,
      manufacturer: true,
      // Nested attributes object
      attributes: {
        color: true,
        size: true,
        material: true,
        gender: true,
        condition: true,
        customFields: [
          {
            name: true,
            value: true,
          },
        ],
      },
      weight: true,
      dimensions: {
        length: true,
        width: true,
        height: true,
      },
      // Nested variants array of objects
      variants: [
        {
          _id: true,
          variantName: true,
          pricing: {
            salePrice: true,
            costPrice: true,
            discount: true,
          },
          inventory: {
            stock: true,
            lowStockThreshold: true,
            trackInventory: true,
            allowBackorders: true,
            inStock: true,
          },
          weight: true,
          dimensions: {
            length: true,
            width: true,
            height: true,
          },
          color: true,
          size: true,
          material: true,
          gender: true,
          condition: true,
          images: [
            {
              url: true,
              alt: true,
            },
          ],
          isActive: true,
        },
      ],
      status: true,
      isPublished: true,
    };

    const updatePayload = await filterObjectBySchema(req.body, productSchema);

    if (updatePayload.variants && updatePayload.variants.length) {
      const existingVariantsMap = product.variants.reduce((acc, variant) => {
        acc[variant._id.toString()] = variant; // Map variants by '_id'
        return acc;
      }, {});

      // Update or add variants
      updatePayload.variants = updatePayload.variants.map((variant) => {
        if (variant?._id) {
          // If the variant has an '_id', update the existing variant
          const existingVariant = existingVariantsMap[variant._id.toString()];
          if (existingVariant) {
            return {
              ...existingVariant.toObject(),
              ...variant, // Update existing variant with new data
              sku: existingVariant.sku, // Preserve 'sku'
            };
          }
        }

        if (!variant?.sku) {
          product.variantSequence += 1;
          variant.sku = `${product.sku}-${String(
            product.variantSequence
          ).padStart(6, "0")}`;
        }
        return variant; // Treat as a new variant
      });

      // Directly assign new variants to the product
      product.variants = updatePayload.variants;
    } else {
      product.variants = [];
    }

    // Update the product with the filtered payload
    Object.assign(product, updatePayload);

    // Special case for slug
    product.seo = { ...(product?.seo || {}) };
    product.seo.slug = slugify(`${product.name}-${product.sku}`);

    if (req.body?.isPublished) {
      product.status = "Published";
      product.publishedAt = new Date();
    }

    await product.save({ validateModifiedOnly: true });

    if (req?.user?.company) {
      const activity = new Activity({
        employeeName: req.user.firstName + " " + req.user.lastName,
        company: req.user.company.id,
        type: "Updated Product",
        "Updated Product": {
          name: product.name,
          category: isCategoryExist.name,
          message: `Updated product ${product.name} in category ${isCategoryExist.name}.`,
        },
      });
      await activity.save();
    }

    return next(new OkResponse(product));
  } catch (error) {
    console.log(error, "error");
    return next(
      new BadRequestResponse(error.message || "Error updating product")
    );
  }
};

const deleteProduct = async (req, res, next) => {
  if (!req.params.id)
    return next(new BadRequestResponse("Product ID is required"));

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new BadRequestResponse("Product not found"));

    const category = await Category.findById(product.category._id);

    if (!category) return next(new BadRequestResponse("Category not found"));

    category.products = category.products.filter(
      (p) => p.toString() !== product.id.toString()
    );

    await category.save();

    await product.deleteOne();
    return next(new OkResponse("Product deleted"));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const blockProduct = async (req, res, next) => {
  if (!req.params.id)
    return next(new BadRequestResponse("Product ID is required"));

  try {
    const { category } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return next(new BadRequestResponse("Product not found"));

    product.isActive = false;

    const activity = new Activity({
      employeeName: req.user.firstName + " " + req.user.lastName,
      company: req.user.company.id,
      type: "Updated Product",
      "Updated Product": {
        name: product.name,
        category,
        message: `inactivated product ${product.name} of category ${category}.`,
      },
    });
    await activity.save();
    await product.save();
    return next(new OkResponse("Product blocked"));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const unblockProduct = async (req, res, next) => {
  if (!req.params.id)
    return next(new BadRequestResponse("Product ID is required"));

  try {
    const { category } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return next(new BadRequestResponse("Product not found"));

    product.isActive = true;

    const activity = new Activity({
      employeeName: req.user.firstName + " " + req.user.lastName,
      company: req.user.company.id,
      type: "Updated Product",
      "Updated Product": {
        name: product.name,
        category,
        message: `activated product ${product.name} of category ${category}.`,
      },
    });
    await activity.save();
    await product.save();
    return next(new OkResponse("Product unblocked"));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const approveProduct = async (req, res, next) => {
  if (!req.params.id)
    return next(new BadRequestResponse("Product ID is required"));

  try {
    const { salePrice, discount, category, subCategory, subSubCategory } =
      req.body;

    if (!salePrice || typeof salePrice !== "number")
      return next(new BadRequestResponse("Sale price is required"));

    const isCategoryExist = await Category.findById(category);
    if (!isCategoryExist)
      return next(new BadRequestResponse("Category not found"));

    if (!isCategoryExist.isActive)
      return next(new BadRequestResponse("Category is disabled"));

    const isSubCategoryExist = await SubCategory.findById(subCategory);
    if (!isSubCategoryExist)
      return next(new BadRequestResponse("Sub-category not found"));

    const isSubSubCategoryExist = await SubSubCategory.findById(subSubCategory);
    if (!isSubSubCategoryExist)
      return next(new BadRequestResponse("Sub-subcategory not found"));

    const product = await Product.findById(req.params.id);

    if (!product) return next(new BadRequestResponse("Product not found"));

    product.category = category;
    product.subCategory = subCategory;
    product.subSubCategory = subSubCategory;
    product.salePrice = salePrice;
    if (typeof discount === "number") product.discount = discount;

    product.status = "Published";
    product.publishedAt = new Date();
    await product.save();
    return next(new OkResponse("Product published"));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const rejectProduct = async (req, res, next) => {
  if (!req.params.id)
    return next(new BadRequestResponse("Product ID is required"));

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return next(new BadRequestResponse("Product not found"));

    product.status = "Rejected";

    await product.save({ validateBeforeSave: false });

    return next(new OkResponse("Product rejected"));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};
const disableProduct = async (req, res, next) => {
  let { disable = false } = req?.query;
  disable = JSON.parse(disable);
  if (!req?.params?.id)
    return next(new BadRequestResponse("Product ID is required"));

  try {
    if (req?.user?.role?.name === "SuperAdmin") {
      const product = await Product.findByIdAndUpdate(req.params.id, {
        isActive: disable,
      });

      if (!product) return next(new BadRequestResponse("Product not found"));
      return next(
        new OkResponse(`Product ${disable ? "Enabled" : "Disabled"}`)
      );
    } else {
      return next(new BadRequestResponse("Action not allowed to this user"));
    }
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const ProductController = {
  getAllProducts,
  filterProducts,
  getProducts,
  getProduct,
  getRelatedProducts,
  getRelatedProductsOnChecout,
  getReviewedProducts,
  getPendingReviewProducts,
  addReview,
  createProduct,
  updateProduct,
  deleteProduct,
  unblockProduct,
  blockProduct,
  approveProduct,
  rejectProduct,
  disableProduct,
  getProductBySlug,
};

module.exports = ProductController;
