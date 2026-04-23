const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all assignments for a company user
 */
const getEmployeeAssignments = async (req, res) => {
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

    // Get all assignments for the company user
    const assignments = await prisma.employeeAssignment.findMany({
      where: {
        companyUserId: BigInt(companyUserId)
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        designation: {
          select: {
            id: true,
            title: true,
            level: true
          }
        },
        manager: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            },
            employeeProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    // Transform the data
    const transformedAssignments = assignments.map(assignment => ({
      id: assignment.id.toString(),
      companyUserId: assignment.companyUserId.toString(),
      departmentId: assignment.departmentId ? assignment.departmentId.toString() : null,
      designationId: assignment.designationId ? assignment.designationId.toString() : null,
      managerId: assignment.managerId ? assignment.managerId.toString() : null,
      employmentType: assignment.employmentType,
      workLocation: assignment.workLocation,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      isCurrent: assignment.isCurrent,
      createdAt: assignment.createdAt,
      department: assignment.department,
      designation: assignment.designation,
      manager: assignment.manager ? {
        id: assignment.manager.id.toString(),
        user: assignment.manager.user,
        profile: assignment.manager.employeeProfile ? {
          firstName: assignment.manager.employeeProfile.firstName,
          lastName: assignment.manager.employeeProfile.lastName
        } : null
      } : null
    }));

    res.status(200).json({
      status: 'success',
      data: transformedAssignments
    });
  } catch (error) {
    console.error('Error fetching employee assignments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employee assignments',
      error: error.message
    });
  }
};

/**
 * Get current assignment for a company user
 */
const getCurrentAssignment = async (req, res) => {
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

    // Get current assignment
    const assignment = await prisma.employeeAssignment.findFirst({
      where: {
        companyUserId: BigInt(companyUserId),
        isCurrent: true
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        designation: {
          select: {
            id: true,
            title: true,
            level: true
          }
        },
        manager: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            },
            employeeProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Current assignment not found'
      });
    }

    // Transform the data
    const transformedAssignment = {
      id: assignment.id.toString(),
      companyUserId: assignment.companyUserId.toString(),
      departmentId: assignment.departmentId ? assignment.departmentId.toString() : null,
      designationId: assignment.designationId ? assignment.designationId.toString() : null,
      managerId: assignment.managerId ? assignment.managerId.toString() : null,
      employmentType: assignment.employmentType,
      workLocation: assignment.workLocation,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      isCurrent: assignment.isCurrent,
      createdAt: assignment.createdAt,
      department: assignment.department,
      designation: assignment.designation,
      manager: assignment.manager ? {
        id: assignment.manager.id.toString(),
        user: assignment.manager.user,
        profile: assignment.manager.employeeProfile ? {
          firstName: assignment.manager.employeeProfile.firstName,
          lastName: assignment.manager.employeeProfile.lastName
        } : null
      } : null
    };

    res.status(200).json({
      status: 'success',
      data: transformedAssignment
    });
  } catch (error) {
    console.error('Error fetching current assignment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch current assignment',
      error: error.message
    });
  }
};

/**
 * Create a new employee assignment
 */
const createEmployeeAssignment = async (req, res) => {
  try {
    const { companyUserId } = req.params;
    const {
      departmentId,
      designationId,
      managerId,
      employmentType,
      workLocation,
      startDate,
      endDate,
      isCurrent = true
    } = req.body;
    const companyId = req.user?.companyId;

    if (!companyUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company User ID is required'
      });
    }

    if (!startDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date is required'
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

    // Verify department belongs to the company
    if (departmentId) {
      const department = await prisma.department.findFirst({
        where: {
          id: BigInt(departmentId),
          companyId: BigInt(companyId)
        }
      });

      if (!department) {
        return res.status(404).json({
          status: 'error',
          message: 'Department not found or does not belong to your company'
        });
      }
    }

    // Verify designation belongs to the company
    if (designationId) {
      const designation = await prisma.designation.findFirst({
        where: {
          id: BigInt(designationId),
          companyId: BigInt(companyId)
        }
      });

      if (!designation) {
        return res.status(404).json({
          status: 'error',
          message: 'Designation not found or does not belong to your company'
        });
      }
    }

    // Verify manager belongs to the company
    if (managerId) {
      const manager = await prisma.companyUser.findFirst({
        where: {
          id: BigInt(managerId),
          companyId: BigInt(companyId)
        }
      });

      if (!manager) {
        return res.status(404).json({
          status: 'error',
          message: 'Manager not found or does not belong to your company'
        });
      }
    }

    // If this is a current assignment, mark other assignments as not current
    if (isCurrent) {
      await prisma.employeeAssignment.updateMany({
        where: {
          companyUserId: BigInt(companyUserId),
          isCurrent: true
        },
        data: {
          isCurrent: false,
          endDate: new Date(startDate) // Set end date to the start date of new assignment
        }
      });
    }

    // Create the assignment
    const assignment = await prisma.employeeAssignment.create({
      data: {
        companyUserId: BigInt(companyUserId),
        departmentId: departmentId ? BigInt(departmentId) : null,
        designationId: designationId ? BigInt(designationId) : null,
        managerId: managerId ? BigInt(managerId) : null,
        employmentType,
        workLocation,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        designation: {
          select: {
            id: true,
            title: true,
            level: true
          }
        },
        manager: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            },
            employeeProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'employee_assignment',
      entityId: assignment.id.toString(),
      action: 'create',
      diff: {
        companyUserId,
        departmentId,
        designationId,
        managerId,
        employmentType,
        workLocation,
        startDate,
        endDate,
        isCurrent
      }
    });

    // Transform the data
    const transformedAssignment = {
      id: assignment.id.toString(),
      companyUserId: assignment.companyUserId.toString(),
      departmentId: assignment.departmentId ? assignment.departmentId.toString() : null,
      designationId: assignment.designationId ? assignment.designationId.toString() : null,
      managerId: assignment.managerId ? assignment.managerId.toString() : null,
      employmentType: assignment.employmentType,
      workLocation: assignment.workLocation,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      isCurrent: assignment.isCurrent,
      createdAt: assignment.createdAt,
      department: assignment.department,
      designation: assignment.designation,
      manager: assignment.manager ? {
        id: assignment.manager.id.toString(),
        user: assignment.manager.user,
        profile: assignment.manager.employeeProfile ? {
          firstName: assignment.manager.employeeProfile.firstName,
          lastName: assignment.manager.employeeProfile.lastName
        } : null
      } : null
    };

    res.status(201).json({
      status: 'success',
      message: 'Employee assignment created successfully',
      data: transformedAssignment
    });
  } catch (error) {
    console.error('Error creating employee assignment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create employee assignment',
      error: error.message
    });
  }
};

/**
 * Update an employee assignment
 */
const updateEmployeeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const companyId = req.user?.companyId;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Assignment ID is required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Check if assignment exists and belongs to the user's company
    const existingAssignment = await prisma.employeeAssignment.findFirst({
      where: {
        id: BigInt(id),
        companyUser: {
          companyId: BigInt(companyId)
        }
      },
      include: {
        companyUser: true
      }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found or you do not have access to it'
      });
    }

    // Verify department belongs to the company
    if (updateData.departmentId) {
      const department = await prisma.department.findFirst({
        where: {
          id: BigInt(updateData.departmentId),
          companyId: BigInt(companyId)
        }
      });

      if (!department) {
        return res.status(404).json({
          status: 'error',
          message: 'Department not found or does not belong to your company'
        });
      }
    }

    // Verify designation belongs to the company
    if (updateData.designationId) {
      const designation = await prisma.designation.findFirst({
        where: {
          id: BigInt(updateData.designationId),
          companyId: BigInt(companyId)
        }
      });

      if (!designation) {
        return res.status(404).json({
          status: 'error',
          message: 'Designation not found or does not belong to your company'
        });
      }
    }

    // Verify manager belongs to the company
    if (updateData.managerId) {
      const manager = await prisma.companyUser.findFirst({
        where: {
          id: BigInt(updateData.managerId),
          companyId: BigInt(companyId)
        }
      });

      if (!manager) {
        return res.status(404).json({
          status: 'error',
          message: 'Manager not found or does not belong to your company'
        });
      }
    }

    // Prepare update data
    const assignmentUpdateData = { ...updateData };
    
    // Handle BigInt conversions
    if (assignmentUpdateData.departmentId) {
      assignmentUpdateData.departmentId = BigInt(assignmentUpdateData.departmentId);
    }
    if (assignmentUpdateData.designationId) {
      assignmentUpdateData.designationId = BigInt(assignmentUpdateData.designationId);
    }
    if (assignmentUpdateData.managerId) {
      assignmentUpdateData.managerId = BigInt(assignmentUpdateData.managerId);
    }
    
    // Handle date conversions
    if (assignmentUpdateData.startDate) {
      assignmentUpdateData.startDate = new Date(assignmentUpdateData.startDate);
    }
    if (assignmentUpdateData.endDate) {
      assignmentUpdateData.endDate = new Date(assignmentUpdateData.endDate);
    }

    // If this is being marked as current, update other assignments
    if (assignmentUpdateData.isCurrent === true) {
      await prisma.employeeAssignment.updateMany({
        where: {
          companyUserId: existingAssignment.companyUserId,
          isCurrent: true,
          id: {
            not: BigInt(id)
          }
        },
        data: {
          isCurrent: false
        }
      });
    }

    // Update the assignment
    const updatedAssignment = await prisma.employeeAssignment.update({
      where: {
        id: BigInt(id)
      },
      data: assignmentUpdateData,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        designation: {
          select: {
            id: true,
            title: true,
            level: true
          }
        },
        manager: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            },
            employeeProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'employee_assignment',
      entityId: id,
      action: 'update',
      diff: updateData
    });

    // Transform the data
    const transformedAssignment = {
      id: updatedAssignment.id.toString(),
      companyUserId: updatedAssignment.companyUserId.toString(),
      departmentId: updatedAssignment.departmentId ? updatedAssignment.departmentId.toString() : null,
      designationId: updatedAssignment.designationId ? updatedAssignment.designationId.toString() : null,
      managerId: updatedAssignment.managerId ? updatedAssignment.managerId.toString() : null,
      employmentType: updatedAssignment.employmentType,
      workLocation: updatedAssignment.workLocation,
      startDate: updatedAssignment.startDate,
      endDate: updatedAssignment.endDate,
      isCurrent: updatedAssignment.isCurrent,
      createdAt: updatedAssignment.createdAt,
      department: updatedAssignment.department,
      designation: updatedAssignment.designation,
      manager: updatedAssignment.manager ? {
        id: updatedAssignment.manager.id.toString(),
        user: updatedAssignment.manager.user,
        profile: updatedAssignment.manager.employeeProfile ? {
          firstName: updatedAssignment.manager.employeeProfile.firstName,
          lastName: updatedAssignment.manager.employeeProfile.lastName
        } : null
      } : null
    };

    res.status(200).json({
      status: 'success',
      message: 'Employee assignment updated successfully',
      data: transformedAssignment
    });
  } catch (error) {
    console.error('Error updating employee assignment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update employee assignment',
      error: error.message
    });
  }
};

/**
 * Delete an employee assignment
 */
const deleteEmployeeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Assignment ID is required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Check if assignment exists and belongs to the user's company
    const existingAssignment = await prisma.employeeAssignment.findFirst({
      where: {
        id: BigInt(id),
        companyUser: {
          companyId: BigInt(companyId)
        }
      }
    });

    if (!existingAssignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Assignment not found or you do not have access to it'
      });
    }

    // Don't allow deletion of current assignment if it's the only one
    if (existingAssignment.isCurrent) {
      const otherAssignments = await prisma.employeeAssignment.findMany({
        where: {
          companyUserId: existingAssignment.companyUserId,
          id: {
            not: BigInt(id)
          }
        }
      });

      if (otherAssignments.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Cannot delete the only assignment for this employee. Please create a new assignment first.'
        });
      }
    }

    // Delete the assignment
    await prisma.employeeAssignment.delete({
      where: {
        id: BigInt(id)
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'employee_assignment',
      entityId: id,
      action: 'delete',
      diff: {
        companyUserId: existingAssignment.companyUserId.toString(),
        departmentId: existingAssignment.departmentId ? existingAssignment.departmentId.toString() : null,
        designationId: existingAssignment.designationId ? existingAssignment.designationId.toString() : null
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Employee assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee assignment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete employee assignment',
      error: error.message
    });
  }
};

/**
 * Get assignments by department
 */
const getAssignmentsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const companyId = req.user?.companyId;

    if (!departmentId) {
      return res.status(400).json({
        status: 'error',
        message: 'Department ID is required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Verify department belongs to the company
    const department = await prisma.department.findFirst({
      where: {
        id: BigInt(departmentId),
        companyId: BigInt(companyId)
      }
    });

    if (!department) {
      return res.status(404).json({
        status: 'error',
        message: 'Department not found or does not belong to your company'
      });
    }

    // Get current assignments for the department
    const assignments = await prisma.employeeAssignment.findMany({
      where: {
        departmentId: BigInt(departmentId),
        isCurrent: true
      },
      include: {
        companyUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            },
            employeeProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        designation: {
          select: {
            id: true,
            title: true,
            level: true
          }
        },
        manager: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            },
            employeeProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        companyUser: {
          employeeProfile: {
            lastName: 'asc'
          }
        }
      }
    });

    // Transform the data
    const transformedAssignments = assignments.map(assignment => ({
      id: assignment.id.toString(),
      companyUserId: assignment.companyUserId.toString(),
      departmentId: assignment.departmentId ? assignment.departmentId.toString() : null,
      designationId: assignment.designationId ? assignment.designationId.toString() : null,
      managerId: assignment.managerId ? assignment.managerId.toString() : null,
      employmentType: assignment.employmentType,
      workLocation: assignment.workLocation,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      isCurrent: assignment.isCurrent,
      createdAt: assignment.createdAt,
      employee: assignment.companyUser ? {
        id: assignment.companyUser.id.toString(),
        user: assignment.companyUser.user,
        profile: assignment.companyUser.employeeProfile ? {
          firstName: assignment.companyUser.employeeProfile.firstName,
          lastName: assignment.companyUser.employeeProfile.lastName
        } : null
      } : null,
      designation: assignment.designation,
      manager: assignment.manager ? {
        id: assignment.manager.id.toString(),
        user: assignment.manager.user,
        profile: assignment.manager.employeeProfile ? {
          firstName: assignment.manager.employeeProfile.firstName,
          lastName: assignment.manager.employeeProfile.lastName
        } : null
      } : null
    }));

    res.status(200).json({
      status: 'success',
      data: transformedAssignments
    });
  } catch (error) {
    console.error('Error fetching assignments by department:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assignments by department',
      error: error.message
    });
  }
};

module.exports = {
  getEmployeeAssignments,
  getCurrentAssignment,
  createEmployeeAssignment,
  updateEmployeeAssignment,
  deleteEmployeeAssignment,
  getAssignmentsByDepartment
};