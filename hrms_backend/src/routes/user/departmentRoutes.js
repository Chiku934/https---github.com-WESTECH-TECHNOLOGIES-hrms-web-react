const express = require('express');
const router = express.Router();
const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  searchDepartments
} = require('../../controllers/user/departmentController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All department routes require authentication
router.use(protect);

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     description: Retrieve a list of all departments for the current company
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of departments retrieved successfully
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
 *                         example: "Engineering"
 *                       code:
 *                         type: string
 *                         example: "ENG"
 *                       parentId:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       headId:
 *                         type: string
 *                         nullable: true
 *                         example: "5"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       childrenCount:
 *                         type: integer
 *                         example: 2
 *                       employeeCount:
 *                         type: integer
 *                         example: 15
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), getAllDepartments);

/**
 * @swagger
 * /departments/search:
 *   get:
 *     summary: Search departments
 *     description: Search departments by name or code
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for department name or code
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
 *                       name:
 *                         type: string
 *                         example: "Engineering"
 *                       code:
 *                         type: string
 *                         example: "ENG"
 *                       parentId:
 *                         type: string
 *                         nullable: true
 *                       employeeCount:
 *                         type: integer
 *                         example: 15
 *       400:
 *         description: Bad request - search query is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.get('/search', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), searchDepartments);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     description: Retrieve a specific department by its ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department retrieved successfully
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
 *                     name:
 *                       type: string
 *                       example: "Engineering"
 *                     code:
 *                       type: string
 *                       example: "ENG"
 *                     parentId:
 *                       type: string
 *                       nullable: true
 *                     headId:
 *                       type: string
 *                       nullable: true
 *                     children:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           code:
 *                             type: string
 *                     employeeCount:
 *                       type: integer
 *                       example: 15
 *       400:
 *         description: Bad request - department ID is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), getDepartmentById);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     description: Create a new department for the current company
 *     tags: [Departments]
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
 *                 example: "Engineering"
 *               code:
 *                 type: string
 *                 example: "ENG"
 *               parentId:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *               headId:
 *                 type: integer
 *                 nullable: true
 *                 example: 5
 *     responses:
 *       201:
 *         description: Department created successfully
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
 *                   example: Department created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     name:
 *                       type: string
 *                       example: "Engineering"
 *                     code:
 *                       type: string
 *                       example: "ENG"
 *       400:
 *         description: Bad request - missing required fields or validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - department with same name already exists
 *       500:
 *         description: Server error
 */
router.post('/', authorize('hr', 'super-admin', 'company-admin'), createDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update a department
 *     description: Update an existing department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Engineering Department"
 *               code:
 *                 type: string
 *                 example: "ENG-DEPT"
 *               parentId:
 *                 type: integer
 *                 nullable: true
 *               headId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Department updated successfully
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
 *                   example: Department updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     name:
 *                       type: string
 *                       example: "Engineering Department"
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Department not found
 *       409:
 *         description: Conflict - department with same name already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', authorize('hr', 'super-admin', 'company-admin'), updateDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete a department
 *     description: Delete a department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
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
 *                   example: Department deleted successfully
 *       400:
 *         description: Bad request - cannot delete department with children or employees
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Department not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authorize('hr', 'super-admin', 'company-admin'), deleteDepartment);

module.exports = router;