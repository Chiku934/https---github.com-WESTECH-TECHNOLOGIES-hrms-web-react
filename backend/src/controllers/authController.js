const { generateUserToken } = require('../utils/jwtUtils');
const { comparePassword } = require('../utils/passwordUtils');

// Mock user data (will be replaced with Prisma database queries)
const mockUsers = [
  {
    id: 1,
    email: 'superadmin@hrms.com',
    password: '$2a$10$X8zWqZQ7ZQ7ZQ7ZQ7ZQ7Z.Q7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7Z', // hashed "1234"
    name: 'Super Admin',
    role: 'super-admin'
  },
  {
    id: 2,
    email: 'hr@hrms.com',
    password: '$2a$10$X8zWqZQ7ZQ7ZQ7ZQ7ZQ7Z.Q7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7Z',
    name: 'HR Manager',
    role: 'hr'
  },
  {
    id: 3,
    email: 'employee@hrms.com',
    password: '$2a$10$X8zWqZQ7ZQ7ZQ7ZQ7ZQ7Z.Q7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7ZQ7Z',
    name: 'John Employee',
    role: 'employee'
  }
];

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user (mock - will be replaced with database query)
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check password (mock - in real app, compare with hashed password)
    // For demo, we'll accept "1234" as password for all users
    const isValidPassword = password === '1234' || await comparePassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateUserToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get current user profile
 */
const getMe = async (req, res) => {
  try {
    // User is attached to request by auth middleware
    const user = req.user;
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Logout user (client-side token removal)
 */
const logout = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  getMe,
  logout
};