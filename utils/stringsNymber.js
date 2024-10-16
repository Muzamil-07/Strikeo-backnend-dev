exports.getNumber = (value = 0) => {
  // Attempt to convert a string to a number
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;

  // Return the parsed number if it's valid, otherwise return 0
  return typeof parsedValue === "number" && !isNaN(parsedValue)
    ? parsedValue
    : 0;
};
exports.getProductId = (product) => String(product?._id || product?.id || "");

exports.jsonFormat = (obj) => {
  const object = JSON.parse(JSON.stringify(obj));
  return object;
};
