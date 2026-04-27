const jwt = require('jsonwebtoken');
const { comparePassword } = require('../../utils/passwordUtils');
const { normalizeRole, normalizeRoles, getPrimaryRole } = require('../../utils/roleUtils');
const prisma = require('../../config/prisma');

function normalizeDepartment(department) {
  if (!department) return null;
  return {
    id: department.id.toString(),
    name: department.name,
    code: department.code,
  };
}

function normalizeDesignation(designation) {
  if (!designation) return null;
  return {
    id: designation.id.toString(),
    title: designation.title,
    level: designation.level,
  };
}

function normalizeAssignment(assignment) {
  if (!assignment) return null;
  return {
    id: String(assignment.id),
    department: normalizeDepartment(assignment.department),
    designation: normalizeDesignation(assignment.designation),
    manager: assignment.manager ? {
      id: String(assignment.manager.id),
      employeeProfile: assignment.manager.companyUser?.employeeProfile ? {
        firstName: assignment.manager.companyUser.employeeProfile.firstName,
        lastName: assignment.manager.companyUser.employeeProfile.lastName
      } : null
    } : null,
  };
}

/**
 * Login user against database
 */
const login = async (req, res) => {
  try {
    console.log('=== LOGIN API CALLED - CLEAN VERSION ===');
    console.log('Login attempt for email:', req.body.email);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        // Get company membership
        companyUsers: {
          include: {
            company: true,
            // Get employee profile for name
            employeeProfile: true,
            // Get user roles
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Get primary company (first company user record)
    const companyUser = user.companyUsers[0];
    if (!companyUser) {
      return res.status(403).json({
        status: 'error',
        message: 'User is not assigned to any company'
      });
    }

    // Get roles from userRoles
    const roles = companyUser.userRoles.map(ur => ur.role);
    const dbRoleNames = roles.map(r => r.name);
    const normalizedRoles = normalizeRoles(dbRoleNames);
    const primaryRoleCode = getPrimaryRole(dbRoleNames);

    // Get permissions
    const permissions = [];
    roles.forEach(role => {
      role.rolePermissions.forEach(rp => {
        if (rp.permission) {
          permissions.push(rp.permission.code);
        }
      });
    });

    // Get employee profile for name
    const employeeName = companyUser.employeeProfile
      ? `${companyUser.employeeProfile.firstName} ${companyUser.employeeProfile.lastName}`
      : user.email.split('@')[0];

    // Create a clean payload with NO BigInt values
    // Convert all IDs to strings explicitly
    const tokenPayload = {
      userId: String(user.id),
      email: user.email,
      companyUserId: String(companyUser.id),
      companyId: String(companyUser.companyId),
      companyName: companyUser.company.name,
      role: primaryRoleCode,
      name: employeeName,
      employeeCode: companyUser.employeeCode || '',
      isActive: user.isActive,
      emailVerified: user.emailVerified
    };

    console.log('Generating JWT token with payload:', tokenPayload);
    
    // Generate token directly - no external utils
    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Prepare user response data (also convert BigInt to string)
    const userResponse = {
      id: String(user.id),
      email: user.email,
      companyUserId: String(companyUser.id),
      companyId: String(companyUser.companyId),
      companyName: companyUser.company.name,
      role: primaryRoleCode,
      roles: normalizedRoles,
      permissions: [...new Set(permissions)], // Remove duplicates
      name: employeeName,
      employeeCode: companyUser.employeeCode || '',
      isActive: user.isActive,
      emailVerified: user.emailVerified
    };

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userResponse,
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
 * Get current user profile with full details
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        companyUsers: {
          include: {
            company: true,
            employeeProfile: true,
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true
                      }
                    }
                  }
                }
              }
            },
            employeeAssignments: {
              include: {
                department: true,
                designation: true,
                manager: {
                  include: {
                    companyUser: {
                      include: {
                        employeeProfile: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const companyUser = user.companyUsers[0];
    if (!companyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found'
      });
    }

    // Get roles
    const roles = companyUser.userRoles.map(ur => ur.role);
    const dbRoleNames = roles.map(r => r.name);
    const normalizedRoles = normalizeRoles(dbRoleNames);
    const primaryRoleCode = getPrimaryRole(dbRoleNames);

    // Get permissions
    const permissions = [];
    roles.forEach(role => {
      role.rolePermissions.forEach(rp => {
        if (rp.permission) {
          permissions.push(rp.permission.code);
        }
      });
    });

    // Get current assignment
    const currentAssignment = companyUser.employeeAssignments[0];

    // Prepare response
    const userData = {
      id: String(user.id),
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      companyUser: {
        id: String(companyUser.id),
        employeeCode: companyUser.employeeCode,
        status: companyUser.status,
        joinedAt: companyUser.joinedAt,
        leftAt: companyUser.leftAt
      },
      company: {
        id: String(companyUser.company.id),
        name: companyUser.company.name,
        slug: companyUser.company.slug,
        legalName: companyUser.company.legalName,
        countryCode: companyUser.company.countryCode,
        timezone: companyUser.company.timezone
      },
      employeeProfile: companyUser.employeeProfile ? {
        firstName: companyUser.employeeProfile.firstName,
        middleName: companyUser.employeeProfile.middleName,
        lastName: companyUser.employeeProfile.lastName,
        dob: companyUser.employeeProfile.dob,
        gender: companyUser.employeeProfile.gender,
        personalEmail: companyUser.employeeProfile.personalEmail,
        personalPhone: companyUser.employeeProfile.personalPhone,
        photoUrl: companyUser.employeeProfile.photoUrl
      } : null,
      roles: roles.map(r => ({
        id: String(r.id),
        name: r.name,
        description: r.description,
        isSystem: r.isSystem
      })),
      normalizedRoles,
      primaryRole: primaryRoleCode,
      permissions: [...new Set(permissions)],
      currentAssignment: normalizeAssignment(currentAssignment)
    };

    res.status(200).json({
      status: 'success',
      data: userData
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Logout user (client-side operation, just returns success)
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
