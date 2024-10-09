exports.tranStatusFormat = (status) => {
  if (["VALID", "VALIDATED"].includes(status)) {
    return true;
  } else {
    return false;
  }
};
