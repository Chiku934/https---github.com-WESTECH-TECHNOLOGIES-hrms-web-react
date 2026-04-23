const express = require('express');
const router = express.Router();
const {
  getEmployeeProfile,
  upsertEmployeeProfile,
  updateEmployeeProfile,
  deleteEmployeeProfile,
  searchEmployeeProfiles
} = require('../../controllers/user/employeeProfileController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All employee profile routes require authentication
router.use(protect);

/**
 * @swagger
 * /employee-profiles/{companyUserId}:
 *   get:
 *     summary: Get employee profile by company user ID
 *     description: Retrieve employee profile for a specific company user
 *     tags: [Employee Profiles]
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
 *         description: Employee profile retrieved successfully
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
 *                     companyUserId:
 *                       type: string
 *                       example: "1"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     middleName:
 *                       type: string
 *                       nullable: true
 *                       example: "Michael"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     dob:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       example: "1990-01-01"
 *                     gender:
 *                       type: string
 *                       nullable: true
 *                       example: "Male"
 *                     maritalStatus:
 *                       type: string
 *                       nullable: true
 *                       example: "Single"
 *                     bloodGroup:
 *                       type: string
 *                       nullable: true
 *                       example: "O+"
 *                     personalEmail:
 *                       type: string
 *                       nullable: true
 *                       example: "john.doe@personal.com"
 *                     personalPhone:
 *                       type: string
 *                       nullable: true
 *                       example: "+1234567890"
 *                     emergencyContactName:
 *                       type: string
 *                       nullable: true
 *                       example: "Jane Doe"
 *                     emergencyContactPhone:
 *                       type: string
 *                       nullable: true
 *                       example: "+1234567891"
 *                     addressLine1:
 *                       type: string
 *                       nullable: true
 *                       example: "123 Main St"
 *                     addressLine2:
 *                       type: string
 *                       nullable: true
 *                       example: "Apt 4B"
 *                     city:
 *                       type: string
 *                       nullable: true
 *                       example: "New York"
 *                     state:
 *                       type: string
 *                       nullable: true
 *                       example: "NY"
 *                     country:
 *                       type: string
 *                       nullable: true
 *                       example: "USA"
 *                     postalCode:
 *                       type: string
 *                       nullable: true
 *                       example: "10001"
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                       example: "https://example.com/photo.jpg"
 *                     extraData:
 *                       type: object
 *                       nullable: true
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1"
 *                         email:
 *                           type: string
 *                           example: "john.doe@company.com"
 *                         phone:
 *                           type: string
 *                           nullable: true
 *                           example: "+1234567890"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *       400:
 *         description: Bad request - Company User ID is required or Company ID not found
 *       404:
 *         description: Company user or employee profile not found
 *       500:
 *         description: Internal server error
 */
router.get('/:companyUserId', getEmployeeProfile);

/**
 * @swagger
 * /employee-profiles/{companyUserId}:
 *   put:
 *     summary: Create or update employee profile
 *     description: Create or update employee profile for a company user (upsert operation)
 *     tags: [Employee Profiles]
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
 *               - firstName
 *               - lastName
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *                 description: First name
 *               middleName:
 *                 type: string
 *                 nullable: true
 *                 example: "Michael"
 *                 description: Middle name
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *                 description: Last name
 *               dob:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: "1990-01-01"
 *                 description: Date of birth
 *               gender:
 *                 type: string
 *                 nullable: true
 *                 example: "Male"
 *                 description: Gender
 *               maritalStatus:
 *                 type: string
 *                 nullable: true
 *                 example: "Single"
 *                 description: Marital status
 *               bloodGroup:
 *                 type: string
 *                 nullable: true
 *                 example: "O+"
 *                 description: Blood group
 *               personalEmail:
 *                 type: string
 *                 nullable: true
 *                 example: "john.doe@personal.com"
 *                 description: Personal email
 *               personalPhone:
 *                 type: string
 *                 nullable: true
 *                 example: "+1234567890"
 *                 description: Personal phone
 *               emergencyContactName:
 *                 type: string
 *                 nullable: true
 *                 example: "Jane Doe"
 *                 description: Emergency contact name
 *               emergencyContactPhone:
 *                 type: string
 *                 nullable: true
 *                 example: "+1234567891"
 *                 description: Emergency contact phone
 *               addressLine1:
 *                 type: string
 *                 nullable: true
 *                 example: "123 Main St"
 *                 description: Address line 1
 *               addressLine2:
 *                 type: string
 *                 nullable: true
 *                 example: "Apt 4B"
 *                 description: Address line 2
 *               city:
 *                 type: string
 *                 nullable: true
 *                 example: "New York"
 *                 description: City
 *               state:
 *                 type: string
 *                 nullable: true
 *                 example: "NY"
 *                 description: State
 *               country:
 *                 type: string
 *                 nullable: true
 *                 example: "USA"
 *                 description: Country
 *               postalCode:
 *                 type: string
 *                 nullable: true
 *                 example: "10001"
 *                 description: Postal code
 *               photoUrl:
 *                 type: string
 *                 nullable: true
 *                 example: "https://example.com/photo.jpg"
 *                 description: Photo URL
 *               extraData:
 *                 type: object
 *                 nullable: true
 *                 description: Additional custom data
 *     responses:
 *       200:
 *         description: Employee profile updated successfully
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
 *                   example: Employee profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     companyUserId:
 *                       type: string
 *                       example: "1"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *       201:
 *         description: Employee profile created successfully
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
 *                   example: Employee profile created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     companyUserId:
 *                       type: string
 *                       example: "1"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - Missing required fields or Company ID not found
 *       404:
 *         description: Company user not found
 *       500:
 *         description: Internal server error
 */
router.put('/:companyUserId', authorize('hr', 'admin'), upsertEmployeeProfile);

/**
 * @swagger
 * /employee-profiles/{companyUserId}:
 *   patch:
 *     summary: Update employee profile (partial update)
 *     description: Partially update employee profile for a company user
 *     tags: [Employee Profiles]
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
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *                 description: First name
 *               middleName:
 *                 type: string
 *                 nullable: true
 *                 example: "Michael"
 *                 description: Middle name
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *                 description: Last name
 *               dob:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 example: "1990-01-01"
 *                 description: Date of birth
 *               gender:
 *                 type: string
 *                 nullable: true
 *                 example: "Male"
 *                 description: Gender
 *               maritalStatus:
 *                 type: string
 *                 nullable: true
 *                 example: "Single"
 *                 description: Marital status
 *               bloodGroup:
 *                 type: string
 *                 nullable: true
 *                 example: "O+"
 *                 description: Blood group
 *               personalEmail:
 *                 type: string
 *                 nullable: true
 *                 example: "john.doe@personal.com"
 *                 description: Personal email
 *               personalPhone:
 *                 type: string
 *                 nullable: true
 *                 example: "+1234567890"
 *                 description: Personal phone
 *               emergencyContactName:
 *                 type: string
 *                 nullable: true
 *                 example: "Jane Doe"
 *                 description: Emergency contact name
 *               emergencyContactPhone:
 *                 type: string
 *                 nullable: true
 *                 example: "+1234567891"
 *                 description: Emergency contact phone
 *               addressLine1:
 *                 type: string
 *                 nullable: true
 *                 example: "123 Main St"
 *                 description: Address line 1
 *               addressLine2:
 *                 type: string
 *                 nullable: true
 *                 example: "Apt 4B"
 *                 description: Address line 2
 *               city:
 *                 type: string
 *                 nullable: true
 *                 example: "New York"
 *                 description: City
 *               state:
 *                 type: string
 *                 nullable: true
 *                 example: "NY"
 *                 description: State
 *               country:
 *                 type: string
 *                 nullable: true
 *                 example: "USA"
 *                 description: Country
 *               postalCode:
 *                 type: string
 *                 nullable: true
 *                 example: "10001"
 *                 description: Postal code
 *               photoUrl:
 *                 type: string
 *                 nullable: true
 *                 example: "https://example.com/photo.jpg"
 *                 description: Photo URL
 *               extraData:
 *                 type: object
 *                 nullable: true
 *                 description: Additional custom data
 *     responses:
 *       200:
 *         description: Employee profile updated successfully
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
 *                   example: Employee profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     companyUserId:
 *                       type: string
 *                       example: "1"
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - Company User ID is required or Company ID not found
 *       404:
 *         description: Company user or employee profile not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:companyUserId', authorize('hr', 'admin'), updateEmployeeProfile);

/**
 * @swagger
 * /employee-profiles/{companyUserId}:
 *   delete:
 *     summary: Delete employee profile
 *     description: Delete employee profile for a company user
 *     tags: [Employee Profiles]
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
 *         description: Employee profile deleted successfully
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
 *                   example: Employee profile deleted successfully
 *       400:
 *         description: Bad request - Company User ID is required or Company ID not found
 *       404:
 *         description: Company user or employee profile not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:companyUserId', authorize('hr', 'admin'), deleteEmployeeProfile);

/**
 * @swagger
 * /employee-profiles/search:
 *   get:
 *     summary: Search employee profiles
 *     description: Search employee profiles by name, email, or phone
 *     tags: [Employee Profiles]
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
 *                       companyUserId:
 *                         type: string
 *                         example: "1"
 *                       firstName:
 *                         type: string
 *                         example: "John"
 *                       middleName:
 *                         type: string
 *                         nullable: true
 *                         example: "Michael"
 *                       lastName:
 *                         type: string
 *                         example: "Doe"
 *                       dob:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         example: "1990-01-01"
 *                       gender:
 *                         type: string
 *                         nullable: true
 *                         example: "Male"
 *                       personalEmail:
 *                         type: string
 *                         nullable: true
 *                         example: "john.doe@personal.com"
 *                       personalPhone:
 *                         type: string
 *                         nullable: true
 *                         example: "+1234567890"
 *                       city:
 *                         type: string
 *                         nullable: true
 *                         example: "New York"
 *                       state:
 *                         type: string
 *                         nullable: true
 *                         example: "NY"
 *                       country:
 *                         type: string
 *                         nullable: true
 *                         example: "USA"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "1"
 *                           email:
 *                             type: string
 *                             example: "john.doe@company.com"
 *                           phone:
 *                             type: string
 *                             nullable: true
 *                             example: "+1234567890"
 *                           isActive:
 *                             type: boolean
 *                             example: true
 *       400:
 *         description: Bad request - Search query is required or Company ID not found
 *       500:
 *         description: Internal server error
 */
router.get('/search', searchEmployeeProfiles);

module.exports = router;