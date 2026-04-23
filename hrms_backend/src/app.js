const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/user/authRoutes');
const employeeRoutes = require('./routes/user/employeeRoutes');
const departmentRoutes = require('./routes/user/departmentRoutes');
const designationRoutes = require('./routes/user/designationRoutes');
const documentTypeRoutes = require('./routes/user/documentTypeRoutes');
const customFieldRoutes = require('./routes/user/customFieldRoutes');
const companyRoutes = require('./routes/user/companyRoutes');
const userRoutes = require('./routes/user/userRoutes');
const companyUserRoutes = require('./routes/user/companyUserRoutes');
const roleRoutes = require('./routes/user/roleRoutes');
const permissionRoutes = require('./routes/user/permissionRoutes');
const rolePermissionRoutes = require('./routes/user/rolePermissionRoutes');
const userRoleRoutes = require('./routes/user/userRoleRoutes');
const employeeProfileRoutes = require('./routes/user/employeeProfileRoutes');
const employeeAssignmentRoutes = require('./routes/user/employeeAssignmentRoutes');
const auditLogRoutes = require('./routes/user/auditLogRoutes');

// Import Swagger configuration
const swaggerSpec = require('./config/swagger');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'HRMS API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    filter: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
  },
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
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
 *                   example: HRMS Backend is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-10-15T10:30:00.000Z
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'HRMS Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);
app.use('/api/document-types', documentTypeRoutes);
app.use('/api/custom-fields', customFieldRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/company-users', companyUserRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/user-roles', userRoleRoutes);
app.use('/api/employee-profiles', employeeProfileRoutes);
app.use('/api/employee-assignments', employeeAssignmentRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// 404 handler - catch all routes that don't match (placed after all other routes)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;