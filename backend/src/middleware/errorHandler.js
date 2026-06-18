// Simple error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    code: err.code || undefined,
    details: err.details || undefined
  });
};

module.exports = errorHandler;

