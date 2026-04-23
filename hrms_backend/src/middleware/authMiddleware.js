const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { hasAnyRole } = require('../utils/roleUtils');

/**
 * Protect routes - verify JWT token and attach user with company context
 */
const protect = async (req, res, next) => {
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
    
    // Check if user is still active in database (optional but recommended)
    try {
      const user = await prisma.user.findUnique({
        where: { id: BigInt(decoded.userId) },
        select: { isActive: true }
      });
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'User account is inactive or deleted'
        });
      }
    } catch (dbError) {
      console.error('Database check error:', dbError);
      // Continue with token validation even if DB check fails
    }
    
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
 * Company-based filtering middleware
 * Ensures user can only access resources belonging to their company
 */
const companyFilter = (req, res, next) => {
  if (!req.user || !req.user.companyId) {
    return res.status(400).json({
      status: 'error',
      message: 'Company context not found in token'
    });
  }
  
  // Attach company filter to request for use in controllers
  req.companyFilter = {
    companyId: BigInt(req.user.companyId)
  };
  
  next();
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
    
    // Check if user has any of the required roles
    const userRoles = req.user.roles || [];
    const hasRole = hasAnyRole(userRoles, roles);
    
    if (!hasRole) {
      return res.status(403).json({
        status: 'error',
        message: `User roles [${userRoles.join(', ')}] are not authorized to access this resource. Required roles: [${roles.join(', ')}]`
      });
    }
    
    next();
  };
};

/**
 * Permission-based authorization middleware
 * @param {...string} permissions - Required permission codes
 */
const hasPermission = (...permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }
    
    // Get user permissions from token
    const userPermissions = req.user.permissions || [];
    
    // Check if user has all required permissions
    const hasAllPermissions = permissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      // If permissions not in token, check database (fallback)
      try {
        const companyUser = await prisma.companyUser.findUnique({
          where: { id: BigInt(req.user.companyUserId) },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        });
        
        if (!companyUser) {
          return res.status(403).json({
            status: 'error',
            message: 'User not found in company'
          });
        }
        
        // Extract all permission codes from user's roles
        const dbPermissions = [];
        companyUser.userRoles.forEach(userRole => {
          userRole.role.rolePermissions.forEach(rolePerm => {
            dbPermissions.push(rolePerm.permission.code);
          });
        });
        
        // Check again with database permissions
        const hasAllFromDB = permissions.every(permission => 
          dbPermissions.includes(permission)
        );
        
        if (!hasAllFromDB) {
          return res.status(403).json({
            status: 'error',
            message: `Insufficient permissions. Required: [${permissions.join(', ')}]`
          });
        }
        
        // Update token permissions for future requests (optional)
        req.user.permissions = [...new Set([...userPermissions, ...dbPermissions])];
      } catch (error) {
        console.error('Permission check error:', error);
        return res.status(403).json({
          status: 'error',
          message: 'Permission check failed'
        });
      }
    }
    
    next();
  };
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources unless they have admin role
 * @param {string} resourceParam - Name of the parameter containing resource ID
 * @param {string} resourceType - Type of resource ('employee', 'document', etc.)
 */
const isOwnerOrAdmin = (resourceParam = 'id', resourceType = 'employee') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }
    
    const resourceId = req.params[resourceParam];
    if (!resourceId) {
      return next(); // No resource ID to check
    }
    
    // Admins can access any resource
    const userRoles = req.user.roles || [];
    const isAdmin = userRoles.some(role =>
      ['super-admin', 'company-admin', 'hr'].includes(role)
    );
    
    if (isAdmin) {
      return next();
    }
    
    // Check if user owns the resource
    try {
      let isOwner = false;
      
      switch (resourceType) {
        case 'employee':
          // For employee resources, check if the resource belongs to the user
          if (resourceParam === 'id' || resourceParam === 'employeeId') {
            const companyUser = await prisma.companyUser.findFirst({
              where: {
                id: BigInt(resourceId),
                userId: BigInt(req.user.userId)
              }
            });
            isOwner = !!companyUser;
          }
          break;
          
        case 'document':
          // For document resources
          const document = await prisma.employeeDocument.findFirst({
            where: {
              id: BigInt(resourceId),
              companyUserId: BigInt(req.user.companyUserId)
            }
          });
          isOwner = !!document;
          break;
          
        case 'assignment':
          // For assignment resources
          const assignment = await prisma.employeeAssignment.findFirst({
            where: {
              id: BigInt(resourceId),
              companyUserId: BigInt(req.user.companyUserId)
            }
          });
          isOwner = !!assignment;
          break;
          
        default:
          // For generic resources, assume ownership if user ID matches
          if (resourceId === req.user.userId?.toString() || 
              resourceId === req.user.companyUserId?.toString()) {
            isOwner = true;
          }
      }
      
      if (!isOwner) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only access your own resources'
        });
      }
      
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Ownership verification failed'
      });
    }
  };
};

/**
 * Combined middleware for protected company resources
 * Combines protect, companyFilter, and optional role/permission checks
 */
const protectCompanyResource = (options = {}) => {
  const middlewares = [protect, companyFilter];
  
  if (options.roles && options.roles.length > 0) {
    middlewares.push(authorize(...options.roles));
  }
  
  if (options.permissions && options.permissions.length > 0) {
    middlewares.push(hasPermission(...options.permissions));
  }
  
  if (options.ownership) {
    middlewares.push(isOwnerOrAdmin(options.ownership.param, options.ownership.type));
  }
  
  // Execute middlewares in sequence
  return (req, res, next) => {
    const executeMiddleware = (index) => {
      if (index >= middlewares.length) {
        return next();
      }
      
      const middleware = middlewares[index];
      middleware(req, res, (err) => {
        if (err) {
          return next(err);
        }
        executeMiddleware(index + 1);
      });
    };
    
    executeMiddleware(0);
  };
};

module.exports = {
  protect,
  companyFilter,
  authorize,
  hasPermission,
  isOwnerOrAdmin,
  protectCompanyResource
};