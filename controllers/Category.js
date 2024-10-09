const { isValidObjectId } = require('mongoose');
const {
  OkResponse,
  BadRequestResponse,
  UnauthorizedResponse
} = require('express-http-response')
const { 
  Category, 
  SubCategory, 
  SubSubCategory
} = require('../models/Category.js')
const Product = require('../models/Product.js')

const getAllCategoriesForUsersOrVendors = async (req, res, next) => {
  try {
    const { name } = req.query;
    const regex = new RegExp(name, 'i');
    let query = { isActive: true };
    if (name) {
      const aggregationPipeline = [
        {
          $lookup: {
            from: 'subcategories',
            localField: 'parentSubCategory',
            foreignField: '_id',
            as: 'parentSubCategoryDoc'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'parentCategory',
            foreignField: '_id',
            as: 'parentCategoryDoc'
          }
        },
        {
          $match: {
            $or: [
              { name: regex },
              { 'parentSubCategoryDoc.name': regex },
              { 'parentCategoryDoc.name': regex }
            ]
          }
        },
        {
          $group: {
            _id: null,
            parentCategoryIds: { $addToSet: '$parentCategory' }
          }
        },
        {
          $project: {
            _id: 0,
            parentCategoryIds: 1
          }
        }
      ];

      const _categoryIds = await SubSubCategory.aggregate(aggregationPipeline);
      query = {
        '_id': { $in: _categoryIds },
        ...query
      }
    }

    const categories = await Category.find(query)
      .populate({
        path: 'subCategories',
        select: 'name id',
        populate: {
          path: 'subSubCategories',
          select: 'name id'
        }
      });

    // Filter categories without any subcategories (if name filtering is applied)
    const filteredCategories = categories.filter(category => category.subCategories.length > 0 || !name);

    return next(new OkResponse(filteredCategories));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse('Something went wrong'));
  }
};

const getPaginatedCategoriesForSuperAdmin = async (req, res, next) => {
  try {
    const { page, name,limit = 10 } = req.query;
     
    const offset = page ? (parseInt(page, 10) - 1) * limit : 0;
    const regex = new RegExp(name, 'i');

    let query = { };
    if (name) {
      const aggregationPipeline = [
        {
          $lookup: {
            from: 'subcategories',
            localField: 'parentSubCategory',
            foreignField: '_id',
            as: 'parentSubCategoryDoc'
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'parentCategory',
            foreignField: '_id',
            as: 'parentCategoryDoc'
          }
        },
        {
          $match: {
            $or: [
              { name: regex },
              { 'parentSubCategoryDoc.name': regex },
              { 'parentCategoryDoc.name': regex }
            ]
          }
        },
        {
          $group: {
            _id: null,
            parentCategoryIds: { $addToSet: '$parentCategory' }
          }
        },
        {
          $project: {
            _id: 0,
            parentCategoryIds: 1
          }
        }
      ];

      const _matechedParentCategoryIds = await SubSubCategory.aggregate(aggregationPipeline);
      if(!_matechedParentCategoryIds[0]){
        return next(new OkResponse({
          totalCategories: 0,
          categories: [],
          totalPages: 1,
          currentPage: 1,
          hasPrevPage: false,
          hasNextPage: false
        }));
      }
      const _categoryIds = _matechedParentCategoryIds[0].parentCategoryIds
      query = {
        '_id': { $in: _categoryIds},
        ...query
      }
    }

    const options = {
      sort: { createdAt: -1 },
      offset,
      limit
    };

    const categoriesWithCounts = await Category.paginate(query, options).then(async (result) => {
      // Add product count for each category
      const categories = await Promise.all(result.docs.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category._id });
        return { ...category._doc, product_count: productCount };
      }));

      return { ...result, docs: categories };
    });

    return next(new OkResponse({
      totalCategories: categoriesWithCounts.totalDocs,
      categories: categoriesWithCounts.docs,
      totalPages: categoriesWithCounts.totalPages,
      currentPage: categoriesWithCounts.page,
      hasPrevPage: categoriesWithCounts.hasPrevPage,
      hasNextPage: categoriesWithCounts.hasNextPage
    }));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse('Something went wrong'));
  }
};


const getCategoryById = async (req, res, next) => {
  try {
    const { id:categoryId } = req.params;

    // Find the category and populate subcategories
    const category = await Category.findById(categoryId)
      .populate({
        path: 'subCategories',
        model: 'SubCategory',
        populate: {
          path: 'subSubCategories',
          model: 'SubSubCategory'
        }
      });

    if (!category) {
      return next(new BadRequestResponse('Category not found'));
    }

    // Convert the Mongoose document to a JSON object
    const categoryData = category.toJSON();

    // Function to recursively set editable to false and format the response
    const formatResponse = (data, type, parentId=null) => {
      return {
        id: data._id || data.id,
        name: data.name,
        type: type,
        parentId: parentId,
        editable: false,
        children: data.subCategories?.map(subCat => formatResponse(subCat, 'subcategory',data._id)) || 
                  data.subSubCategories?.map(subSubCat => formatResponse(subSubCat, 'sub-subcategory',data._id)) || []
      };
    };

    // Format the category data
    const formattedCategory = formatResponse(categoryData, 'category');

    res.json(formattedCategory);
  } catch (error) {
    console.error('Error fetching category:', error);
    return next(new BadRequestResponse('Failed to fetch category'));
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, children } = req.body;

    // Validate that each category includes at least one subcategory.
    if (!children || children.length === 0) {
      return next(new BadRequestResponse('Category must have at least one subcategory.'));
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
    const saveChildren = async (children, parentId = null, parentType = null, parentCategoryId = null) => {
      let savedChildrenIds = [];

      for (const child of children) {
        let savedChildId = null;

        // Handle subcategory creation and its children.
        if (child.type === 'subcategory') {
          // Ensure subcategories contain at least one sub-subcategory.
          if (!child.children || child.children.length === 0) {
            return next(new BadRequestResponse('Subcategory must have at least one sub-subcategory.'));
          }

          // Create and save a new SubCategory.
          const newSubCategory = new SubCategory({ name: child.name });
          const savedSubCategory = await newSubCategory.save();
          savedChildId = savedSubCategory._id;

          // Recursively save sub-subcategories, passing the current subcategory's ID.
          const subSubCategoriesIds = await saveChildren(child.children, savedChildId, 'SubSubCategory', parentCategoryId);

          // Update the SubCategory with references to its SubSubCategories.
          savedSubCategory.subSubCategories = subSubCategoriesIds;
          await savedSubCategory.save();
        } 
        // Handle sub-subcategory creation.
        else if (child.type === 'sub-subcategory') {
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
    const subCategoriesIds = await saveChildren(children, null, 'SubCategory', savedCategory._id);

    // Update the main category document with the IDs of the saved subcategories.
    savedCategory.subCategories = subCategoriesIds;
    await savedCategory.save();

    return next(new OkResponse('Category structure saved successfully!'));
  } catch (error) {
    console.error('Error saving category structure:', error);
    return next(new BadRequestResponse('Failed to save category structure'));
  }
};

const updateCategoryById = async (req, res, next) => {
  try {
    // Retrieves the category ID from request parameters for identification.
    const { id: categoryId } = req.params;
    // Destructures the name, children hierarchy, and active status from the request body.
    const { name, children, isActive } = req.body;

    // Attempts to find the existing category by its ID to ensure it exists before updating.
    const category = await Category.findById(categoryId);
    if (!category) {
      // If the category is not found, responds with an error message.
      return next(new BadRequestResponse('Category not found'));
    }

    // Checks if the request intends to update the active status of the category and updates it if so.
    if (isActive !== undefined) {
      category.isActive = isActive; // Updates the category's active status.
      await category.save(); // Saves the change to the database.
      // Responds to the client upon successful update of the active status.
      return next(new OkResponse('Category active status updated successfully!'));
    }

    // Updates the category's name with the provided new name.
    category.name = name;

    /**
    * Defines a function to recursively handle the saving or updating of subcategories and their respective sub-subcategories.
    * 
    * @param {Array} children - The child categories to be saved.
    * @param {mongoose.ObjectId} parentId - The ID of the parent category for subcategories, null for top-level categories.
    * @param {mongoose.ObjectId} parentCategoryId - The ID of the top-level category, used for sub-subcategories.
    * @returns {Promise<Array>} A promise that resolves to an array of IDs of the saved child categories.
    */
    const saveOrUpdateChildren = async (children, parentId = categoryId, parentCategoryId = categoryId) => {
      let savedChildrenIds = []; // Initializes an array to keep track of the saved children's IDs.

      // Iterates over each child element (either a subcategory or a sub-subcategory) to process them.
      for (const child of children) {
        let savedChildId = null; // Initializes a variable to store the saved child's ID.

        // Processes subcategories, either updating existing ones or creating new ones.
        if (child.type === 'subcategory') {
          let subCategory;

          // Determines whether to update an existing subcategory or create a new one based on the provided ID.
          if (child.id && isValidObjectId(child.id)) {
            subCategory = await SubCategory.findById(child.id); // Attempts to find an existing subcategory.
            // If found, updates its name.
            if (subCategory) subCategory.name = child.name;
          } else {
            // Creates a new subcategory with the specified name if no valid ID is provided.
            subCategory = new SubCategory({ name: child.name });
          }

          // Saves the subcategory and records its ID.
          await subCategory.save();
          savedChildId = subCategory._id;

          // Recursively processes any children (sub-subcategories) of the current subcategory, linking them accordingly.
          const subSubCategoryIds = await saveOrUpdateChildren(child.children, savedChildId, parentId);
          // Associates the processed sub-subcategories with their parent subcategory.
          subCategory.subSubCategories = subSubCategoryIds;
          // Saves the updated subcategory, now including references to its sub-subcategories.
          await subCategory.save();
        } else if (child.type === 'sub-subcategory') {
          let subSubCategory;

          // Determines whether to update an existing sub-subcategory or create a new one based on the provided ID.
          if (child.id && isValidObjectId(child.id)) {
            subSubCategory = await SubSubCategory.findById(child.id); // Attempts to find an existing sub-subcategory.
            // If found, updates its name and parent references.
            if (subSubCategory) {
              subSubCategory.name = child.name;
              subSubCategory.parentCategory = parentCategoryId;
              subSubCategory.parentSubCategory = parentId;
            }
          } else {
            // Creates a new sub-subcategory with the specified name and parent references if no valid ID is provided.
            subSubCategory = new SubSubCategory({
              name: child.name,
              parentCategory: parentCategoryId,
              parentSubCategory: parentId,
            });
          }

          // Saves the sub-subcategory and records its ID.
          await subSubCategory.save();
          savedChildId = subSubCategory._id;
        }

        // Adds the IDs of saved or updated children to the tracking array.
        if (savedChildId) {
          savedChildrenIds.push(savedChildId);
        }
      }

      // Returns the array of saved or updated children's IDs.
      return savedChildrenIds;
    };

    // Initiates the process of updating or adding subcategories and sub-subcategories.
    const updatedSubCategoryIds = await saveOrUpdateChildren(children);

    // Updates the category with the new or updated list of subcategory IDs.
    category.subCategories = updatedSubCategoryIds;
    await category.save(); // Saves the updated category to the database.

    // Sends a response back to the client indicating the successful update of the category.
    return next(new OkResponse('Category updated successfully!'));
  } catch (error) {
    console.error('Error updating category:', error);
    return next(new BadRequestResponse('Failed to update category'));
  }
};


const deleteCategoryById = async (req, res, next) => {
  const { id } = { ...req.params }

  if (!id) return next(new BadRequestResponse('Category ID is required'))

  try {
    const category = await Category.findById(id)

    if (!category) return next(new BadRequestResponse('Category not found'))

    if (category.products.length > 0)
      return next(
        new BadRequestResponse("Category has products. You can't delete it!")
      )

    await category.deleteOne()

    return next(new OkResponse(category))
  } catch (error) {
    console.log(error)
    return next(new BadRequestResponse('Something went wrong'))
  }
}

const OrderController = {
  getAllCategoriesForUsersOrVendors,
  getPaginatedCategoriesForSuperAdmin,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById
}

module.exports = OrderController
