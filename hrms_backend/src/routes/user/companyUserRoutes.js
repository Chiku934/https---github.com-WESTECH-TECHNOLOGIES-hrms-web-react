const express = require('express');
const router = express.Router();
const {
  getAllCompanyUsers,
  getCompanyUserById,
  createCompanyUser,
  updateCompanyUser,
  deleteCompanyUser,
  searchCompanyUsers
} = require('../../controllers/user/companyUserController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All company user routes require authentication
router.use(protect);

/**
 * @swagger
 * /company-users:
 *   get:
 *     summary: Get all company users
 *     description: Retrieve a list of all users in the current company
 *     tags: [Company Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of company users retrieved successfully
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
 *                       userId:
 *                         type: string
 *                         example: "1"
 *                       employeeCode:
 *                         type: string
 *                         example: "SUR001"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       joinedAt:
 *                         type: string
 *                         format: date
 *                       leftAt:
 *                         type: string
 *                         format: date
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           email:
 *                             type: string
 *                             example: "arjun.sharma@suryodaya.in"
 *                           phone:
 *                             type: string
 *                             example: "+919812345001"
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *                           emailVerified:
 *                             type: boolean
 *                             example: true
 *                           lastLoginAt:
 *                             type: string
 *                             format: date-time
 *                       profile:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                             example: "Arjun"
 *                           lastName:
 *                             type: string
 *                             example: "Sharma"
 *                           dob:
 *                             type: string
 *                             format: date
 *                           gender:
 *                             type: string
 *                             example: "Male"
 *                           personalEmail:
 *                             type: string
 *                             example: "arjun.sharma85@gmail.com"
 *                           personalPhone:
 *                             type: string
 *                             example: "+919812345001"
 *                       currentAssignment:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           department:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "1"
 *                               name:
 *                                 type: string
 *                                 example: "Engineering"
 *                               code:
 *                                 type: string
 *                                 example: "ENG"
 *                           designation:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "1"
 *                               title:
 *                                 type: string
 *                                 example: "Chief Technology Officer"
 *                               level:
 *                                 type: integer
 *                                 example: 10
 *                           employmentType:
 *                             type: string
 *                             example: "full-time"
 *                           workLocation:
 *                             type: string
 *                             example: "Noida"
 *                           startDate:
 *                             type: string
 *                             format: date
 *                           endDate:
 *                             type: string
 *                             format: date
 *                           isCurrent:
 *                             type: boolean
 *                             example: true
 *                       roles:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "1"
 *                             name:
 *                               type: string
 *                               example: "Super Admin"
 *                             description:
 *                               type: string
 *                               example: "Full access to everything"
 *                             isSystem:
 *                               type: boolean
 *                               example: true
 *       400:
 *         description: Bad request - Company ID not found in token
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllCompanyUsers);

/**
 * @swagger
 * /company-users/search:
 *   get:
 *     summary: Search company users
 *     description: Search company users by employee code, email, name, or filter by status
 *     tags: [Company Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for employee code, email, phone, or name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (active, inactive, suspended)
 *       - in: query
 *         name: hasProfile
 *         schema:
 *           type: boolean
 *         description: Filter by whether user has a profile (true/false)
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
 *                     $ref: '#/components/schemas/CompanyUser'
 *       400:
 *         description: Bad request - Company ID not found in token
 *       500:
 *         description: Internal server error
 */
router.get('/search', searchCompanyUsers);

/**
 * @swagger
 * /company-users/{id}:
 *   get:
 *     summary: Get company user by ID
 *     description: Retrieve a specific company user by ID
 *     tags: [Company Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company User ID
 *     responses:
 *       200:
 *         description: Company user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CompanyUserDetail'
 *       400:
 *         description: Bad request - Company ID not found in token
 *       404:
 *         description: Company user not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getCompanyUserById);

/**
 * @swagger
 * /company-users:
 *   post:
 *     summary: Create a new company user
 *     description: Add a user to the current company
 *     tags: [Company Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "1"
 *               employeeCode:
 *                 type: string
 *                 example: "SUR001"
 *               status:
 *                 type: string
 *                 example: "active"
 *               joinedAt:
 *                 type: string
 *                 format: date
 *                 example: "2022-04-01"
 *               leftAt:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Company user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CompanyUser'
 *       400:
 *         description: Bad request - Missing required fields or validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/', createCompanyUser);

/**
 * @swagger
 * /company-users/{id}:
 *   put:
 *     summary: Update company user
 *     description: Update an existing company user
 *     tags: [Company Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               employeeCode:
 *                 type: string
 *                 example: "SUR001"
 *               status:
 *                 type: string
 *                 example: "active"
 *               joinedAt:
 *                 type: string
 *                 format: date
 *                 example: "2022-04-01"
 *               leftAt:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Company user updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CompanyUser'
 *       400:
 *         description: Bad request - Validation error
 *       404:
 *         description: Company user not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateCompanyUser);

/**
 * @swagger
 * /company-users/{id}:
 *   delete:
 *     summary: Delete company user
 *     description: Remove a user from the company
 *     tags: [Company Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company User ID
 *     responses:
 *       200:
 *         description: Company user deleted successfully
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
 *                   example: "Company user deleted successfully"
 *       400:
 *         description: Bad request - Company ID not found in token
 *       404:
 *         description: Company user not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteCompanyUser);

module.exports = router;