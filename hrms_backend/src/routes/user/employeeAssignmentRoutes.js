const express = require('express');
const router = express.Router();
const {
  getEmployeeAssignments,
  getCurrentAssignment,
  createEmployeeAssignment,
  updateEmployeeAssignment,
  deleteEmployeeAssignment,
  getAssignmentsByDepartment
} = require('../../controllers/user/employeeAssignmentController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All employee assignment routes require authentication
router.use(protect);

/**
 * @swagger
 * /employee-assignments/{companyUserId}:
 *   get:
 *     summary: Get all assignments for a company user
 *     description: Retrieve all employee assignments for a specific company user
 *     tags: [Employee Assignments]
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
 *         description: Employee assignments retrieved successfully
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
 *                       companyUserId:
 *                         type: string
 *                         example: "1"
 *                       departmentId:
 *                         type: string
 *                         example: "1"
 *                       designationId:
 *                         type: string
 *                         example: "1"
 *                       managerId:
 *                         type: string
 *                         nullable: true
 *                         example: "2"
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-01"
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         example: "2024-12-31"
 *                       isCurrent:
 *                         type: boolean
 *                         example: true
 *                       department:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           name:
 *                             type: string
 *                             example: "Engineering"
 *                           code:
 *                             type: string
 *                             example: "ENG"
 *                       designation:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           title:
 *                             type: string
 *                             example: "Software Engineer"
 *                           code:
 *                             type: string
 *                             example: "SE"
 *                       manager:
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
 *                                 example: "manager@example.com"
 *                               firstName:
 *                                 type: string
 *                                 example: "Jane"
 *                               lastName:
 *                                 type: string
 *                                 example: "Smith"
 *                           profile:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               employeeCode:
 *                                 type: string
 *                                 example: "EMP002"
 *       400:
 *         description: Bad request - missing companyUserId
 *       404:
 *         description: Company user not found
 *       500:
 *         description: Internal server error
 */
router.get('/:companyUserId', authorize(['super-admin', 'admin', 'hr', 'manager']), getEmployeeAssignments);

/**
 * @swagger
 * /employee-assignments/{companyUserId}/current:
 *   get:
 *     summary: Get current assignment for a company user
 *     description: Retrieve the current active employee assignment for a specific company user
 *     tags: [Employee Assignments]
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
 *         description: Current assignment retrieved successfully
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
 *                     companyUserId:
 *                       type: string
 *                       example: "1"
 *                     departmentId:
 *                       type: string
 *                       example: "1"
 *                     designationId:
 *                       type: string
 *                       example: "1"
 *                     managerId:
 *                       type: string
 *                       nullable: true
 *                       example: "2"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "2024-12-31"
 *                     isCurrent:
 *                       type: boolean
 *                       example: true
 *                     department:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1"
 *                         name:
 *                           type: string
 *                           example: "Engineering"
 *                         code:
 *                           type: string
 *                           example: "ENG"
 *                     designation:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1"
 *                         title:
 *                           type: string
 *                           example: "Software Engineer"
 *                         code:
 *                           type: string
 *                           example: "SE"
 *                     manager:
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
 *                               example: "manager@example.com"
 *                             firstName:
 *                               type: string
 *                               example: "Jane"
 *                             lastName:
 *                               type: string
 *                               example: "Smith"
 *                         profile:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             employeeCode:
 *                               type: string
 *                               example: "EMP002"
 *       400:
 *         description: Bad request - missing companyUserId
 *       404:
 *         description: Company user not found or no current assignment
 *       500:
 *         description: Internal server error
 */
router.get('/:companyUserId/current', authorize(['super-admin', 'admin', 'hr', 'manager']), getCurrentAssignment);

/**
 * @swagger
 * /employee-assignments/{companyUserId}:
 *   post:
 *     summary: Create a new employee assignment
 *     description: Create a new employee assignment for a company user. If isCurrent is true, previous assignments will be marked as not current.
 *     tags: [Employee Assignments]
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
 *               - departmentId
 *               - designationId
 *               - startDate
 *             properties:
 *               departmentId:
 *                 type: string
 *                 example: "1"
 *               designationId:
 *                 type: string
 *                 example: "1"
 *               managerId:
 *                 type: string
 *                 nullable: true
 *                 example: "2"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: "2024-12-31"
 *               isCurrent:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Employee assignment created successfully
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
 *                     companyUserId:
 *                       type: string
 *                       example: "1"
 *                     departmentId:
 *                       type: string
 *                       example: "1"
 *                     designationId:
 *                       type: string
 *                       example: "1"
 *                     managerId:
 *                       type: string
 *                       nullable: true
 *                       example: "2"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "2024-12-31"
 *                     isCurrent:
 *                       type: boolean
 *                       example: true
 *                     department:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1"
 *                         name:
 *                           type: string
 *                           example: "Engineering"
 *                         code:
 *                           type: string
 *                           example: "ENG"
 *                     designation:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1"
 *                         title:
 *                           type: string
 *                           example: "Software Engineer"
 *                         code:
 *                           type: string
 *                           example: "SE"
 *                     manager:
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
 *                               example: "manager@example.com"
 *                             firstName:
 *                               type: string
 *                               example: "Jane"
 *                             lastName:
 *                               type: string
 *                               example: "Smith"
 *                         profile:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             employeeCode:
 *                               type: string
 *                               example: "EMP002"
 *       400:
 *         description: Bad request - missing required fields or invalid data
 *       404:
 *         description: Company user, department, designation, or manager not found
 *       500:
 *         description: Internal server error
 */
router.post('/:companyUserId', authorize(['super-admin', 'admin', 'hr']), createEmployeeAssignment);

/**
 * @swagger
 * /employee-assignments/{id}:
 *   put:
 *     summary: Update an employee assignment
 *     description: Update an existing employee assignment
 *     tags: [Employee Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               departmentId:
 *                 type: string
 *                 example: "1"
 *               designationId:
 *                 type: string
 *                 example: "2"
 *               managerId:
 *                 type: string
 *                 nullable: true
 *                 example: "3"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: "2024-12-31"
 *               isCurrent:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Employee assignment updated successfully
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
 *                     companyUserId:
 *                       type: string
 *                       example: "1"
 *                     departmentId:
 *                       type: string
 *                       example: "1"
 *                     designationId:
 *                       type: string
 *                       example: "2"
 *                     managerId:
 *                       type: string
 *                       nullable: true
 *                       example: "3"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "2024-12-31"
 *                     isCurrent:
 *                       type: boolean
 *                       example: true
 *                     department:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1"
 *                         name:
 *                           type: string
 *                           example: "Engineering"
 *                         code:
 *                           type: string
 *                           example: "ENG"
 *                     designation:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "2"
 *                         title:
 *                           type: string
 *                           example: "Senior Software Engineer"
 *                         code:
 *                           type: string
 *                           example: "SSE"
 *                     manager:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "3"
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "3"
 *                             email:
 *                               type: string
 *                               example: "senior.manager@example.com"
 *                             firstName:
 *                               type: string
 *                               example: "Robert"
 *                             lastName:
 *                               type: string
 *                               example: "Johnson"
 *                         profile:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             employeeCode:
 *                               type: string
 *                               example: "EMP003"
 *       400:
 *         description: Bad request - invalid data
 *       404:
 *         description: Assignment, department, designation, or manager not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authorize(['super-admin', 'admin', 'hr']), updateEmployeeAssignment);

/**
 * @swagger
 * /employee-assignments/{id}:
 *   delete:
 *     summary: Delete an employee assignment
 *     description: Delete an employee assignment. Cannot delete if it's the only assignment for the user.
 *     tags: [Employee Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee Assignment ID
 *     responses:
 *       200:
 *         description: Employee assignment deleted successfully
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
 *                   example: "Employee assignment deleted successfully"
 *       400:
 *         description: Bad request - cannot delete the only assignment
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authorize(['super-admin', 'admin', 'hr']), deleteEmployeeAssignment);

/**
 * @swagger
 * /employee-assignments/department/{departmentId}:
 *   get:
 *     summary: Get assignments by department
 *     description: Retrieve all employee assignments for a specific department
 *     tags: [Employee Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
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
 *                       companyUserId:
 *                         type: string
 *                         example: "1"
 *                       departmentId:
 *                         type: string
 *                         example: "1"
 *                       designationId:
 *                         type: string
 *                         example: "1"
 *                       managerId:
 *                         type: string
 *                         nullable: true
 *                         example: "2"
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-01"
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         example: "2024-12-31"
 *                       isCurrent:
 *                         type: boolean
 *                         example: true
 *                       employee:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "1"
 *                               email:
 *                                 type: string
 *                                 example: "employee@example.com"
 *                               firstName:
 *                                 type: string
 *                                 example: "John"
 *                               lastName:
 *                                 type: string
 *                                 example: "Doe"
 *                           profile:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               employeeCode:
 *                                 type: string
 *                                 example: "EMP001"
 *                       manager:
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
 *                                 example: "manager@example.com"
 *                               firstName:
 *                                 type: string
 *                                 example: "Jane"
 *                               lastName:
 *                                 type: string
 *                                 example: "Smith"
 *                           profile:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               employeeCode:
 *                                 type: string
 *                                 example: "EMP002"
 *       400:
 *         description: Bad request - missing departmentId
 *       404:
 *         description: Department not found
 *       500:
 *         description: Internal server error
 */
router.get('/department/:departmentId', authorize(['super-admin', 'admin', 'hr', 'manager']), getAssignmentsByDepartment);

module.exports = router;