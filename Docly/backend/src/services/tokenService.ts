import jwt from 'jsonwebtoken';
import { type TokenPayload, type UserRole } from '../types';

/**
 * Sign a JWT for a user.
 *
 * - Secret:  process.env.JWT_SECRET
 * - Expiry:  process.env.JWT_EXPIRES_IN
 * - Payload: { id, role }
 *
 * Throws an AppError if the JWT secret is missing/unset, so tokens are never
 * signed with a weak default in production.
 */
export function signToken(userId: string, role: UserRole): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'change-me-in-production') {
    throw new Error('JWT_SECRET is not configured. Add it to the backend .env file.');
  }

  const payload: TokenPayload = { id: userId, role };
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT. Returns the typed payload on success, or null when
 * the token is invalid, malformed, or expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, secret);
    return decoded as TokenPayload;
  } catch {
    return null;
  }
}