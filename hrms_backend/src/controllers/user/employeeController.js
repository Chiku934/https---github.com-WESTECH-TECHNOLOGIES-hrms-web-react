const prisma = require('../../config/prisma');
const { logEmployeeCreate, logEmployeeUpdate, logEmployeeDelete } = require('../../utils/auditLogger');
const { hashPassword } = require('../../utils/passwordUtils');

/**
 * Get all employees for the current company
 */
const getAllEmployees = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Get all company users with their profiles and current assignments
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
            lastLoginAt: true
          }
        },
        employeeProfile: true,
        employeeAssignments: {
          where: {
            isCurrent: true
          },
          include: {
            department: true,
            designation: true,
            manager: {
              include: {
                user: {
                  select: {
                    email: true
                  }
                },
                employeeProfile: true
              }
            }
          },
          take: 1
        },
        userRoles: {
          include: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to match frontend expectations
    const employees = companyUsers.map(cu => {
      const currentAssignment = cu.employeeAssignments[0] || null;
      const profile = cu.employeeProfile || {};
      
      return {
        id: cu.id.toString(),
        companyUserId: cu.id.toString(),
        userId: cu.userId.toString(),
        employeeCode: cu.employeeCode || `EMP-${cu.id.toString().padStart(3, '0')}`,
        email: cu.user.email,
        phone: cu.user.phone,
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        lastName: profile.lastName || '',
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || cu.user.email,
        department: currentAssignment?.department?.name || 'Not Assigned',
        designation: currentAssignment?.designation?.title || 'Not Assigned',
        departmentId: currentAssignment?.departmentId?.toString(),
        designationId: currentAssignment?.designationId?.toString(),
        managerId: currentAssignment?.managerId?.toString(),
        managerName: currentAssignment?.manager?.employeeProfile 
          ? `${currentAssignment.manager.employeeProfile.firstName || ''} ${currentAssignment.manager.employeeProfile.lastName || ''}`.trim()
          : currentAssignment?.manager?.user?.email || '',
        employmentType: currentAssignment?.employmentType || '',
        workLocation: currentAssignment?.workLocation || '',
        status: cu.status || 'active',
        joinDate: cu.joinedAt ? cu.joinedAt.toISOString().split('T')[0] : null,
        leftAt: cu.leftAt ? cu.leftAt.toISOString().split('T')[0] : null,
        isActive: cu.user.isActive,
        roles: cu.userRoles.map(ur => ur.role.name),
        createdAt: cu.createdAt
      };
    });

    res.status(200).json({
      status: 'success',
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get employee by ID
 */
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const companyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(id),
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
            department: true,
            designation: true,
            manager: {
              include: {
                user: {
                  select: {
                    email: true
                  }
                },
                employeeProfile: true
              }
            }
          },
          orderBy: {
            isCurrent: 'desc',
            startDate: 'desc'
          }
        },
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
        employeeDocuments: {
          include: {
            documentType: true,
            verifiedByUser: {
              include: {
                user: {
                  select: {
                    email: true
                  }
                },
                employeeProfile: true
              }
            }
          }
        }
      }
    });

    if (!companyUser) {
      return res.status(404).json({
        status: 'error',
        message: `Employee with ID ${id} not found`
      });
    }

    const currentAssignment = companyUser.employeeAssignments.find(a => a.isCurrent) || companyUser.employeeAssignments[0] || null;
    const profile = companyUser.employeeProfile || {};
    
    const employee = {
      id: companyUser.id.toString(),
      companyUserId: companyUser.id.toString(),
      userId: companyUser.userId.toString(),
      employeeCode: companyUser.employeeCode || `EMP-${companyUser.id.toString().padStart(3, '0')}`,
      email: companyUser.user.email,
      phone: companyUser.user.phone,
      firstName: profile.firstName || '',
      middleName: profile.middleName || '',
      lastName: profile.lastName || '',
      name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || companyUser.user.email,
      dob: profile.dob ? profile.dob.toISOString().split('T')[0] : null,
      gender: profile.gender,
      maritalStatus: profile.maritalStatus,
      bloodGroup: profile.bloodGroup,
      personalEmail: profile.personalEmail,
      personalPhone: profile.personalPhone,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
      addressLine1: profile.addressLine1,
      addressLine2: profile.addressLine2,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      postalCode: profile.postalCode,
      photoUrl: profile.photoUrl,
      department: currentAssignment?.department?.name || 'Not Assigned',
      designation: currentAssignment?.designation?.title || 'Not Assigned',
      departmentId: currentAssignment?.departmentId?.toString(),
      designationId: currentAssignment?.designationId?.toString(),
      managerId: currentAssignment?.managerId?.toString(),
      managerName: currentAssignment?.manager?.employeeProfile 
        ? `${currentAssignment.manager.employeeProfile.firstName || ''} ${currentAssignment.manager.employeeProfile.lastName || ''}`.trim()
        : currentAssignment?.manager?.user?.email || '',
      employmentType: currentAssignment?.employmentType || '',
      workLocation: currentAssignment?.workLocation || '',
      startDate: currentAssignment?.startDate ? currentAssignment.startDate.toISOString().split('T')[0] : null,
      endDate: currentAssignment?.endDate ? currentAssignment.endDate.toISOString().split('T')[0] : null,
      status: companyUser.status || 'active',
      joinDate: companyUser.joinedAt ? companyUser.joinedAt.toISOString().split('T')[0] : null,
      leftAt: companyUser.leftAt ? companyUser.leftAt.toISOString().split('T')[0] : null,
      isActive: companyUser.user.isActive,
      emailVerified: companyUser.user.emailVerified,
      mfaEnabled: companyUser.user.mfaEnabled,
      roles: companyUser.userRoles.map(ur => ({
        id: ur.role.id.toString(),
        name: ur.role.name,
        description: ur.role.description,
        isSystem: ur.role.isSystem,
        permissions: ur.role.rolePermissions.map(rp => rp.permission.code)
      })),
      assignments: companyUser.employeeAssignments.map(a => ({
        id: a.id.toString(),
        department: a.department?.name,
        designation: a.designation?.title,
        managerId: a.managerId?.toString(),
        employmentType: a.employmentType,
        workLocation: a.workLocation,
        startDate: a.startDate.toISOString().split('T')[0],
        endDate: a.endDate ? a.endDate.toISOString().split('T')[0] : null,
        isCurrent: a.isCurrent
      })),
      documents: companyUser.employeeDocuments.map(d => ({
        id: d.id.toString(),
        documentType: d.documentType?.name,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        documentNumber: d.documentNumber,
        issuedDate: d.issuedDate ? d.issuedDate.toISOString().split('T')[0] : null,
        expiryDate: d.expiryDate ? d.expiryDate.toISOString().split('T')[0] : null,
        verified: d.verified,
        verifiedBy: d.verifiedBy?.toString(),
        verifiedByName: d.verifiedByUser?.employeeProfile 
          ? `${d.verifiedByUser.employeeProfile.firstName || ''} ${d.verifiedByUser.employeeProfile.lastName || ''}`.trim()
          : d.verifiedByUser?.user?.email || '',
        verifiedAt: d.verifiedAt,
        uploadedAt: d.uploadedAt
      })),
      createdAt: companyUser.createdAt,
      updatedAt: profile.updatedAt
    };

    res.status(200).json({
      status: 'success',
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Create new employee
 */
const createEmployee = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const employeeData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Validate required fields
    if (!employeeData.email || !employeeData.firstName || !employeeData.lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'Email, first name, and last name are required'
      });
    }

    // Start a transaction for creating user + company user + profile
    const result = await prisma.$transaction(async (tx) => {
      // Determine password hash
      let passwordHash = null;
      if (employeeData.password) {
        // Hash the plain password
        passwordHash = await hashPassword(employeeData.password);
      } else if (employeeData.passwordHash) {
        // Use provided hash (backward compatibility)
        passwordHash = employeeData.passwordHash;
      }

      // 1. Create user
      const user = await tx.user.create({
        data: {
          email: employeeData.email,
          passwordHash,
          phone: employeeData.phone || null,
          isActive: employeeData.isActive !== undefined ? employeeData.isActive : true
        }
      });

      // 2. Create company user
      const companyUser = await tx.companyUser.create({
        data: {
          companyId: BigInt(companyId),
          userId: user.id,
          employeeCode: employeeData.employeeCode || null,
          status: employeeData.status || 'active',
          joinedAt: employeeData.joinDate ? new Date(employeeData.joinDate) : new Date()
        }
      });

      // 3. Create employee profile
      const employeeProfile = await tx.employeeProfile.create({
        data: {
          companyUserId: companyUser.id,
          firstName: employeeData.firstName,
          middleName: employeeData.middleName || null,
          lastName: employeeData.lastName,
          dob: employeeData.dob ? new Date(employeeData.dob) : null,
          gender: employeeData.gender || null,
          maritalStatus: employeeData.maritalStatus || null,
          bloodGroup: employeeData.bloodGroup || null,
          personalEmail: employeeData.personalEmail || null,
          personalPhone: employeeData.personalPhone || null,
          emergencyContactName: employeeData.emergencyContactName || null,
          emergencyContactPhone: employeeData.emergencyContactPhone || null,
          addressLine1: employeeData.addressLine1 || null,
          addressLine2: employeeData.addressLine2 || null,
          city: employeeData.city || null,
          state: employeeData.state || null,
          country: employeeData.country || null,
          postalCode: employeeData.postalCode || null,
          photoUrl: employeeData.photoUrl || null,
          extraData: employeeData.extraData || null
        }
      });

      // 4. Create employee assignment if department/designation provided
      let employeeAssignment = null;
      if (employeeData.departmentId || employeeData.designationId) {
        employeeAssignment = await tx.employeeAssignment.create({
          data: {
            companyUserId: companyUser.id,
            departmentId: employeeData.departmentId ? BigInt(employeeData.departmentId) : null,
            designationId: employeeData.designationId ? BigInt(employeeData.designationId) : null,
            managerId: employeeData.managerId ? BigInt(employeeData.managerId) : null,
            employmentType: employeeData.employmentType || 'full-time',
            workLocation: employeeData.workLocation || null,
            startDate: employeeData.startDate ? new Date(employeeData.startDate) : new Date(),
            isCurrent: true
          },
          include: {
            department: true,
            designation: true
          }
        });
      }

      // 5. Assign roles if provided
      if (employeeData.roleIds && employeeData.roleIds.length > 0) {
        const userRolesData = employeeData.roleIds.map(roleId => ({
          companyUserId: companyUser.id,
          roleId: BigInt(roleId),
          assignedBy: req.user?.companyUserId ? BigInt(req.user.companyUserId) : null
        }));

        await tx.userRole.createMany({
          data: userRolesData
        });
      }

      return {
        user,
        companyUser,
        employeeProfile,
        employeeAssignment
      };
    });

    // Create audit log using utility
    await logEmployeeCreate(req, result.companyUser, employeeData);

    // Prepare response
    const responseData = {
      id: result.companyUser.id.toString(),
      companyUserId: result.companyUser.id.toString(),
      userId: result.user.id.toString(),
      employeeCode: result.companyUser.employeeCode || `EMP-${result.companyUser.id.toString().padStart(3, '0')}`,
      email: result.user.email,
      firstName: result.employeeProfile.firstName,
      lastName: result.employeeProfile.lastName,
      name: `${result.employeeProfile.firstName} ${result.employeeProfile.lastName}`,
      status: result.companyUser.status,
      joinDate: result.companyUser.joinedAt ? result.companyUser.joinedAt.toISOString().split('T')[0] : null,
      department: result.employeeAssignment?.department?.name || 'Not Assigned',
      designation: result.employeeAssignment?.designation?.title || 'Not Assigned',
      createdAt: result.companyUser.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Create employee error:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists in this company'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Update employee
 */
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const updateData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Check if employee exists and belongs to the company
    const existingCompanyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(id),
        companyId: BigInt(companyId)
      },
      include: {
        user: true,
        employeeProfile: true
      }
    });

    if (!existingCompanyUser) {
      return res.status(404).json({
        status: 'error',
        message: `Employee with ID ${id} not found`
      });
    }

    // Start transaction for updates
    const result = await prisma.$transaction(async (tx) => {
      const updates = {};
      
      // Update user if email or phone changed
      if (updateData.email || updateData.phone !== undefined || updateData.isActive !== undefined) {
        const userUpdateData = {};
        if (updateData.email) userUpdateData.email = updateData.email;
        if (updateData.phone !== undefined) userUpdateData.phone = updateData.phone;
        if (updateData.isActive !== undefined) userUpdateData.isActive = updateData.isActive;
        
        await tx.user.update({
          where: { id: existingCompanyUser.user.id },
          data: userUpdateData
        });
      }
      
      // Update company user
      const companyUserUpdateData = {};
      if (updateData.employeeCode !== undefined) companyUserUpdateData.employeeCode = updateData.employeeCode;
      if (updateData.status !== undefined) companyUserUpdateData.status = updateData.status;
      if (updateData.joinDate !== undefined) companyUserUpdateData.joinedAt = new Date(updateData.joinDate);
      if (updateData.leftAt !== undefined) companyUserUpdateData.leftAt = updateData.leftAt ? new Date(updateData.leftAt) : null;
      
      const updatedCompanyUser = await tx.companyUser.update({
        where: { id: BigInt(id) },
        data: companyUserUpdateData
      });
      
      // Update employee profile
      const profileUpdateData = {};
      if (updateData.firstName !== undefined) profileUpdateData.firstName = updateData.firstName;
      if (updateData.middleName !== undefined) profileUpdateData.middleName = updateData.middleName;
      if (updateData.lastName !== undefined) profileUpdateData.lastName = updateData.lastName;
      if (updateData.dob !== undefined) profileUpdateData.dob = updateData.dob ? new Date(updateData.dob) : null;
      if (updateData.gender !== undefined) profileUpdateData.gender = updateData.gender;
      if (updateData.maritalStatus !== undefined) profileUpdateData.maritalStatus = updateData.maritalStatus;
      if (updateData.bloodGroup !== undefined) profileUpdateData.bloodGroup = updateData.bloodGroup;
      if (updateData.personalEmail !== undefined) profileUpdateData.personalEmail = updateData.personalEmail;
      if (updateData.personalPhone !== undefined) profileUpdateData.personalPhone = updateData.personalPhone;
      if (updateData.emergencyContactName !== undefined) profileUpdateData.emergencyContactName = updateData.emergencyContactName;
      if (updateData.emergencyContactPhone !== undefined) profileUpdateData.emergencyContactPhone = updateData.emergencyContactPhone;
      if (updateData.addressLine1 !== undefined) profileUpdateData.addressLine1 = updateData.addressLine1;
      if (updateData.addressLine2 !== undefined) profileUpdateData.addressLine2 = updateData.addressLine2;
      if (updateData.city !== undefined) profileUpdateData.city = updateData.city;
      if (updateData.state !== undefined) profileUpdateData.state = updateData.state;
      if (updateData.country !== undefined) profileUpdateData.country = updateData.country;
      if (updateData.postalCode !== undefined) profileUpdateData.postalCode = updateData.postalCode;
      if (updateData.photoUrl !== undefined) profileUpdateData.photoUrl = updateData.photoUrl;
      if (updateData.extraData !== undefined) profileUpdateData.extraData = updateData.extraData;
      
      const updatedProfile = await tx.employeeProfile.update({
        where: { companyUserId: BigInt(id) },
        data: profileUpdateData
      });
      
      // Update or create employee assignment if department/designation changed
      let updatedAssignment = null;
      if (updateData.departmentId !== undefined || updateData.designationId !== undefined ||
          updateData.managerId !== undefined || updateData.employmentType !== undefined ||
          updateData.workLocation !== undefined || updateData.startDate !== undefined) {
        
        // First, mark any existing current assignment as not current
        await tx.employeeAssignment.updateMany({
          where: {
            companyUserId: BigInt(id),
            isCurrent: true
          },
          data: {
            isCurrent: false,
            endDate: updateData.startDate ? new Date(updateData.startDate) : new Date()
          }
        });
        
        // Create new current assignment
        updatedAssignment = await tx.employeeAssignment.create({
          data: {
            companyUserId: BigInt(id),
            departmentId: updateData.departmentId ? BigInt(updateData.departmentId) : null,
            designationId: updateData.designationId ? BigInt(updateData.designationId) : null,
            managerId: updateData.managerId ? BigInt(updateData.managerId) : null,
            employmentType: updateData.employmentType || 'full-time',
            workLocation: updateData.workLocation || null,
            startDate: updateData.startDate ? new Date(updateData.startDate) : new Date(),
            isCurrent: true
          },
          include: {
            department: true,
            designation: true
          }
        });
      }
      
      // Update roles if provided
      if (updateData.roleIds !== undefined) {
        // Delete existing roles
        await tx.userRole.deleteMany({
          where: {
            companyUserId: BigInt(id)
          }
        });
        
        // Add new roles
        if (updateData.roleIds.length > 0) {
          const userRolesData = updateData.roleIds.map(roleId => ({
            companyUserId: BigInt(id),
            roleId: BigInt(roleId),
            assignedBy: req.user?.companyUserId ? BigInt(req.user.companyUserId) : null
          }));
          
          await tx.userRole.createMany({
            data: userRolesData
          });
        }
      }
      
      return {
        companyUser: updatedCompanyUser,
        profile: updatedProfile,
        assignment: updatedAssignment
      };
    });

    // Get updated employee with all relations for response
    const updatedEmployee = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(id),
        companyId: BigInt(companyId)
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true
          }
        },
        employeeProfile: true,
        employeeAssignments: {
          where: {
            isCurrent: true
          },
          include: {
            department: true,
            designation: true,
            manager: {
              include: {
                user: {
                  select: {
                    email: true
                  }
                },
                employeeProfile: true
              }
            }
          },
          take: 1
        },
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!updatedEmployee) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee not found after update'
      });
    }

    // Create audit log using utility
    await logEmployeeUpdate(req, updatedEmployee, updateData);

    const currentAssignment = updatedEmployee.employeeAssignments[0] || null;
    const profile = updatedEmployee.employeeProfile || {};
    
    const responseData = {
      id: updatedEmployee.id.toString(),
      companyUserId: updatedEmployee.id.toString(),
      userId: updatedEmployee.userId.toString(),
      employeeCode: updatedEmployee.employeeCode || `EMP-${updatedEmployee.id.toString().padStart(3, '0')}`,
      email: updatedEmployee.user.email,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || updatedEmployee.user.email,
      department: currentAssignment?.department?.name || 'Not Assigned',
      designation: currentAssignment?.designation?.title || 'Not Assigned',
      status: updatedEmployee.status || 'active',
      joinDate: updatedEmployee.joinedAt ? updatedEmployee.joinedAt.toISOString().split('T')[0] : null,
      roles: updatedEmployee.userRoles.map(ur => ur.role.name),
      updatedAt: profile.updatedAt
    };

    res.status(200).json({
      status: 'success',
      message: 'Employee updated successfully',
      data: responseData
    });
  } catch (error) {
    console.error('Update employee error:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists in this company'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Delete employee
 */
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Check if employee exists and belongs to the company
    const existingCompanyUser = await prisma.companyUser.findFirst({
      where: {
        id: BigInt(id),
        companyId: BigInt(companyId)
      }
    });

    if (!existingCompanyUser) {
      return res.status(404).json({
        status: 'error',
        message: `Employee with ID ${id} not found`
      });
    }

    // Start transaction for deletion
    await prisma.$transaction(async (tx) => {
      // Delete employee documents
      await tx.employeeDocument.deleteMany({
        where: {
          companyUserId: BigInt(id)
        }
      });
      
      // Delete employee assignments
      await tx.employeeAssignment.deleteMany({
        where: {
          companyUserId: BigInt(id)
        }
      });
      
      // Delete user roles
      await tx.userRole.deleteMany({
        where: {
          companyUserId: BigInt(id)
        }
      });
      
      // Delete employee profile
      await tx.employeeProfile.delete({
        where: {
          companyUserId: BigInt(id)
        }
      });
      
      // Delete company user
      await tx.companyUser.delete({
        where: {
          id: BigInt(id)
        }
      });
      
      // Note: We don't delete the user record because it might be used in other companies
      // Instead, we mark it as inactive
      await tx.user.update({
        where: { id: existingCompanyUser.userId },
        data: { isActive: false }
      });
    });

    // Create audit log using utility
    await logEmployeeDelete(req, { id, ...existingCompanyUser });

    res.status(200).json({
      status: 'success',
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Search employees
 */
const searchEmployees = async (req, res) => {
  try {
    const { q, query: queryParam, department, status, page = 1, limit = 20 } = req.query;
    const query = q || queryParam;
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    const whereClause = {
      companyId: BigInt(companyId)
    };
    
    // Build search conditions
    const searchConditions = [];
    
    if (query) {
      searchConditions.push({
        OR: [
          {
            employeeProfile: {
              OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { personalEmail: { contains: query, mode: 'insensitive' } }
              ]
            }
          },
          {
            user: {
              email: { contains: query, mode: 'insensitive' }
            }
          },
          {
            employeeCode: { contains: query, mode: 'insensitive' }
          }
        ]
      });
    }
    
    if (department) {
      searchConditions.push({
        employeeAssignments: {
          some: {
            isCurrent: true,
            department: {
              name: { contains: department, mode: 'insensitive' }
            }
          }
        }
      });
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (searchConditions.length > 0) {
      whereClause.AND = searchConditions;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count
    const total = await prisma.companyUser.count({
      where: whereClause
    });
    
    // Get paginated results
    const companyUsers = await prisma.companyUser.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            isActive: true
          }
        },
        employeeProfile: true,
        employeeAssignments: {
          where: {
            isCurrent: true
          },
          include: {
            department: true,
            designation: true
          },
          take: 1
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data
    const employees = companyUsers.map(cu => {
      const currentAssignment = cu.employeeAssignments[0] || null;
      const profile = cu.employeeProfile || {};
      
      return {
        id: cu.id.toString(),
        companyUserId: cu.id.toString(),
        userId: cu.userId.toString(),
        employeeCode: cu.employeeCode || `EMP-${cu.id.toString().padStart(3, '0')}`,
        email: cu.user.email,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || cu.user.email,
        department: currentAssignment?.department?.name || 'Not Assigned',
        designation: currentAssignment?.designation?.title || 'Not Assigned',
        status: cu.status || 'active',
        joinDate: cu.joinedAt ? cu.joinedAt.toISOString().split('T')[0] : null,
        isActive: cu.user.isActive,
        createdAt: cu.createdAt
      };
    });

    res.status(200).json({
      status: 'success',
      count: employees.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: employees
    });
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees
};