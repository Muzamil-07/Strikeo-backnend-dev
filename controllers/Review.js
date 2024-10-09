/** @format */

const { OkResponse, BadRequestResponse } = require("express-http-response");
const Order = require("../models/Order");
const Review = require("../models/Review");;
const Product = require("../models/Product");

const submitReview = async (req, res, next) => {
  const user = req?.user?.id || req?.user?._id;
  const { rating, description, images, order, product, title } = req.body;

  try {
    if (!user) return next(new BadRequestResponse("User not found"));

    // Check if the order is completed
    const userOrder = await Order.findById(order);

    if (!userOrder || !userOrder?.status === "Delivered") {
      return next(
        new BadRequestResponse(
          "You cannot submit a review before the order is completed!"
        )
      );
    }

    // Check if the user has already reviewed the product
    const existingReview = await Review.findOne({ user, product, order });
    if (existingReview) {
      return next(
        new BadRequestResponse(
          "You have already submitted a review for this product!"
        )
      );
    }

    // Create a new review object
    const review = new Review({
      rating,
      description,
      images,
      order,
      product,
      user,
      title,
    });

    await review.save();

    return next(new OkResponse(review));
  } catch (error) {
    console.log(error.message);
    return next(new BadRequestResponse(error?.message));
  }
};
const getReviewsByProductAndUser = async (req, res, next) => {
  const user = req?.user?.id || req?.user?._id;
  const { productId, orderId } = req.params; // Assume product ID is passed as a parameter

  try {
    if (!user) return next(new BadRequestResponse("User not found"));
    if (!productId)
      return next(new BadRequestResponse("Product ID is required"));

    // Find reviews for the specific product and user
    const reviews = await Review.find({ product: productId, user });

    if (!reviews || reviews.length === 0) {
      return next(
        new BadRequestResponse("No reviews found for this product by the user")
      );
    }

    return next(new OkResponse(reviews));
  } catch (error) {
    console.log(error.message);
    return next(new BadRequestResponse(error?.message));
  }
};

const updateReview = async (req, res, next) => {
  const user = req?.user?.id || req?.user?._id;
  const { rating, description, images, title } = req.body;
  const { reviewId } = req.params; // Assume review ID is passed as a parameter

  try {
    if (!user) return next(new BadRequestResponse("User not found"));

    // Find the existing review by ID
    const review = await Review.findById(reviewId);

    // Check if the review exists and belongs to the user
    if (!review) {
      return next(new BadRequestResponse("Review not found"));
    }
    if (review.user.id !== user.toString()) {
      return next(
        new BadRequestResponse(
          "You do not have permission to update this review"
        )
      );
    }

    // Update the review fields
    review.rating = rating ?? 0;
    review.description = description ?? "";
    review.title = title ?? "";
    review.images = images ?? [];

    // Save the updated review
    await review.save();

    return next(new OkResponse(review));
  } catch (error) {
    console.log(error.message);
    return next(new BadRequestResponse(error?.message));
  }
};
const approvedAndActiveReview = async (req, res, next) => {
  const user = req?.user?.id || req?.user?._id;
  const { isActive, isApproved } = req.body;
  const { reviewId } = req.params; // Assume review ID is passed as a parameter

  try {
    if (!user)
      return next(
        new BadRequestResponse("You are not allowed to delete this review")
      );
    // Find the existing review by ID
    const review = await Review.findById(reviewId);

    // Check if the review exists and belongs to the user
    if (!review) {
      return next(new BadRequestResponse("Review not found"));
    }

    // Update the review fields
    if (isActive) review.isActive = isActive;
    if (isApproved) review.isApproved = isApproved;

    // Save the updated review
    await review.save();

    return next(new OkResponse(review));
  } catch (error) {
    console.log(error.message);
    return next(new BadRequestResponse(error?.message));
  }
};

const deleteUserReview = async (req, res, next) => {
  const user = req?.user?.id || req?.user?._id;
  const { reviewId } = req.params; // Assume review ID is passed as a parameter

  try {
    if (!user) return next(new BadRequestResponse("User not found"));

    // Find the review by ID
    const review = await Review.findById(reviewId);

    // Check if the review exists and belongs to the user
    if (!review) {
      return next(new BadRequestResponse("Review not found"));
    }
    if (review.user.id !== user.toString()) {
      return next(
        new BadRequestResponse(
          "You do not have permission to delete this review"
        )
      );
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    return next(new OkResponse("Review deleted successfully"));
  } catch (error) {
    console.log(error.message);
    return next(new BadRequestResponse(error?.message));
  }
};
const deleteUserReviewByVendor = async (req, res, next) => {
  const user = req?.user?.id || req?.user?._id;
  const { reviewId } = req.params; // Assume review ID is passed as a parameter

  try {
    if (!user)
      return next(
        new BadRequestResponse("You are not allowed to delete this review")
      );

    // Find the review by ID
    const review = await Review.findById(reviewId);

    // Check if the review exists and belongs to the user
    if (!review) {
      return next(new BadRequestResponse("Review not found"));
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    return next(new OkResponse("Review deleted successfully"));
  } catch (error) {
    console.log(error.message);
    return next(new BadRequestResponse(error?.message));
  }
};

const getReviews = async (req, res, next) => {
  try {
    const user = req?.user?.id || req?.user?._id || null; // Extract user ID

    const { limit, page, order, product } = req.query;
    const limitPage = parseInt(limit, 10) || 10; // Ensure limit is an integer, default to 10
    const currentPage = parseInt(page, 10) || 1; // Ensure page is an integer, default to 1
    const offset = (currentPage - 1) * limitPage;

    // Build the query object dynamically based on provided filters
    const query = {
      ...(user ? { user } : { isActive: true, isApproved: true }),
      ...(product && { product }), // Filter by product if provided
      ...(order && { order }), // Filter by order if provided
    };

    const options = {
      offset,
      limit: limitPage,
      sort: { createdAt: -1 }, // Adjust sorting as needed
    };

    const reviews = await Review.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: reviews.totalDocs,
        reviews: reviews.docs,
        totalPages: reviews.totalPages,
        currentPage: reviews.page, // Correctly set current page
        hasPrevPage: reviews.hasPrevPage,
        hasNextPage: reviews.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error.message);
    return next(new BadRequestResponse(error.message));
  }
};
const getReviewsByProductSlug = async (req, res, next) => {
  try {
    const userId = req?.user?.id || req?.user?._id || null; // Extract user ID
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return next(new BadRequestResponse("Product not found"));

    const { limit, page } = req.query;
    const limitPage = parseInt(limit, 10) || 10; // Ensure limit is an integer, default to 10
    const currentPage = parseInt(page, 10) || 1; // Ensure page is an integer, default to 1
    const offset = (currentPage - 1) * limitPage;

    // Build the query object dynamically based on provided filters
    const query = {
      product: product.id.toString(), // Filter by product ID
      ...(userId
        ? {
            $or: [
              { user: userId }, // Include reviews by the logged-in user
              { isActive: true, isApproved: true }, // Include approved reviews by other users
            ],
          }
        : { isActive: true, isApproved: true }), // Only approved reviews for guests
    };

    const options = {
      offset,
      limit: limitPage,
      sort: { createdAt: -1 }, // Adjust sorting as needed
    };

    const reviews = await Review.paginate(query, options);

    return next(
      new OkResponse({
        product,
        totalItems: reviews.totalDocs,
        reviews: reviews.docs,
        totalPages: reviews.totalPages,
        currentPage: reviews.page, // Correctly set current page
        hasPrevPage: reviews.hasPrevPage,
        hasNextPage: reviews.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error.message);
    return next(new BadRequestResponse(error.message));
  }
};

const ReviewController = {
  submitReview,
  getReviewsByProductAndUser,
  updateReview,
  getReviews,
  deleteUserReview,
  deleteUserReviewByVendor,
  approvedAndActiveReview,
  getReviewsByProductSlug,
};

module.exports = ReviewController;
