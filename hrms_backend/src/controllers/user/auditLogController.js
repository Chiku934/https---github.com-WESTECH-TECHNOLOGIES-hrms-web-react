const prisma = require('../../config/prisma');
const { getAuditLogs } = require('../../utils/auditLogger');

/**
 * Get audit logs with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAuditLogsController = async (req, res) => {
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
    } = req.query;

    // Parse query parameters
    const filters = {};
    
    if (companyId) {
      // For non-super admins, restrict to their company
      if (req.user.role !== 'super_admin' && req.user.companyId !== companyId) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only view audit logs for your own company'
        });
      }
      filters.companyId = companyId;
    } else if (req.user.role !== 'super_admin') {
      // Non-super admins can only see logs for their company
      filters.companyId = req.user.companyId;
    }
    
    if (entity) filters.entity = entity;
    if (entityId) filters.entityId = entityId;
    if (action) filters.action = action;
    if (actorUserId) filters.actorUserId = actorUserId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (page) filters.page = parseInt(page, 10);
    if (limit) filters.limit = parseInt(limit, 10);

    // Validate pagination
    if (filters.page < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Page must be greater than 0'
      });
    }
    
    if (filters.limit < 1 || filters.limit > 100) {
      return res.status(400).json({
        status: 'error',
        message: 'Limit must be between 1 and 100'
      });
    }

    // Get audit logs
    const result = await getAuditLogs(filters);

    // Transform BigInt values to strings
    const transformedLogs = result.logs.map(log => ({
      id: log.id.toString(),
      entity: log.entity,
      entityId: log.entityId ? log.entityId.toString() : null,
      action: log.action,
      diff: log.diff,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      description: log.description,
      createdAt: log.createdAt,
      company: log.company ? {
        id: log.company.id.toString(),
        name: log.company.name
      } : null,
      actorUser: log.actorUser ? {
        id: log.actorUser.id.toString(),
        email: log.actorUser.email
      } : null
    }));

    res.status(200).json({
      status: 'success',
      data: transformedLogs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting audit logs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get audit log by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Audit log ID is required'
      });
    }

    const auditLog = await prisma.auditLog.findUnique({
      where: {
        id: BigInt(id)
      },
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
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!auditLog) {
      return res.status(404).json({
        status: 'error',
        message: 'Audit log not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'super_admin' && auditLog.companyId && auditLog.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only view audit logs for your own company'
      });
    }

    // Transform BigInt values to strings
    const transformedLog = {
      id: auditLog.id.toString(),
      entity: auditLog.entity,
      entityId: auditLog.entityId ? auditLog.entityId.toString() : null,
      action: auditLog.action,
      diff: auditLog.diff,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      description: auditLog.description,
      createdAt: auditLog.createdAt,
      company: auditLog.company ? {
        id: auditLog.company.id.toString(),
        name: auditLog.company.name
      } : null,
      actorUser: auditLog.actorUser ? {
        id: auditLog.actorUser.id.toString(),
        email: auditLog.actorUser.email,
        firstName: auditLog.actorUser.firstName,
        lastName: auditLog.actorUser.lastName
      } : null
    };

    res.status(200).json({
      status: 'success',
      data: transformedLog
    });
  } catch (error) {
    console.error('Error getting audit log by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get audit log statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAuditLogStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build where clause based on user permissions
    const whereClause = {};
    
    if (req.user.role !== 'super_admin') {
      whereClause.companyId = BigInt(req.user.companyId);
    }
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    // Get total count
    const total = await prisma.auditLog.count({
      where: whereClause
    });

    // Get count by action
    const actions = await prisma.auditLog.groupBy({
      by: ['action'],
      where: whereClause,
      _count: {
        action: true
      },
      orderBy: {
        _count: {
          action: 'desc'
        }
      },
      take: 10
    });

    // Get count by entity
    const entities = await prisma.auditLog.groupBy({
      by: ['entity'],
      where: whereClause,
      _count: {
        entity: true
      },
      orderBy: {
        _count: {
          entity: 'desc'
        }
      },
      take: 10
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentWhereClause = {
      ...whereClause,
      createdAt: {
        gte: sevenDaysAgo
      }
    };

    const recentActivity = await prisma.auditLog.groupBy({
      by: ['createdAt'],
      where: recentWhereClause,
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Format recent activity for chart
    const activityByDay = {};
    recentActivity.forEach(item => {
      const date = item.createdAt.toISOString().split('T')[0];
      activityByDay[date] = (activityByDay[date] || 0) + item._count.id;
    });

    const activityChart = Object.entries(activityByDay).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      status: 'success',
      data: {
        total,
        byAction: actions.map(item => ({
          action: item.action,
          count: item._count.action
        })),
        byEntity: entities.map(item => ({
          entity: item.entity,
          count: item._count.entity
        })),
        recentActivity: activityChart
      }
    });
  } catch (error) {
    console.error('Error getting audit log statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve audit log statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search audit logs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const searchAuditLogs = async (req, res) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build where clause based on user permissions
    const whereClause = {
      OR: [
        { entity: { contains: q, mode: 'insensitive' } },
        { action: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { ipAddress: { contains: q, mode: 'insensitive' } }
      ]
    };
    
    if (req.user.role !== 'super_admin') {
      whereClause.companyId = BigInt(req.user.companyId);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

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
      take: parseInt(limit, 10)
    });

    // Transform BigInt values to strings
    const transformedLogs = logs.map(log => ({
      id: log.id.toString(),
      entity: log.entity,
      entityId: log.entityId ? log.entityId.toString() : null,
      action: log.action,
      diff: log.diff,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      description: log.description,
      createdAt: log.createdAt,
      company: log.company ? {
        id: log.company.id.toString(),
        name: log.company.name
      } : null,
      actorUser: log.actorUser ? {
        id: log.actorUser.id.toString(),
        email: log.actorUser.email
      } : null
    }));

    res.status(200).json({
      status: 'success',
      data: transformedLogs,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Error searching audit logs:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAuditLogsController,
  getAuditLogById,
  getAuditLogStatistics,
  searchAuditLogs
};