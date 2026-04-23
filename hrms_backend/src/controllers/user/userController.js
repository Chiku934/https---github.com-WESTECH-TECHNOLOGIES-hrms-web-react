const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');
const { hashPassword } = require('../../utils/passwordUtils');

/**
 * Get all users (super admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    // Check if user is super admin
    const userRole = req.user?.role;
    if (userRole !== 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only super admins can access all users'
      });
    }

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        companyUsers: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            companyUsers: true
          }
        }
      },
      orderBy: {
        email: 'asc'
      }
    });

    // Transform the data
    const transformedUsers = users.map(user => ({
      id: user.id.toString(),
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      companies: user.companyUsers.map(cu => ({
        id: cu.company.id.toString(),
        name: cu.company.name,
        slug: cu.company.slug,
        employeeCode: cu.employeeCode,
        status: cu.status,
        joinedAt: cu.joinedAt,
        leftAt: cu.leftAt
      })),
      companyCount: user._count.companyUsers
    }));

    res.status(200).json({
      status: 'success',
      data: transformedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user by ID
 */
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user is super admin or accessing their own profile
    const currentUserId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (userRole !== 'super_admin' && currentUserId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You can only access your own profile'
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: BigInt(userId)
      },
      include: {
        companyUsers: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            employeeProfile: true,
            userRoles: {
              include: {
                role: true
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

    const transformedUser = {
      id: user.id.toString(),
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      companies: user.companyUsers.map(cu => ({
        id: cu.id.toString(),
        companyId: cu.company.id.toString(),
        companyName: cu.company.name,
        companySlug: cu.company.slug,
        employeeCode: cu.employeeCode,
        status: cu.status,
        joinedAt: cu.joinedAt,
        leftAt: cu.leftAt,
        profile: cu.employeeProfile ? {
          firstName: cu.employeeProfile.firstName,
          lastName: cu.employeeProfile.lastName,
          dob: cu.employeeProfile.dob,
          gender: cu.employeeProfile.gender
        } : null,
        roles: cu.userRoles.map(ur => ({
          id: ur.role.id.toString(),
          name: ur.role.name,
          description: ur.role.description
        }))
      }))
    };

    res.status(200).json({
      status: 'success',
      data: transformedUser
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new user (super admin only)
 */
const createUser = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only super admins can create users'
      });
    }

    const { email, password, phone, isActive, emailVerified, mfaEnabled } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        phone,
        isActive: isActive !== undefined ? isActive : true,
        emailVerified: emailVerified !== undefined ? emailVerified : false,
        mfaEnabled: mfaEnabled !== undefined ? mfaEnabled : false
      }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'user',
      entityId: user.id.toString(),
      action: 'CREATE',
      diff: { email, phone, isActive, emailVerified, mfaEnabled }
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: user.id.toString(),
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user?.userId;
    const userRole = req.user?.role;
    
    // Only super admin or the user themselves can update
    if (userRole !== 'super_admin' && currentUserId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You can only update your own profile'
      });
    }

    const { email, password, phone, isActive, emailVerified, mfaEnabled } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: BigInt(userId) }
    });

    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if new email conflicts with another user
    if (email && email !== existingUser.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email }
      });
      if (emailConflict) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this email already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    if (mfaEnabled !== undefined) updateData.mfaEnabled = mfaEnabled;
    
    // Only super admin can update password
    if (password && userRole === 'super_admin') {
      updateData.passwordHash = await hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: updateData
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'user',
      entityId: user.id.toString(),
      action: 'UPDATE',
      diff: { ...req.body, password: password ? '[HIDDEN]' : undefined }
    });

    res.status(200).json({
      status: 'success',
      data: {
        id: user.id.toString(),
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete user (super admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userRole = req.user?.role;
    
    if (userRole !== 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only super admins can delete users'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: BigInt(userId) }
    });

    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: BigInt(userId) }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'user',
      entityId: userId,
      action: 'DELETE',
      diff: null
    });

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search users
 */
const searchUsers = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: Only super admins can search users'
      });
    }

    const { q, isActive, emailVerified } = req.query;
    
    let where = {};
    
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified === 'true';
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            companyUsers: true
          }
        }
      },
      orderBy: {
        email: 'asc'
      }
    });

    const transformedUsers = users.map(user => ({
      id: user.id.toString(),
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      mfaEnabled: user.mfaEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      companyCount: user._count.companyUsers
    }));

    res.status(200).json({
      status: 'success',
      data: transformedUsers
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers
};