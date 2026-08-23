import type { Request, Response } from 'express';

interface AuthStubResponse {
  message: string;
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (_req: Request, res: Response<AuthStubResponse>) => {
  res.status(201).json({ message: 'Register endpoint - coming soon' });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (_req: Request, res: Response<AuthStubResponse>) => {
  res.status(200).json({ message: 'Login endpoint - coming soon' });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (_req: Request, res: Response<AuthStubResponse>) => {
  res.status(200).json({ message: 'Get current user endpoint - coming soon' });
};

export {
  registerUser,
  loginUser,
  getMe
};