const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { asyncHandler } = require('../middleware/error');
const AppError = require('../utils/AppError');

/**
 * Build a JSON response that never includes the password.
 * The Mongoose schema (select:false + toJSON transform) already strips it,
 * but we also assemble `data` explicitly for a clean, stable contract.
 */
const formatUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  token,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate required fields.
  if (!name || name.trim() === '') {
    throw new AppError(400, 'Name is required');
  }
  if (!email || email.trim() === '') {
    throw new AppError(400, 'Email is required');
  }
  if (!password) {
    throw new AppError(400, 'Password is required');
  }
  if (password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters');
  }
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, 'Please provide a valid email address');
  }

  // Prevent duplicate emails (defense in depth alongside the unique index).
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError(400, 'Email already registered');
  }

  // Role is intentionally NOT accepted from the client to prevent privilege
  // escalation; it defaults to 'user' (admin accounts are created via a
  // seeder/protected route in a later phase).
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: formatUser(user, token),
  });
});

// @desc    Log in an existing user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || email.trim() === '') {
    throw new AppError(400, 'Email is required');
  }
  if (!password) {
    throw new AppError(400, 'Password is required');
  }

  // +password because the schema excludes it by default (select: false).
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  // Use the same message for "no user" and "wrong password" to avoid leaking
  // which emails are registered.
  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: formatUser(user, token),
  });
});

// @desc    Get the currently authenticated user
// @route   GET /api/auth/me
// @access  Private (requires a valid JWT via the protect middleware)
const getMe = asyncHandler(async (req, res, next) => {
  // req.user is populated by the `protect` middleware.
  const user = req.user;

  res.status(200).json({
    success: true,
    message: 'Authenticated user',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
