const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * `protect` middleware — JWT authentication guard.
 *
 * 1. Reads the `Authorization` header and expects `Bearer <token>`.
 * 2. Verifies the JWT using `process.env.JWT_SECRET`.
 * 3. Looks the user up in MongoDB Atlas via Mongoose.
 * 4. Attaches the fresh user document to `req.user`.
 * 5. Rejects missing / invalid / expired tokens with a clean 401.
 *
 * The user queried from the DB always reflects the current `role`, so roles
 * are never trusted from the token itself (avoids stale-privilege issues).
 */
const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  // 1-2. Require the "Bearer <token>" format.
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 6 (missing token).
  if (!token) {
    return next(new AppError(401, 'Not authorized, no token'));
  }

  try {
    // 3. Verify the JWT (throws on invalid / expired).
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user in MongoDB Atlas.
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError(401, 'Not authorized, user not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    // 5-6 (invalid / expired token).
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(401, 'Not authorized, token expired'));
    }
    return next(new AppError(401, 'Not authorized, invalid token'));
  }
};

module.exports = { protect };
