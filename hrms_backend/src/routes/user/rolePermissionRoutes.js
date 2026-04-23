const express = require('express');
const router = express.Router();
const {
  getRolePermissions,
  addPermissionToRole,
  removePermissionFromRole,
  updateRolePermissions,
  checkRolePermission
} = require('../../controllers/user/rolePermissionController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All role permission routes require authentication
router.use(protect);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   get:
 *     summary: Get all permissions for a role
 *     description: Retrieve all permissions assigned to a specific role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
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
 *                       permissionId:
 *                         type: string
 *                         example: "1"
 *                       roleId:
 *                         type: string
 *                         example: "1"
 *                       permission:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           code:
 *                             type: string
 *                             example: "user.create"
 *                           module:
 *                             type: string
 *                             example: "user"
 *                           description:
 *                             type: string
 *                             example: "Create new users"
 *       400:
 *         description: Bad request - Role ID is required or Company ID not found
 *       404:
 *         description: Role not found or you do not have access to it
 *       500:
 *         description: Internal server error
 */
router.get('/:roleId/permissions', getRolePermissions);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   post:
 *     summary: Add a permission to a role
 *     description: Assign a permission to a specific role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
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
 *             required:
 *               - permissionId
 *             properties:
 *               permissionId:
 *                 type: string
 *                 example: "1"
 *                 description: Permission ID to add to the role
 *     responses:
 *       201:
 *         description: Permission added to role successfully
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
 *                   example: Permission added to role successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     permissionId:
 *                       type: string
 *                       example: "1"
 *                     roleId:
 *                       type: string
 *                       example: "1"
 *                     permission:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1"
 *                         code:
 *                           type: string
 *                           example: "user.create"
 *                         module:
 *                           type: string
 *                           example: "user"
 *                         description:
 *                           type: string
 *                           example: "Create new users"
 *       400:
 *         description: Bad request - Role ID and Permission ID are required
 *       404:
 *         description: Role or permission not found
 *       409:
 *         description: Conflict - Permission is already assigned to this role
 *       500:
 *         description: Internal server error
 */
router.post('/:roleId/permissions', authorize('admin'), addPermissionToRole);

/**
 * @swagger
 * /roles/{roleId}/permissions/{permissionId}:
 *   delete:
 *     summary: Remove a permission from a role
 *     description: Remove a permission from a specific role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission removed from role successfully
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
 *                   example: Permission removed from role successfully
 *       400:
 *         description: Bad request - Role ID and Permission ID are required
 *       404:
 *         description: Role, permission, or role-permission relationship not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:roleId/permissions/:permissionId', authorize('admin'), removePermissionFromRole);

/**
 * @swagger
 * /roles/{roleId}/permissions/bulk:
 *   put:
 *     summary: Bulk update permissions for a role
 *     description: Replace all permissions for a role with the provided list
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
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
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["1", "2", "3"]
 *                 description: Array of permission IDs to assign to the role
 *     responses:
 *       200:
 *         description: Role permissions updated successfully
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
 *                   example: Role permissions updated successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       permissionId:
 *                         type: string
 *                         example: "1"
 *                       roleId:
 *                         type: string
 *                         example: "1"
 *                       permission:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           code:
 *                             type: string
 *                             example: "user.create"
 *                           module:
 *                             type: string
 *                             example: "user"
 *                           description:
 *                             type: string
 *                             example: "Create new users"
 *       400:
 *         description: Bad request - Role ID is required or permissionIds must be an array
 *       404:
 *         description: Role not found or one or more permissions not found
 *       500:
 *         description: Internal server error
 */
router.put('/:roleId/permissions/bulk', authorize('admin'), updateRolePermissions);

/**
 * @swagger
 * /roles/{roleId}/permissions/{permissionId}/check:
 *   get:
 *     summary: Check if a role has a specific permission
 *     description: Verify whether a specific permission is assigned to a role
 *     tags: [Role Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission check completed successfully
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
 *                     hasPermission:
 *                       type: boolean
 *                       example: true
 *                     permission:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         permissionId:
 *                           type: string
 *                           example: "1"
 *                         roleId:
 *                           type: string
 *                           example: "1"
 *                         permission:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "1"
 *                             code:
 *                               type: string
 *                               example: "user.create"
 *                             module:
 *                               type: string
 *                               example: "user"
 *                             description:
 *                               type: string
 *                               example: "Create new users"
 *       400:
 *         description: Bad request - Role ID and Permission ID are required
 *       404:
 *         description: Role or permission not found
 *       500:
 *         description: Internal server error
 */
router.get('/:roleId/permissions/:permissionId/check', checkRolePermission);

module.exports = router;