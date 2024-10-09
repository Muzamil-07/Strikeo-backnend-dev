const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const mongoosePaginate = require("mongoose-paginate-v2");
const { getNumber } = require("../utils/stringsNymber");
const Product = require("./Product");
const { handleOrderErrorsAndNotify } = require("../utils/mailer");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const validatePositiveNumber = (value) => {
  value = Number(value);
  return !isNaN(value) && value >= 0 ? value : 0;
};

// Pricing schema for productSnapshot with tax and currency
const pricingProductSchema = {
  salePrice: {
    type: Number,
    required: function () {
      return !this.variantSKU;
    },
    min: 0,
    default: 0,
    validate: {
      validator: function (val) {
        return !this.variantSKU ? val > 0 : true;
      },
      message: "Product sale price is required.",
    },
    set: validatePositiveNumber,
  },
  costPrice: {
    type: Number,
    min: 0,
    default: 0,
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
          return this?.productSnapshot?.pricing?.salePrice
            ? this?.productSnapshot?.pricing?.salePrice > val
            : true;
        },
        message: "Discount cannot be greater than or equal to sale price.",
      },
      {
        validator: function (val) {
          return val < this?.productSnapshot?.pricing?.costPrice;
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
};

// Pricing schema for variantSnapshot without tax and currency
const pricingVariantSchema = {
  salePrice: {
    type: Number,
    set: validatePositiveNumber,
    validate: {
      validator: function (value) {
        return this.variantSKU ? value > 0 : true;
      },
      message: "Variant Sale price is required.",
    },
  },
  costPrice: {
    type: Number,
    min: 0,
    default: 0,
    set: validatePositiveNumber,
  },
  discount: {
    type: Number,
    default: 0,
    set: validatePositiveNumber,
    validate: [
      {
        validator: function (val) {
          return this?.variantSnapshot?.pricing?.salePrice
            ? this?.variantSnapshot?.pricing?.salePrice > val
            : true;
        },
        message: "Discount cannot be greater than or equal to sale price.",
      },
      {
        validator: function (val) {
          return val < this?.variantSnapshot?.pricing?.costPrice;
        },
        message: "Discount cannot be greater than or equal to cost price.",
      },
    ],
  },
};

const productDimensionsSchema = {
  length: {
    type: Number,
    // validate: {
    //   validator: function (val) {
    //     return !this.variantSKU ? val > 0 : true;
    //   },
    //   message: "Product length is required.",
    // },
    set: validatePositiveNumber,
  },
  width: {
    type: Number,
    // validate: {
    //   validator: function (val) {
    //     return !this.variantSKU ? val > 0 : true;
    //   },
    //   message: "Product width is required.",
    // },
    set: validatePositiveNumber,
  },
  height: {
    type: Number,
    // validate: {
    //   validator: function (val) {
    //     return !this.variantSKU ? val > 0 : true;
    //   },
    //   message: "Product height is required.",
    // },
    set: validatePositiveNumber,
  },
  unit: { type: String, default: "cm", enum: ["cm"] },
};
const variantDimensionsSchema = {
  length: {
    type: Number,
    // validate: {
    //   validator: function (val) {
    //     return this.variantSKU ? val > 0 : true;
    //   },
    //   message: "Variant length is required.",
    // },
    set: validatePositiveNumber,
  },
  width: {
    type: Number,
    // validate: {
    //   validator: function (val) {
    //     return this.variantSKU ? val > 0 : true;
    //   },
    //   message: "Variant width is required.",
    // },
    set: validatePositiveNumber,
  },
  height: {
    type: Number,
    // validate: {
    //   validator: function (val) {
    //     return this.variantSKU ? val > 0 : true;
    //   },
    //   message: "Variant height is required.",
    // },
    set: validatePositiveNumber,
  },
  unit: { type: String, default: "cm", enum: ["cm"] },
};

const attributesSchema = {
  color: { type: String, default: "" },
  size: { type: String, default: "" },
  material: { type: String, default: "" },
  condition: { type: String, default: "" },
};

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        review: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Review",
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        variantSKU: {
          type: String,
          default: "",
        },
        // Product snapshot schema
        productSnapshot: {
          name: {
            type: String,
            validate: {
              validator: function () {
                return (
                  !this.variantSKU ||
                  (this.variantSKU && this.productSnapshot?.name)
                );
              },
              message: "Product name is required.",
            },
            required: function () {
              return !this.variantSKU;
            },
          },
          images: {
            type: [
              {
                url: { type: String, required: true, trim: true },
                alt: { type: String, default: "", trim: true },
              },
            ],
          },
          sku: {
            type: String,
            required: function () {
              return !this.variantSKU;
            },
          },
          pricing: pricingProductSchema,
          weight: {
            type: Number,
            // validate: {
            //   validator: function (val) {
            //     return !this.variantSKU ? val > 0 : true;
            //   },
            //   message: "Product weight is required.",
            // },
            set: validatePositiveNumber,
          },
          dimensions: productDimensionsSchema,
          attributes: attributesSchema,
        },
        // Variant snapshot schema
        variantSnapshot: {
          type: Object,
          required: function () {
            return !!this.variantSKU;
          },
          default: null,
          validate: {
            validator: function (val) {
              return this.variantSKU ? !!val : val === null;
            },
            message: "variantSnapshot is required when variantSKU is provided.",
          },
          variantName: {
            type: String,
            required: function () {
              return !!this.variantSKU;
            },
            validate: {
              validator: function () {
                return this.variantSKU
                  ? this.variantSnapshot?.variantName
                  : true;
              },
              message: "Variant name is required.",
            },
          },
          images: {
            type: [
              {
                url: { type: String, required: true, trim: true },
                alt: { type: String, default: "", trim: true },
              },
            ],
          },
          sku: {
            type: String,
            required: function () {
              return !!this.variantSKU;
            },
          },
          pricing: pricingVariantSchema,
          weight: {
            type: Number,
            // required: function () {
            //   return !!this.variantSKU;
            // },
            set: validatePositiveNumber,
          },
          dimensions: variantDimensionsSchema,
          attributes: attributesSchema,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },
    statusHistory: {
      type: Map,
      of: Date,
      default: {
        Pending: new Date(),
      },
    },
    vendorBill: {
      type: Number,
      default: 0,
    },
    customerBill: {
      type: Number,
      required: true,
      min: 0,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    shippingDetails: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      zone: String,
      area: String,
      state: String,
      country: String,
      zipCode: String,
      instruction: String,
      shippingType: {
        type: String,
        enum: ["Standard", "Express", "Same-Day", "Pickup Point"],
        default: "Standard",
      },
      shippingCost: { type: Number, default: 0 },
      estimatedDelivery: { type: Date },
    },
    orderedAt: {
      type: Date,
      default: Date.now,
    },
    orderSequence: {
      type: Number,
    },
    confirm_token: {
      type: {
        token: String,
        link: String,
        expires: Date,
      },
      default: null,
    },
  },
  { timestamps: true }
);

// Plugins and hooks

OrderSchema.plugin(AutoIncrement, {
  id: "order_seq",
  inc_field: "orderSequence",
});
OrderSchema.plugin(uniqueValidator, { message: "is already taken." });
OrderSchema.plugin(mongoosePaginate);

OrderSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "order",
});

OrderSchema.post("save", async function (order, next) {
  if (!order.orderNumber) {
    order.orderNumber = String(order.orderSequence).padStart(6, "0");
    await order.save();
  }
  next();
});

OrderSchema.pre("save", async function (next) {
  if (this.isNew) {
    let vendorBill = 0;
    let notFoundCount = 0; // Counter for items that are not found
    const validItems = []; // To store valid items for order creation

    // Only track inventory reduction for new orders
    for (const item of this.items) {
      const product = await Product.findById(item?.product);
      if (!product || !product?.isActive) {
        // Track product not found error
        console.log(`* Variant with id => ${item?.product} not found. *`);
        notFoundCount++;
        continue; // Skip to next item
      }

      let variant = null;
      const quantity = getNumber(item.quantity);
      const productStock = getNumber(product?.inventory?.stock);

      if (item?.variantSKU) {
        variant = product?.variants.find((v) => v?.sku === item?.variantSKU);
        if (!variant) {
          console.log(`* Variant with SKU => ${item?.variantSKU} not found. *`);
          // Track variant not found error
          notFoundCount++;
          continue; // Skip to next item
        }

        const variantStock = getNumber(variant?.inventory?.stock);

        if (variant?.inventory?.trackInventory) {
          if (variant?.inventory?.allowBackorders) {
            console.log(
              `* Backorders are allowed for variant SKU: ${variant?.sku}. No stock reduction. *`
            );
            vendorBill += getNumber(variant?.pricing?.costPrice) * quantity; // Accumulate cost
            validItems.push(item); // Add item to valid items since we allow backorders
          } else {
            if (quantity > variantStock || variantStock === 0) {
              console.log(
                `* Variant with SKU => ${variant?.sku} is out of stock. *`
              );
              continue; // Skip to next item
            }

            // Update stock for the variant using `updateOne`
            await Product.updateOne(
              { _id: item?.product, "variants.sku": item.variantSKU },
              {
                $set: { "variants.$.inventory.stock": variantStock - quantity },
              }
            );

            // Accumulate vendor bill
            vendorBill += getNumber(variant?.pricing?.costPrice) * quantity;

            // Add the valid item to the validItems array
            validItems.push(item);
          }
        } else {
          console.log(
            `* Tracking inventory is Off for variant SKU => ${variant?.sku} *`
          );
          validItems.push(item); // Add item to valid items since we're not tracking inventory
        }
      } else {
        item.variantSnapshot = null;

        if (product?.inventory?.trackInventory) {
          if (product?.inventory?.allowBackorders) {
            console.log(
              `Backorders are allowed for product SKU => ${product?.sku}. No stock reduction.`
            );
            vendorBill += getNumber(product?.pricing?.costPrice) * quantity; // Accumulate cost
            validItems.push(item); // Add item to valid items since we allow backorders
          } else {
            if (quantity > productStock || productStock === 0) {
              console.log(
                `Product with SKU => ${product?.sku} is out of stock`
              );
              continue; // Skip to next item
            }

            // Update stock for the product
            product.inventory.stock = productStock - quantity;
            vendorBill += getNumber(product?.pricing?.costPrice) * quantity;
            await product.save({ validateModifiedOnly: true });
            validItems.push(item); // Add item to valid items
          }
        } else {
          console.log(
            `* Tracking inventory is Off for product SKU => ${product?.sku} *`
          );
          validItems.push(item); // Add item to valid items since we're not tracking inventory
        }
      }
    }

    // Update items array with valid items
    this.items = validItems;

    this.vendorBill = vendorBill;
  }

  next();
});

OrderSchema.post("findOneAndUpdate", async function (order, next) {
  if (order && order.items && order.items.length > 0) {
    const allDelivered = order.status === "Delivered";
    order.isCompleted = allDelivered ? true : false;
    await order.save();
  }
  next();
});

// Indexing for optimized queries
OrderSchema.index({ isConfirmed: 1 });
OrderSchema.index({ orderedAt: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ company: 1 });

OrderSchema.methods.toJSON = function () {
  return {
    id: this._id,
    _id: this._id,
    customer: this.customer,
    company: this.company,
    items: this?.items?.map((item) => {
      let variantDetails = null;
      if (item?.variantSKU) {
        variantDetails = item?.product?.variants?.find(
          (variant) => variant?.sku === item?.variantSKU
        );
      }

      return {
        ...item.toObject(),
        variantDetails,
      };
    }),
    customerBill: this.customerBill,
    payment: this.payment,
    isConfirmed: this.isConfirmed,
    isCompleted: this.isCompleted,
    shippingDetails: this.shippingDetails,
    orderedAt: this.orderedAt,
    orderNumber: this.orderNumber,
    vendorBill: this.vendorBill,
    status: this.status,
    statusHistory: this.statusHistory,
    orderSequence: this.orderSequence,
    confirm_token: this.confirm_token,
  };
};

module.exports = mongoose.model("Order", OrderSchema);
