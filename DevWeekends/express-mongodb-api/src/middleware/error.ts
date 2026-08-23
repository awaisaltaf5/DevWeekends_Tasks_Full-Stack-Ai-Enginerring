/**
 * Centralized error-handling middleware for Express.
 *
 * Controllers should throw or pass an `Error` (or plain error object)
 * to `next()`. This handler maps known error types to the appropriate
 * HTTP status code and a consistent JSON shape, and it never exposes
 * stack traces or raw DB messages in production.
 */

// Map raw error properties to a normalized `success: false` response.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose validation error (required, minlength, match, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const values = Object.values(err.errors || {}).map((e) => e.message);
    message = values.join(', ') || 'Validation failed';
  }

  // Mongoose duplicate key error (unique index violation)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field} already exists`;
  }

  // Mongoose CastError (e.g., invalid ObjectId passed to findById)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID format';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Express body-parser / express.json() invalid body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON body';
  }

  const response = {
    success: false,
    message,
  };

  // Expose stack traces only in development.
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// 404 for unknown routes (mounted AFTER all known routes).
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};

/**
 * Wrap an async route handler so rejected promises are forwarded to
 * Express's error-handling middleware instead of crashing the process.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, notFound, asyncHandler };
