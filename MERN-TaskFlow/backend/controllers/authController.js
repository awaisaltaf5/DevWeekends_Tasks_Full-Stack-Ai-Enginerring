const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  res.status(201).json({ message: 'Register endpoint - coming soon' });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  res.status(200).json({ message: 'Login endpoint - coming soon' });
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({ message: 'Get current user endpoint - coming soon' });
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};