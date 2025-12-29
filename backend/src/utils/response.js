const sendSuccess = (res, data, message = 'Operation successful', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const sendError = (res, error, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: typeof error === 'string' ? error : error.message || 'An error occurred',
    statusCode,
  });
};

module.exports = { sendSuccess, sendError };
