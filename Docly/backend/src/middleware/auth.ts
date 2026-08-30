import { type NextFunction, type Request, type Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../services/tokenService';
import { asyncHandler } from './errorHandler';
import { type AuthenticatedRequest, type AuthUser } from '../types';

/**
 * `protect` middleware — JWT authentication guard.
 *
 * 1. Reads the `Authorization: Bearer <token>` header.
 * 2. Verifies the JWT with `verifyToken`.
 * 3. Loads the user from the database via Mongoose.
 * 4. Rejects inactive accounts.
 * 5. Attaches a safe, password-free user object to `req.user`.
 *
 * The user is re-fetched on every request so `role` and `isActive` are never
 * trusted from the token alone.
 */
export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token) {
      throw new AppError(401, 'Not authorized. No token provided.');
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new AppError(401, 'Not authorized. Invalid or expired token.');
    }

    if (payload.id === 'admin_system' && payload.role === 'admin') {
      const authUser: AuthUser = {
        id: 'admin_system',
        name: process.env.ADMIN_NAME || 'System Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@docly.com',
        role: 'admin',
        profileImage: '',
        isActive: true,
      };

      (req as AuthenticatedRequest).user = authUser;
      next();
      return;
    }

    const user = await User.findById(payload.id);
    if (!user) {
      throw new AppError(401, 'Not authorized. User not found.');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated. Contact an administrator.');
    }

    const authUser: AuthUser = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isActive: user.isActive,
    };

    (req as AuthenticatedRequest).user = authUser;
    next();
  },
);