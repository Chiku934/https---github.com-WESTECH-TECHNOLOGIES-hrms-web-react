const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all roles for a user (company user)
 */
const getUserRoles = async (req, res) => {
  try {
    const { companyUserId } = req.params;
    const companyId = req.user?.companyId;

    if (!companyUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company User ID is required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Verify the company user belongs to the user's company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(companyUserId),
        companyId: BigInt(companyId)
      }
    });

    if (!companyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found or you do not have access to it'
      });
    }

    // Get all roles for the company user
    const userRoles = await prisma.userRole.findMany({
      where: {
        companyUserId: BigInt(companyUserId)
      },
      include: {
        role: true,
        assignedByUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        role: {
          name: 'asc'
        }
      }
    });

    // Transform the data
    const transformedRoles = userRoles.map(ur => ({
      companyUserId: ur.companyUserId.toString(),
      roleId: ur.roleId.toString(),
      assignedAt: ur.assignedAt,
      assignedBy: ur.assignedBy ? ur.assignedBy.toString() : null,
      role: {
        id: ur.role.id.toString(),
        name: ur.role.name,
        description: ur.role.description,
        isSystem: ur.role.isSystem
      },
      assignedByUser: ur.assignedByUser ? {
        id: ur.assignedByUser.id.toString(),
        user: {
          id: ur.assignedByUser.user.id.toString(),
          email: ur.assignedByUser.user.email
        }
      } : null
    }));

    res.status(200).json({
      status: 'success',
      data: transformedRoles
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user roles',
      error: error.message
    });
  }
};

/**
 * Add a role to a user (company user)
 */
const addRoleToUser = async (req, res) => {
  try {
    const { companyUserId } = req.params;
    const { roleId } = req.body;
    const currentUserId = req.user?.userId;
    const companyId = req.user?.companyId;

    if (!companyUserId || !roleId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company User ID and Role ID are required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Verify the company user belongs to the user's company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(companyUserId),
        companyId: BigInt(companyId)
      }
    });

    if (!companyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found or you do not have access to it'
      });
    }

    // Verify the role belongs to the user's company
    const role = await prisma.role.findFirst({
      where: {
        id: BigInt(roleId),
        companyId: BigInt(companyId)
      }
    });

    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found or you do not have access to it'
      });
    }

    // Check if the role is already assigned to the user
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        companyUserId_roleId: {
          companyUserId: BigInt(companyUserId),
          roleId: BigInt(roleId)
        }
      }
    });

    if (existingUserRole) {
      return res.status(409).json({
        status: 'error',
        message: 'Role is already assigned to this user'
      });
    }

    // Get the current user's company user ID for assignment
    let assignedBy = null;
    if (currentUserId) {
      const currentCompanyUser = await prisma.companyUser.findFirst({
        where: {
          userId: BigInt(currentUserId),
          companyId: BigInt(companyId)
        }
      });
      if (currentCompanyUser) {
        assignedBy = currentCompanyUser.id;
      }
    }

    // Add the role to the user
    const userRole = await prisma.userRole.create({
      data: {
        companyUserId: BigInt(companyUserId),
        roleId: BigInt(roleId),
        assignedBy: assignedBy ? BigInt(assignedBy) : null
      },
      include: {
        role: true,
        assignedByUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'user_role',
      entityId: `${companyUserId}-${roleId}`,
      action: 'create',
      diff: {
        companyUserId,
        roleId,
        roleName: role.name,
        userEmail: companyUser.userId // We'd need to fetch user email for better audit
      }
    });

    // Transform the data
    const transformedUserRole = {
      companyUserId: userRole.companyUserId.toString(),
      roleId: userRole.roleId.toString(),
      assignedAt: userRole.assignedAt,
      assignedBy: userRole.assignedBy ? userRole.assignedBy.toString() : null,
      role: {
        id: userRole.role.id.toString(),
        name: userRole.role.name,
        description: userRole.role.description,
        isSystem: userRole.role.isSystem
      },
      assignedByUser: userRole.assignedByUser ? {
        id: userRole.assignedByUser.id.toString(),
        user: {
          id: userRole.assignedByUser.user.id.toString(),
          email: userRole.assignedByUser.user.email
        }
      } : null
    };

    res.status(201).json({
      status: 'success',
      message: 'Role added to user successfully',
      data: transformedUserRole
    });
  } catch (error) {
    console.error('Error adding role to user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add role to user',
      error: error.message
    });
  }
};

/**
 * Remove a role from a user (company user)
 */
const removeRoleFromUser = async (req, res) => {
  try {
    const { companyUserId, roleId } = req.params;
    const companyId = req.user?.companyId;

    if (!companyUserId || !roleId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company User ID and Role ID are required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Verify the company user belongs to the user's company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(companyUserId),
        companyId: BigInt(companyId)
      }
    });

    if (!companyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found or you do not have access to it'
      });
    }

    // Verify the role belongs to the user's company
    const role = await prisma.role.findFirst({
      where: {
        id: BigInt(roleId),
        companyId: BigInt(companyId)
      }
    });

    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found or you do not have access to it'
      });
    }

    // Check if the role is assigned to the user
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        companyUserId_roleId: {
          companyUserId: BigInt(companyUserId),
          roleId: BigInt(roleId)
        }
      }
    });

    if (!existingUserRole) {
      return res.status(404).json({
        status: 'error',
        message: 'Role is not assigned to this user'
      });
    }

    // Remove the role from the user
    await prisma.userRole.delete({
      where: {
        companyUserId_roleId: {
          companyUserId: BigInt(companyUserId),
          roleId: BigInt(roleId)
        }
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'user_role',
      entityId: `${companyUserId}-${roleId}`,
      action: 'delete',
      diff: {
        companyUserId,
        roleId,
        roleName: role.name
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Role removed from user successfully'
    });
  } catch (error) {
    console.error('Error removing role from user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove role from user',
      error: error.message
    });
  }
};

/**
 * Bulk update roles for a user
 * Replaces all roles for the user with the provided list
 */
const updateUserRoles = async (req, res) => {
  try {
    const { companyUserId } = req.params;
    const { roleIds } = req.body;
    const currentUserId = req.user?.userId;
    const companyId = req.user?.companyId;

    if (!companyUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company User ID is required'
      });
    }

    if (!Array.isArray(roleIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'roleIds must be an array'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Verify the company user belongs to the user's company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(companyUserId),
        companyId: BigInt(companyId)
      }
    });

    if (!companyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found or you do not have access to it'
      });
    }

    // Verify all roles belong to the user's company
    const roles = await prisma.role.findMany({
      where: {
        id: {
          in: roleIds.map(id => BigInt(id))
        },
        companyId: BigInt(companyId)
      }
    });

    if (roles.length !== roleIds.length) {
      return res.status(404).json({
        status: 'error',
        message: 'One or more roles not found or you do not have access to them'
      });
    }

    // Get the current user's company user ID for assignment
    let assignedBy = null;
    if (currentUserId) {
      const currentCompanyUser = await prisma.companyUser.findFirst({
        where: {
          userId: BigInt(currentUserId),
          companyId: BigInt(companyId)
        }
      });
      if (currentCompanyUser) {
        assignedBy = currentCompanyUser.id;
      }
    }

    // Start a transaction to update roles
    const result = await prisma.$transaction(async (tx) => {
      // Delete all existing roles for the user
      await tx.userRole.deleteMany({
        where: {
          companyUserId: BigInt(companyUserId)
        }
      });

      // Add new roles
      if (roleIds.length > 0) {
        const userRolesData = roleIds.map(roleId => ({
          companyUserId: BigInt(companyUserId),
          roleId: BigInt(roleId),
          assignedBy: assignedBy ? BigInt(assignedBy) : null
        }));

        await tx.userRole.createMany({
          data: userRolesData
        });
      }

      // Get the updated roles with details
      const updatedUserRoles = await tx.userRole.findMany({
        where: {
          companyUserId: BigInt(companyUserId)
        },
        include: {
          role: true,
          assignedByUser: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          role: {
            name: 'asc'
          }
        }
      });

      return updatedUserRoles;
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'user_role',
      entityId: companyUserId,
      action: 'update',
      diff: {
        companyUserId,
        roleIds,
        roleCount: roleIds.length
      }
    });

    // Transform the data
    const transformedRoles = result.map(ur => ({
      companyUserId: ur.companyUserId.toString(),
      roleId: ur.roleId.toString(),
      assignedAt: ur.assignedAt,
      assignedBy: ur.assignedBy ? ur.assignedBy.toString() : null,
      role: {
        id: ur.role.id.toString(),
        name: ur.role.name,
        description: ur.role.description,
        isSystem: ur.role.isSystem
      },
      assignedByUser: ur.assignedByUser ? {
        id: ur.assignedByUser.id.toString(),
        user: {
          id: ur.assignedByUser.user.id.toString(),
          email: ur.assignedByUser.user.email
        }
      } : null
    }));

    res.status(200).json({
      status: 'success',
      message: 'User roles updated successfully',
      data: transformedRoles
    });
  } catch (error) {
    console.error('Error updating user roles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update user roles',
      error: error.message
    });
  }
};

/**
 * Check if a user has a specific role
 */
const checkUserRole = async (req, res) => {
  try {
    const { companyUserId, roleId } = req.params;
    const companyId = req.user?.companyId;

    if (!companyUserId || !roleId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company User ID and Role ID are required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Verify the company user belongs to the user's company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(companyUserId),
        companyId: BigInt(companyId)
      }
    });

    if (!companyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found or you do not have access to it'
      });
    }

    // Verify the role belongs to the user's company
    const role = await prisma.role.findFirst({
      where: {
        id: BigInt(roleId),
        companyId: BigInt(companyId)
      }
    });

    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found or you do not have access to it'
      });
    }

    // Check if the role is assigned to the user
    const userRole = await prisma.userRole.findUnique({
      where: {
        companyUserId_roleId: {
          companyUserId: BigInt(companyUserId),
          roleId: BigInt(roleId)
        }
      },
      include: {
        role: true
      }
    });

    const hasRole = !!userRole;

    // Transform the data if role exists
    let roleData = null;
    if (userRole) {
      roleData = {
        companyUserId: userRole.companyUserId.toString(),
        roleId: userRole.roleId.toString(),
        assignedAt: userRole.assignedAt,
        assignedBy: userRole.assignedBy ? userRole.assignedBy.toString() : null,
        role: {
          id: userRole.role.id.toString(),
          name: userRole.role.name,
          description: userRole.role.description,
          isSystem: userRole.role.isSystem
        }
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        hasRole,
        role: roleData
      }
    });
  } catch (error) {
    console.error('Error checking user role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check user role',
      error: error.message
    });
  }
};

module.exports = {
  getUserRoles,
  addRoleToUser,
  removeRoleFromUser,
  updateUserRoles,
  checkUserRole
};