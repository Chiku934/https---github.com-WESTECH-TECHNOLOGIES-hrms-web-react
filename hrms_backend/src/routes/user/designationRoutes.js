const express = require('express');
const router = express.Router();
const {
  getAllDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  searchDesignations
} = require('../../controllers/user/designationController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All designation routes require authentication
router.use(protect);

/**
 * @swagger
 * /designations:
 *   get:
 *     summary: Get all designations
 *     description: Retrieve a list of all designations for the current company
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of designations retrieved successfully
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
 *                       title:
 *                         type: string
 *                         example: "Software Engineer"
 *                       level:
 *                         type: integer
 *                         nullable: true
 *                         example: 3
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       employeeCount:
 *                         type: integer
 *                         example: 8
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), getAllDesignations);

/**
 * @swagger
 * /designations/search:
 *   get:
 *     summary: Search designations
 *     description: Search designations by title
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for designation title
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
 *                       title:
 *                         type: string
 *                         example: "Software Engineer"
 *                       level:
 *                         type: integer
 *                         nullable: true
 *                       employeeCount:
 *                         type: integer
 *                         example: 8
 *       400:
 *         description: Bad request - search query is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.get('/search', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), searchDesignations);

/**
 * @swagger
 * /designations/{id}:
 *   get:
 *     summary: Get designation by ID
 *     description: Retrieve a specific designation by its ID
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Designation ID
 *     responses:
 *       200:
 *         description: Designation retrieved successfully
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
 *                     companyId:
 *                       type: string
 *                       example: "1"
 *                     title:
 *                       type: string
 *                       example: "Software Engineer"
 *                     level:
 *                       type: integer
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     employeeCount:
 *                       type: integer
 *                       example: 8
 *       400:
 *         description: Bad request - designation ID is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Designation not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), getDesignationById);

/**
 * @swagger
 * /designations:
 *   post:
 *     summary: Create a new designation
 *     description: Create a new designation for the current company
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Software Engineer"
 *               level:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *     responses:
 *       201:
 *         description: Designation created successfully
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
 *                   example: Designation created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     title:
 *                       type: string
 *                       example: "Software Engineer"
 *                     level:
 *                       type: integer
 *                       nullable: true
 *       400:
 *         description: Bad request - missing required fields or validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - designation with same title already exists
 *       500:
 *         description: Server error
 */
router.post('/', authorize('hr', 'super-admin', 'company-admin'), createDesignation);

/**
 * @swagger
 * /designations/{id}:
 *   put:
 *     summary: Update a designation
 *     description: Update an existing designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Designation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               level:
 *                 type: integer
 *                 nullable: true
 *                 example: 4
 *     responses:
 *       200:
 *         description: Designation updated successfully
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
 *                   example: Designation updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     title:
 *                       type: string
 *                       example: "Senior Software Engineer"
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Designation not found
 *       409:
 *         description: Conflict - designation with same title already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', authorize('hr', 'super-admin', 'company-admin'), updateDesignation);

/**
 * @swagger
 * /designations/{id}:
 *   delete:
 *     summary: Delete a designation
 *     description: Delete a designation by ID
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Designation ID
 *     responses:
 *       200:
 *         description: Designation deleted successfully
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
 *                   example: Designation deleted successfully
 *       400:
 *         description: Bad request - cannot delete designation with employees assigned
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Designation not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authorize('hr', 'super-admin', 'company-admin'), deleteDesignation);

module.exports = router;