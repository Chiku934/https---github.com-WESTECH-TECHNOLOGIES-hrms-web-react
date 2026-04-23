const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers
} = require('../../controllers/user/userController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All user routes require authentication
router.use(protect);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users (super admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
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
 *                       email:
 *                         type: string
 *                         example: "arjun.sharma@suryodaya.in"
 *                       phone:
 *                         type: string
 *                         example: "+919812345001"
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       emailVerified:
 *                         type: boolean
 *                         example: true
 *                       mfaEnabled:
 *                         type: boolean
 *                         example: false
 *                       lastLoginAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       companies:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "1"
 *                             name:
 *                               type: string
 *                               example: "Suryodaya Technologies"
 *                             slug:
 *                               type: string
 *                               example: "suryodaya"
 *                             employeeCode:
 *                               type: string
 *                               example: "SUR001"
 *                             status:
 *                               type: string
 *                               example: "active"
 *                             joinedAt:
 *                               type: string
 *                               format: date
 *                       companyCount:
 *                         type: integer
 *                         example: 1
 *       403:
 *         description: Unauthorized - Only super admins can access all users
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users
 *     description: Search users by email, phone, or filter by status (super admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for email or phone
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: emailVerified
 *         schema:
 *           type: boolean
 *         description: Filter by email verification status
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
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Unauthorized - Only super admins can search users
 *       500:
 *         description: Internal server error
 */
router.get('/search', searchUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user by ID (super admin or the user themselves)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/UserDetail'
 *       403:
 *         description: Unauthorized - You can only access your own profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user (super admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "new.user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               emailVerified:
 *                 type: boolean
 *                 example: false
 *               mfaEnabled:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Missing required fields or email already exists
 *       403:
 *         description: Unauthorized - Only super admins can create users
 *       500:
 *         description: Internal server error
 */
router.post('/', createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     description: Update an existing user (super admin or the user themselves)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "updated.email@example.com"
 *               password:
 *                 type: string
 *                 description: New password (super admin only)
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               emailVerified:
 *                 type: boolean
 *                 example: true
 *               mfaEnabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Email already exists
 *       403:
 *         description: Unauthorized - You can only update your own profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Delete a user (super admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: "User deleted successfully"
 *       403:
 *         description: Unauthorized - Only super admins can delete users
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteUser);

module.exports = router;