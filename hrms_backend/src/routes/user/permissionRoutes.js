const express = require('express');
const router = express.Router();
const {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  searchPermissions,
  getPermissionsByModule
} = require('../../controllers/user/permissionController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All permission routes require authentication
router.use(protect);

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     description: Retrieve a list of all system permissions (system-wide, not company-specific)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions retrieved successfully
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
 *                       code:
 *                         type: string
 *                         example: "user.create"
 *                       module:
 *                         type: string
 *                         example: "user"
 *                       description:
 *                         type: string
 *                         example: "Create new users"
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllPermissions);

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Get permission by ID
 *     description: Retrieve a specific permission by its ID
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission retrieved successfully
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
 *                     code:
 *                       type: string
 *                       example: "user.create"
 *                     module:
 *                       type: string
 *                       example: "user"
 *                     description:
 *                       type: string
 *                       example: "Create new users"
 *       400:
 *         description: Bad request - Permission ID is required
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getPermissionById);

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Create a new permission
 *     description: Create a new system permission (super admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - module
 *             properties:
 *               code:
 *                 type: string
 *                 example: "user.create"
 *                 description: Unique permission code
 *               module:
 *                 type: string
 *                 example: "user"
 *                 description: Module name
 *               description:
 *                 type: string
 *                 example: "Create new users"
 *                 description: Permission description
 *     responses:
 *       201:
 *         description: Permission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Permission created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     code:
 *                       type: string
 *                       example: "user.create"
 *                     module:
 *                       type: string
 *                       example: "user"
 *                     description:
 *                       type: string
 *                       example: "Create new users"
 *       400:
 *         description: Bad request - Missing required fields
 *       409:
 *         description: Conflict - Permission with this code already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authorize('super-admin'), createPermission);

/**
 * @swagger
 * /permissions/{id}:
 *   put:
 *     summary: Update a permission
 *     description: Update an existing permission (super admin only)
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "user.create"
 *                 description: Unique permission code
 *               module:
 *                 type: string
 *                 example: "user"
 *                 description: Module name
 *               description:
 *                 type: string
 *                 example: "Create new users"
 *                 description: Permission description
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Permission updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     code:
 *                       type: string
 *                       example: "user.create"
 *                     module:
 *                       type: string
 *                       example: "user"
 *                     description:
 *                       type: string
 *                       example: "Create new users"
 *       400:
 *         description: Bad request - Permission ID is required
 *       404:
 *         description: Permission not found
 *       409:
 *         description: Conflict - Permission with this code already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authorize('super-admin'), updatePermission);

/**
 * @swagger
 * /permissions/{id}:
 *   delete:
 *     summary: Delete a permission
 *     description: Delete a permission (super admin only). Cannot delete if permission is assigned to roles.
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Permission deleted successfully
 *       400:
 *         description: Bad request - Permission ID is required or permission is assigned to roles
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authorize('super-admin'), deletePermission);

/**
 * @swagger
 * /permissions/search:
 *   get:
 *     summary: Search permissions
 *     description: Search permissions by code, module, or description
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *                       code:
 *                         type: string
 *                         example: "user.create"
 *                       module:
 *                         type: string
 *                         example: "user"
 *                       description:
 *                         type: string
 *                         example: "Create new users"
 *       400:
 *         description: Bad request - Search query is required
 *       500:
 *         description: Internal server error
 */
router.get('/search', searchPermissions);

/**
 * @swagger
 * /permissions/module/{module}:
 *   get:
 *     summary: Get permissions by module
 *     description: Retrieve all permissions for a specific module
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *         description: Module name
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
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
 *                       code:
 *                         type: string
 *                         example: "user.create"
 *                       module:
 *                         type: string
 *                         example: "user"
 *                       description:
 *                         type: string
 *                         example: "Create new users"
 *       400:
 *         description: Bad request - Module name is required
 *       500:
 *         description: Internal server error
 */
router.get('/module/:module', getPermissionsByModule);

module.exports = router;