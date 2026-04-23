const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all permissions
 * Permissions are system-wide (not company-specific)
 */
const getAllPermissions = async (req, res) => {
  try {
    // Get all permissions
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { code: 'asc' }
      ]
    });

    // Transform the data
    const transformedPermissions = permissions.map(permission => ({
      id: permission.id.toString(),
      code: permission.code,
      module: permission.module,
      description: permission.description
    }));

    res.status(200).json({
      status: 'success',
      data: transformedPermissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch permissions',
      error: error.message
    });
  }
};

/**
 * Get permission by ID
 */
const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Permission ID is required'
      });
    }

    // Get permission by ID
    const permission = await prisma.permission.findUnique({
      where: {
        id: BigInt(id)
      }
    });

    if (!permission) {
      return res.status(404).json({
        status: 'error',
        message: 'Permission not found'
      });
    }

    // Transform the data
    const transformedPermission = {
      id: permission.id.toString(),
      code: permission.code,
      module: permission.module,
      description: permission.description
    };

    res.status(200).json({
      status: 'success',
      data: transformedPermission
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch permission',
      error: error.message
    });
  }
};

/**
 * Create a new permission
 * Only super admin can create permissions
 */
const createPermission = async (req, res) => {
  try {
    const { code, module, description } = req.body;

    // Validate required fields
    if (!code || !module) {
      return res.status(400).json({
        status: 'error',
        message: 'Code and module are required fields'
      });
    }

    // Check if permission with same code already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { code }
    });

    if (existingPermission) {
      return res.status(409).json({
        status: 'error',
        message: 'Permission with this code already exists'
      });
    }

    // Create the permission
    const permission = await prisma.permission.create({
      data: {
        code,
        module,
        description
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'permission',
      entityId: permission.id.toString(),
      action: 'create',
      diff: {
        code,
        module,
        description
      }
    });

    // Transform the data
    const transformedPermission = {
      id: permission.id.toString(),
      code: permission.code,
      module: permission.module,
      description: permission.description
    };

    res.status(201).json({
      status: 'success',
      message: 'Permission created successfully',
      data: transformedPermission
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create permission',
      error: error.message
    });
  }
};

/**
 * Update a permission
 * Only super admin can update permissions
 */
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, module, description } = req.body;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Permission ID is required'
      });
    }

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id: BigInt(id) }
    });

    if (!existingPermission) {
      return res.status(404).json({
        status: 'error',
        message: 'Permission not found'
      });
    }

    // If code is being changed, check for duplicates
    if (code && code !== existingPermission.code) {
      const duplicatePermission = await prisma.permission.findUnique({
        where: { code }
      });

      if (duplicatePermission) {
        return res.status(409).json({
          status: 'error',
          message: 'Permission with this code already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (code !== undefined) updateData.code = code;
    if (module !== undefined) updateData.module = module;
    if (description !== undefined) updateData.description = description;

    // Update the permission
    const updatedPermission = await prisma.permission.update({
      where: { id: BigInt(id) },
      data: updateData
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'permission',
      entityId: updatedPermission.id.toString(),
      action: 'update',
      diff: updateData
    });

    // Transform the data
    const transformedPermission = {
      id: updatedPermission.id.toString(),
      code: updatedPermission.code,
      module: updatedPermission.module,
      description: updatedPermission.description
    };

    res.status(200).json({
      status: 'success',
      message: 'Permission updated successfully',
      data: transformedPermission
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update permission',
      error: error.message
    });
  }
};

/**
 * Delete a permission
 * Only super admin can delete permissions
 */
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Permission ID is required'
      });
    }

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: {
            rolePermissions: true
          }
        }
      }
    });

    if (!existingPermission) {
      return res.status(404).json({
        status: 'error',
        message: 'Permission not found'
      });
    }

    // Check if permission is being used by any roles
    if (existingPermission._count.rolePermissions > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete permission because it is assigned to one or more roles'
      });
    }

    // Delete the permission
    await prisma.permission.delete({
      where: { id: BigInt(id) }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'permission',
      entityId: id,
      action: 'delete',
      diff: {
        code: existingPermission.code,
        module: existingPermission.module
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete permission',
      error: error.message
    });
  }
};

/**
 * Search permissions by code, module, or description
 */
const searchPermissions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const searchQuery = `%${q}%`;

    // Search permissions
    const permissions = await prisma.permission.findMany({
      where: {
        OR: [
          {
            code: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            module: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: [
        { module: 'asc' },
        { code: 'asc' }
      ]
    });

    // Transform the data
    const transformedPermissions = permissions.map(permission => ({
      id: permission.id.toString(),
      code: permission.code,
      module: permission.module,
      description: permission.description
    }));

    res.status(200).json({
      status: 'success',
      data: transformedPermissions
    });
  } catch (error) {
    console.error('Error searching permissions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search permissions',
      error: error.message
    });
  }
};

/**
 * Get permissions by module
 */
const getPermissionsByModule = async (req, res) => {
  try {
    const { module } = req.params;

    if (!module) {
      return res.status(400).json({
        status: 'error',
        message: 'Module name is required'
      });
    }

    // Get permissions by module
    const permissions = await prisma.permission.findMany({
      where: {
        module: {
          equals: module,
          mode: 'insensitive'
        }
      },
      orderBy: {
        code: 'asc'
      }
    });

    // Transform the data
    const transformedPermissions = permissions.map(permission => ({
      id: permission.id.toString(),
      code: permission.code,
      module: permission.module,
      description: permission.description
    }));

    res.status(200).json({
      status: 'success',
      data: transformedPermissions
    });
  } catch (error) {
    console.error('Error fetching permissions by module:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch permissions by module',
      error: error.message
    });
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  searchPermissions,
  getPermissionsByModule
};