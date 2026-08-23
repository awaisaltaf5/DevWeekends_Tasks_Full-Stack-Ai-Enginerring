import jwt from 'jsonwebtoken';
import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../types';
import dotenv from 'dotenv';

dotenv.config();

// Protect routes - verify JWT token
const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        res.status(500).json({ message: 'JWT secret is not configured' });
        return;
      }
      const decoded = jwt.verify(token, secret);

      // Add user from payload to request object
      req.user = typeof decoded === 'string' ? { id: decoded } : {
        id: typeof decoded.sub === 'string' ? decoded.sub : undefined,
        email: typeof decoded.email === 'string' ? decoded.email : undefined
      };
      next();
    } catch (error: unknown) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };