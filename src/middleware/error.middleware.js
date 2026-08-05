const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  let message =
    err.message || "Internal Server Error";

  // Only log unexpected server errors
  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;