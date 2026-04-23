const express = require('express');
const router = express.Router();
const {
  getAuditLogsController,
  getAuditLogById,
  getAuditLogStatistics,
  searchAuditLogs
} = require('../../controllers/user/auditLogController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All audit log routes require authentication
router.use(protect);

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     summary: Get audit logs with filtering and pagination
 *     description: Retrieve audit logs with various filters. Super admins can see all logs, others only see their company's logs.
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: string
 *         description: Filter by company ID (super admin only)
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filter by entity type (e.g., 'employee', 'user', 'document')
 *       - in: query
 *         name: entityId
 *         schema:
 *           type: string
 *         description: Filter by entity ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action (e.g., 'create', 'update', 'delete', 'login')
 *       - in: query
 *         name: actorUserId
 *         schema:
 *           type: string
 *         description: Filter by actor user ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (ISO format)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       entity:
 *                         type: string
 *                         example: "employee"
 *                       entityId:
 *                         type: string
 *                         nullable: true
 *                         example: "123"
 *                       action:
 *                         type: string
 *                         example: "create"
 *                       diff:
 *                         type: object
 *                         nullable: true
 *                       ipAddress:
 *                         type: string
 *                         nullable: true
 *                         example: "192.168.1.1"
 *                       userAgent:
 *                         type: string
 *                         nullable: true
 *                         example: "Mozilla/5.0"
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: "Employee created"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T10:30:00.000Z"
 *                       company:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           name:
 *                             type: string
 *                             example: "Acme Corp"
 *                       actorUser:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "2"
 *                           email:
 *                             type: string
 *                             example: "admin@example.com"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Invalid query parameters
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/', authorize(['super_admin', 'admin', 'hr']), getAuditLogsController);

/**
 * @swagger
 * /audit-logs/{id}:
 *   get:
 *     summary: Get audit log by ID
 *     description: Retrieve a specific audit log entry by its ID
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Audit log ID
 *     responses:
 *       200:
 *         description: Audit log retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     entity:
 *                       type: string
 *                       example: "employee"
 *                     entityId:
 *                       type: string
 *                       nullable: true
 *                       example: "123"
 *                     action:
 *                       type: string
 *                       example: "create"
 *                     diff:
 *                       type: object
 *                       nullable: true
 *                     ipAddress:
 *                       type: string
 *                       nullable: true
 *                       example: "192.168.1.1"
 *                     userAgent:
 *                       type: string
 *                       nullable: true
 *                       example: "Mozilla/5.0"
 *                     description:
 *                       type: string
 *                       nullable: true
 *                       example: "Employee created"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T10:30:00.000Z"
 *                     company:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1"
 *                         name:
 *                           type: string
 *                           example: "Acme Corp"
 *                     actorUser:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "2"
 *                         email:
 *                           type: string
 *                           example: "admin@example.com"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *       400:
 *         description: Missing audit log ID
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Audit log not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authorize(['super_admin', 'admin', 'hr']), getAuditLogById);

/**
 * @swagger
 * /audit-logs/statistics:
 *   get:
 *     summary: Get audit log statistics
 *     description: Retrieve statistics about audit logs (counts by action, entity, recent activity)
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (ISO format)
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 1000
 *                     byAction:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                             example: "create"
 *                           count:
 *                             type: integer
 *                             example: 250
 *                     byEntity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           entity:
 *                             type: string
 *                             example: "employee"
 *                           count:
 *                             type: integer
 *                             example: 400
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2024-01-01"
 *                           count:
 *                             type: integer
 *                             example: 25
 *       500:
 *         description: Internal server error
 */
router.get('/statistics', authorize(['super_admin', 'admin', 'hr']), getAuditLogStatistics);

/**
 * @swagger
 * /audit-logs/search:
 *   get:
 *     summary: Search audit logs
 *     description: Search audit logs by entity, action, description, or IP address
 *     tags: [Audit Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       entity:
 *                         type: string
 *                         example: "employee"
 *                       entityId:
 *                         type: string
 *                         nullable: true
 *                         example: "123"
 *                       action:
 *                         type: string
 *                         example: "create"
 *                       diff:
 *                         type: object
 *                         nullable: true
 *                       ipAddress:
 *                         type: string
 *                         nullable: true
 *                         example: "192.168.1.1"
 *                       userAgent:
 *                         type: string
 *                         nullable: true
 *                         example: "Mozilla/5.0"
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: "Employee created"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T10:30:00.000Z"
 *                       company:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           name:
 *                             type: string
 *                             example: "Acme Corp"
 *                       actorUser:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "2"
 *                           email:
 *                             type: string
 *                             example: "admin@example.com"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 10
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid search query
 *       500:
 *         description: Internal server error
 */
router.get('/search', authorize(['super_admin', 'admin', 'hr']), searchAuditLogs);

module.exports = router;