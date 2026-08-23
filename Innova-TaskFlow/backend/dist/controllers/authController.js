"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.loginUser = exports.registerUser = void 0;
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (_req, res) => {
    res.status(201).json({ message: 'Register endpoint - coming soon' });
};
exports.registerUser = registerUser;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (_req, res) => {
    res.status(200).json({ message: 'Login endpoint - coming soon' });
};
exports.loginUser = loginUser;
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (_req, res) => {
    res.status(200).json({ message: 'Get current user endpoint - coming soon' });
};
exports.getMe = getMe;
