const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const { slugify } = require("slugify-unicode");
// const { generateEmbedding } = require("../utils/fetch");

const validateGreaterThanZero = function (val) {
  return val > 0;
};

const validateArrayLength = function (val) {
  return val.length > 0;
};
const validatePositiveNumber = (value) => {
  value = Number(value);
  return !isNaN(value) && value >= 0 ? value : 0;
};
// Custom Validator for unique SKU in variants array
const validateUniqueVariantSKUs = function () {
  const skuSet = new Set();
  for (let variant of this.variants) {
    if (skuSet.has(variant.sku)) {
      return false; // Duplicate SKU found
    }
    skuSet.add(variant.sku);
  }
  return true; // All SKUs are unique
};
const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    subCategory: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    subSubCategory: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubSubCategory",
    },
    pricing: {
      salePrice: {
        type: Number,
        min: 0,
        default: 0,
        // set: validatePositiveNumber,
      },
      costPrice: {
        type: Number,
        required: function () {
          return this.variants.length === 0;
        },
        min: 0,
        default: 0,
        validate: {
          validator: function (val) {
            return this.variants.length === 0 ? val > 0 : true;
          },
          message: "Product cost price is required if there are no variants.",
        },
        set: validatePositiveNumber,
      },
      discount: {
        type: Number,
        min: 0,
        default: 0,
        set: validatePositiveNumber,
        validate: [
          {
            validator: function (val) {
              if (this?.pricing?.salePrice)
                return this?.pricing?.salePrice > val;
              else return true;
            },
            message: "Discount cannot be greater than or equal to sale price.",
          },
          {
            validator: function (val) {
              if (this?.pricing?.costPrice)
                return this?.pricing?.costPrice > val;
              else return true;
            },
            message: "Discount cannot be greater than or equal to cost price.",
          },
        ],
      },
      taxRate: {
        type: Number,
        default: 0,
        set: function (val) {
          if (this.isTaxInclusive) {
            return 0;
          }
          return validatePositiveNumber(val);
        },
      },
      currency: { type: String, default: "BDT", enum: ["BDT"], trim: true },
      isTaxInclusive: {
        type: Boolean,
        default: false,
      },
    },
    inventory: {
      stock: { type: Number, default: 0, min: 0, set: validatePositiveNumber },
      lowStockThreshold: {
        type: Number,
        min: 0,
        default: 0,
        set: validatePositiveNumber,
      },
      trackInventory: { type: Boolean, default: true },
      allowBackorders: {
        type: Boolean,
        default: false,
        set: function (val) {
          if (!this?.inventory?.trackInventory) {
            return false;
          }
          return val;
        },
      },
      inStock: {
        type: Boolean,
        default: false,
        set: function (val) {
          if (!this?.inventory?.trackInventory) {
            return val;
          }
          return false;
        },
      },
    },
    seo: {
      title: {
        type: String,
        trim: true,
        default: "",
      },
      description: {
        type: String,
        trim: true,
        default: "",
      },
      slug: { type: String, trim: true, unique: true },
      metaTags: [String],
    },
    images: {
      type: [
        {
          url: { type: String, required: true, trim: true },
          alt: { type: String, default: "", trim: true },
        },
      ],
      validate: {
        validator: function (val) {
          return val?.length > 0;
        },
        message: "At least one image is required.",
      },
    },

    tags: [{ type: String, trim: true, default: "" }],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    manufacturer: { type: String, trim: true, default: "" },
    attributes: {
      color: { type: String, trim: true, default: "" },
      size: { type: String, trim: true, default: "" },
      material: { type: String, trim: true, default: "" },
      gender: {
        type: String,
        enum: ["male", "female", "unisex", ""],
        default: "",
      },
      condition: {
        type: String,
        enum: ["new", "refurbished", "used", ""],
        default: "",
      },
      customFields: [
        {
          name: { type: String, trim: true, default: "" },
          value: { type: String, trim: true, default: "" },
        },
      ],
    },
    weight: {
      type: Number,
      default: 0,

      // validate: {
      //   validator: function (val) {
      //     return this.variants.length === 0
      //       ? validateGreaterThanZero(val)
      //       : true;
      //   },
      //   message: "Product weight is required if there are no variants.",
      // },
      set: validatePositiveNumber,
    },
    weightUnit: { type: String, default: "kg", enum: ["kg"] },
    dimensions: {
      length: {
        type: Number,
        default: 0,
        // validate: {
        //   validator: function (val) {
        //     return this.variants.length === 0
        //       ? validateGreaterThanZero(val)
        //       : true;
        //   },
        //   message: "Product length is required if there are no variants.",
        // },
        set: validatePositiveNumber,
      },
      width: {
        type: Number,
        default: 0,

        // validate: {
        //   validator: function (val) {
        //     return this.variants.length === 0
        //       ? validateGreaterThanZero(val)
        //       : true;
        //   },
        //   message: "Product width is required if there are no variants.",
        // },
        set: validatePositiveNumber,
      },
      height: {
        type: Number,
        default: 0,

        // validate: {
        //   validator: function (val) {
        //     return this.variants.length === 0
        //       ? validateGreaterThanZero(val)
        //       : true;
        //   },
        //   message: "Product height is required if there are no variants.",
        // },
        set: validatePositiveNumber,
      },
      unit: { type: String, default: "cm", enum: ["cm"] },
    },
    variants: [
      {
        variantName: {
          type: String,
          default: "",
          required: [true, "Variant name cannot be empty."],
          trim: true,
        },
        sku: { type: String, trim: true, default: "" },
        pricing: {
          salePrice: {
            type: Number,
            min: 0,
            default: 0,
            // set: validatePositiveNumber,
          },
          costPrice: {
            type: Number,
            required: true,
            min: 0,
            validate: {
              validator: validateGreaterThanZero,
              message: "Variant cost price is required and cannot be zero.",
            },
            set: validatePositiveNumber,
          },
          discount: {
            type: Number,
            min: 0,
            default: 0,
            set: validatePositiveNumber,
            validate: [
              {
                validator: function (val) {
                  if (this?.pricing?.salePrice)
                    return this?.pricing?.salePrice > val;
                  else return true;
                },
                message:
                  "Variant discount cannot be greater than or equal to sale price.",
              },
              {
                validator: function (val) {
                  return this?.pricing?.costPrice > val;
                },
                message:
                  "Variant discount cannot be greater than or equal to cost price.",
              },
            ],
          },
        },
        inventory: {
          stock: {
            type: Number,
            default: 0,
            min: 0,
            set: validatePositiveNumber,
          },
          lowStockThreshold: {
            type: Number,
            min: 0,
            default: 0,
            set: validatePositiveNumber,
          },
          trackInventory: { type: Boolean, default: true },
          allowBackorders: {
            type: Boolean,
            default: false,
            set: function (val) {
              if (!this?.inventory?.trackInventory) {
                return false;
              }
              return val;
            },
          },
          inStock: {
            type: Boolean,
            default: false,
            set: function (val) {
              if (!this?.inventory?.trackInventory) {
                return val;
              }
              return false;
            },
          },
        },
        weight: {
          type: Number,
          default: 0,

          // required: true,
          // validate: {
          //   validator: validateGreaterThanZero,
          //   message: "Variant weight is required and cannot be zero.",
          // },
          set: validatePositiveNumber,
        },
        weightUnit: { type: String, default: "kg", enum: ["kg"] },
        dimensions: {
          length: {
            type: Number,
            default: 0,

            // required: true,
            // validate: {
            //   validator: validateGreaterThanZero,
            //   message: "Variant length is required and cannot be zero.",
            // },
            set: validatePositiveNumber,
          },
          width: {
            type: Number,
            default: 0,

            // required: true,
            // validate: {
            //   validator: validateGreaterThanZero,
            //   message: "Variant width is required and cannot be zero.",
            // },
            set: validatePositiveNumber,
          },
          height: {
            type: Number,
            default: 0,

            // required: true,
            // validate: {
            //   validator: validateGreaterThanZero,
            //   message: "Variant height is required and cannot be zero.",
            // },
            set: validatePositiveNumber,
          },
          unit: { type: String, default: "cm", enum: ["cm"] },
        },
        color: { type: String, trim: true, default: "" },
        size: { type: String, trim: true, default: "" },
        material: { type: String, trim: true, default: "" },
        gender: {
          type: String,
          enum: ["male", "female", "unisex", ""],
          default: "",
        },
        condition: {
          type: String,
          enum: ["new", "refurbished", "used", ""],
          default: "",
        },
        images: {
          type: [
            {
              url: { type: String, required: true, trim: true },
              alt: { type: String, default: "", trim: true },
            },
          ],
          validate: [validateArrayLength, "At least one image is required."],
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      set: validatePositiveNumber,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    embedding: {
      type: [Number],
    },
    status: {
      type: String,
      enum: ["Pending", "Published", "Rejected"],
      default: "Pending",
    },
    publishedAt: { type: Date, default: null },
    productSequence: {
      type: Number,
      default: 0,
      set: validatePositiveNumber,
    },
    variantSequence: {
      type: Number,
      default: 0,
      set: validatePositiveNumber,
    },
  },
  { timestamps: true }
);

ProductSchema.path("variants").validate(
  validateUniqueVariantSKUs,
  "Variant SKUs must be unique within the product."
);

const autoPopulate = function (next) {
  this.populate("brand", "name _id");
  next();
};

ProductSchema.pre("findOne", autoPopulate);
ProductSchema.pre("find", autoPopulate);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

ProductSchema.post("save", async function (product, next) {
  if (!product.sku) {
    product.sku = "SKU-" + String(product.productSequence).padStart(6, "0");
    product.seo.slug = slugify(`${product.name}-${product.sku}`);

    if (product.variants && product.variants.length > 0) {
      if (!product.variantSequence) {
        product.variantSequence = 0;
      }

      // For each variant, if SKU is missing, generate it
      product.variants.forEach((variant) => {
        if (!variant.sku) {
          product.variantSequence += 1;
          variant.sku = `${product.sku}-${String(
            product.variantSequence
          ).padStart(6, "0")}`;
          needToSave = true;
        }
      });
    }

    await product.save();
  }

  // // Handle missing SKUs for variants
  // if (product.variants && product.variants.length > 0) {
  //   if (!product.variantSequence) {
  //     product.variantSequence = 0;
  //   }

  //   // For each variant, if SKU is missing, generate it
  //   product.variants.forEach((variant) => {
  //     if (!variant.sku) {
  //       console.log("------post variant sku", variant?.sku);
  //       product.variantSequence += 1;
  //       variant.sku = `${product.sku}-${String(
  //         product.variantSequence
  //       ).padStart(6, "0")}`;
  //       needToSave = true;
  //     }
  //   });
  // }

  // // Save the product again if any changes were made
  // if (needToSave) {
  //   console.log("------saving product with new SKUs");
  //   await product.save();
  // }

  next();
});

ProductSchema.pre("save", function (next) {
  this.seo.title = this.name;
  this.seo.description = this.description;
  this.seo.metaTags = this.tags;

  if (this.status === "Published") {
    let validationErrors = [];

    if (this.variants.length) {
      this.variants.forEach((variant, i) => {
        if (variant.pricing.salePrice <= 0) {
          validationErrors.push(
            `Variant at position (${i + 1}), salePrice must be greater than 0.`
          );
        }
      });
    } else {
      if (this?.pricing?.salePrice <= 0) {
        validationErrors.push(
          "Publishing product requires a salePrice greater than 0."
        );
      }
    }

    // If there are validation errors, pass them to next() as a validation error
    if (validationErrors.length > 0) {
      const err = new Error(validationErrors.join(" "));
      return next(err);
    }
  }

  // If no validation errors, proceed with saving
  next();

  next();
});

ProductSchema.plugin(AutoIncrement, {
  id: "product_seq",
  inc_field: "productSequence",
});
ProductSchema.plugin(uniqueValidator, { message: "is already taken." });
ProductSchema.plugin(mongoosePaginate);
// Creating an index for 'pricing.salePrice'
ProductSchema.index({ "pricing.salePrice": 1 });

// Creating a multikey index for 'variants.pricing.salePrice'
ProductSchema.index({ "variants.pricing.salePrice": 1 });

ProductSchema.methods.toJSON = function () {
  return {
    id: this._id,
    name: this.name,
    company: this.company,
    sku: this.sku,
    description: this.description,
    category: this.category,
    subCategory: this.subCategory,
    subSubCategory: this.subSubCategory,
    pricing: this.pricing,
    inventory: this.inventory,
    seo: this.seo,
    images: this.images,
    tags: this.tags,
    brand: this.brand,
    manufacturer: this.manufacturer,
    attributes: this.attributes,
    weight: this.weight,
    dimensions: this.dimensions,
    variants: this.variants,
    averageRating: this.averageRating,
    reviews: this.reviews,
    isActive: this.isActive,
    // embedding: this.embedding,
    status: this.status,
    // publishedAt: this.publishedAt,
    // productSequence: this.productSequence,
    // createdAt: this.createdAt,
    // updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Product", ProductSchema);
