const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @route   POST /api/auth/login
 * @route   POST /api/auth/logout
 * @route   GET   /api/auth/me            (protected)
 * @route   PUT   /api/auth/profile        (protected)
 * @route   PUT   /api/auth/change-password (protected)
 */
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
