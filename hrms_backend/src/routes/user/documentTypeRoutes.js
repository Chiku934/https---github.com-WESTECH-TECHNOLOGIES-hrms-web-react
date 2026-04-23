const express = require('express');
const router = express.Router();
const {
  getAllDocumentTypes,
  getDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  searchDocumentTypes
} = require('../../controllers/user/documentTypeController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All document type routes require authentication
router.use(protect);

/**
 * @swagger
 * /document-types:
 *   get:
 *     summary: Get all document types
 *     description: Retrieve a list of all document types for the current company (including global ones)
 *     tags: [Document Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of document types retrieved successfully
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
 *                         nullable: true
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: "Passport"
 *                       category:
 *                         type: string
 *                         nullable: true
 *                         example: "Identity"
 *                       isRequired:
 *                         type: boolean
 *                         example: true
 *                       hasExpiry:
 *                         type: boolean
 *                         example: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       documentCount:
 *                         type: integer
 *                         example: 5
 *                       isGlobal:
 *                         type: boolean
 *                         example: false
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), getAllDocumentTypes);

/**
 * @swagger
 * /document-types/search:
 *   get:
 *     summary: Search document types
 *     description: Search document types by name or category
 *     tags: [Document Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term for document type name or category
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
 *                         example: "Passport"
 *                       category:
 *                         type: string
 *                         nullable: true
 *                       isRequired:
 *                         type: boolean
 *                       hasExpiry:
 *                         type: boolean
 *                       documentCount:
 *                         type: integer
 *                       isGlobal:
 *                         type: boolean
 *       400:
 *         description: Bad request - search query is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */
router.get('/search', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), searchDocumentTypes);

/**
 * @swagger
 * /document-types/{id}:
 *   get:
 *     summary: Get document type by ID
 *     description: Retrieve a specific document type by its ID
 *     tags: [Document Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document Type ID
 *     responses:
 *       200:
 *         description: Document type retrieved successfully
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
 *                       nullable: true
 *                     name:
 *                       type: string
 *                       example: "Passport"
 *                     category:
 *                       type: string
 *                       nullable: true
 *                     isRequired:
 *                       type: boolean
 *                       example: true
 *                     hasExpiry:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     documentCount:
 *                       type: integer
 *                       example: 5
 *                     isGlobal:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Bad request - document type ID is required
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Document type not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authorize('hr', 'super-admin', 'company-admin', 'sub-admin'), getDocumentTypeById);

/**
 * @swagger
 * /document-types:
 *   post:
 *     summary: Create a new document type
 *     description: Create a new document type for the current company or as a global type
 *     tags: [Document Types]
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
 *                 example: "Passport"
 *               category:
 *                 type: string
 *                 nullable: true
 *                 example: "Identity"
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *               hasExpiry:
 *                 type: boolean
 *                 example: true
 *               isGlobal:
 *                 type: boolean
 *                 example: false
 *                 description: Set to true to create a global document type (super-admin only)
 *     responses:
 *       201:
 *         description: Document type created successfully
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
 *                   example: Document type created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     name:
 *                       type: string
 *                       example: "Passport"
 *                     category:
 *                       type: string
 *                       nullable: true
 *                     isRequired:
 *                       type: boolean
 *                     hasExpiry:
 *                       type: boolean
 *                     isGlobal:
 *                       type: boolean
 *       400:
 *         description: Bad request - missing required fields or validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions (global types require super-admin)
 *       409:
 *         description: Conflict - document type with same name already exists
 *       500:
 *         description: Server error
 */
router.post('/', authorize('hr', 'super-admin', 'company-admin'), createDocumentType);

/**
 * @swagger
 * /document-types/{id}:
 *   put:
 *     summary: Update a document type
 *     description: Update an existing document type
 *     tags: [Document Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document Type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "International Passport"
 *               category:
 *                 type: string
 *                 nullable: true
 *               isRequired:
 *                 type: boolean
 *                 example: true
 *               hasExpiry:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Document type updated successfully
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
 *                   example: Document type updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1"
 *                     name:
 *                       type: string
 *                       example: "International Passport"
 *                     isRequired:
 *                       type: boolean
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Document type not found
 *       409:
 *         description: Conflict - document type with same name already exists
 *       500:
 *         description: Server error
 */
router.put('/:id', authorize('hr', 'super-admin', 'company-admin'), updateDocumentType);

/**
 * @swagger
 * /document-types/{id}:
 *   delete:
 *     summary: Delete a document type
 *     description: Delete a document type by ID
 *     tags: [Document Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document Type ID
 *     responses:
 *       200:
 *         description: Document type deleted successfully
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
 *                   example: Document type deleted successfully
 *       400:
 *         description: Bad request - cannot delete document type with associated documents
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Document type not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authorize('hr', 'super-admin', 'company-admin'), deleteDocumentType);

module.exports = router;