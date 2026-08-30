import { type Request, type Response, type NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './AppError';

/**
 * Express middleware that runs after express-validator body/query/param
 * chains. Throws an AppError(400) if validation recorded any errors.
 */
export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }
  const messages = errors.array().map((e) => e.msg);
  throw new AppError(400, `Validation error: ${messages.join('; ')}`);
}
