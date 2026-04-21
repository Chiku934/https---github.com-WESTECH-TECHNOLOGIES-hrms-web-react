// Mock employee data (will be replaced with Prisma)
const mockEmployees = [
  {
    id: 1,
    employeeCode: 'EMP-001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    status: 'Active',
    joinDate: '2023-01-15'
  },
  {
    id: 2,
    employeeCode: 'EMP-002',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'HR',
    designation: 'HR Manager',
    status: 'Active',
    joinDate: '2022-08-20'
  },
  {
    id: 3,
    employeeCode: 'EMP-003',
    name: 'Robert Johnson',
    email: 'robert.j@company.com',
    department: 'Finance',
    designation: 'Accountant',
    status: 'Active',
    joinDate: '2023-03-10'
  },
  {
    id: 4,
    employeeCode: 'EMP-004',
    name: 'Sarah Williams',
    email: 'sarah.w@company.com',
    department: 'Engineering',
    designation: 'Frontend Developer',
    status: 'Inactive',
    joinDate: '2022-11-05'
  },
  {
    id: 5,
    employeeCode: 'EMP-005',
    name: 'Michael Brown',
    email: 'michael.b@company.com',
    department: 'Sales',
    designation: 'Sales Executive',
    status: 'Active',
    joinDate: '2023-05-22'
  }
];

/**
 * Get all employees
 */
const getAllEmployees = async (req, res) => {
  try {
    // In real app: const employees = await prisma.employee.findMany();
    const employees = mockEmployees;
    
    res.status(200).json({
      status: 'success',
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get employee by ID
 */
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In real app: const employee = await prisma.employee.findUnique({ where: { id: parseInt(id) } });
    const employee = mockEmployees.find(emp => emp.id === parseInt(id));
    
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        message: `Employee with ID ${id} not found`
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Create new employee
 */
const createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;
    
    // Validate required fields
    if (!employeeData.name || !employeeData.email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email are required'
      });
    }
    
    // In real app: const newEmployee = await prisma.employee.create({ data: employeeData });
    const newEmployee = {
      id: mockEmployees.length + 1,
      employeeCode: `EMP-00${mockEmployees.length + 1}`,
      ...employeeData,
      status: employeeData.status || 'Active',
      joinDate: employeeData.joinDate || new Date().toISOString().split('T')[0]
    };
    
    // Add to mock array
    mockEmployees.push(newEmployee);
    
    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: newEmployee
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Update employee
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // In real app: const updatedEmployee = await prisma.employee.update({ where: { id: parseInt(id) }, data: updateData });
    const employeeIndex = mockEmployees.findIndex(emp => emp.id === parseInt(id));
    
    if (employeeIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: `Employee with ID ${id} not found`
      });
    }
    
    const updatedEmployee = {
      ...mockEmployees[employeeIndex],
      ...updateData
    };
    
    mockEmployees[employeeIndex] = updatedEmployee;
    
    res.status(200).json({
      status: 'success',
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Delete employee
 */
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In real app: await prisma.employee.delete({ where: { id: parseInt(id) } });
    const employeeIndex = mockEmployees.findIndex(emp => emp.id === parseInt(id));
    
    if (employeeIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: `Employee with ID ${id} not found`
      });
    }
    
    // Remove from mock array
    mockEmployees.splice(employeeIndex, 1);
    
    res.status(200).json({
      status: 'success',
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Search employees
 */
const searchEmployees = async (req, res) => {
  try {
    const { query, department, status } = req.query;
    
    let filteredEmployees = [...mockEmployees];
    
    // Filter by search query
    if (query) {
      const searchTerm = query.toLowerCase();
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm) ||
        emp.email.toLowerCase().includes(searchTerm) ||
        emp.employeeCode.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by department
    if (department) {
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.department === department
      );
    }
    
    // Filter by status
    if (status) {
      filteredEmployees = filteredEmployees.filter(emp => 
        emp.status === status
      );
    }
    
    res.status(200).json({
      status: 'success',
      count: filteredEmployees.length,
      data: filteredEmployees
    });
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees
};