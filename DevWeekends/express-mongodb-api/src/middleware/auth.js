const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * JWT authentication middleware (`protect`).
 *
 * - Reads the `Authorization` header.
 * - Expects the format: `Bearer <JWT>`.
 * - Verifies the token using `JWT_SECRET`.
 * - Identifies the authenticated user and attaches it to `req.user`.
 * - Rejects missing / malformed / invalid / expired tokens with a clean
 *   JSON response and a 401 status code.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Read the Authorization header.
  const authHeader = req.headers.authorization;

  // 2. Expect the format "Bearer <token>".
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 3. Reject requests with no token.
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }

  try {
    // 4. Verify the JWT and identify the user.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the authenticated user (without the password hash) to req.user.
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    // 5. Forward to the next middleware / route handler.
    next();
  } catch (error) {
    // Invalid, malformed or expired token -> 401 with a clean JSON response.
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

module.exports = { protect };
