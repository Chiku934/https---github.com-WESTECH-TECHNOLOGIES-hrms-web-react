const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get employee profile by company user ID
 */
const getEmployeeProfile = async (req, res) => {
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

    // Get employee profile
    const employeeProfile = await prisma.employeeProfile.findUnique({
      where: {
        companyUserId: BigInt(companyUserId)
      },
      include: {
        companyUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!employeeProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee profile not found'
      });
    }

    // Transform the data
    const transformedProfile = {
      companyUserId: employeeProfile.companyUserId.toString(),
      firstName: employeeProfile.firstName,
      middleName: employeeProfile.middleName,
      lastName: employeeProfile.lastName,
      dob: employeeProfile.dob,
      gender: employeeProfile.gender,
      maritalStatus: employeeProfile.maritalStatus,
      bloodGroup: employeeProfile.bloodGroup,
      personalEmail: employeeProfile.personalEmail,
      personalPhone: employeeProfile.personalPhone,
      emergencyContactName: employeeProfile.emergencyContactName,
      emergencyContactPhone: employeeProfile.emergencyContactPhone,
      addressLine1: employeeProfile.addressLine1,
      addressLine2: employeeProfile.addressLine2,
      city: employeeProfile.city,
      state: employeeProfile.state,
      country: employeeProfile.country,
      postalCode: employeeProfile.postalCode,
      photoUrl: employeeProfile.photoUrl,
      extraData: employeeProfile.extraData,
      updatedAt: employeeProfile.updatedAt,
      user: employeeProfile.companyUser.user
    };

    res.status(200).json({
      status: 'success',
      data: transformedProfile
    });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employee profile',
      error: error.message
    });
  }
};

/**
 * Create or update employee profile
 */
const upsertEmployeeProfile = async (req, res) => {
  try {
    const { companyUserId } = req.params;
    const {
      firstName,
      middleName,
      lastName,
      dob,
      gender,
      maritalStatus,
      bloodGroup,
      personalEmail,
      personalPhone,
      emergencyContactName,
      emergencyContactPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      photoUrl,
      extraData
    } = req.body;
    const companyId = req.user?.companyId;

    if (!companyUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company User ID is required'
      });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({
        status: 'error',
        message: 'First name and last name are required'
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

    // Check if profile already exists
    const existingProfile = await prisma.employeeProfile.findUnique({
      where: {
        companyUserId: BigInt(companyUserId)
      }
    });

    const action = existingProfile ? 'update' : 'create';

    // Prepare profile data
    const profileData = {
      firstName,
      middleName,
      lastName,
      dob: dob ? new Date(dob) : null,
      gender,
      maritalStatus,
      bloodGroup,
      personalEmail,
      personalPhone,
      emergencyContactName,
      emergencyContactPhone,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      photoUrl,
      extraData: extraData ? JSON.parse(JSON.stringify(extraData)) : null
    };

    // Create or update profile
    const employeeProfile = await prisma.employeeProfile.upsert({
      where: {
        companyUserId: BigInt(companyUserId)
      },
      update: profileData,
      create: {
        companyUserId: BigInt(companyUserId),
        ...profileData
      },
      include: {
        companyUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'employee_profile',
      entityId: companyUserId,
      action,
      diff: profileData
    });

    // Transform the data
    const transformedProfile = {
      companyUserId: employeeProfile.companyUserId.toString(),
      firstName: employeeProfile.firstName,
      middleName: employeeProfile.middleName,
      lastName: employeeProfile.lastName,
      dob: employeeProfile.dob,
      gender: employeeProfile.gender,
      maritalStatus: employeeProfile.maritalStatus,
      bloodGroup: employeeProfile.bloodGroup,
      personalEmail: employeeProfile.personalEmail,
      personalPhone: employeeProfile.personalPhone,
      emergencyContactName: employeeProfile.emergencyContactName,
      emergencyContactPhone: employeeProfile.emergencyContactPhone,
      addressLine1: employeeProfile.addressLine1,
      addressLine2: employeeProfile.addressLine2,
      city: employeeProfile.city,
      state: employeeProfile.state,
      country: employeeProfile.country,
      postalCode: employeeProfile.postalCode,
      photoUrl: employeeProfile.photoUrl,
      extraData: employeeProfile.extraData,
      updatedAt: employeeProfile.updatedAt,
      user: employeeProfile.companyUser.user
    };

    res.status(action === 'create' ? 201 : 200).json({
      status: 'success',
      message: `Employee profile ${action}d successfully`,
      data: transformedProfile
    });
  } catch (error) {
    console.error('Error upserting employee profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to upsert employee profile',
      error: error.message
    });
  }
};

/**
 * Update employee profile (partial update)
 */
const updateEmployeeProfile = async (req, res) => {
  try {
    const { companyUserId } = req.params;
    const updateData = req.body;
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

    // Check if profile exists
    const existingProfile = await prisma.employeeProfile.findUnique({
      where: {
        companyUserId: BigInt(companyUserId)
      }
    });

    if (!existingProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee profile not found'
      });
    }

    // Prepare update data
    const profileUpdateData = { ...updateData };
    
    // Handle date conversion for dob
    if (profileUpdateData.dob) {
      profileUpdateData.dob = new Date(profileUpdateData.dob);
    }
    
    // Handle JSON for extraData
    if (profileUpdateData.extraData) {
      profileUpdateData.extraData = JSON.parse(JSON.stringify(profileUpdateData.extraData));
    }

    // Update profile
    const updatedProfile = await prisma.employeeProfile.update({
      where: {
        companyUserId: BigInt(companyUserId)
      },
      data: profileUpdateData,
      include: {
        companyUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'employee_profile',
      entityId: companyUserId,
      action: 'update',
      diff: updateData
    });

    // Transform the data
    const transformedProfile = {
      companyUserId: updatedProfile.companyUserId.toString(),
      firstName: updatedProfile.firstName,
      middleName: updatedProfile.middleName,
      lastName: updatedProfile.lastName,
      dob: updatedProfile.dob,
      gender: updatedProfile.gender,
      maritalStatus: updatedProfile.maritalStatus,
      bloodGroup: updatedProfile.bloodGroup,
      personalEmail: updatedProfile.personalEmail,
      personalPhone: updatedProfile.personalPhone,
      emergencyContactName: updatedProfile.emergencyContactName,
      emergencyContactPhone: updatedProfile.emergencyContactPhone,
      addressLine1: updatedProfile.addressLine1,
      addressLine2: updatedProfile.addressLine2,
      city: updatedProfile.city,
      state: updatedProfile.state,
      country: updatedProfile.country,
      postalCode: updatedProfile.postalCode,
      photoUrl: updatedProfile.photoUrl,
      extraData: updatedProfile.extraData,
      updatedAt: updatedProfile.updatedAt,
      user: updatedProfile.companyUser.user
    };

    res.status(200).json({
      status: 'success',
      message: 'Employee profile updated successfully',
      data: transformedProfile
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update employee profile',
      error: error.message
    });
  }
};

/**
 * Delete employee profile
 */
const deleteEmployeeProfile = async (req, res) => {
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

    // Check if profile exists
    const existingProfile = await prisma.employeeProfile.findUnique({
      where: {
        companyUserId: BigInt(companyUserId)
      }
    });

    if (!existingProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Employee profile not found'
      });
    }

    // Delete profile
    await prisma.employeeProfile.delete({
      where: {
        companyUserId: BigInt(companyUserId)
      }
    });

    // Log audit
    await auditFromRequest(req, {
      entity: 'employee_profile',
      entityId: companyUserId,
      action: 'delete',
      diff: {
        firstName: existingProfile.firstName,
        lastName: existingProfile.lastName
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Employee profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting employee profile:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete employee profile',
      error: error.message
    });
  }
};

/**
 * Search employee profiles
 */
const searchEmployeeProfiles = async (req, res) => {
  try {
    const { q } = req.query;
    const companyId = req.user?.companyId;

    if (!q || q.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Search employee profiles
    const profiles = await prisma.employeeProfile.findMany({
      where: {
        companyUser: {
          companyId: BigInt(companyId)
        },
        OR: [
          {
            firstName: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            personalEmail: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            personalPhone: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        companyUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                phone: true,
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        lastName: 'asc'
      }
    });

    // Transform the data
    const transformedProfiles = profiles.map(profile => ({
      companyUserId: profile.companyUserId.toString(),
      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName,
      dob: profile.dob,
      gender: profile.gender,
      personalEmail: profile.personalEmail,
      personalPhone: profile.personalPhone,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      user: profile.companyUser.user
    }));

    res.status(200).json({
      status: 'success',
      data: transformedProfiles
    });
  } catch (error) {
    console.error('Error searching employee profiles:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search employee profiles',
      error: error.message
    });
  }
};

module.exports = {
  getEmployeeProfile,
  upsertEmployeeProfile,
  updateEmployeeProfile,
  deleteEmployeeProfile,
  searchEmployeeProfiles
};