const express = require('express');
const router = express.Router();
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  searchRoles
} = require('../../controllers/user/roleController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All role routes require authentication
router.use(protect);

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     description: Retrieve a list of all roles for the current company
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
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
 *                       companyId:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: "Super Admin"
 *                       description:
 *                         type: string
 *                         example: "Full access to everything"
 *                       isSystem:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       userCount:
 *                         type: integer
 *                         example: 1
 *                       permissionCount:
 *                         type: integer
 *                         example: 14
 *       400:
 *         description: Bad request - Company ID not found in token
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllRoles);

/**
 * @swagger
 * /roles/search:
 *   get:
 *     summary: Search roles
 *     description: Search roles by name, description, or filter by system status
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for name or description
 *       - in: query
 *         name: isSystem
 *         schema:
 *           type: boolean
 *         description: Filter by system role status
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
 *                     $ref: '#/components/schemas/Role'
 *       400:
 *         description: Bad request - Company ID not found in token
 *       500:
 *         description: Internal server error
 */
router.get('/search', searchRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     description: Retrieve a specific role by ID with its permissions and users
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/RoleDetail'
 *       400:
 *         description: Bad request - Company ID not found in token
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getRoleById);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     description: Create a new role for the current company
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "HR Manager"
 *               description:
 *                 type: string
 *                 example: "Manages employees and documents"
 *               isSystem:
 *                 type: boolean
 *                 example: false
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1", "2", "5", "6", "8", "9", "10", "13", "14"]
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/RoleWithPermissions'
 *       400:
 *         description: Bad request - Missing required fields or validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', createRole);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update role
 *     description: Update an existing role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "HR Manager Updated"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *               isSystem:
 *                 type: boolean
 *                 example: false
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1", "2", "5", "6", "8", "9", "10", "13", "14"]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/RoleWithPermissions'
 *       400:
 *         description: Bad request - Validation error
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete role
 *     description: Delete a role (system roles cannot be deleted)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
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
 *                   example: "Role deleted successfully"
 *       400:
 *         description: Bad request - Cannot delete system role or Company ID not found
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteRole);

module.exports = router;