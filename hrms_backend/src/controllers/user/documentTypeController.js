const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all document types for the current company (including global ones)
 */
const getAllDocumentTypes = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Get document types for the company AND global ones (where companyId is null)
    const documentTypes = await prisma.documentType.findMany({
      where: {
        OR: [
          { companyId: BigInt(companyId) },
          { companyId: null }
        ]
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
            employeeDocuments: true
          }
        }
      },
      orderBy: [
        { companyId: 'asc' }, // Global ones first (null), then company-specific
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform the data
    const transformedDocumentTypes = documentTypes.map(docType => ({
      id: docType.id.toString(),
      companyId: docType.companyId ? docType.companyId.toString() : null,
      name: docType.name,
      category: docType.category,
      isRequired: docType.isRequired,
      hasExpiry: docType.hasExpiry,
      createdAt: docType.createdAt,
      company: docType.company,
      documentCount: docType._count.employeeDocuments,
      isGlobal: docType.companyId === null
    }));

    res.status(200).json({
      status: 'success',
      data: transformedDocumentTypes
    });
  } catch (error) {
    console.error('Error fetching document types:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch document types',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get document type by ID
 */
const getDocumentTypeById = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const documentTypeId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!documentTypeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Document Type ID is required'
      });
    }

    const documentType = await prisma.documentType.findFirst({
      where: {
        id: BigInt(documentTypeId),
        OR: [
          { companyId: BigInt(companyId) },
          { companyId: null }
        ]
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
            employeeDocuments: true
          }
        }
      }
    });

    if (!documentType) {
      return res.status(404).json({
        status: 'error',
        message: 'Document type not found or not accessible'
      });
    }

    const transformedDocumentType = {
      id: documentType.id.toString(),
      companyId: documentType.companyId ? documentType.companyId.toString() : null,
      name: documentType.name,
      category: documentType.category,
      isRequired: documentType.isRequired,
      hasExpiry: documentType.hasExpiry,
      createdAt: documentType.createdAt,
      company: documentType.company,
      documentCount: documentType._count.employeeDocuments,
      isGlobal: documentType.companyId === null
    };

    res.status(200).json({
      status: 'success',
      data: transformedDocumentType
    });
  } catch (error) {
    console.error('Error fetching document type:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch document type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new document type
 */
const createDocumentType = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const documentTypeData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Validate required fields
    if (!documentTypeData.name) {
      return res.status(400).json({
        status: 'error',
        message: 'Document type name is required'
      });
    }

    // Check if document type with same name already exists in company (or globally if creating global)
    const isGlobal = documentTypeData.isGlobal === true;
    const searchCompanyId = isGlobal ? null : BigInt(companyId);
    
    const existingDocumentType = await prisma.documentType.findFirst({
      where: {
        companyId: searchCompanyId,
        name: documentTypeData.name
      }
    });

    if (existingDocumentType) {
      const type = isGlobal ? 'global' : 'company';
      return res.status(409).json({
        status: 'error',
        message: `Document type with this name already exists as a ${type} document type`
      });
    }

    // Prepare data for creation
    const createData = {
      name: documentTypeData.name,
      category: documentTypeData.category || null,
      isRequired: documentTypeData.isRequired || false,
      hasExpiry: documentTypeData.hasExpiry || false
    };

    // Only set companyId if not creating a global document type
    if (!isGlobal) {
      createData.companyId = BigInt(companyId);
      createData.company = {
        connect: { id: BigInt(companyId) }
      };
    }

    // Create document type
    const documentType = await prisma.documentType.create({
      data: createData,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'document_type',
      entityId: documentType.id.toString(),
      action: 'CREATE',
      description: `Created document type: ${documentType.name} (${isGlobal ? 'global' : 'company'})`,
      diff: {
        before: null,
        after: documentType
      }
    });

    const transformedDocumentType = {
      id: documentType.id.toString(),
      companyId: documentType.companyId ? documentType.companyId.toString() : null,
      name: documentType.name,
      category: documentType.category,
      isRequired: documentType.isRequired,
      hasExpiry: documentType.hasExpiry,
      createdAt: documentType.createdAt,
      company: documentType.company,
      isGlobal: documentType.companyId === null
    };

    res.status(201).json({
      status: 'success',
      message: 'Document type created successfully',
      data: transformedDocumentType
    });
  } catch (error) {
    console.error('Error creating document type:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create document type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a document type
 */
const updateDocumentType = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const documentTypeId = req.params.id;
    const updateData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!documentTypeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Document Type ID is required'
      });
    }

    // Check if document type exists and is accessible
    const existingDocumentType = await prisma.documentType.findFirst({
      where: {
        id: BigInt(documentTypeId),
        OR: [
          { companyId: BigInt(companyId) },
          { companyId: null }
        ]
      }
    });

    if (!existingDocumentType) {
      return res.status(404).json({
        status: 'error',
        message: 'Document type not found or not accessible'
      });
    }

    // Check if name is being changed and if new name already exists
    if (updateData.name && updateData.name !== existingDocumentType.name) {
      const searchCompanyId = existingDocumentType.companyId;
      const duplicateDocumentType = await prisma.documentType.findFirst({
        where: {
          companyId: searchCompanyId,
          name: updateData.name,
          NOT: {
            id: BigInt(documentTypeId)
          }
        }
      });

      if (duplicateDocumentType) {
        const type = existingDocumentType.companyId === null ? 'global' : 'company';
        return res.status(409).json({
          status: 'error',
          message: `Document type with this name already exists as a ${type} document type`
        });
      }
    }

    // Prepare update data
    const dataToUpdate = {};
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.category !== undefined) dataToUpdate.category = updateData.category;
    if (updateData.isRequired !== undefined) dataToUpdate.isRequired = updateData.isRequired;
    if (updateData.hasExpiry !== undefined) dataToUpdate.hasExpiry = updateData.hasExpiry;

    // Update document type
    const updatedDocumentType = await prisma.documentType.update({
      where: {
        id: BigInt(documentTypeId)
      },
      data: dataToUpdate,
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'document_type',
      entityId: updatedDocumentType.id.toString(),
      action: 'UPDATE',
      description: `Updated document type: ${updatedDocumentType.name}`,
      diff: {
        before: existingDocumentType,
        after: updatedDocumentType
      }
    });

    const transformedDocumentType = {
      id: updatedDocumentType.id.toString(),
      companyId: updatedDocumentType.companyId ? updatedDocumentType.companyId.toString() : null,
      name: updatedDocumentType.name,
      category: updatedDocumentType.category,
      isRequired: updatedDocumentType.isRequired,
      hasExpiry: updatedDocumentType.hasExpiry,
      createdAt: updatedDocumentType.createdAt,
      company: updatedDocumentType.company,
      isGlobal: updatedDocumentType.companyId === null
    };

    res.status(200).json({
      status: 'success',
      message: 'Document type updated successfully',
      data: transformedDocumentType
    });
  } catch (error) {
    console.error('Error updating document type:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update document type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a document type
 */
const deleteDocumentType = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const documentTypeId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!documentTypeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Document Type ID is required'
      });
    }

    // Check if document type exists and is accessible
    const existingDocumentType = await prisma.documentType.findFirst({
      where: {
        id: BigInt(documentTypeId),
        OR: [
          { companyId: BigInt(companyId) },
          { companyId: null }
        ]
      },
      include: {
        _count: {
          select: {
            employeeDocuments: true
          }
        }
      }
    });

    if (!existingDocumentType) {
      return res.status(404).json({
        status: 'error',
        message: 'Document type not found or not accessible'
      });
    }

    // Check if document type has documents associated
    if (existingDocumentType._count.employeeDocuments > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete document type that has documents associated. Please delete or reassign documents first.'
      });
    }

    // Delete document type
    await prisma.documentType.delete({
      where: {
        id: BigInt(documentTypeId)
      }
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'document_type',
      entityId: existingDocumentType.id.toString(),
      action: 'DELETE',
      description: `Deleted document type: ${existingDocumentType.name}`,
      diff: {
        before: existingDocumentType,
        after: null
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Document type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document type:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete document type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search document types
 */
const searchDocumentTypes = async (req, res) => {
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

    // Search document types by name or category
    const documentTypes = await prisma.documentType.findMany({
      where: {
        OR: [
          { companyId: BigInt(companyId) },
          { companyId: null }
        ],
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            category: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
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
            employeeDocuments: true
          }
        }
      },
      orderBy: [
        { companyId: 'asc' },
        { name: 'asc' }
      ],
      take: 50 // Limit results
    });

    const transformedDocumentTypes = documentTypes.map(docType => ({
      id: docType.id.toString(),
      companyId: docType.companyId ? docType.companyId.toString() : null,
      name: docType.name,
      category: docType.category,
      isRequired: docType.isRequired,
      hasExpiry: docType.hasExpiry,
      createdAt: docType.createdAt,
      company: docType.company,
      documentCount: docType._count.employeeDocuments,
      isGlobal: docType.companyId === null
    }));

    res.status(200).json({
      status: 'success',
      data: transformedDocumentTypes
    });
  } catch (error) {
    console.error('Error searching document types:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search document types',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllDocumentTypes,
  getDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  searchDocumentTypes
};