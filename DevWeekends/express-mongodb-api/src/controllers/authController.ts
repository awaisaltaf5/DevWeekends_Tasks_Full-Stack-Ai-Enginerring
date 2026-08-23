const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { asyncHandler } = require('../middleware/error');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || name.trim() === '') {
    throw { statusCode: 400, message: 'Name is required' };
  }

  if (!email || email.trim() === '') {
    throw { statusCode: 400, message: 'Email is required' };
  }

  if (!password) {
    throw { statusCode: 400, message: 'Password is required' };
  }

  if (password.length < 6) {
    throw { statusCode: 400, message: 'Password must be at least 6 characters' };
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    throw { statusCode: 400, message: 'Please provide a valid email address' };
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw { statusCode: 400, message: 'Email already registered' };
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || email.trim() === '') {
    throw { statusCode: 400, message: 'Email is required' };
  }

  if (!password) {
    throw { statusCode: 400, message: 'Password is required' };
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw { statusCode: 401, message: 'Invalid email or password' };
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
};