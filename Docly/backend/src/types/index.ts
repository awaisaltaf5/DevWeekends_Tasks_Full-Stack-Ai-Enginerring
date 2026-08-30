import { type Request } from 'express';

/** Roles available on the Docly platform. */
export type UserRole = 'patient' | 'doctor' | 'admin';

/** Role(s) that a public registration endpoint may create. */
export const PUBLIC_REGISTRATION_ROLES: readonly UserRole[] = ['patient', 'doctor'];

/**
 * Minimum shape of the authenticated user attached to `req.user` by the
 * `protect` middleware. This is a plain object (never a password hash).
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage: string;
  isActive: boolean;
}

/** Payload embedded inside a signed JWT. */
export interface TokenPayload {
  id: string;
  role: UserRole;
}

/** An Express request that has passed the `protect` middleware. */
export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}