const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All employee routes require authentication
router.use(protect);

/**
 * @route   GET /api/employees
 * @desc    Get all employees
 * @access  Private (HR, Admin roles)
 */
router.get('/', authorize('hr', 'super-admin', 'company-admin'), getAllEmployees);

/**
 * @route   GET /api/employees/search
 * @desc    Search employees
 * @access  Private (HR, Admin roles)
 */
router.get('/search', authorize('hr', 'super-admin', 'company-admin'), searchEmployees);

/**
 * @route   GET /api/employees/:id
 * @desc    Get employee by ID
 * @access  Private (HR, Admin, or employee themselves)
 */
router.get('/:id', (req, res, next) => {
  // Allow access if user is HR/Admin OR if user is accessing their own profile
  if (req.user.role === 'hr' || req.user.role === 'super-admin' || req.user.role === 'company-admin' || req.user.id === parseInt(req.params.id)) {
    return getEmployeeById(req, res, next);
  }
  
  return res.status(403).json({
    status: 'error',
    message: 'Not authorized to access this employee data'
  });
});

/**
 * @route   POST /api/employees
 * @desc    Create new employee
 * @access  Private (HR, Admin roles)
 */
router.post('/', authorize('hr', 'super-admin'), createEmployee);

/**
 * @route   PUT /api/employees/:id
 * @desc    Update employee
 * @access  Private (HR, Admin roles)
 */
router.put('/:id', authorize('hr', 'super-admin'), updateEmployee);

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete employee
 * @access  Private (HR, Admin roles)
 */
router.delete('/:id', authorize('hr', 'super-admin'), deleteEmployee);

module.exports = router;