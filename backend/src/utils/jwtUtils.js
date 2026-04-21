const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - User data to include in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Generate token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateUserToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role || 'employee',
    name: user.name
  };
  
  return generateToken(payload);
};

module.exports = {
  generateToken,
  verifyToken,
  generateUserToken
};