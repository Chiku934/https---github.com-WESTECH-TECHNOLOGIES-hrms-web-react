const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  searchCompanies
} = require('../../controllers/user/companyController');
const { protect, authorize } = require('../../middleware/authMiddleware');

// All company routes require authentication
router.use(protect);

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     description: Retrieve a list of all companies (super admin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies retrieved successfully
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
 *                         example: "Suryodaya Technologies"
 *                       slug:
 *                         type: string
 *                         example: "suryodaya"
 *                       legalName:
 *                         type: string
 *                         example: "Suryodaya Technologies Pvt Ltd"
 *                       countryCode:
 *                         type: string
 *                         example: "IN"
 *                       timezone:
 *                         type: string
 *                         example: "Asia/Kolkata"
 *                       plan:
 *                         type: string
 *                         example: "pro"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       userCount:
 *                         type: integer
 *                         example: 5
 *                       departmentCount:
 *                         type: integer
 *                         example: 4
 *                       designationCount:
 *                         type: integer
 *                         example: 5
 *       403:
 *         description: Unauthorized - Only super admins can access companies
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllCompanies);

/**
 * @swagger
 * /companies/search:
 *   get:
 *     summary: Search companies
 *     description: Search companies by name, slug, or filter by status/plan (super admin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for name, slug, or legal name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (active, inactive, suspended)
 *       - in: query
 *         name: plan
 *         schema:
 *           type: string
 *         description: Filter by plan (free, pro, enterprise)
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
 *                     $ref: '#/components/schemas/Company'
 *       403:
 *         description: Unauthorized - Only super admins can search companies
 *       500:
 *         description: Internal server error
 */
router.get('/search', searchCompanies);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company by ID
 *     description: Retrieve a specific company by ID (super admin or company member)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CompanyDetail'
 *       403:
 *         description: Unauthorized - You can only access your own company
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getCompanyById);

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company
 *     description: Create a new company (super admin only)
 *     tags: [Companies]
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
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Suryodaya Technologies"
 *               slug:
 *                 type: string
 *                 example: "suryodaya"
 *               legalName:
 *                 type: string
 *                 example: "Suryodaya Technologies Pvt Ltd"
 *               countryCode:
 *                 type: string
 *                 example: "IN"
 *               timezone:
 *                 type: string
 *                 example: "Asia/Kolkata"
 *               plan:
 *                 type: string
 *                 example: "pro"
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request - Missing required fields or slug already exists
 *       403:
 *         description: Unauthorized - Only super admins can create companies
 *       500:
 *         description: Internal server error
 */
router.post('/', createCompany);

/**
 * @swagger
 * /companies/{id}:
 *   put:
 *     summary: Update company
 *     description: Update an existing company (super admin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Suryodaya Technologies Updated"
 *               slug:
 *                 type: string
 *                 example: "suryodaya-updated"
 *               legalName:
 *                 type: string
 *                 example: "Suryodaya Technologies Pvt Ltd"
 *               countryCode:
 *                 type: string
 *                 example: "IN"
 *               timezone:
 *                 type: string
 *                 example: "Asia/Kolkata"
 *               plan:
 *                 type: string
 *                 example: "enterprise"
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       400:
 *         description: Bad request - Slug already exists
 *       403:
 *         description: Unauthorized - Only super admins can update companies
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateCompany);

/**
 * @swagger
 * /companies/{id}:
 *   delete:
 *     summary: Delete company
 *     description: Delete a company (super admin only)
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *     responses:
 *       200:
 *         description: Company deleted successfully
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
 *                   example: "Company deleted successfully"
 *       403:
 *         description: Unauthorized - Only super admins can delete companies
 *       404:
 *         description: Company not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteCompany);

module.exports = router;