const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    return sendError(res, errorMessages[0], 400);
  }
  next();
};

module.exports = validate;
