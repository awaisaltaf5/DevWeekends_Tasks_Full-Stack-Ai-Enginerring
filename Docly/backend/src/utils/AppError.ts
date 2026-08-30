/**
 * A typed, "operational" application error.
 *
 * Throw these from controllers/services for expected, client-facing errors:
 *
 *   throw new AppError(400, 'Name is required');
 *   throw new AppError(404, 'Doctor not found');
 *
 * The centralized error handler (../middleware/errorHandler) reads
 * `statusCode` and `message` and returns a consistent JSON response.
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    // Avoid polluting the stack trace with this constructor frame.
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}