const AppError = require('../utils/AppError');

/**
 * Admin authorization middleware.
 *
 * MUST be mounted AFTER the `protect` middleware so that `req.user` is
 * already populated from the verified JWT. Returns 403 when the authenticated
 * user is not an admin — note this is distinct from 401 (authentication),
 * because the user *is* authenticated but lacks the required role.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  next(new AppError(403, 'Not authorized as admin'));
};

module.exports = { admin };
