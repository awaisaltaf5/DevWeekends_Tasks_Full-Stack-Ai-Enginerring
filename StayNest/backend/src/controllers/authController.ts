const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../middleware/error');

/**
 * Send a consistent auth response with a signed JWT and a password-less user.
 */
const sendAuthResponse = (res, statusCode, { user, message }) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user,
  });
};

/**
 * @POST /api/auth/register
 * Register a new user (defaults to the `user` role — role is never trusted
 * from the client). Returns a JWT.
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // --- Validation ---
  if (!name || !email || !password) {
    return next(new AppError(400, 'Please provide a name, email and password'));
  }
  if (typeof name === 'string' && name.trim().length < 2) {
    return next(new AppError(400, 'Name must be at least 2 characters'));
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return next(new AppError(400, 'Please provide a valid email address'));
  }
  if (password.length < 6) {
    return next(new AppError(400, 'Password must be at least 6 characters'));
  }

  // --- Duplicate email guard (clean 400 instead of a 500 key violation) ---
  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError(400, 'A user already exists with that email'));
  }

  const user = await User.create({ name, email, password });
  sendAuthResponse(res, 201, { user, message: 'User registered successfully' });
});

/**
 * @POST /api/auth/login
 * Authenticate an existing user against email + password. Returns a JWT.
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(400, 'Please provide an email and password'));
  }

  // `password` is select:false — re-select it so we can compare it.
  const user = await User.findOne({ email }).select('+password');

  // Use a generic message to avoid leaking whether the email exists.
  if (!user) {
    return next(new AppError(401, 'Invalid credentials'));
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new AppError(401, 'Invalid credentials'));
  }

  // Drop the loaded password before serializing.
  user.password = undefined;
  sendAuthResponse(res, 200, { user, message: 'Login successful' });
});

/**
 * @POST /api/auth/logout
 * JWT is stateless and stored on the client, so logout is primarily a
 * client-side operation (the token is discarded). This endpoint exists for
 * completeness and for a future server-side/revocable token store.
 */
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @GET /api/auth/me
 * Returns the authenticated user. `req.user` is populated by `protect`.
 */
exports.getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * @PUT /api/auth/profile
 * Update the authenticated user's profile. Allowed fields: name, avatar, and
 * preferences (currency, emailNotifications). Email changes are supported but
 * must pass validation and remain unique. The response never includes the
 * password (enforced by the User toJSON transform + explicit clearing).
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { name, email, avatar, preferences } = req.body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return next(new AppError(400, 'Name must be at least 2 characters'));
    }
    user.name = name.trim();
  }

  if (email !== undefined) {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return next(new AppError(400, 'Please provide a valid email address'));
    }
    const normalized = String(email).toLowerCase().trim();
    if (normalized !== user.email) {
      const existing = await User.findOne({ email: normalized });
      if (existing && String(existing._id) !== String(user._id)) {
        return next(new AppError(400, 'A user already exists with that email'));
      }
      user.email = normalized;
    }
  }

  if (avatar !== undefined) {
    user.avatar = typeof avatar === 'string' ? avatar.trim() : '';
  }

  if (preferences !== undefined && preferences !== null) {
    const { currency, emailNotifications } = preferences;
    if (currency !== undefined) {
      if (!['PKR', 'USD', 'EUR', 'GBP'].includes(currency)) {
        return next(new AppError(400, 'Invalid currency'));
      }
      user.preferences.currency = currency;
    }
    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications = Boolean(emailNotifications);
    }
  }

  await user.save();

  // The pre('save') hook only hashes when password is modified, so saving a
  // profile change never re-hashes the existing (already hashed) password.
  user.password = undefined;
  res.status(200).json({ success: true, message: 'Profile updated', user });
});

/**
 * @PUT /api/auth/change-password
 * Change the authenticated user's password.
 *  - verifies the supplied current password against the stored hash
 *  - validates the new password (>= 6 chars)
 *  - the pre('save') hook hashes the new password before persisting
 *  - the response never contains the password
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError(400, 'Please provide the current and new password')
    );
  }

  // `password` is select:false on the schema — re-select it to compare.
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError(404, 'User not found'));
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new AppError(400, 'Current password is incorrect'));
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return next(
      new AppError(400, 'New password must be at least 6 characters')
    );
  }
  if (newPassword === currentPassword) {
    return next(new AppError(400, 'New password must differ from the current one'));
  }

  user.password = newPassword;
  await user.save();

  user.password = undefined;
  res.status(200).json({ success: true, message: 'Password changed successfully', user });
});

/**
 * @GET /api/admin/users
 * Admin-only: list every user (passwords excluded via the schema transform).
 */
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});
