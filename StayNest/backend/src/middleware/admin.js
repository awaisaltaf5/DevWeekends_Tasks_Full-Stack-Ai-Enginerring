const AppError = require('../utils/AppError');

/**
 * `admin` middleware — role-based authorization guard.
 *
 * Must be used AFTER `protect` so that `req.user` is already populated.
 * Only users whose `role` is exactly `'admin'` may continue; everyone else
 * receives a 403 Forbidden.
 */
const admin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError(403, 'Access denied — admin role required'));
  }
  next();
};

module.exports = { admin };
