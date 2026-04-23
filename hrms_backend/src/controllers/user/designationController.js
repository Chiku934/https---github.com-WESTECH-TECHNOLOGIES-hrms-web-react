const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all designations for the current company
 */
const getAllDesignations = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Get all designations for the company
    const designations = await prisma.designation.findMany({
      where: {
        companyId: BigInt(companyId)
      },
      include: {
        _count: {
          select: {
            employeeAssignments: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { title: 'asc' }
      ]
    });

    // Transform the data
    const transformedDesignations = designations.map(designation => ({
      id: designation.id.toString(),
      companyId: designation.companyId.toString(),
      title: designation.title,
      level: designation.level,
      createdAt: designation.createdAt,
      employeeCount: designation._count.employeeAssignments
    }));

    res.status(200).json({
      status: 'success',
      data: transformedDesignations
    });
  } catch (error) {
    console.error('Error fetching designations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch designations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get designation by ID
 */
const getDesignationById = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const designationId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!designationId) {
      return res.status(400).json({
        status: 'error',
        message: 'Designation ID is required'
      });
    }

    const designation = await prisma.designation.findFirst({
      where: {
        id: BigInt(designationId),
        companyId: BigInt(companyId)
      },
      include: {
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

    if (!designation) {
      return res.status(404).json({
        status: 'error',
        message: 'Designation not found'
      });
    }

    const transformedDesignation = {
      id: designation.id.toString(),
      companyId: designation.companyId.toString(),
      title: designation.title,
      level: designation.level,
      createdAt: designation.createdAt,
      company: designation.company,
      employeeCount: designation._count.employeeAssignments
    };

    res.status(200).json({
      status: 'success',
      data: transformedDesignation
    });
  } catch (error) {
    console.error('Error fetching designation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch designation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new designation
 */
const createDesignation = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const designationData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Validate required fields
    if (!designationData.title) {
      return res.status(400).json({
        status: 'error',
        message: 'Designation title is required'
      });
    }

    // Check if designation with same title already exists in company
    const existingDesignation = await prisma.designation.findFirst({
      where: {
        companyId: BigInt(companyId),
        title: designationData.title
      }
    });

    if (existingDesignation) {
      return res.status(409).json({
        status: 'error',
        message: 'Designation with this title already exists in the company'
      });
    }

    // Prepare data for creation
    const createData = {
      companyId: BigInt(companyId),
      title: designationData.title,
      level: designationData.level || null
    };

    // Create designation
    const designation = await prisma.designation.create({
      data: createData
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'designation',
      entityId: designation.id.toString(),
      action: 'CREATE',
      description: `Created designation: ${designation.title}`,
      diff: {
        before: null,
        after: designation
      }
    });

    const transformedDesignation = {
      id: designation.id.toString(),
      companyId: designation.companyId.toString(),
      title: designation.title,
      level: designation.level,
      createdAt: designation.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Designation created successfully',
      data: transformedDesignation
    });
  } catch (error) {
    console.error('Error creating designation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create designation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a designation
 */
const updateDesignation = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const designationId = req.params.id;
    const updateData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!designationId) {
      return res.status(400).json({
        status: 'error',
        message: 'Designation ID is required'
      });
    }

    // Check if designation exists
    const existingDesignation = await prisma.designation.findFirst({
      where: {
        id: BigInt(designationId),
        companyId: BigInt(companyId)
      }
    });

    if (!existingDesignation) {
      return res.status(404).json({
        status: 'error',
        message: 'Designation not found'
      });
    }

    // Check if title is being changed and if new title already exists
    if (updateData.title && updateData.title !== existingDesignation.title) {
      const duplicateDesignation = await prisma.designation.findFirst({
        where: {
          companyId: BigInt(companyId),
          title: updateData.title,
          NOT: {
            id: BigInt(designationId)
          }
        }
      });

      if (duplicateDesignation) {
        return res.status(409).json({
          status: 'error',
          message: 'Designation with this title already exists in the company'
        });
      }
    }

    // Prepare update data
    const dataToUpdate = {};
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.level !== undefined) dataToUpdate.level = updateData.level;

    // Update designation
    const updatedDesignation = await prisma.designation.update({
      where: {
        id: BigInt(designationId)
      },
      data: dataToUpdate
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'designation',
      entityId: updatedDesignation.id.toString(),
      action: 'UPDATE',
      description: `Updated designation: ${updatedDesignation.title}`,
      diff: {
        before: existingDesignation,
        after: updatedDesignation
      }
    });

    const transformedDesignation = {
      id: updatedDesignation.id.toString(),
      companyId: updatedDesignation.companyId.toString(),
      title: updatedDesignation.title,
      level: updatedDesignation.level,
      createdAt: updatedDesignation.createdAt
    };

    res.status(200).json({
      status: 'success',
      message: 'Designation updated successfully',
      data: transformedDesignation
    });
  } catch (error) {
    console.error('Error updating designation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update designation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a designation
 */
const deleteDesignation = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const designationId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!designationId) {
      return res.status(400).json({
        status: 'error',
        message: 'Designation ID is required'
      });
    }

    // Check if designation exists
    const existingDesignation = await prisma.designation.findFirst({
      where: {
        id: BigInt(designationId),
        companyId: BigInt(companyId)
      },
      include: {
        _count: {
          select: {
            employeeAssignments: true
          }
        }
      }
    });

    if (!existingDesignation) {
      return res.status(404).json({
        status: 'error',
        message: 'Designation not found'
      });
    }

    // Check if designation has employees assigned
    if (existingDesignation._count.employeeAssignments > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete designation that has employees assigned. Please reassign employees first.'
      });
    }

    // Delete designation
    await prisma.designation.delete({
      where: {
        id: BigInt(designationId)
      }
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'designation',
      entityId: existingDesignation.id.toString(),
      action: 'DELETE',
      description: `Deleted designation: ${existingDesignation.title}`,
      diff: {
        before: existingDesignation,
        after: null
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Designation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting designation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete designation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search designations
 */
const searchDesignations = async (req, res) => {
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

    // Search designations by title
    const designations = await prisma.designation.findMany({
      where: {
        companyId: BigInt(companyId),
        title: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        _count: {
          select: {
            employeeAssignments: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      },
      take: 50 // Limit results
    });

    const transformedDesignations = designations.map(designation => ({
      id: designation.id.toString(),
      companyId: designation.companyId.toString(),
      title: designation.title,
      level: designation.level,
      createdAt: designation.createdAt,
      employeeCount: designation._count.employeeAssignments
    }));

    res.status(200).json({
      status: 'success',
      data: transformedDesignations
    });
  } catch (error) {
    console.error('Error searching designations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search designations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllDesignations,
  getDesignationById,
  createDesignation,
  updateDesignation,
  deleteDesignation,
  searchDesignations
};