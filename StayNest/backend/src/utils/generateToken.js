const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user.
 *
 * - Secret:  process.env.JWT_SECRET
 * - Expiry:  process.env.JWT_EXPIRES_IN
 * - Payload: { id: userId }
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = generateToken;
