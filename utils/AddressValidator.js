function validateAddress(address) {
  if (!address) return "Address is required.";

  if (!address.firstName) {
    return "First name is required.";
  }

  if (!address.lastName) {
    return "Last name is required.";
  }

  if (!address.email) {
    return "Email is required.";
  }

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailRegex.test(address.email)) {
    return "Invalid email.";
  }

  if (!address.phone) {
    return "Phone is required.";
  }

  // const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
  const phoneRegex = /^\+\d{1,3}\d{7,12}$/; // Included Bangladeshi Mobile Number
  if (!phoneRegex.test(address.phone)) {
    return "Invalid phone number.";
  }

  if (!address.address) {
    return "Street address is required.";
  }

  if (!address.city) {
    return "City is required.";
  }

  // if (!address.state) {
  //   return "State is required.";
  // }

  if (!address.country) {
    return "Country is required.";
  }

  if (!address.zipCode) {
    return "Zip code is required.";
  }

  return null; // No validation errors
}

module.exports = validateAddress;
