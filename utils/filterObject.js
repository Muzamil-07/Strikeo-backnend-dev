function filterObjectBySchema(payload, schema) {
  const filter = (obj, schema) => {
    if (!obj || typeof obj !== "object") return {}; // Ensure obj is an object

    if (Array.isArray(schema)) {
      if (!Array.isArray(obj)) return []; // If obj is not an array, return empty array

      // Handle array of strings or objects based on schema type
      if (typeof schema[0] === "boolean" && typeof obj[0] === "string") {
        return [...obj]; // Simply return the array of strings as is
      }

      // Recursively filter arrays of objects based on schema
      return obj
        .map((item) => filter(item, schema[0])) // Apply filtering to each item
        .filter(
          (item) => typeof item === "object" && Object.keys(item).length > 0
        ); // Keep non-empty objects
    }

    if (typeof schema === "object" && schema !== null) {
      const result = {};

      for (const key in schema) {
        if (schema[key] === true && obj[key] !== undefined) {
          // If the schema key is true, and obj has a defined value for key
          result[key] = obj[key];
        } else if (typeof schema[key] === "object" && obj[key]) {
          // Recursively process nested objects or arrays if obj[key] exists
          const nestedValue = filter(obj[key], schema[key]);

          if (Array.isArray(schema[key])) {
            result[key] = Array.isArray(nestedValue) ? nestedValue : [];
          } else if (
            typeof nestedValue === "object" &&
            Object.keys(nestedValue).length > 0
          ) {
            result[key] = nestedValue;
          }
        }
      }

      return result;
    }

    return {}; // Return empty object if schema is not an object
  };

  return filter(payload, schema);
}

// Example usage
const productSchema = {
  name: true,
  description: true,
  category: true,
  tags: true, // Array of strings
  pricing: {
    costPrice: true,
    discount: true,
  },
  images: [
    {
      url: true,
      alt: true,
    },
  ],
  variants: [
    {
      _id: true,
      variantName: true,
    },
  ],
};

module.exports = filterObjectBySchema;
