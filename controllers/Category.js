const { isValidObjectId } = require("mongoose");
const {
  OkResponse,
  BadRequestResponse,
  UnauthorizedResponse,
} = require("express-http-response");
const {
  Category,
  SubCategory,
  SubSubCategory,
} = require("../models/Category.js");
const Product = require("../models/Product.js");
const { getProductId } = require("../utils/stringsNymber.js");

const getAllCategoriesForUsersOrVendors = async (req, res, next) => {
  try {
    let query = { isActive: true };

    // Perform aggregation to get product counts for categories, subcategories, and sub-subcategories
    const productAggregation = await Product.aggregate([
      { $match: { isActive: true, status: "Published" } },
      {
        $group: {
          _id: {
            category: "$category",
            subCategory: "$subCategory",
            subSubCategory: "$subSubCategory",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          subCategory: "$_id.subCategory",
          subSubCategory: "$_id.subSubCategory",
          count: 1,
        },
      },
    ]).allowDiskUse(true);

    // Convert the aggregation results into a map for easier lookup
    const productCounts = productAggregation.reduce(
      (acc, { category, subCategory, subSubCategory, count }) => {
        if (!acc[category]) acc[category] = { subCategories: {} };
        if (!acc[category].subCategories[subCategory])
          acc[category].subCategories[subCategory] = {
            subSubCategories: {},
            count: 0,
          };
        if (
          !acc[category].subCategories[subCategory].subSubCategories[
            subSubCategory
          ]
        )
          acc[category].subCategories[subCategory].subSubCategories[
            subSubCategory
          ] = 0;

        // Update counts
        acc[category].subCategories[subCategory].count += count;
        acc[category].subCategories[subCategory].subSubCategories[
          subSubCategory
        ] += count;

        return acc;
      },
      {}
    );

    // Get all categories with populated subcategories and subsubcategories
    const categories = await Category.find(query)
      .populate({
        path: "subCategories",
        select: "name id",
        populate: {
          path: "subSubCategories",
          select: "name id",
        },
      })
      .sort({ name: 1 })
      .allowDiskUse(true);

    // Filter categories, subcategories, and sub-subcategories based on product counts
    const filteredCategories = categories.filter((category) => {
      // Scenario 1: If category has products, include it
      const categoryProductCount =
        productCounts[getProductId(category)]?.count || 0;
      if (categoryProductCount > 0) return true;

      // Scenario 2: Check subcategories for products
      const subCategoriesWithProducts = category.subCategories.filter(
        (subCategory) => {
          const subCategoryProductCount =
            productCounts[getProductId(category)]?.subCategories[
              getProductId(subCategory)
            ]?.count || 0;
          return subCategoryProductCount > 0;
        }
      );

      // Scenario 3: Check sub-subcategories for products
      const subSubCategoriesWithProducts = category.subCategories
        .map((subCategory) => {
          return subCategory.subSubCategories.filter((subSubCategory) => {
            const subSubCategoryProductCount =
              productCounts[getProductId(category)]?.subCategories[
                getProductId(subCategory)
              ]?.subSubCategories[getProductId(subSubCategory)] || 0;
            return subSubCategoryProductCount > 0;
          });
        })
        .flat();

      // Include categories that have products or subcategories/sub-subcategories with products
      if (
        subCategoriesWithProducts.length > 0 ||
        subSubCategoriesWithProducts.length > 0
      ) {
        return true;
      }

      return false;
    });

    // Add filtered subcategories and subsubcategories to the result
    const finalCategories = filteredCategories.map((category) => {
      // Filter subcategories based on product counts
      const finalSubCategories = category.subCategories.filter(
        (subCategory) => {
          const subCategoryProductCount =
            productCounts[getProductId(category)]?.subCategories[
              getProductId(subCategory)
            ]?.count || 0;
          return subCategoryProductCount > 0;
        }
      );

      // Filter sub-subcategories based on product counts
      const finalSubSubCategories = finalSubCategories.map((subCategory) => {
        const subSubCategoryProductCounts =
          productCounts[getProductId(category)]?.subCategories[
            getProductId(subCategory)
          ]?.subSubCategories || {};

        // Filter sub-subcategories that have products
        const validSubSubCategories = subCategory.subSubCategories.filter(
          (subSubCategory) => {
            const subSubCategoryProductCount =
              subSubCategoryProductCounts[getProductId(subSubCategory)] || 0;
            return subSubCategoryProductCount > 0;
          }
        );
        return {
          ...subCategory.toJSON(),
          subSubCategories: validSubSubCategories,
        };
      });

      return {
        ...category.toJSON(),
        subCategories: finalSubSubCategories,
      };
    });

    // Return the filtered categories
    return next(new OkResponse(finalCategories));
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

const getPaginatedCategoriesForSuperAdmin = async (req, res, next) => {
  try {
    const { page, name, limit = 10 } = req.query;

    const offset = page ? (parseInt(page, 10) - 1) * limit : 0;
    const regex = new RegExp(name, "i");

    let query = {};
    if (name) {
      const aggregationPipeline = [
        {
          $lookup: {
            from: "subcategories",
            localField: "parentSubCategory",
            foreignField: "_id",
            as: "parentSubCategoryDoc",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "parentCategory",
            foreignField: "_id",
            as: "parentCategoryDoc",
          },
        },
        {
          $match: {
            $or: [
              { name: regex },
              { "parentSubCategoryDoc.name": regex },
              { "parentCategoryDoc.name": regex },
            ],
          },
        },
        {
          $group: {
            _id: null,
            parentCategoryIds: { $addToSet: "$parentCategory" },
          },
        },
        {
          $project: {
            _id: 0,
            parentCategoryIds: 1,
          },
        },
      ];

      const _matechedParentCategoryIds = await SubSubCategory.aggregate(
        aggregationPipeline
      );
      if (!_matechedParentCategoryIds[0]) {
        return next(
          new OkResponse({
            totalCategories: 0,
            categories: [],
            totalPages: 1,
            currentPage: 1,
            hasPrevPage: false,
            hasNextPage: false,
          })
        );
      }
      const _categoryIds = _matechedParentCategoryIds[0].parentCategoryIds;
      query = {
        _id: { $in: _categoryIds },
        ...query,
      };
    }

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit,
    };

    const categoriesWithCounts = await Category.paginate(query, options).then(
      async (result) => {
        // Add product count for each category
        const categories = await Promise.all(
          result.docs.map(async (category) => {
            const productCount = await Product.countDocuments({
              category: category._id,
            });
            return { ...category._doc, product_count: productCount };
          })
        );

        return { ...result, docs: categories };
      }
    );

    return next(
      new OkResponse({
        totalCategories: categoriesWithCounts.totalDocs,
        categories: categoriesWithCounts.docs,
        totalPages: categoriesWithCounts.totalPages,
        currentPage: categoriesWithCounts.page,
        hasPrevPage: categoriesWithCounts.hasPrevPage,
        hasNextPage: categoriesWithCounts.hasNextPage,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id: categoryId } = req.params;

    // Find the category and populate subcategories
    const category = await Category.findById(categoryId).populate({
      path: "subCategories",
      model: "SubCategory",
      populate: {
        path: "subSubCategories",
        model: "SubSubCategory",
      },
    });

    if (!category) {
      return next(new BadRequestResponse("Category not found"));
    }

    // Convert the Mongoose document to a JSON object
    const categoryData = category.toJSON();

    // Function to recursively set editable to false and format the response
    const formatResponse = (data, type, parentId = null) => {
      return {
        id: data._id || data.id,
        name: data.name,
        type: type,
        parentId: parentId,
        editable: false,
        children:
          data.subCategories?.map((subCat) =>
            formatResponse(subCat, "subcategory", data._id)
          ) ||
          data.subSubCategories?.map((subSubCat) =>
            formatResponse(subSubCat, "sub-subcategory", data._id)
          ) ||
          [],
      };
    };

    // Format the category data
    const formattedCategory = formatResponse(categoryData, "category");

    res.json(formattedCategory);
  } catch (error) {
    console.error("Error fetching category:", error);
    return next(new BadRequestResponse("Failed to fetch category"));
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, children } = req.body;

    // Validate that each category includes at least one subcategory.
    if (!children || children.length === 0) {
      return next(
        new BadRequestResponse("Category must have at least one subcategory.")
      );
    }

    /**
     * Recursively saves children categories (subcategories and sub-subcategories),
     * maintaining hierarchical relationships by storing references to parent categories.
     *
     * @param {Array} children - The child categories to be saved.
     * @param {mongoose.ObjectId} parentId - The ID of the parent category for subcategories, null for top-level categories.
     * @param {String} parentType - The type of the parent category, used to differentiate between category levels.
     * @param {mongoose.ObjectId} parentCategoryId - The ID of the top-level category, used for sub-subcategories.
     * @returns {Promise<Array>} A promise that resolves to an array of IDs of the saved child categories.
     */
    const saveChildren = async (
      children,
      parentId = null,
      parentType = null,
      parentCategoryId = null
    ) => {
      let savedChildrenIds = [];

      for (const child of children) {
        let savedChildId = null;

        // Handle subcategory creation and its children.
        if (child.type === "subcategory") {
          // Ensure subcategories contain at least one sub-subcategory.
          if (!child.children || child.children.length === 0) {
            return next(
              new BadRequestResponse(
                "Subcategory must have at least one sub-subcategory."
              )
            );
          }

          // Create and save a new SubCategory.
          const newSubCategory = new SubCategory({ name: child.name });
          const savedSubCategory = await newSubCategory.save();
          savedChildId = savedSubCategory._id;

          // Recursively save sub-subcategories, passing the current subcategory's ID.
          const subSubCategoriesIds = await saveChildren(
            child.children,
            savedChildId,
            "SubSubCategory",
            parentCategoryId
          );

          // Update the SubCategory with references to its SubSubCategories.
          savedSubCategory.subSubCategories = subSubCategoriesIds;
          await savedSubCategory.save();
        }
        // Handle sub-subcategory creation.
        else if (child.type === "sub-subcategory") {
          // Create and save a new SubSubCategory with references to its parent category and subcategory.
          const newSubSubCategory = new SubSubCategory({
            name: child.name,
            parentCategory: parentCategoryId,
            parentSubCategory: parentId,
          });
          const savedSubSubCategory = await newSubSubCategory.save();
          savedChildId = savedSubSubCategory._id;
        }

        // Accumulate saved document IDs to link with their parent.
        if (savedChildId) {
          savedChildrenIds.push(savedChildId);
        }
      }

      return savedChildrenIds;
    };

    // Create and save the main category to obtain its ID for child references.
    const newCategory = new Category({ name: name });
    const savedCategory = await newCategory.save();

    // Recursively save subcategories and link them to the main category.
    const subCategoriesIds = await saveChildren(
      children,
      null,
      "SubCategory",
      savedCategory._id
    );

    // Update the main category document with the IDs of the saved subcategories.
    savedCategory.subCategories = subCategoriesIds;
    await savedCategory.save();

    return next(new OkResponse("Category structure saved successfully!"));
  } catch (error) {
    console.error("Error saving category structure:", error);
    return next(new BadRequestResponse("Failed to save category structure"));
  }
};

const updateCategoryById = async (req, res, next) => {
  try {
    const { id: categoryId } = req.params;
    const { name, children, isActive } = req.body;

    // Early exit if the category ID is invalid.
    if (!isValidObjectId(categoryId)) {
      return next(new BadRequestResponse("Invalid category ID"));
    }

    // Retrieve the category, handle the case if not found
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new BadRequestResponse("Category not found"));
    }

    // Only update the active status if it's present in the request.
    if (isActive !== undefined && category.isActive !== isActive) {
      category.isActive = isActive;
      await category.save(); // Save only if the status has changed.
      return next(
        new OkResponse("Category active status updated successfully!")
      );
    }

    // If name is provided, update it.
    if (name && category.name !== name) {
      category.name = name;
    }

    // Process children (subcategories and sub-subcategories) in bulk.
    const saveOrUpdateChildren = async (
      children,
      parentId = categoryId,
      parentCategoryId = categoryId
    ) => {
      let childIds = [];

      // Loop through children and process them in batch.
      for (const child of children) {
        if (!child.name || !child.type) continue; // Skip invalid children.

        const { id, name, type } = child;
        let childRecord = null;

        // Process subcategories.
        if (type === "subcategory") {
          childRecord = await processSubCategory(child, parentId);
        }
        // Process sub-subcategories.
        else if (type === "sub-subcategory") {
          childRecord = await processSubSubCategory(
            child,
            parentCategoryId,
            parentId
          );
        }

        if (childRecord) {
          childIds.push(childRecord._id);
        }
      }

      return childIds;
    };

    // Process a subcategory, either create or update it.
    const processSubCategory = async (child, parentId) => {
      let subCategory = null;
      const { id, name } = child;
      if (id && isValidObjectId(id)) {
        subCategory = await SubCategory.findById(id);
        if (subCategory) subCategory.name = name;
      } else {
        subCategory = new SubCategory({ name });
      }
      await subCategory.save();
      // Process sub-subcategories if any.
      const subSubCategoryIds = await saveOrUpdateChildren(
        child.children,
        subCategory._id,
        parentId
      );
      subCategory.subSubCategories = subSubCategoryIds;
      await subCategory.save();
      return subCategory;
    };

    // Process a sub-subcategory, either create or update it.
    const processSubSubCategory = async (child, parentCategoryId, parentId) => {
      let subSubCategory = null;
      const { id, name } = child;
      if (id && isValidObjectId(id)) {
        subSubCategory = await SubSubCategory.findById(id);
        if (subSubCategory) {
          subSubCategory.name = name;
          subSubCategory.parentCategory = parentCategoryId;
          subSubCategory.parentSubCategory = parentId;
        }
      } else {
        subSubCategory = new SubSubCategory({
          name,
          parentCategory: parentCategoryId,
          parentSubCategory: parentId,
        });
      }
      await subSubCategory.save();
      return subSubCategory;
    };

    // Update or add new subcategories and sub-subcategories in bulk.
    const updatedChildIds = await saveOrUpdateChildren(children);
    category.subCategories = updatedChildIds;

    await category.save(); // Save the category only once after all updates.

    return next(new OkResponse("Category updated successfully!"));
  } catch (error) {
    console.error("Error updating category:", error);
    return next(new BadRequestResponse("Failed to update category"));
  }
};

const deleteCategoryById = async (req, res, next) => {
  const { id } = { ...req.params };

  if (!id) return next(new BadRequestResponse("Category ID is required"));

  try {
    const category = await Category.findById(id);

    if (!category) return next(new BadRequestResponse("Category not found"));

    if (category.products.length > 0)
      return next(
        new BadRequestResponse("Category has products. You can't delete it!")
      );

    await category.deleteOne();

    return next(new OkResponse(category));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const OrderController = {
  getAllCategoriesForUsersOrVendors,
  getPaginatedCategoriesForSuperAdmin,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};

module.exports = OrderController;
