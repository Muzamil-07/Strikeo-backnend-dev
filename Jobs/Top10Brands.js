const cron = require("node-cron");
const { SubSubCategory } = require("../models/Category");
const Top10Brands = require("../models/Top10Brands");
const JobState = require("../models/JobState");
const Product = require("../models/Product");
const Brand = require("../models/Brand");

// Function to get the last processed subsubcategory for a specific job from the JobState collection
const getLastProcessedSubSubCategory = async (jobName) => {
  const jobState = await JobState.findOne({ jobName });
  return jobState ? jobState.lastSubSubCategory : null;
};

// Function to update the last processed subsubcategory for a specific job in the JobState collection
const updateLastProcessedSubSubCategory = async (jobName, subSubCategoryId) => {
  try {
    // Upsert the job state: if jobName exists, update it; if not, create a new entry
    await JobState.updateOne(
      { jobName },
      { lastSubSubCategory: subSubCategoryId },
      { upsert: true }
    );
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate jobName error
      console.error(`Duplicate jobName detected: ${jobName}`);
    } else {
      console.error("Error updating job state:", error);
    }
  }
};

const updateTopBrands = async (subSubCategory, excludingBrandId) => {
  try {
    const batchSize = 1000; // Define the batch size based on available memory and performance needs
    let totalProcessed = 0;

    // Use aggregation with a cursor for batch processing
    const cursor = Product.aggregate([
      {
        $match: {
          subSubCategory: subSubCategory._id,
          brand: { $ne: excludingBrandId },
        },
      }, // Filter by subsubcategory
      { $project: { brand: 1 } }, // Project only the brand field to minimize data processed
      { $group: { _id: "$brand", productCount: { $sum: 1 } } }, // Group by brand and count products
      { $sort: { productCount: -1 } }, // Sort by the number of products in descending order
    ]).cursor({ batchSize });

    const brandCounts = []; // Collect all brand counts in memory in batches

    // Process the cursor in batches
    for (
      let doc = await cursor.next();
      doc != null;
      doc = await cursor.next()
    ) {
      brandCounts.push(doc);
      totalProcessed += 1;

      if (totalProcessed % batchSize === 0) {
        console.log(
          `Processed ${totalProcessed} products for subsubcategory ${subSubCategory.name}`
        );
      }
    }

    const topBrands = brandCounts.slice(0, 10).map((brand) => brand._id);

    // Update the Top10Brands schema for the subsubcategory
    await Top10Brands.updateOne(
      { subSubCategory: subSubCategory._id },
      { brands: topBrands },
      { upsert: true } // Upsert option creates the entry if it doesn't exist
    );
  } catch (error) {
    // console.error(
    //   `Error updating top brands for subsubcategory ${subSubCategory.name}:`,
    //   error
    // );
    throw new Error(error);
  }
};

// Function to process top brands for all sub-subcategories in chunks for a specific job
const updateTopBrandsForSubSubCategories = async () => {
  const jobName = "TopBrandsCron"; // Unique identifier for this cron job

  try {
    const totalSubSubCategories = await SubSubCategory.countDocuments();
    const chunkSize = 50;
    const totalChunks = Math.ceil(totalSubSubCategories / chunkSize);

    console.log(
      `************* Processing ${totalSubSubCategories} sub-subcategories in ${totalChunks} chunks of ${chunkSize} *************`
    );

    let lastSubSubCategoryId = await getLastProcessedSubSubCategory(jobName);
    const excludingBrand = await Brand.findOne({ name: "n/a" });
    let hasMoreSubSubCategories = true; // Track if there are more categories to process

    while (hasMoreSubSubCategories) {
      // Find the next chunk of sub-subcategories
      const query = lastSubSubCategoryId
        ? { _id: { $gt: lastSubSubCategoryId } } // Resume from last processed subsubcategory
        : {}; // Start from the beginning

      const subSubCategories = await SubSubCategory.find(query).limit(
        chunkSize
      );

      // If no more sub-subcategories are found, exit the loop
      if (subSubCategories.length === 0) {
        console.log(
          "************* All sub-subcategories processed *************"
        );
        hasMoreSubSubCategories = false;
        // Reset the job state
        await updateLastProcessedSubSubCategory(jobName, null);
        break;
      }

      // Process each subsubcategory in the current chunk
      for (const subSubCategory of subSubCategories) {
        try {
          // Call the function to update top brands for the subsubcategory
          await updateTopBrands(subSubCategory, excludingBrand?._id);

          // Update the last processed subsubcategory after successful completion
          lastSubSubCategoryId = subSubCategory._id;
          await updateLastProcessedSubSubCategory(jobName, subSubCategory._id);

          console.log(
            `*** Successfully updated top brands for ${subSubCategory.name} ***`
          );
        } catch (error) {
          console.error(
            `Error updating top brands for subsubcategory ${subSubCategory.name}:`,
            error
          );
        }
      }
    }

    console.log(
      "************* Top brands updated for all sub-subcategories *************"
    );
  } catch (error) {
    console.error("Error updating top brands for sub-subcategories:", error);
  }
};

const scheduleTop10BrandsJob = () => {
  // Schedule the cron job to run every 24 hours (at midnight)
  cron.schedule(
    "40 18 * * *",
    async () => {
      console.log(
        "Running cron job to update top brands for sub-subcategories..."
      );
      await updateTopBrandsForSubSubCategories();
    },
    { name: "Update Top 10 Brands for all Sub-SubCategories" }
  );

  console.log(
    "Cron job scheduled => Update Top 10 Brands for all Sub-SubCategories"
  );
};
module.exports = scheduleTop10BrandsJob;
