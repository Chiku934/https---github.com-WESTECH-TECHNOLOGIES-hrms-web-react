const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all permissions for a role
 */
const getRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const companyId = req.user?.companyId;

    if (!roleId) {
      return res.status(400).json({
        status: 'error',
        message: 'Role ID is required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
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

    // Get all permissions for the role
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId: BigInt(roleId)
      },
      include: {
        permission: true
      },
      orderBy: {
        permission: {
          module: 'asc',
          code: 'asc'
        }
      }
    });

    // Transform the data
    const transformedPermissions = rolePermissions.map(rp => ({
      permissionId: rp.permissionId.toString(),
      roleId: rp.roleId.toString(),
      permission: {
        id: rp.permission.id.toString(),
        code: rp.permission.code,
        module: rp.permission.module,
        description: rp.permission.description
      }
    }));

    res.status(200).json({
      status: 'success',
      data: transformedPermissions
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch role permissions',
      error: error.message
    });
  }
};

/**
 * Add a permission to a role
 */
const addPermissionToRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionId } = req.body;
    const companyId = req.user?.companyId;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Role ID and Permission ID are required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
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

    // Verify the permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: BigInt(permissionId) }
    });

    if (!permission) {
      return res.status(404).json({
        status: 'error',
        message: 'Permission not found'
      });
    }

    // Check if the permission is already assigned to the role
    const existingRolePermission = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: BigInt(roleId),
          permissionId: BigInt(permissionId)
        }
      }
    });

    if (existingRolePermission) {
      return res.status(409).json({
        status: 'error',
        message: 'Permission is already assigned to this role'
      });
    }

    // Add the permission to the role
    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId: BigInt(roleId),
        permissionId: BigInt(permissionId)
      },
      include: {
        permission: true
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'role_permission',
      entityId: `${roleId}-${permissionId}`,
      action: 'create',
      diff: {
        roleId,
        permissionId,
        permissionCode: permission.code,
        roleName: role.name
      }
    });

    // Transform the data
    const transformedRolePermission = {
      roleId: rolePermission.roleId.toString(),
      permissionId: rolePermission.permissionId.toString(),
      permission: {
        id: rolePermission.permission.id.toString(),
        code: rolePermission.permission.code,
        module: rolePermission.permission.module,
        description: rolePermission.permission.description
      }
    };

    res.status(201).json({
      status: 'success',
      message: 'Permission added to role successfully',
      data: transformedRolePermission
    });
  } catch (error) {
    console.error('Error adding permission to role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add permission to role',
      error: error.message
    });
  }
};

/**
 * Remove a permission from a role
 */
const removePermissionFromRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;
    const companyId = req.user?.companyId;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Role ID and Permission ID are required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
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

    // Verify the permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: BigInt(permissionId) }
    });

    if (!permission) {
      return res.status(404).json({
        status: 'error',
        message: 'Permission not found'
      });
    }

    // Check if the permission is assigned to the role
    const existingRolePermission = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: BigInt(roleId),
          permissionId: BigInt(permissionId)
        }
      }
    });

    if (!existingRolePermission) {
      return res.status(404).json({
        status: 'error',
        message: 'Permission is not assigned to this role'
      });
    }

    // Remove the permission from the role
    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId: BigInt(roleId),
          permissionId: BigInt(permissionId)
        }
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'role_permission',
      entityId: `${roleId}-${permissionId}`,
      action: 'delete',
      diff: {
        roleId,
        permissionId,
        permissionCode: permission.code,
        roleName: role.name
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Permission removed from role successfully'
    });
  } catch (error) {
    console.error('Error removing permission from role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove permission from role',
      error: error.message
    });
  }
};

/**
 * Bulk update permissions for a role
 * Replaces all permissions for the role with the provided list
 */
const updateRolePermissions = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;
    const companyId = req.user?.companyId;

    if (!roleId) {
      return res.status(400).json({
        status: 'error',
        message: 'Role ID is required'
      });
    }

    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'permissionIds must be an array'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
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

    // Verify all permissions exist
    const permissions = await prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds.map(id => BigInt(id))
        }
      }
    });

    if (permissions.length !== permissionIds.length) {
      return res.status(404).json({
        status: 'error',
        message: 'One or more permissions not found'
      });
    }

    // Start a transaction to update permissions
    const result = await prisma.$transaction(async (tx) => {
      // Delete all existing permissions for the role
      await tx.rolePermission.deleteMany({
        where: {
          roleId: BigInt(roleId)
        }
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        const rolePermissionsData = permissionIds.map(permissionId => ({
          roleId: BigInt(roleId),
          permissionId: BigInt(permissionId)
        }));

        await tx.rolePermission.createMany({
          data: rolePermissionsData
        });
      }

      // Get the updated permissions with details
      const updatedRolePermissions = await tx.rolePermission.findMany({
        where: {
          roleId: BigInt(roleId)
        },
        include: {
          permission: true
        },
        orderBy: {
          permission: {
            module: 'asc',
            code: 'asc'
          }
        }
      });

      return updatedRolePermissions;
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'role_permission',
      entityId: roleId,
      action: 'update',
      diff: {
        roleId,
        permissionIds,
        permissionCount: permissionIds.length
      }
    });

    // Transform the data
    const transformedPermissions = result.map(rp => ({
      permissionId: rp.permissionId.toString(),
      roleId: rp.roleId.toString(),
      permission: {
        id: rp.permission.id.toString(),
        code: rp.permission.code,
        module: rp.permission.module,
        description: rp.permission.description
      }
    }));

    res.status(200).json({
      status: 'success',
      message: 'Role permissions updated successfully',
      data: transformedPermissions
    });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update role permissions',
      error: error.message
    });
  }
};

/**
 * Check if a role has a specific permission
 */
const checkRolePermission = async (req, res) => {
  try {
    const { roleId, permissionId } = req.params;
    const companyId = req.user?.companyId;

    if (!roleId || !permissionId) {
      return res.status(400).json({
        status: 'error',
        message: 'Role ID and Permission ID are required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
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

    // Check if the permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: BigInt(permissionId) }
    });

    if (!permission) {
      return res.status(404).json({
        status: 'error',
        message: 'Permission not found'
      });
    }

    // Check if the permission is assigned to the role
    const rolePermission = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: BigInt(roleId),
          permissionId: BigInt(permissionId)
        }
      },
      include: {
        permission: true
      }
    });

    const hasPermission = !!rolePermission;

    // Transform the data if permission exists
    let permissionData = null;
    if (rolePermission) {
      permissionData = {
        permissionId: rolePermission.permissionId.toString(),
        roleId: rolePermission.roleId.toString(),
        permission: {
          id: rolePermission.permission.id.toString(),
          code: rolePermission.permission.code,
          module: rolePermission.permission.module,
          description: rolePermission.permission.description
        }
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        hasPermission,
        permission: permissionData
      }
    });
  } catch (error) {
    console.error('Error checking role permission:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check role permission',
      error: error.message
    });
  }
};

module.exports = {
  getRolePermissions,
  addPermissionToRole,
  removePermissionFromRole,
  updateRolePermissions,
  checkRolePermission
};