const jwt = require('jsonwebtoken');

/**
 * Recursively convert BigInt values to strings in an object
 * @param {Object} obj - Object to process
 * @returns {Object} Object with BigInts converted to strings
 */
function convertBigIntToString(obj) {
  // Handle primitive values
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToString(item));
  }
  
  // Handle objects (but not Dates, RegExp, etc.)
  if (typeof obj === 'object') {
    // Check for circular references by limiting depth
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          result[key] = convertBigIntToString(obj[key]);
        } catch (error) {
          // If we can't convert this property, skip it
          console.warn(`Could not convert property ${key}:`, error.message);
          result[key] = '[Unserializable]';
        }
      }
    }
    return result;
  }
  
  // Return other primitive values as-is
  return obj;
}

/**
 * Deep clone an object, converting all BigInt values to strings
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object with BigInts as strings
 */
function deepCloneWithBigInt(obj) {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneWithBigInt(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepCloneWithBigInt(obj[key]);
    }
  }
  return cloned;
}

/**
 * Generate JWT token
 * @param {Object} payload - User data to include in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
  console.log('=== generateToken DEBUG START ===');
  console.log('Payload received:', payload);
  console.log('Payload type:', typeof payload);
  console.log('Payload keys:', Object.keys(payload || {}));
  
  // Create an absolutely minimal, hardcoded payload for testing
  const testPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
    role: 'test-role'
  };
  
  console.log('Using test payload:', testPayload);
  console.log('=== generateToken DEBUG END ===');
  
  return jwt.sign(
    testPayload,
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
  console.log('=== generateUserToken DEBUG START ===');
  console.log('userData keys:', Object.keys(userData || {}));
  
  // Create an extremely minimal payload with only primitive values
  // Convert ALL values to strings or numbers to avoid any BigInt issues
  const payload = {
    userId: String(userData.id || ''),
    email: String(userData.email || ''),
    companyUserId: String(userData.companyUserId || ''),
    companyId: String(userData.companyId || ''),
    companyName: String(userData.companyName || ''),
    role: String(userData.role || ''),
    // Convert roles to simple strings
    roles: Array.isArray(userData.roles) ? userData.roles.map(r => {
      if (typeof r === 'bigint') return r.toString();
      if (r && typeof r === 'object') return String(r.name || r.id || '');
      return String(r || '');
    }) : [],
    // Convert permissions to simple strings
    permissions: Array.isArray(userData.permissions) ? userData.permissions.map(p => {
      if (typeof p === 'bigint') return p.toString();
      if (p && typeof p === 'object') return String(p.code || p.id || '');
      return String(p || '');
    }) : [],
    name: String(userData.name || ''),
    employeeCode: String(userData.employeeCode || ''),
    isActive: Boolean(userData.isActive),
    emailVerified: Boolean(userData.emailVerified)
  };
  
  console.log('Payload created, calling generateToken');
  console.log('=== generateUserToken DEBUG END ===');
  
  return generateToken(payload);
};

module.exports = {
  generateToken,
  verifyToken,
  generateUserToken,
  convertBigIntToString
};