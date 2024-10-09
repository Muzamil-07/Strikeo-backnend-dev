function validateProductData(data) {
  // Basic product info validation
  if (!data.name) {
    return "Product name is required.";
  }

  // Category and subcategory validations
  if (!data.category) {
    return "Product category is required.";
  }
  if (!data.subCategory) {
    return "Product sub-category is required.";
  }
  if (!data.subSubCategory) {
    return "Product sub-subcategory is required.";
  }

  // Pricing validation
  if (!data.pricing || !data.pricing.costPrice) {
    return "Product cost price is required.";
  } else {
    if (isNaN(data.pricing.costPrice)) {
      return "Product cost price must be a valid number.";
    }
    if (data.pricing.costPrice <= 0) {
      return "Product cost price must be greater than zero.";
    }
  }

  if (data.pricing.salePrice && isNaN(data.pricing.salePrice)) {
    return "Product sale price must be a valid number.";
  }

  if (data.pricing.discount && isNaN(data.pricing.discount)) {
    return "Product discount must be a valid number.";
  }

  if (data.pricing.taxRate && isNaN(data.pricing.taxRate)) {
    return "Product tax rate must be a valid number.";
  }

  // Inventory validation
  //   if (!data.inventory || typeof data.inventory.stock === "undefined") {
  //     return "Product stock quantity is required.";
  //   } else if (isNaN(data.inventory.stock)) {
  //     return "Product stock quantity must be a valid number.";
  //   }

  if (
    data.inventory.lowStockThreshold &&
    isNaN(data.inventory.lowStockThreshold)
  ) {
    return "Low stock threshold must be a valid number.";
  }

  // SEO validation
  //   if (!data.seo || !data.seo.title) {
  //     return "SEO title is required.";
  //   }

  //   if (data.seo.slug && !data.seo.slug.startsWith("http")) {
  //     return "SEO slug must be a valid URL.";
  //   }

  // Images validation
  if (!data.images || data.images.length === 0) {
    return "At least one product image is required.";
  }

  // Brand validation
  if (!data.brand) {
    return "Product brand is required.";
  }

  // Attributes validation
  //   if (!data.attributes || !data.attributes.color) {
  //     return "Product color is required.";
  //   }

  //   if (!data.attributes.size) {
  //     return "Product size is required.";
  //   }

  //   if (!data.attributes.material) {
  //     return "Product material is required.";
  //   }

  //   if (!data.attributes.gender) {
  //     return "Product gender is required.";
  //   }

  //   if (!data.attributes.condition) {
  //     return "Product condition is required.";
  //   }

  // Variants validation (if provided)
  if (data.variants && data.variants.length > 0) {
    for (let i = 0; i < data.variants.length; i++) {
      const variant = data.variants[i];
      if (!variant.variantName) {
        return `Variant name is required for variant ${i + 1}.`;
      }
      if (!variant.pricing || !variant.pricing.costPrice) {
        return `Cost price is required for variant ${i + 1}.`;
      }
      if (variant.pricing.costPrice && isNaN(variant.pricing.costPrice)) {
        return `Cost price must be a number for variant ${i + 1}.`;
      }
      if (variant.inventory && isNaN(variant.inventory.stock)) {
        return `Stock must be a valid number for variant ${i + 1}.`;
      }
    }
  }

  return null; // No validation errors
}

module.exports = validateProductData;
