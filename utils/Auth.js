exports.generateOTPCode = async function generateCode(length = 6) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const code = Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length))
  ).join("");

  // Ensure the code has at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(code);
  const hasNumber = /[0-9]/.test(code);

  return hasLetter && hasNumber ? code : generateCode(length);
};
