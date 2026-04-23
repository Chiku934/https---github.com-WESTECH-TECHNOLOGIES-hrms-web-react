const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all departments for the current company
 */
const getAllDepartments = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Get all departments for the company
    const departments = await prisma.department.findMany({
      where: {
        companyId: BigInt(companyId)
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        head: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            children: true,
            employeeAssignments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data
    const transformedDepartments = departments.map(dept => ({
      id: dept.id.toString(),
      companyId: dept.companyId.toString(),
      name: dept.name,
      code: dept.code,
      parentId: dept.parentId ? dept.parentId.toString() : null,
      parent: dept.parent,
      headId: dept.headId ? dept.headId.toString() : null,
      head: dept.head ? {
        id: dept.head.id.toString(),
        user: dept.head.user
      } : null,
      createdAt: dept.createdAt,
      childrenCount: dept._count.children,
      employeeCount: dept._count.employeeAssignments
    }));

    res.status(200).json({
      status: 'success',
      data: transformedDepartments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get department by ID
 */
const getDepartmentById = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const departmentId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!departmentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Department ID is required'
      });
    }

    const department = await prisma.department.findFirst({
      where: {
        id: BigInt(departmentId),
        companyId: BigInt(companyId)
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        head: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            code: true,
            createdAt: true
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            employeeAssignments: true
          }
        }
      }
    });

    if (!department) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found'
      });
    }

    const transformedDepartment = {
      id: department.id.toString(),
      companyId: department.companyId.toString(),
      name: department.name,
      code: department.code,
      parentId: department.parentId ? department.parentId.toString() : null,
      parent: department.parent,
      headId: department.headId ? department.headId.toString() : null,
      head: department.head ? {
        id: department.head.id.toString(),
        user: department.head.user
      } : null,
      createdAt: department.createdAt,
      company: department.company,
      children: department.children.map(child => ({
        id: child.id.toString(),
        name: child.name,
        code: child.code,
        createdAt: child.createdAt
      })),
      employeeCount: department._count.employeeAssignments
    };

    res.status(200).json({
      status: 'success',
      data: transformedDepartment
    });
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new department
 */
const createDepartment = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const departmentData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Validate required fields
    if (!departmentData.name) {
      return res.status(400).json({
        status: 'error',
        message: 'Department name is required'
      });
    }

    // Check if department with same name already exists in company
    const existingDepartment = await prisma.department.findFirst({
      where: {
        companyId: BigInt(companyId),
        name: departmentData.name
      }
    });

    if (existingDepartment) {
      return res.status(409).json({
        status: 'error',
        message: 'Department with this name already exists in the company'
      });
    }

    // Prepare data for creation
    const createData = {
      companyId: BigInt(companyId),
      name: departmentData.name,
      code: departmentData.code || null,
      parentId: departmentData.parentId ? BigInt(departmentData.parentId) : null,
      headId: departmentData.headId ? BigInt(departmentData.headId) : null
    };

    // Create department
    const department = await prisma.department.create({
      data: createData,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        head: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'department',
      entityId: department.id.toString(),
      action: 'CREATE',
      description: `Created department: ${department.name}`,
      diff: {
        before: null,
        after: department
      }
    });

    const transformedDepartment = {
      id: department.id.toString(),
      companyId: department.companyId.toString(),
      name: department.name,
      code: department.code,
      parentId: department.parentId ? department.parentId.toString() : null,
      parent: department.parent,
      headId: department.headId ? department.headId.toString() : null,
      head: department.head ? {
        id: department.head.id.toString(),
        user: department.head.user
      } : null,
      createdAt: department.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Department created successfully',
      data: transformedDepartment
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a department
 */
const updateDepartment = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const departmentId = req.params.id;
    const updateData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!departmentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Department ID is required'
      });
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        id: BigInt(departmentId),
        companyId: BigInt(companyId)
      }
    });

    if (!existingDepartment) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found'
      });
    }

    // Check if name is being changed and if new name already exists
    if (updateData.name && updateData.name !== existingDepartment.name) {
      const duplicateDepartment = await prisma.department.findFirst({
        where: {
          companyId: BigInt(companyId),
          name: updateData.name,
          NOT: {
            id: BigInt(departmentId)
          }
        }
      });

      if (duplicateDepartment) {
        return res.status(409).json({
          status: 'error',
          message: 'Department with this name already exists in the company'
        });
      }
    }

    // Prepare update data
    const dataToUpdate = {};
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.code !== undefined) dataToUpdate.code = updateData.code;
    if (updateData.parentId !== undefined) {
      dataToUpdate.parentId = updateData.parentId ? BigInt(updateData.parentId) : null;
    }
    if (updateData.headId !== undefined) {
      dataToUpdate.headId = updateData.headId ? BigInt(updateData.headId) : null;
    }

    // Update department
    const updatedDepartment = await prisma.department.update({
      where: {
        id: BigInt(departmentId)
      },
      data: dataToUpdate,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        head: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'department',
      entityId: updatedDepartment.id.toString(),
      action: 'UPDATE',
      description: `Updated department: ${updatedDepartment.name}`,
      diff: {
        before: existingDepartment,
        after: updatedDepartment
      }
    });

    const transformedDepartment = {
      id: updatedDepartment.id.toString(),
      companyId: updatedDepartment.companyId.toString(),
      name: updatedDepartment.name,
      code: updatedDepartment.code,
      parentId: updatedDepartment.parentId ? updatedDepartment.parentId.toString() : null,
      parent: updatedDepartment.parent,
      headId: updatedDepartment.headId ? updatedDepartment.headId.toString() : null,
      head: updatedDepartment.head ? {
        id: updatedDepartment.head.id.toString(),
        user: updatedDepartment.head.user
      } : null,
      createdAt: updatedDepartment.createdAt
    };

    res.status(200).json({
      status: 'success',
      message: 'Department updated successfully',
      data: transformedDepartment
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a department
 */
const deleteDepartment = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const departmentId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!departmentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Department ID is required'
      });
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findFirst({
      where: {
        id: BigInt(departmentId),
        companyId: BigInt(companyId)
      },
      include: {
        _count: {
          select: {
            children: true,
            employeeAssignments: true
          }
        }
      }
    });

    if (!existingDepartment) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found'
      });
    }

    // Check if department has children
    if (existingDepartment._count.children > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete department that has child departments. Please delete or reassign child departments first.'
      });
    }

    // Check if department has employees assigned
    if (existingDepartment._count.employeeAssignments > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete department that has employees assigned. Please reassign employees first.'
      });
    }

    // Delete department
    await prisma.department.delete({
      where: {
        id: BigInt(departmentId)
      }
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'department',
      entityId: existingDepartment.id.toString(),
      action: 'DELETE',
      description: `Deleted department: ${existingDepartment.name}`,
      diff: {
        before: existingDepartment,
        after: null
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search departments
 */
const searchDepartments = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const { query } = req.query;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!query || query.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const searchTerm = `%${query}%`;
    
    // Search departments by name or code
    const departments = await prisma.department.findMany({
      where: {
        companyId: BigInt(companyId),
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            code: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        head: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            employeeAssignments: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      },
      take: 50 // Limit results
    });

    const transformedDepartments = departments.map(dept => ({
      id: dept.id.toString(),
      companyId: dept.companyId.toString(),
      name: dept.name,
      code: dept.code,
      parentId: dept.parentId ? dept.parentId.toString() : null,
      parent: dept.parent,
      headId: dept.headId ? dept.headId.toString() : null,
      head: dept.head ? {
        id: dept.head.id.toString(),
        user: dept.head.user
      } : null,
      createdAt: dept.createdAt,
      employeeCount: dept._count.employeeAssignments
    }));

    res.status(200).json({
      status: 'success',
      data: transformedDepartments
    });
  } catch (error) {
    console.error('Error searching departments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  searchDepartments
};