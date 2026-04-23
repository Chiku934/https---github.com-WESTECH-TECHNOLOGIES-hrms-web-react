const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all company users for a company
 */
const getAllCompanyUsers = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Get all company users for the company
    const companyUsers = await prisma.companyUser.findMany({
      where: {
        companyId: BigInt(companyId)
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true,
            emailVerified: true,
            lastLoginAt: true
          }
        },
        employeeProfile: true,
        employeeAssignments: {
          where: {
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
            }
          }
        },
        userRoles: {
          include: {
            role: true
          }
        }
      },
      orderBy: {
        employeeCode: 'asc'
      }
    });

    // Transform the data
    const transformedCompanyUsers = companyUsers.map(cu => {
      const currentAssignment = cu.employeeAssignments[0] || null;
      
      return {
        id: cu.id.toString(),
        companyId: cu.companyId.toString(),
        userId: cu.userId.toString(),
        employeeCode: cu.employeeCode,
        status: cu.status,
        joinedAt: cu.joinedAt,
        leftAt: cu.leftAt,
        createdAt: cu.createdAt,
        user: {
          id: cu.user.id.toString(),
          email: cu.user.email,
          phone: cu.user.phone,
          isActive: cu.user.isActive,
          emailVerified: cu.user.emailVerified,
          lastLoginAt: cu.user.lastLoginAt
        },
        profile: cu.employeeProfile ? {
          firstName: cu.employeeProfile.firstName,
          lastName: cu.employeeProfile.lastName,
          dob: cu.employeeProfile.dob,
          gender: cu.employeeProfile.gender,
          personalEmail: cu.employeeProfile.personalEmail,
          personalPhone: cu.employeeProfile.personalPhone
        } : null,
        currentAssignment: currentAssignment ? {
          id: currentAssignment.id.toString(),
          department: currentAssignment.department,
          designation: currentAssignment.designation,
          employmentType: currentAssignment.employmentType,
          workLocation: currentAssignment.workLocation,
          startDate: currentAssignment.startDate,
          endDate: currentAssignment.endDate,
          isCurrent: currentAssignment.isCurrent
        } : null,
        roles: cu.userRoles.map(ur => ({
          id: ur.role.id.toString(),
          name: ur.role.name,
          description: ur.role.description,
          isSystem: ur.role.isSystem
        }))
      };
    });

    res.status(200).json({
      status: 'success',
      data: transformedCompanyUsers
    });
  } catch (error) {
    console.error('Error fetching company users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch company users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get company user by ID
 */
const getCompanyUserById = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const companyUserId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const companyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(companyUserId),
        companyId: BigInt(companyId)
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true,
            emailVerified: true,
            mfaEnabled: true,
            lastLoginAt: true,
            createdAt: true
          }
        },
        employeeProfile: true,
        employeeAssignments: {
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
            }
          },
          orderBy: {
            isCurrent: 'desc',
            startDate: 'desc'
          }
        },
        employeeDocuments: {
          include: {
            documentType: true
          }
        },
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!companyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found'
      });
    }

    const transformedCompanyUser = {
      id: companyUser.id.toString(),
      companyId: companyUser.companyId.toString(),
      userId: companyUser.userId.toString(),
      employeeCode: companyUser.employeeCode,
      status: companyUser.status,
      joinedAt: companyUser.joinedAt,
      leftAt: companyUser.leftAt,
      createdAt: companyUser.createdAt,
      user: companyUser.user,
      profile: companyUser.employeeProfile,
      assignments: companyUser.employeeAssignments.map(a => ({
        id: a.id.toString(),
        departmentId: a.departmentId ? a.departmentId.toString() : null,
        department: a.department,
        designationId: a.designationId ? a.designationId.toString() : null,
        designation: a.designation,
        managerId: a.managerId ? a.managerId.toString() : null,
        employmentType: a.employmentType,
        workLocation: a.workLocation,
        startDate: a.startDate,
        endDate: a.endDate,
        isCurrent: a.isCurrent,
        createdAt: a.createdAt
      })),
      documents: companyUser.employeeDocuments.map(d => ({
        id: d.id.toString(),
        documentTypeId: d.documentTypeId ? d.documentTypeId.toString() : null,
        documentType: d.documentType,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        documentNumber: d.documentNumber,
        issuedDate: d.issuedDate,
        expiryDate: d.expiryDate,
        verified: d.verified,
        verifiedBy: d.verifiedBy ? d.verifiedBy.toString() : null,
        verifiedAt: d.verifiedAt,
        uploadedAt: d.uploadedAt
      })),
      roles: companyUser.userRoles.map(ur => ({
        id: ur.role.id.toString(),
        name: ur.role.name,
        description: ur.role.description,
        isSystem: ur.role.isSystem,
        assignedAt: ur.assignedAt,
        assignedBy: ur.assignedBy ? ur.assignedBy.toString() : null
      }))
    };

    res.status(200).json({
      status: 'success',
      data: transformedCompanyUser
    });
  } catch (error) {
    console.error('Error fetching company user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch company user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new company user (add user to company)
 */
const createCompanyUser = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const { userId, employeeCode, status, joinedAt, leftAt } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Check if user is already in this company
    const existingCompanyUser = await prisma.companyUser.findFirst({
      where: {
        companyId: BigInt(companyId),
        userId: BigInt(userId)
      }
    });

    if (existingCompanyUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User is already a member of this company'
      });
    }

    // Check if employee code is unique within company
    if (employeeCode) {
      const existingEmployeeCode = await prisma.companyUser.findFirst({
        where: {
          companyId: BigInt(companyId),
          employeeCode
        }
      });

      if (existingEmployeeCode) {
        return res.status(400).json({
          status: 'error',
          message: 'Employee code already exists in this company'
        });
      }
    }

    const companyUser = await prisma.companyUser.create({
      data: {
        companyId: BigInt(companyId),
        userId: BigInt(userId),
        employeeCode,
        status: status || 'active',
        joinedAt: joinedAt ? new Date(joinedAt) : null,
        leftAt: leftAt ? new Date(leftAt) : null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'company_user',
      entityId: companyUser.id.toString(),
      action: 'CREATE',
      diff: { ...req.body }
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: companyUser.id.toString(),
        companyId: companyUser.companyId.toString(),
        userId: companyUser.userId.toString(),
        employeeCode: companyUser.employeeCode,
        status: companyUser.status,
        joinedAt: companyUser.joinedAt,
        leftAt: companyUser.leftAt,
        createdAt: companyUser.createdAt,
        user: companyUser.user,
        company: companyUser.company
      }
    });
  } catch (error) {
    console.error('Error creating company user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create company user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update company user
 */
const updateCompanyUser = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const companyUserId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const { employeeCode, status, joinedAt, leftAt } = req.body;

    // Check if company user exists and belongs to company
    const existingCompanyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(companyUserId),
        companyId: BigInt(companyId)
      }
    });

    if (!existingCompanyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found'
      });
    }

    // Check if new employee code conflicts with another user in same company
    if (employeeCode && employeeCode !== existingCompanyUser.employeeCode) {
      const codeConflict = await prisma.companyUser.findFirst({
        where: {
          companyId: BigInt(companyId),
          employeeCode,
          id: { not: BigInt(companyUserId) }
        }
      });

      if (codeConflict) {
        return res.status(400).json({
          status: 'error',
          message: 'Employee code already exists in this company'
        });
      }
    }

    const companyUser = await prisma.companyUser.update({
      where: { id: BigInt(companyUserId) },
      data: {
        employeeCode,
        status,
        joinedAt: joinedAt ? new Date(joinedAt) : null,
        leftAt: leftAt ? new Date(leftAt) : null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'company_user',
      entityId: companyUser.id.toString(),
      action: 'UPDATE',
      diff: { ...req.body }
    });

    res.status(200).json({
      status: 'success',
      data: {
        id: companyUser.id.toString(),
        companyId: companyUser.companyId.toString(),
        userId: companyUser.userId.toString(),
        employeeCode: companyUser.employeeCode,
        status: companyUser.status,
        joinedAt: companyUser.joinedAt,
        leftAt: companyUser.leftAt,
        createdAt: companyUser.createdAt,
        user: companyUser.user
      }
    });
  } catch (error) {
    console.error('Error updating company user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update company user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete company user (remove user from company)
 */
const deleteCompanyUser = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const companyUserId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Check if company user exists and belongs to company
    const existingCompanyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(companyUserId),
        companyId: BigInt(companyId)
      }
    });

    if (!existingCompanyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found'
      });
    }

    // Delete company user (cascade will handle related records)
    await prisma.companyUser.delete({
      where: { id: BigInt(companyUserId) }
    });

    // Audit log
    await auditFromRequest(req, {
      entity: 'company_user',
      entityId: companyUserId,
      action: 'DELETE',
      diff: null
    });

    res.status(200).json({
      status: 'success',
      message: 'Company user deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting company user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete company user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search company users
 */
const searchCompanyUsers = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const { q, status, hasProfile } = req.query;
    
    let where = {
      companyId: BigInt(companyId)
    };
    
    if (q) {
      where.OR = [
        { employeeCode: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { phone: { contains: q, mode: 'insensitive' } } },
        { employeeProfile: { firstName: { contains: q, mode: 'insensitive' } } },
        { employeeProfile: { lastName: { contains: q, mode: 'insensitive' } } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (hasProfile === 'true') {
      where.employeeProfile = { isNot: null };
    } else if (hasProfile === 'false') {
      where.employeeProfile = null;
    }

    const companyUsers = await prisma.companyUser.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true
          }
        },
        employeeProfile: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        employeeCode: 'asc'
      }
    });

    const transformedCompanyUsers = companyUsers.map(cu => ({
      id: cu.id.toString(),
      companyId: cu.companyId.toString(),
      userId: cu.userId.toString(),
      employeeCode: cu.employeeCode,
      status: cu.status,
      joinedAt: cu.joinedAt,
      leftAt: cu.leftAt,
      createdAt: cu.createdAt,
      user: cu.user,
      profile: cu.employeeProfile ? {
        firstName: cu.employeeProfile.firstName,
        lastName: cu.employeeProfile.lastName
      } : null
    }));

    res.status(200).json({
      status: 'success',
      data: transformedCompanyUsers
    });
  } catch (error) {
    console.error('Error searching company users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search company users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllCompanyUsers,
  getCompanyUserById,
  createCompanyUser,
  updateCompanyUser,
  deleteCompanyUser,
  searchCompanyUsers
};