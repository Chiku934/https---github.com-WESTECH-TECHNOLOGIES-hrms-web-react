const express = require('express');
const router = express.Router();
const {
  getUserRoles,
  addRoleToUser,
  removeRoleFromUser,
  updateUserRoles,
  checkUserRole
} = require('../../controllers/user/userRoleController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All user role routes require authentication
router.use(protect);

/**
 * @swagger
 * /company-users/{companyUserId}/roles:
 *   get:
 *     summary: Get all roles for a user
 *     description: Retrieve all roles assigned to a specific company user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company User ID
 *     responses:
 *       200:
 *         description: User roles retrieved successfully
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
 *                       companyUserId:
 *                         type: string
 *                         example: "1"
 *                       roleId:
 *                         type: string
 *                         example: "1"
 *                       assignedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00.000Z"
 *                       assignedBy:
 *                         type: string
 *                         nullable: true
 *                         example: "2"
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           name:
 *                             type: string
 *                             example: "Admin"
 *                           description:
 *                             type: string
 *                             example: "Administrator role"
 *                           isSystem:
 *                             type: boolean
 *                             example: false
 *                       assignedByUser:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "2"
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "2"
 *                               email:
 *                                 type: string
 *                                 example: "admin@example.com"
 *       400:
 *         description: Bad request - Company User ID is required or Company ID not found
 *       404:
 *         description: Company user not found or you do not have access to it
 *       500:
 *         description: Internal server error
 */
router.get('/:companyUserId/roles', getUserRoles);

/**
 * @swagger
 * /company-users/{companyUserId}/roles:
 *   post:
 *     summary: Add a role to a user
 *     description: Assign a role to a specific company user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 example: "1"
 *                 description: Role ID to add to the user
 *     responses:
 *       201:
 *         description: Role added to user successfully
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
 *                   example: Role added to user successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     companyUserId:
 *                       type: string
 *                       example: "1"
 *                     roleId:
 *                       type: string
 *                       example: "1"
 *                     assignedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *                     assignedBy:
 *                       type: string
 *                       nullable: true
 *                       example: "2"
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1"
 *                         name:
 *                           type: string
 *                           example: "Admin"
 *                         description:
 *                           type: string
 *                           example: "Administrator role"
 *                         isSystem:
 *                           type: boolean
 *                           example: false
 *                     assignedByUser:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "2"
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "2"
 *                             email:
 *                               type: string
 *                               example: "admin@example.com"
 *       400:
 *         description: Bad request - Company User ID and Role ID are required
 *       404:
 *         description: Company user or role not found
 *       409:
 *         description: Conflict - Role is already assigned to this user
 *       500:
 *         description: Internal server error
 */
router.post('/:companyUserId/roles', authorize('admin'), addRoleToUser);

/**
 * @swagger
 * /company-users/{companyUserId}/roles/{roleId}:
 *   delete:
 *     summary: Remove a role from a user
 *     description: Remove a role from a specific company user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company User ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role removed from user successfully
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
 *                   example: Role removed from user successfully
 *       400:
 *         description: Bad request - Company User ID and Role ID are required
 *       404:
 *         description: Company user, role, or user-role relationship not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:companyUserId/roles/:roleId', authorize('admin'), removeRoleFromUser);

/**
 * @swagger
 * /company-users/{companyUserId}/roles/bulk:
 *   put:
 *     summary: Bulk update roles for a user
 *     description: Replace all roles for a user with the provided list
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleIds
 *             properties:
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1", "2", "3"]
 *                 description: Array of role IDs to assign to the user
 *     responses:
 *       200:
 *         description: User roles updated successfully
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
 *                   example: User roles updated successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       companyUserId:
 *                         type: string
 *                         example: "1"
 *                       roleId:
 *                         type: string
 *                         example: "1"
 *                       assignedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00.000Z"
 *                       assignedBy:
 *                         type: string
 *                         nullable: true
 *                         example: "2"
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           name:
 *                             type: string
 *                             example: "Admin"
 *                           description:
 *                             type: string
 *                             example: "Administrator role"
 *                           isSystem:
 *                             type: boolean
 *                             example: false
 *                       assignedByUser:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "2"
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "2"
 *                               email:
 *                                 type: string
 *                                 example: "admin@example.com"
 *       400:
 *         description: Bad request - Company User ID is required or roleIds must be an array
 *       404:
 *         description: Company user not found or one or more roles not found
 *       500:
 *         description: Internal server error
 */
router.put('/:companyUserId/roles/bulk', authorize('admin'), updateUserRoles);

/**
 * @swagger
 * /company-users/{companyUserId}/roles/{roleId}/check:
 *   get:
 *     summary: Check if a user has a specific role
 *     description: Verify whether a specific role is assigned to a user
 *     tags: [User Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: Company User ID
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role check completed successfully
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
 *                     hasRole:
 *                       type: boolean
 *                       example: true
 *                     role:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         companyUserId:
 *                           type: string
 *                           example: "1"
 *                         roleId:
 *                           type: string
 *                           example: "1"
 *                         assignedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *                         assignedBy:
 *                           type: string
 *                           nullable: true
 *                           example: "2"
 *                         role:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "1"
 *                             name:
 *                               type: string
 *                               example: "Admin"
 *                             description:
 *                               type: string
 *                               example: "Administrator role"
 *                             isSystem:
 *                               type: boolean
 *                               example: false
 *       400:
 *         description: Bad request - Company User ID and Role ID are required
 *       404:
 *         description: Company user or role not found
 *       500:
 *         description: Internal server error
 */
router.get('/:companyUserId/roles/:roleId/check', checkUserRole);

module.exports = router;