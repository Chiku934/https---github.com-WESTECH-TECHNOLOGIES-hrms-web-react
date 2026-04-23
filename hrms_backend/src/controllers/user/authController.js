const { generateUserToken } = require('../../utils/jwtUtils');
const { comparePassword } = require('../../utils/passwordUtils');
const { normalizeRole, normalizeRoles, getPrimaryRole } = require('../../utils/roleUtils');
const prisma = require('../../config/prisma');

/**
 * Login user against database
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

    // Prepare user data for token
    const userData = {
      id: user.id,
      email: user.email,
      companyUserId: companyUser.id,
      companyId: companyUser.companyId,
      companyName: companyUser.company.name,
      role: primaryRoleCode,
      roles: normalizedRoles,
      permissions: [...new Set(permissions)], // Remove duplicates
      name: employeeName,
      employeeCode: companyUser.employeeCode,
      isActive: user.isActive,
      emailVerified: user.emailVerified
    };

    // Generate token
    const token = generateUserToken(userData);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userData,
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
    // User is attached to request by auth middleware
    const { userId, companyUserId, companyId } = req.user;

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        companyUsers: {
          where: { id: companyUserId },
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
              where: { isCurrent: true },
              include: {
                department: true,
                designation: true,
                manager: {
                  include: {
                    user: true,
                    employeeProfile: true
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
        message: 'Company membership not found'
      });
    }

    // Get roles and permissions
    const roles = companyUser.userRoles.map(ur => ur.role);
    const dbRoleNames = roles.map(r => r.name);
    const normalizedRoles = normalizeRoles(dbRoleNames);
    
    const permissions = [];
    roles.forEach(role => {
      role.rolePermissions.forEach(rp => {
        if (rp.permission) {
          permissions.push(rp.permission.code);
        }
      });
    });

    // Get current assignment
    const currentAssignment = companyUser.employeeAssignments[0] || null;

    // Prepare response
    const userData = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      companyUser: {
        id: companyUser.id,
        employeeCode: companyUser.employeeCode,
        status: companyUser.status,
        joinedAt: companyUser.joinedAt,
        leftAt: companyUser.leftAt
      },
      company: {
        id: companyUser.company.id,
        name: companyUser.company.name,
        slug: companyUser.company.slug,
        legalName: companyUser.company.legalName,
        countryCode: companyUser.company.countryCode,
        timezone: companyUser.company.timezone,
        plan: companyUser.company.plan,
        status: companyUser.company.status
      },
      profile: companyUser.employeeProfile || null,
      roles: roles.map(r => ({
        id: r.id,
        name: r.name,
        normalizedName: normalizeRole(r.name),
        description: r.description,
        isSystem: r.isSystem
      })),
      permissions: [...new Set(permissions)], // Remove duplicates, array of permission codes
      currentAssignment: currentAssignment ? {
        id: currentAssignment.id,
        department: currentAssignment.department,
        designation: currentAssignment.designation,
        employmentType: currentAssignment.employmentType,
        workLocation: currentAssignment.workLocation,
        startDate: currentAssignment.startDate,
        endDate: currentAssignment.endDate,
        manager: currentAssignment.manager ? {
          id: currentAssignment.manager.id,
          employeeCode: currentAssignment.manager.employeeCode,
          profile: currentAssignment.manager.employeeProfile
        } : null
      } : null
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userData
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