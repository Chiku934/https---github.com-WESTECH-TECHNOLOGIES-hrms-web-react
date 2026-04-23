const express = require('express');
const router = express.Router();
const {
  getAllCustomFields,
  getCustomFieldById,
  getCustomFieldsByEntity,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  searchCustomFields
} = require('../../controllers/user/customFieldController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All custom field routes require authentication
router.use(protect);

/**
 * @swagger
 * /custom-fields:
 *   get:
 *     summary: Get all custom fields
 *     description: Retrieve a list of all custom fields for the current company
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of custom fields retrieved successfully
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
 *                       entity:
 *                         type: string
 *                         example: "employee"
 *                       fieldKey:
 *                         type: string
 *                         example: "emergency_contact"
 *                       fieldLabel:
 *                         type: string
 *                         example: "Emergency Contact"
 *                       fieldType:
 *                         type: string
 *                         example: "text"
 *                       options:
 *                         type: object
 *                         nullable: true
 *                       isRequired:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), getAllCustomFields);

/**
 * @swagger
 * /custom-fields/entity/{entity}:
 *   get:
 *     summary: Get custom fields by entity
 *     description: Retrieve custom fields for a specific entity (e.g., employee, department)
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity name (e.g., employee, department, designation)
 *     responses:
 *       200:
 *         description: Custom fields retrieved successfully
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
 *                       fieldKey:
 *                         type: string
 *                       fieldLabel:
 *                         type: string
 *                       fieldType:
 *                         type: string
 *                       options:
 *                         type: object
 *                         nullable: true
 *                       isRequired:
 *                         type: boolean
 *       400:
 *         description: Bad request - entity parameter is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.get('/entity/:entity', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), getCustomFieldsByEntity);

/**
 * @swagger
 * /custom-fields/search:
 *   get:
 *     summary: Search custom fields
 *     description: Search custom fields by field label, key, or entity
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for field label, field key, or entity
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
 *                       entity:
 *                         type: string
 *                       fieldKey:
 *                         type: string
 *                       fieldLabel:
 *                         type: string
 *                       fieldType:
 *                         type: string
 *                       isRequired:
 *                         type: boolean
 *       400:
 *         description: Bad request - search query is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.get('/search', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), searchCustomFields);

/**
 * @swagger
 * /custom-fields/{id}:
 *   get:
 *     summary: Get custom field by ID
 *     description: Retrieve a specific custom field by its ID
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Custom Field ID
 *     responses:
 *       200:
 *         description: Custom field retrieved successfully
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
 *                     entity:
 *                       type: string
 *                       example: "employee"
 *                     fieldKey:
 *                       type: string
 *                       example: "emergency_contact"
 *                     fieldLabel:
 *                       type: string
 *                       example: "Emergency Contact"
 *                     fieldType:
 *                       type: string
 *                       example: "text"
 *                     options:
 *                       type: object
 *                       nullable: true
 *                     isRequired:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - custom field ID is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Custom field not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), getCustomFieldById);

/**
 * @swagger
 * /custom-fields:
 *   post:
 *     summary: Create a new custom field
 *     description: Create a new custom field for the current company
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entity
 *               - fieldKey
 *               - fieldLabel
 *               - fieldType
 *             properties:
 *               entity:
 *                 type: string
 *                 example: "employee"
 *               fieldKey:
 *                 type: string
 *                 example: "emergency_contact"
 *               fieldLabel:
 *                 type: string
 *                 example: "Emergency Contact"
 *               fieldType:
 *                 type: string
 *                 example: "text"
 *                 enum: [text, number, date, select, checkbox, textarea]
 *               options:
 *                 type: object
 *                 nullable: true
 *                 description: Required for 'select' field type, contains array of options
 *                 example: ["Option 1", "Option 2", "Option 3"]
 *               isRequired:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Custom field created successfully
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
 *                   example: Custom field created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     entity:
 *                       type: string
 *                       example: "employee"
 *                     fieldKey:
 *                       type: string
 *                       example: "emergency_contact"
 *                     fieldLabel:
 *                       type: string
 *                       example: "Emergency Contact"
 *                     fieldType:
 *                       type: string
 *                       example: "text"
 *       400:
 *         description: Bad request - missing required fields or validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       409:
 *         description: Conflict - custom field with same key already exists for this entity
 *       500:
 *         description: Server error
 */
router.post('/', authorize('hr', 'super-admin', 'company-admin'), createCustomField);

/**
 * @swagger
 * /custom-fields/{id}:
 *   put:
 *     summary: Update a custom field
 *     description: Update an existing custom field
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Custom Field ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entity:
 *                 type: string
 *                 example: "employee"
 *               fieldKey:
 *                 type: string
 *                 example: "emergency_contact_updated"
 *               fieldLabel:
 *                 type: string
 *                 example: "Emergency Contact (Updated)"
 *               fieldType:
 *                 type: string
 *                 example: "select"
 *               options:
 *                 type: object
 *                 nullable: true
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Custom field updated successfully
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
 *                   example: Custom field updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     fieldKey:
 *                       type: string
 *                       example: "emergency_contact_updated"
 *                     fieldLabel:
 *                       type: string
 *                       example: "Emergency Contact (Updated)"
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Custom field not found
 *       409:
 *         description: Conflict - custom field with same key already exists for this entity
 *       500:
 *         description: Server error
 */
router.put('/:id', authorize('hr', 'super-admin', 'company-admin'), updateCustomField);

/**
 * @swagger
 * /custom-fields/{id}:
 *   delete:
 *     summary: Delete a custom field
 *     description: Delete a custom field by ID
 *     tags: [Custom Fields]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Custom Field ID
 *     responses:
 *       200:
 *         description: Custom field deleted successfully
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
 *                   example: Custom field deleted successfully
 *       400:
 *         description: Bad request - custom field ID is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Custom field not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authorize('hr', 'super-admin', 'company-admin'), deleteCustomField);

module.exports = router;