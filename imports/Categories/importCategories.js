const mongoose = require('mongoose');
const fs = require('fs');
const { Category, SubCategory, SubSubCategory } = require('../../models/Category');

// Function to connect to the database
mongoose.connect('mongodb://admin:admin@ac-nzvtyfx-shard-00-00.ol4jasv.mongodb.net:27017,ac-nzvtyfx-shard-00-01.ol4jasv.mongodb.net:27017,ac-nzvtyfx-shard-00-02.ol4jasv.mongodb.net:27017/?ssl=true&replicaSet=atlas-b8ak7i-shard-0&authSource=admin&retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const importCategories = async () => {
  try {
    // Read the JSON file
    const data = JSON.parse(fs.readFileSync('/home/devfum-01/Biking-Gears-Ecomerce-Store/server/imports/Categories/categories.json', 'utf-8'));

    // Iterate over the main categories
    for (const categoryName in data) {
      let category = new Category({ name: categoryName, subCategories: [] });
      
      const subCategoriesData = data[categoryName];
      for (const subCategoryName in subCategoriesData) {
        let subCategory = new SubCategory({
          name: subCategoryName,
          subSubCategories: [],
        });

        // Iterate over the sub-sub-categories
        const subSubCategoriesNames = subCategoriesData[subCategoryName];
        for (const subSubCategoryName of subSubCategoriesNames) {
          let subSubCategory = new SubSubCategory({
            name: subSubCategoryName,
            parentCategory: category._id,
            parentSubCategory: subCategory._id,
          });
          await subSubCategory.save(); // Save the sub-sub category
          subCategory.subSubCategories.push(subSubCategory._id); // Link to sub-sub category
        }

        await subCategory.save(); // Save the sub category
        category.subCategories.push(subCategory._id); // Link to sub category
      }

      await category.save(); // Save the main category
    }
    console.log('Import completed successfully.');
  } catch (error) {
    console.error('Error during import:', error);
  }
};

importCategories().then(() => mongoose.disconnect());
