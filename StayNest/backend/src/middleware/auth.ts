const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/error');

/**
 * `protect` middleware — JWT authentication guard.
 *
 * 1. Reads the `Authorization: Bearer <token>` header.
 * 2. Verifies the JWT using `process.env.JWT_SECRET`.
 * 3. Loads the user from MongoDB Atlas via Mongoose.
 * 4. Attaches the fresh user document to `req.user`.
 * 5. Rejects missing / invalid / expired tokens with a clean 401.
 *
 * The user is re-fetched from the DB on every request, so the `role` is never
 * trusted from the token itself (avoids stale-privilege issues).
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(401, 'Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError(401, 'Not authorized, user not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Not authorized, token expired'));
    }
    return next(new AppError(401, 'Not authorized, invalid token'));
  }
});

module.exports = { protect };
