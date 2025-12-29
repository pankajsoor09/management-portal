const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    if (user.status === 'inactive') {
      return sendError(res, 'Your account has been deactivated', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Not authorized to access this route', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Role '${req.user.role}' is not authorized to access this route`, 403);
    }
    next();
  };
};

module.exports = { protect, authorize };
