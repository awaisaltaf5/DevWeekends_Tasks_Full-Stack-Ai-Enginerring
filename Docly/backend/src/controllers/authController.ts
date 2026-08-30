import { type NextFunction, type Request, type Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/apiResponse';
import { signToken } from '../services/tokenService';
import { asyncHandler } from '../middleware/errorHandler';
import { OAuth2Client } from 'google-auth-library';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import {
  type AuthenticatedRequest,
  PUBLIC_REGISTRATION_ROLES,
  type UserRole,
} from '../types';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

interface AuthBody {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  credential?: string;
  recoveryCode?: string;
  recoveryCodes?: string[];
}

function readAuthBody(raw: unknown): AuthBody {
  const body: AuthBody = {};
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.name === 'string') body.name = obj.name;
    if (typeof obj.email === 'string') body.email = obj.email;
    if (typeof obj.password === 'string') body.password = obj.password;
    if (typeof obj.role === 'string') body.role = obj.role as UserRole;
    if (typeof obj.credential === 'string') body.credential = obj.credential;
    if (typeof obj.recoveryCode === 'string') body.recoveryCode = obj.recoveryCode;
    if (Array.isArray(obj.recoveryCodes) && obj.recoveryCodes.every((code) => typeof code === 'string')) {
      body.recoveryCodes = obj.recoveryCodes;
    }
  }
  return body;
}

/**
 * Register a new user and return a signed JWT.
 *
 * - role defaults to `patient`.
 * - A public endpoint may NOT create an `admin` account (admin bootstrap is
 *   done via `npm run seed:admin`).
 * - role is only ever validated against the allow-list, never trusted blindly.
 */
export const register = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
    const { name, email, password, role, recoveryCodes } = readAuthBody(req.body);

    if (!name || !email || !password) {
      throw new AppError(400, 'Please provide a name, email and password.');
    }
    if (name.trim().length < 2) {
      throw new AppError(400, 'Name must be at least 2 characters.');
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new AppError(400, 'Please provide a valid email address.');
    }
    if (password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters.');
    }
    if (!recoveryCodes || recoveryCodes.length !== 3 || recoveryCodes.some((code) => !/^DOC-[A-F0-9]{6}-[A-F0-9]{12}$/.test(code))) {
      throw new AppError(400, 'Please generate and save your three recovery codes before registering.');
    }

    const normalizedRole: UserRole =
      role && PUBLIC_REGISTRATION_ROLES.includes(role) ? role : 'patient';

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      throw new AppError(400, 'A user already exists with that email.');
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: normalizedRole,
      recoveryCodes: recoveryCodes.map((code) => ({ hash: hashRecoveryCode(code) })),
    });

    // Serialized via schema toJSON transform (password is stripped).
    const token = signToken(String(user._id), user.role);

    return sendSuccess(res, 201, `${capitalize(normalizedRole)} registered successfully`, {
      token,
      user,
    });
  },
);

/** Log in an existing user with email + password. */
export const login = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
    const { email, password } = readAuthBody(req.body);

    if (!email || !password) {
      throw new AppError(400, 'Please provide an email and password.');
    }

    // `password` is select:false, so re-select it to compare.
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    // Generic message so we never leak whether an email exists.
    if (!user) {
      throw new AppError(401, 'Invalid credentials.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError(401, 'Invalid credentials.');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated. Contact an administrator.');
    }

    const token = signToken(String(user._id), user.role);

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user,
    });
  },
);

/** Verify a Google Identity Services credential and return the normal JWT session. */
export const googleLogin = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
    const { credential, role } = readAuthBody(req.body);
    if (!env.googleClientId) {
      throw new AppError(503, 'Google sign-in is not configured.');
    }
    if (!credential) {
      throw new AppError(400, 'Google sign-in did not provide a credential.');
    }

    const googleClient = new OAuth2Client(env.googleClientId);
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: env.googleClientId });
      payload = ticket.getPayload();
    } catch (error) {
      console.error('[GoogleAuth] verifyIdToken failed', {
        message: error instanceof Error ? error.message : String(error),
        clientId: env.googleClientId,
        credentialLength: credential.length,
      });
      throw new AppError(401, 'Unable to verify your Google account.');
    }

    if (!payload?.email || !payload.email_verified || !payload.name) {
      throw new AppError(401, 'Your Google account did not provide the required profile details.');
    }

    const email = payload.email.toLowerCase().trim();
    let user = await User.findOne({ email });
    if (!user) {
      const normalizedRole: UserRole = role && PUBLIC_REGISTRATION_ROLES.includes(role) ? role : 'patient';
      user = await User.create({
        name: payload.name.trim(),
        email,
        password: randomBytes(32).toString('hex'),
        role: normalizedRole,
        profileImage: payload.picture ?? '',
      });
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated. Contact an administrator.');
    }

    const token = signToken(String(user._id), user.role);
    return sendSuccess(res, 200, 'Google sign-in successful', { token, user });
  },
);

const recoveryAttempts = new Map<string, { count: number; resetAt: number }>();

/** Reset a local password with one unused recovery code. */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response): Promise<Response> => {
    const { email, recoveryCode, password } = readAuthBody(req.body);
    if (!email || !recoveryCode || !password) {
      throw new AppError(400, 'Email, recovery code and new password are required.');
    }
    if (password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters.');
    }

    const key = `${req.ip}:${email.toLowerCase().trim()}`;
    const attempt = recoveryAttempts.get(key);
    if (attempt && attempt.resetAt > Date.now() && attempt.count >= 8) {
      throw new AppError(429, 'Too many recovery attempts. Please try again later.');
    }
    if (!attempt || attempt.resetAt <= Date.now()) {
      recoveryAttempts.set(key, { count: 1, resetAt: Date.now() + 15 * 60 * 1000 });
    } else {
      attempt.count += 1;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +recoveryCodes');
    const suppliedHash = hashRecoveryCode(recoveryCode);
    const matchingCode = user?.recoveryCodes.find((code) => {
      if (code.usedAt || code.hash.length !== suppliedHash.length) return false;
      return timingSafeEqual(Buffer.from(code.hash), Buffer.from(suppliedHash));
    });
    if (!user || !matchingCode) {
      throw new AppError(400, 'Invalid or already used recovery code.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await User.updateOne(
      { _id: user._id, 'recoveryCodes.hash': matchingCode.hash, 'recoveryCodes.usedAt': { $exists: false } },
      { $set: { password: passwordHash, 'recoveryCodes.$.usedAt': new Date() } },
    );
    if (result.modifiedCount !== 1) {
      throw new AppError(400, 'Invalid or already used recovery code.');
    }
    recoveryAttempts.delete(key);
    return sendSuccess(res, 200, 'Password reset successfully');
  },
);

function hashRecoveryCode(code: string): string {
  return createHash('sha256').update(code.trim().toUpperCase()).digest('hex');
}

/** GET current authenticated user (requires `protect`). */
export const getMe = (
  req: Request,
  res: Response,
): Response => {
  const user = (req as AuthenticatedRequest).user;
  return sendSuccess(res, 200, 'Authenticated user retrieved', { user });
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Admin Login Endpoint
 * POST /api/auth/admin-login
 * 
 * Uses username and password from environment variables for admin authentication.
 * This is separate from regular user authentication.
 */
export const adminLogin = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<Response> => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      throw new AppError(400, 'Username and password are required.');
    }

    // Get admin credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Validate credentials
    if (username !== adminUsername || password !== adminPassword) {
      throw new AppError(401, 'Invalid admin credentials.');
    }

    // Create a hardcoded admin token
    const adminUser = {
      id: 'admin_system',
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@docly.com',
      role: 'admin' as const,
    };

    const token = signToken('admin_system', 'admin');

    return sendSuccess(res, 200, 'Admin login successful', {
      token,
      user: adminUser,
    });
  },
);