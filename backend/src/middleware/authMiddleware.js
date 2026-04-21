const jwt = require('jsonwebtoken');

/**
 * Protect routes - verify JWT token
 */
const protect = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided, access denied'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token, access denied'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired, please login again'
      });
    }
    
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }
    
    next();
  };
};

module.exports = {
  protect,
  authorize
};