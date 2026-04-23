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
 * @param {Object} userData - User object from database with company/role info
 * @returns {string} JWT token
 */
const generateUserToken = (userData) => {
  const payload = {
    userId: userData.id,
    email: userData.email,
    companyUserId: userData.companyUserId,
    companyId: userData.companyId,
    companyName: userData.companyName,
    role: userData.role,
    roles: userData.roles,
    permissions: userData.permissions,
    name: userData.name,
    employeeCode: userData.employeeCode,
    isActive: userData.isActive,
    emailVerified: userData.emailVerified
  };
  
  return generateToken(payload);
};

module.exports = {
  generateToken,
  verifyToken,
  generateUserToken
};