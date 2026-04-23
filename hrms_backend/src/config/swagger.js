/**
 * Swagger/OpenAPI configuration for HRMS Backend API
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS Backend API',
      version: '1.0.0',
      description: 'Human Resource Management System API Documentation',
      contact: {
        name: 'HRMS Development Team',
        email: 'support@hrms.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server',
      },
      {
        url: 'https://api.hrms.com/api',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
              example: 1,
            },
            email: {
              type: 'string',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              description: 'User role',
              enum: ['employee', 'hr', 'company-admin', 'super-admin', 'sub-admin'],
              example: 'employee',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update timestamp',
            },
          },
        },
        Employee: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Employee ID',
              example: 101,
            },
            firstName: {
              type: 'string',
              description: 'Employee first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'Employee last name',
              example: 'Doe',
            },
            email: {
              type: 'string',
              description: 'Employee email',
              example: 'john.doe@company.com',
            },
            department: {
              type: 'string',
              description: 'Employee department',
              example: 'Engineering',
            },
            position: {
              type: 'string',
              description: 'Employee job position',
              example: 'Software Engineer',
            },
            salary: {
              type: 'number',
              description: 'Employee salary',
              example: 75000,
            },
            hireDate: {
              type: 'string',
              format: 'date',
              description: 'Employee hire date',
              example: '2023-01-15',
            },
            status: {
              type: 'string',
              description: 'Employment status',
              enum: ['active', 'inactive', 'on-leave', 'terminated'],
              example: 'active',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            token: {
              type: 'string',
              description: 'JWT authentication token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Invalid credentials',
            },
            stack: {
              type: 'string',
              description: 'Error stack trace (development only)',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Not authorized, token failed',
              },
            },
          },
        },
        NotFoundError: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Employee not found',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
              example: {
                status: 'error',
                message: 'Validation failed: email is required',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Employees',
        description: 'Employee management operations',
      },
      {
        name: 'Health',
        description: 'API health check endpoints',
      },
    ],
  },
  apis: [
    './src/routes/user/*.js',
    './src/controllers/user/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;