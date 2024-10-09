const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");
const Product = require("./Product");

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    reviewedDate: {
      type: Date,
      default: new Date(),
    },
    title: {
      type: String,
      default: "Great Experience",
    },
    description: {
      type: String,
      // required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    order: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    isApproved: {
      type: Boolean,
      required: true,
      default: true,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

const autoPopulate = function (next) {
  this.populate("product", "name _id") // Automatically populate the 'product' field with 'name' and '_id'
    .populate("user", "firstName lastName email _id profileImage"); // Automatically populate the 'user' field with 'name', 'email', and '_id'
  next();
};

ReviewSchema.pre("findOne", autoPopulate);
ReviewSchema.pre("find", autoPopulate);

ReviewSchema.plugin(uniqueValidator, { message: "is already taken." });
ReviewSchema.plugin(mongoosePaginate);

ReviewSchema.post("save", async function (review) {
  await recalculateAverageRating(review.product);
});

ReviewSchema.post("remove", async function (review) {
  await recalculateAverageRating(review.product);
});

async function recalculateAverageRating(productId) {
  const product = await Product.findById(productId).populate("reviews");

  if (product) {
    const reviews = product.reviews;
    let totalRating = 0;
    let validReviewCount = 0;

    for (const review of reviews) {
      if (!isNaN(review.rating)) {
        totalRating += review.rating;
        validReviewCount++;
      }
    }

    const averageRating =
      validReviewCount > 0 ? totalRating / validReviewCount : 0;
    product.averageRating = averageRating;
    await product.save({ validateModifiedOnly: true });
  }
}

ReviewSchema.methods.toJSON = function () {
  return {
    id: this._id,
    title: this.title,
    user: this.user,
    rating: this.rating,
    reviewedDate: this.reviewedDate,
    description: this.description,
    order: this.order,
    product: this.product,
    images: this.images,
    isActive: this.isActive,
    isApproved: this.isApproved,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("Review", ReviewSchema);
