import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

/**
 * Wrap an async route handler so rejected promises are forwarded to Express's
 * error-handling middleware instead of crashing the process.
 */
export const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Centralized error-handling middleware for Express.
 *
 * Controllers throw `AppError` for expected errors; raw Mongoose/JWT errors are
 * normalized here into a consistent JSON shape. Stack traces are exposed only
 * in development.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  let statusCode = 500;
  let message = 'Server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  } else {
    message = String(err);
  }

  // Mongoose validation error (required, minlength, match, enum, etc.)
  if (isMongooseError(err, 'ValidationError')) {
    statusCode = 400;
    const values = Object.values((err as MongooseValidationError).errors).map(
      (e) => e.message,
    );
    message = values.join(', ') || 'Validation failed';
  }

  // Mongoose duplicate key error (unique index violation, e.g. duplicate email)
  if (isMongooseError(err, 'MongoServerError') && Number((err as { code?: number }).code) === 11000) {
    statusCode = 400;
    const keyValue = (err as { keyValue?: Record<string, string> }).keyValue;
    const field = keyValue ? Object.keys(keyValue)[0] : 'field';
    message = `${field} already exists`;
  }

  // Mongoose CastError (e.g. invalid ObjectId passed to findById)
  if (isMongooseError(err, 'CastError')) {
    statusCode = 400;
    message = 'Invalid resource ID format';
  }

  // JSON web token errors
  if (isMongooseError(err, 'JsonWebTokenError')) {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (isMongooseError(err, 'TokenExpiredError')) {
    statusCode = 401;
    message = 'Token expired';
  }

  // Multer upload errors (file too large, unexpected file, custom fileFilter rejections).
  if (err instanceof Error && err.name === 'MulterError') {
    statusCode = 400;
    message = normalizeMulterMessage(err.message);
  }
  // Custom fileFilter error thrown by medicalUpload/upload (disallowed type).
  if (err instanceof Error && err.message.toLowerCase().includes('invalid file type')) {
    statusCode = 400;
  }

  const body: Record<string, unknown> = { success: false, message };
  if (env.nodeEnv === 'development' && err instanceof Error) {
    body.stack = err.stack;
  }

  return res.status(statusCode).json(body);
};

interface MongooseValidationDetail {
  message: string;
}

interface MongooseValidationError {
  errors: Record<string, MongooseValidationDetail>;
}

function isMongooseError(err: unknown, name: string): boolean {
  return err instanceof Error && err.name === name;
}

/** Human-friendly message for Multer errors (e.g. file-too-large). */
function normalizeMulterMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('file too large')) {
    return 'File too large. Please choose a smaller file.';
  }
  if (lower.includes('unexpected field')) {
    return 'Unexpected upload field.';
  }
  return message;
}

/** 404 handler for unknown routes (mounted AFTER all known routes). */
export const notFound = (_req: Request, res: Response): Response =>
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });