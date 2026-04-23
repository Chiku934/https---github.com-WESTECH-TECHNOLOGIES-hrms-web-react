const prisma = require('../config/prisma');

/**
 * Audit Logger Utility
 * Provides standardized audit logging across the application
 */

/**
 * Create an audit log entry
 * @param {Object} options - Audit log options
 * @param {string} options.entity - Entity type (e.g., 'employee', 'user', 'document')
 * @param {string|number} options.entityId - Entity ID
 * @param {string} options.action - Action performed (e.g., 'create', 'update', 'delete', 'login', 'logout')
 * @param {Object} options.diff - Changes made (optional)
 * @param {string|number} options.companyId - Company ID (optional, will use req.user.companyId if not provided)
 * @param {string|number} options.actorUserId - User ID of the actor (optional, will use req.user.userId if not provided)
 * @param {Object} options.req - Request object (optional, used to extract IP and user agent)
 * @param {string} options.ipAddress - IP address (optional, extracted from req if not provided)
 * @param {string} options.userAgent - User agent (optional, extracted from req if not provided)
 * @param {string} options.description - Human-readable description (optional)
 * @returns {Promise<Object>} Created audit log entry
 */
const createAuditLog = async (options) => {
  try {
    const {
      entity,
      entityId,
      action,
      diff = null,
      companyId = null,
      actorUserId = null,
      req = null,
      ipAddress = null,
      userAgent = null,
      description = null
    } = options;

    if (!entity || !action) {
      console.warn('Audit log missing required fields:', { entity, action });
      return null;
    }

    // Extract IP and user agent from request if available
    let finalIpAddress = ipAddress;
    let finalUserAgent = userAgent;
    
    if (req) {
      finalIpAddress = finalIpAddress || req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      finalUserAgent = finalUserAgent || req.headers['user-agent'];
    }

    // Prepare audit log data
    const auditData = {
      entity,
      entityId: entityId ? BigInt(entityId) : null,
      action,
      diff: diff ? JSON.stringify(diff) : null,
      companyId: companyId ? BigInt(companyId) : null,
      actorUserId: actorUserId ? BigInt(actorUserId) : null,
      ipAddress: finalIpAddress,
      userAgent: finalUserAgent,
      description
    };

    // Create audit log entry
    const auditLog = await prisma.auditLog.create({
      data: auditData
    });

    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error - audit logging failure shouldn't break the main operation
    return null;
  }
};

/**
 * Create audit log from request context
 * Convenience method that extracts companyId and actorUserId from req.user
 * @param {Object} req - Express request object
 * @param {Object} options - Audit log options (entity, entityId, action, diff)
 * @returns {Promise<Object>} Created audit log entry
 */
const auditFromRequest = async (req, options) => {
  const companyId = req.user?.companyId;
  const actorUserId = req.user?.userId;
  
  return createAuditLog({
    ...options,
    companyId,
    actorUserId,
    req
  });
};

/**
 * Log user login activity
 * @param {Object} req - Request object
 * @param {Object} user - User object
 * @returns {Promise<Object>} Created audit log entry
 */
const logLogin = async (req, user) => {
  return auditFromRequest(req, {
    entity: 'user',
    entityId: user.id,
    action: 'login',
    description: `User ${user.email} logged in`
  });
};

/**
 * Log user logout activity
 * @param {Object} req - Request object
 * @param {Object} user - User object
 * @returns {Promise<Object>} Created audit log entry
 */
const logLogout = async (req, user) => {
  return auditFromRequest(req, {
    entity: 'user',
    entityId: user.id,
    action: 'logout',
    description: `User ${user.email} logged out`
  });
};

/**
 * Log employee creation
 * @param {Object} req - Request object
 * @param {Object} employee - Employee object
 * @param {Object} diff - Employee data that was created
 * @returns {Promise<Object>} Created audit log entry
 */
const logEmployeeCreate = async (req, employee, diff = null) => {
  return auditFromRequest(req, {
    entity: 'employee',
    entityId: employee.id,
    action: 'create',
    diff,
    description: `Employee ${employee.employeeCode || employee.email} created`
  });
};

/**
 * Log employee update
 * @param {Object} req - Request object
 * @param {Object} employee - Employee object
 * @param {Object} diff - Changes made
 * @returns {Promise<Object>} Created audit log entry
 */
const logEmployeeUpdate = async (req, employee, diff = null) => {
  return auditFromRequest(req, {
    entity: 'employee',
    entityId: employee.id,
    action: 'update',
    diff,
    description: `Employee ${employee.employeeCode || employee.email} updated`
  });
};

/**
 * Log employee deletion
 * @param {Object} req - Request object
 * @param {Object} employee - Employee object
 * @returns {Promise<Object>} Created audit log entry
 */
const logEmployeeDelete = async (req, employee) => {
  return auditFromRequest(req, {
    entity: 'employee',
    entityId: employee.id,
    action: 'delete',
    description: `Employee ${employee.employeeCode || employee.email} deleted`
  });
};

/**
 * Log permission changes
 * @param {Object} req - Request object
 * @param {Object} target - Target user/role
 * @param {string} targetType - 'user' or 'role'
 * @param {Object} changes - Permission changes
 * @returns {Promise<Object>} Created audit log entry
 */
const logPermissionChange = async (req, target, targetType, changes) => {
  return auditFromRequest(req, {
    entity: targetType,
    entityId: target.id,
    action: 'permission_change',
    diff: changes,
    description: `Permissions changed for ${targetType} ${target.name || target.email}`
  });
};

/**
 * Get audit logs with filtering
 * @param {Object} filters - Filter options
 * @param {string|number} filters.companyId - Company ID
 * @param {string} filters.entity - Entity type
 * @param {string|number} filters.entityId - Entity ID
 * @param {string} filters.action - Action type
 * @param {string|number} filters.actorUserId - Actor user ID
 * @param {Date} filters.startDate - Start date
 * @param {Date} filters.endDate - End date
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 50)
 * @returns {Promise<Object>} Paginated audit logs
 */
const getAuditLogs = async (filters = {}) => {
  try {
    const {
      companyId,
      entity,
      entityId,
      action,
      actorUserId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    const whereClause = {};
    
    if (companyId) whereClause.companyId = BigInt(companyId);
    if (entity) whereClause.entity = entity;
    if (entityId) whereClause.entityId = BigInt(entityId);
    if (action) whereClause.action = action;
    if (actorUserId) whereClause.actorUserId = BigInt(actorUserId);
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await prisma.auditLog.count({
      where: whereClause
    });
    
    // Get paginated results
    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        },
        actorUser: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    throw error;
  }
};

/**
 * Middleware to automatically log HTTP requests
 * @param {Object} options - Middleware options
 * @param {Array} options.excludePaths - Paths to exclude from logging
 * @param {Array} options.excludeMethods - HTTP methods to exclude
 * @returns {Function} Express middleware
 */
const requestLoggerMiddleware = (options = {}) => {
  const {
    excludePaths = ['/health', '/metrics', '/favicon.ico'],
    excludeMethods = ['GET', 'OPTIONS', 'HEAD']
  } = options;

  return async (req, res, next) => {
    // Skip excluded paths and methods
    if (excludePaths.includes(req.path) || excludeMethods.includes(req.method)) {
      return next();
    }

    // Store original end method
    const originalEnd = res.end;
    const startTime = Date.now();

    // Override end method to log after response is sent
    res.end = function (...args) {
      // Restore original end
      res.end = originalEnd;
      
      // Call original end
      originalEnd.apply(res, args);
      
      // Log the request (async, don't wait)
      setTimeout(async () => {
        try {
          const duration = Date.now() - startTime;
          const statusCode = res.statusCode;
          
          // Only log significant events (errors or non-GET requests)
          if (statusCode >= 400 || req.method !== 'GET') {
            await createAuditLog({
              entity: 'http_request',
              entityId: null,
              action: req.method.toLowerCase(),
              companyId: req.user?.companyId,
              actorUserId: req.user?.userId,
              req,
              description: `${req.method} ${req.path} - ${statusCode} (${duration}ms)`,
              diff: {
                method: req.method,
                path: req.path,
                statusCode,
                duration,
                query: req.query,
                params: req.params
              }
            });
          }
        } catch (error) {
          console.error('Request logging failed:', error);
        }
      }, 0);
    };

    next();
  };
};

module.exports = {
  createAuditLog,
  auditFromRequest,
  logLogin,
  logLogout,
  logEmployeeCreate,
  logEmployeeUpdate,
  logEmployeeDelete,
  logPermissionChange,
  getAuditLogs,
  requestLoggerMiddleware
};