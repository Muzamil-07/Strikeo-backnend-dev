// function filterProductPayload(payload, schema) {
//   // Check if the value is empty based on your criteria, excluding booleans
//   const isEmptyValue = (value) => {
//     if (typeof value === "boolean") return false; // Keep booleans (including false)
//     if (value === undefined || value === null) return true;
//     if (typeof value === "string" && value.trim() === "") return true;
//     if (Array.isArray(value)) return value.length === 0; // Consider array empty only if it has no elements
//     if (
//       typeof value === "object" &&
//       value !== null &&
//       Object.keys(value).length === 0
//     )
//       return true;
//     return false;
//   };

//   // Main function that recursively filters the payload based on the schema
//   const filter = (obj, schema) => {
//     if (Array.isArray(schema)) {
//       if (!Array.isArray(obj)) return [];

//       // If the array is of strings, filter them out
//       if (typeof schema[0] === "boolean" && typeof obj[0] === "string") {
//         const filteredArray = obj.filter((item) => !isEmptyValue(item));
//         return filteredArray.length > 0 ? filteredArray : []; // Keep empty arrays
//       }

//       // Filter objects within an array
//       const filteredArray = obj
//         .map((item) => filter(item, schema[0]))
//         .filter((item) => !isEmptyValue(item) && Object.keys(item).length > 0);

//       return filteredArray.length > 0 ? filteredArray : []; // Keep empty arrays
//     }

//     if (typeof schema === "object" && schema !== null) {
//       const result = {};

//       for (const key in schema) {
//         if (schema[key] === true && obj[key] !== undefined) {
//           // For simple key-value pairs
//           if (!isEmptyValue(obj[key])) {
//             result[key] = obj[key];
//           }
//         } else if (typeof schema[key] === "object") {
//           // For nested objects
//           const nestedValue = filter(obj[key], schema[key]);
//           if (Array.isArray(schema[key])) {
//             // Ensure arrays remain as empty arrays even if filtered out
//             result[key] = nestedValue.length > 0 ? nestedValue : [];
//           } else if (
//             !isEmptyValue(nestedValue) &&
//             Object.keys(nestedValue).length > 0
//           ) {
//             result[key] = nestedValue;
//           }
//         }
//       }

//       return result;
//     }

//     return {};
//   };

//   return filter(payload, schema);
// }

function filterObjectBySchema(payload, schema) {
  // Main function that recursively filters the payload based on the schema
  const filter = (obj, schema) => {
    if (Array.isArray(schema)) {
      if (!Array.isArray(obj)) return [];

      // If the array is of strings, return the array as is (since we're not filtering by value anymore)
      if (typeof schema[0] === "boolean" && typeof obj[0] === "string") {
        return [...obj]; // Simply return the array, don't filter by value
      }

      // Recursively filter arrays of objects based on schema
      return obj
        .map((item) => filter(item, schema[0]))
        .filter(
          (item) => typeof item === "object" && Object.keys(item).length > 0
        ); // Keep objects only
    }

    if (typeof schema === "object" && schema !== null) {
      const result = {};

      for (const key in schema) {
        if (schema[key] === true && obj[key] !== undefined) {
          // Keep key as is, regardless of value
          result[key] = obj[key];
        } else if (typeof schema[key] === "object") {
          // Recursively process nested objects or arrays
          const nestedValue = filter(obj[key], schema[key]);
          if (Array.isArray(schema[key])) {
            // Ensure arrays remain as arrays
            result[key] = nestedValue.length > 0 ? nestedValue : [];
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

    return {};
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
