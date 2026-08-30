import { type NextFunction, type Request, type Response } from 'express';
import { AppError } from '../utils/AppError';
import { type AuthenticatedRequest, type UserRole } from '../types';

/**
 * Role-based authorization middleware factory.
 *
 *   router.get('/patient', protect, authorize('patient'), patientController.x)
 *
 * `authorize(...roles)` returns middleware that rejects the request when the
 * authenticated user's role is not in the allowed list (HTTP 403). Must run
 * AFTER `protect`.
 */
export const authorize =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      throw new AppError(401, 'Not authorized. Please sign in.');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError(
        403,
        `Access denied. The ${user.role} role cannot access this resource.`,
      );
    }

    next();
  };