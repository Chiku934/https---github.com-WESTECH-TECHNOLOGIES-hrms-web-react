const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all roles for the current company
 */
const getAllRoles = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Get all roles for the company
    const roles = await prisma.role.findMany({
      where: {
        companyId: BigInt(companyId)
      },
      include: {
        _count: {
          select: {
            userRoles: true,
            rolePermissions: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data
    const transformedRoles = roles.map(role => ({
      id: role.id.toString(),
      companyId: role.companyId.toString(),
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      userCount: role._count.userRoles,
      permissionCount: role._count.rolePermissions
    }));

    res.status(200).json({
      status: 'success',
      data: transformedRoles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch roles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get role by ID
 */
const getRoleById = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const roleId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const role = await prisma.role.findFirst({
      where: {
        id: BigInt(roleId),
        companyId: BigInt(companyId)
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        },
        userRoles: {
          include: {
            companyUser: {
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
        }
      }
    });

    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }

    const transformedRole = {
      id: role.id.toString(),
      companyId: role.companyId.toString(),
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      permissions: role.rolePermissions.map(rp => ({
        id: rp.permission.id.toString(),
        code: rp.permission.code,
        module: rp.permission.module,
        description: rp.permission.description
      })),
      users: role.userRoles.map(ur => ({
        companyUserId: ur.companyUser.id.toString(),
        userId: ur.companyUser.user.id.toString(),
        email: ur.companyUser.user.email,
        assignedAt: ur.assignedAt,
        assignedBy: ur.assignedBy ? ur.assignedBy.toString() : null
      }))
    };

    res.status(200).json({
      status: 'success',
      data: transformedRole
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new role
 */
const createRole = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const { name, description, isSystem, permissionIds } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Role name is required'
      });
    }

    // Check if role name already exists in company
    const existingRole = await prisma.role.findFirst({
      where: {
        companyId: BigInt(companyId),
        name
      }
    });

    if (existingRole) {
      return res.status(400).json({
        status: 'error',
        message: 'Role with this name already exists in this company'
      });
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        companyId: BigInt(companyId),
        name,
        description,
        isSystem: isSystem || false
      }
    });

    // Add permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      const rolePermissionData = permissionIds.map(permissionId => ({
        roleId: role.id,
        permissionId: BigInt(permissionId)
      }));

      await prisma.rolePermission.createMany({
        data: rolePermissionData
      });
    }

    // Get role with permissions
    const roleWithDetails = await prisma.role.findUnique({
      where: { id: role.id },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'role',
      entityId: role.id.toString(),
      action: 'CREATE',
      diff: { name, description, isSystem, permissionIds }
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: roleWithDetails.id.toString(),
        companyId: roleWithDetails.companyId.toString(),
        name: roleWithDetails.name,
        description: roleWithDetails.description,
        isSystem: roleWithDetails.isSystem,
        createdAt: roleWithDetails.createdAt,
        permissions: roleWithDetails.rolePermissions.map(rp => ({
          id: rp.permission.id.toString(),
          code: rp.permission.code,
          module: rp.permission.module,
          description: rp.permission.description
        }))
      }
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update role
 */
const updateRole = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const roleId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const { name, description, isSystem, permissionIds } = req.body;

    // Check if role exists and belongs to company
    const existingRole = await prisma.role.findFirst({
      where: {
        id: BigInt(roleId),
        companyId: BigInt(companyId)
      }
    });

    if (!existingRole) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }

    // Check if new name conflicts with another role in same company
    if (name && name !== existingRole.name) {
      const nameConflict = await prisma.role.findFirst({
        where: {
          companyId: BigInt(companyId),
          name,
          id: { not: BigInt(roleId) }
        }
      });

      if (nameConflict) {
        return res.status(400).json({
          status: 'error',
          message: 'Role with this name already exists in this company'
        });
      }
    }

    // Update role
    const role = await prisma.role.update({
      where: { id: BigInt(roleId) },
      data: {
        name,
        description,
        isSystem
      }
    });

    // Update permissions if provided
    if (permissionIds) {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: BigInt(roleId) }
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        const rolePermissionData = permissionIds.map(permissionId => ({
          roleId: BigInt(roleId),
          permissionId: BigInt(permissionId)
        }));

        await prisma.rolePermission.createMany({
          data: rolePermissionData
        });
      }
    }

    // Get role with permissions
    const roleWithDetails = await prisma.role.findUnique({
      where: { id: role.id },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'role',
      entityId: role.id.toString(),
      action: 'UPDATE',
      diff: { name, description, isSystem, permissionIds }
    });

    res.status(200).json({
      status: 'success',
      data: {
        id: roleWithDetails.id.toString(),
        companyId: roleWithDetails.companyId.toString(),
        name: roleWithDetails.name,
        description: roleWithDetails.description,
        isSystem: roleWithDetails.isSystem,
        createdAt: roleWithDetails.createdAt,
        permissions: roleWithDetails.rolePermissions.map(rp => ({
          id: rp.permission.id.toString(),
          code: rp.permission.code,
          module: rp.permission.module,
          description: rp.permission.description
        }))
      }
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete role
 */
const deleteRole = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const roleId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Check if role exists and belongs to company
    const existingRole = await prisma.role.findFirst({
      where: {
        id: BigInt(roleId),
        companyId: BigInt(companyId)
      }
    });

    if (!existingRole) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found'
      });
    }

    // Check if role is system role (cannot delete)
    if (existingRole.isSystem) {
      return res.status(400).json({
        status: 'error',
        message: 'System roles cannot be deleted'
      });
    }

    // Delete role (cascade will handle role_permissions and user_roles)
    await prisma.role.delete({
      where: { id: BigInt(roleId) }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'role',
      entityId: roleId,
      action: 'DELETE',
      diff: null
    });

    res.status(200).json({
      status: 'success',
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search roles
 */
const searchRoles = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const { q, isSystem } = req.query;
    
    let where = {
      companyId: BigInt(companyId)
    };
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    
    if (isSystem !== undefined) {
      where.isSystem = isSystem === 'true';
    }

    const roles = await prisma.role.findMany({
      where,
      include: {
        _count: {
          select: {
            userRoles: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const transformedRoles = roles.map(role => ({
      id: role.id.toString(),
      companyId: role.companyId.toString(),
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      userCount: role._count.userRoles
    }));

    res.status(200).json({
      status: 'success',
      data: transformedRoles
    });
  } catch (error) {
    console.error('Error searching roles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search roles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  searchRoles
};