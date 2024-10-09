const { ForbiddenResponse } = require("express-http-response");
require("dotenv").config();

const validateSecretKey = (req, res, next) => {
  const incomingSecretKey = req.query.secretKey || req.body.secretKey;
  const secretKey = process.env.SECRET_KEY;

  if (!incomingSecretKey || incomingSecretKey !== secretKey) {
    return next(new ForbiddenResponse("Forbidden: Invalid secretKey"));
  }

  next();
};

module.exports = validateSecretKey;
