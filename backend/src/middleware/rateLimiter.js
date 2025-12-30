const rateLimit = require('express-rate-limit');

// Rate limiter for authentication routes (login, signup)
// Strict limit to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    success: false,
    error: 'Too many attempts. Please try again after 1 minute.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
// Applied to all routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Too many requests. Please slow down.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for sensitive operations (password change)
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  message: {
    success: false,
    error: 'Too many attempts. Please try again after 1 minute.',
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter,
};
