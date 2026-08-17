/**
 * A typed, "operational" application error.
 *
 * Throw these from controllers/services for expected, client-facing errors:
 *
 *   throw new AppError(400, 'Name is required');
 *   throw new AppError(404, 'Product not found');
 *
 * The centralized error handler (../middleware/error.js) reads
 * `statusCode` + `message` and returns a consistent JSON response.
 * Marking `isOperational = true` lets the handler distinguish expected
 * errors from unexpected bugs.
 */
class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    // Avoid polluting the stack trace with this constructor frame.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
