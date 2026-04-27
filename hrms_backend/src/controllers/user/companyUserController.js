const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

const DEFAULT_ROLE_MAP = {
  'super-admin': 'Super Admin',
  'company-admin': 'Company Admin',
  employee: 'Employee',
};

function isSuperAdmin(req) {
  return req.user?.role === 'super-admin';
}

function getScopeCompanyId(req, bodyCompanyId = null, queryCompanyId = null) {
  if (isSuperAdmin(req)) {
    return bodyCompanyId || queryCompanyId || null;
  }

  return req.user?.companyId || null;
}

function normalizeRoleCode(role) {
  if (!role) return 'employee';
  return String(role).toLowerCase();
}

function getRoleNameForCode(roleCode) {
  return DEFAULT_ROLE_MAP[normalizeRoleCode(roleCode)] || 'Employee';
}

function getRoleCodeForName(roleName) {
  const normalized = String(roleName || '').trim().toLowerCase();
  if (normalized === 'super admin') return 'super-admin';
  if (normalized === 'company admin') return 'company-admin';
  return 'employee';
}

async function ensureRoleForCompany(tx, companyId, roleCode) {
  const roleName = getRoleNameForCode(roleCode);

  let role = await tx.role.findFirst({
    where: {
      companyId: BigInt(companyId),
      name: roleName,
    },
  });

  if (!role) {
    role = await tx.role.create({
      data: {
        companyId: BigInt(companyId),
        name: roleName,
        description:
          roleCode === 'super-admin'
            ? 'Full access to everything'
            : roleCode === 'company-admin'
              ? 'Company level administration access'
              : 'Standard employee access',
        isSystem: true,
      },
    });
  }

  return role;
}

async function assignCompanyUserRole(tx, companyUserId, companyId, roleCode, assignedBy = null) {
  const role = await ensureRoleForCompany(tx, companyId, roleCode);

  await tx.userRole.deleteMany({
    where: { companyUserId: BigInt(companyUserId) },
  });

  await tx.userRole.create({
    data: {
      companyUserId: BigInt(companyUserId),
      roleId: role.id,
      assignedBy: assignedBy ? BigInt(assignedBy) : null,
    },
  });

  return role;
}

function normalizeCompanyUser(companyUser) {
  const primaryRole = companyUser.userRoles?.[0]?.role || null;
  const roleName = primaryRole?.name || 'Employee';
  const roleCode = getRoleCodeForName(roleName);

  return {
    id: companyUser.id.toString(),
    companyId: companyUser.companyId.toString(),
    userId: companyUser.userId.toString(),
    employeeCode: companyUser.employeeCode,
    status: companyUser.status,
    joinedAt: companyUser.joinedAt,
    leftAt: companyUser.leftAt,
    createdAt: companyUser.createdAt,
    company: companyUser.company
      ? {
          id: companyUser.company.id.toString(),
          name: companyUser.company.name,
          slug: companyUser.company.slug,
        }
      : null,
    user: companyUser.user
      ? {
          id: companyUser.user.id.toString(),
          email: companyUser.user.email,
          phone: companyUser.user.phone,
          isActive: companyUser.user.isActive,
          emailVerified: companyUser.user.emailVerified,
          lastLoginAt: companyUser.user.lastLoginAt,
        }
      : null,
    profile: companyUser.employeeProfile
      ? {
          firstName: companyUser.employeeProfile.firstName,
          lastName: companyUser.employeeProfile.lastName,
          dob: companyUser.employeeProfile.dob,
          gender: companyUser.employeeProfile.gender,
          personalEmail: companyUser.employeeProfile.personalEmail,
          personalPhone: companyUser.employeeProfile.personalPhone,
        }
      : null,
    roles: (companyUser.userRoles || []).map((ur) => ({
      id: ur.role.id.toString(),
      name: ur.role.name,
      description: ur.role.description,
      isSystem: ur.role.isSystem,
    })),
    role: roleCode,
    roleLabel: roleName,
  };
}

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
    id: assignment.id.toString(),
    departmentId: assignment.departmentId ? assignment.departmentId.toString() : null,
    department: normalizeDepartment(assignment.department),
    designationId: assignment.designationId ? assignment.designationId.toString() : null,
    designation: normalizeDesignation(assignment.designation),
    managerId: assignment.managerId ? assignment.managerId.toString() : null,
    employmentType: assignment.employmentType,
    workLocation: assignment.workLocation,
    startDate: assignment.startDate,
    endDate: assignment.endDate,
    isCurrent: assignment.isCurrent,
    createdAt: assignment.createdAt,
  };
}

/**
 * Get all company users for a company
 */
const getAllCompanyUsers = async (req, res) => {
  try {
    const companyId = getScopeCompanyId(req, null, req.query.companyId || null);

    // Get all company users for the company
    const where = {};
    if (companyId) {
      where.companyId = BigInt(companyId);
    }

    const companyUsers = await prisma.companyUser.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
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
    const transformedCompanyUsers = companyUsers.map((cu) => {
      const currentAssignment = cu.employeeAssignments[0] || null;
      const normalized = normalizeCompanyUser(cu);

      return {
        ...normalized,
        currentAssignment: normalizeAssignment(currentAssignment),
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
    const companyId = getScopeCompanyId(req);
    const companyUserId = req.params.id;

    const where = { id: BigInt(companyUserId) };
    if (companyId) {
      where.companyId = BigInt(companyId);
    } else if (!isSuperAdmin(req)) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const companyUser = await prisma.companyUser.findFirst({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
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

    const transformedCompanyUser = normalizeCompanyUser(companyUser);
    transformedCompanyUser.assignments = companyUser.employeeAssignments.map(normalizeAssignment);
    transformedCompanyUser.documents = companyUser.employeeDocuments.map(d => ({
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
    }));

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
    const companyId = getScopeCompanyId(req, req.body.companyId, req.query.companyId);

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const { userId, employeeCode, status, joinedAt, leftAt, role } = req.body;

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

    const company = await prisma.company.findUnique({
      where: { id: BigInt(companyId) },
    });

    if (!company) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    const companyUser = await prisma.$transaction(async (tx) => {
      const created = await tx.companyUser.create({
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
              phone: true,
              isActive: true,
              emailVerified: true,
              lastLoginAt: true
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

      await assignCompanyUserRole(tx, created.id, companyId, normalizeRoleCode(role), req.user?.companyUserId);

      return tx.companyUser.findUnique({
        where: { id: created.id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
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
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });
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
      data: normalizeCompanyUser(companyUser)
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
    const companyUserId = req.params.id;

    const { employeeCode, status, joinedAt, leftAt, role } = req.body;

    const existingCompanyUser = await prisma.companyUser.findUnique({
      where: { id: BigInt(companyUserId) },
    });

    if (!existingCompanyUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Company user not found'
      });
    }

    if (!isSuperAdmin(req) && String(existingCompanyUser.companyId) !== String(req.user?.companyId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized: You can only update users from your own company'
      });
    }

    const targetCompanyId = isSuperAdmin(req)
      ? (req.body.companyId || req.query.companyId || existingCompanyUser.companyId.toString())
      : existingCompanyUser.companyId.toString();

    const targetCompany = await prisma.company.findUnique({
      where: { id: BigInt(targetCompanyId) }
    });

    if (!targetCompany) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    // Check if new employee code conflicts with another user in same company
    if (employeeCode && employeeCode !== existingCompanyUser.employeeCode) {
      const codeConflict = await prisma.companyUser.findFirst({
        where: {
          companyId: BigInt(targetCompanyId),
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

    const companyUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.companyUser.update({
        where: { id: BigInt(companyUserId) },
        data: {
          companyId: BigInt(targetCompanyId),
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
              phone: true,
              isActive: true,
              emailVerified: true,
              lastLoginAt: true
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

      if (role) {
        await assignCompanyUserRole(tx, updated.id, updated.companyId, normalizeRoleCode(role), req.user?.companyUserId);
      }

      return tx.companyUser.findUnique({
        where: { id: updated.id },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
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
          userRoles: {
            include: {
              role: true
            }
          }
        }
      });
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
      data: normalizeCompanyUser(companyUser)
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
    const companyUserId = req.params.id;

    const companyId = getScopeCompanyId(req, req.body.companyId, req.query.companyId);

    if (!companyId && !isSuperAdmin(req)) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Check if company user exists and belongs to company
    const where = { id: BigInt(companyUserId) };
    if (companyId) {
      where.companyId = BigInt(companyId);
    }

    const existingCompanyUser = await prisma.companyUser.findFirst({ where });

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
    const companyId = getScopeCompanyId(req, null, req.query.companyId || null);

    if (!companyId && !isSuperAdmin(req)) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const { q, status, hasProfile } = req.query;
    
    let where = {};
    if (companyId) {
      where.companyId = BigInt(companyId);
    }
    
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
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
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
      ...normalizeCompanyUser(cu),
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
