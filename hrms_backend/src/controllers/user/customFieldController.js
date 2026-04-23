const prisma = require('../../config/prisma');
const { auditFromRequest } = require('../../utils/auditLogger');

/**
 * Get all custom fields for the current company
 */
const getAllCustomFields = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Get all custom fields for the company
    const customFields = await prisma.customField.findMany({
      where: {
        companyId: BigInt(companyId)
      },
      orderBy: [
        { entity: 'asc' },
        { fieldLabel: 'asc' }
      ]
    });

    // Transform the data
    const transformedCustomFields = customFields.map(field => ({
      id: field.id.toString(),
      companyId: field.companyId.toString(),
      entity: field.entity,
      fieldKey: field.fieldKey,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      options: field.options,
      isRequired: field.isRequired,
      createdAt: field.createdAt
    }));

    res.status(200).json({
      status: 'success',
      data: transformedCustomFields
    });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch custom fields',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get custom field by ID
 */
const getCustomFieldById = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const customFieldId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!customFieldId) {
      return res.status(400).json({
        status: 'error',
        message: 'Custom Field ID is required'
      });
    }

    const customField = await prisma.customField.findFirst({
      where: {
        id: BigInt(customFieldId),
        companyId: BigInt(companyId)
      },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!customField) {
      return res.status(404).json({
        status: 'error',
        message: 'Custom field not found'
      });
    }

    const transformedCustomField = {
      id: customField.id.toString(),
      companyId: customField.companyId.toString(),
      entity: customField.entity,
      fieldKey: customField.fieldKey,
      fieldLabel: customField.fieldLabel,
      fieldType: customField.fieldType,
      options: customField.options,
      isRequired: customField.isRequired,
      createdAt: customField.createdAt,
      company: customField.company
    };

    res.status(200).json({
      status: 'success',
      data: transformedCustomField
    });
  } catch (error) {
    console.error('Error fetching custom field:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch custom field',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get custom fields by entity
 */
const getCustomFieldsByEntity = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const entity = req.params.entity;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!entity) {
      return res.status(400).json({
        status: 'error',
        message: 'Entity parameter is required'
      });
    }

    const customFields = await prisma.customField.findMany({
      where: {
        companyId: BigInt(companyId),
        entity: entity
      },
      orderBy: {
        fieldLabel: 'asc'
      }
    });

    const transformedCustomFields = customFields.map(field => ({
      id: field.id.toString(),
      companyId: field.companyId.toString(),
      entity: field.entity,
      fieldKey: field.fieldKey,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      options: field.options,
      isRequired: field.isRequired,
      createdAt: field.createdAt
    }));

    res.status(200).json({
      status: 'success',
      data: transformedCustomFields
    });
  } catch (error) {
    console.error('Error fetching custom fields by entity:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch custom fields',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new custom field
 */
const createCustomField = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const customFieldData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    // Validate required fields
    if (!customFieldData.entity) {
      return res.status(400).json({
        status: 'error',
        message: 'Entity is required'
      });
    }

    if (!customFieldData.fieldKey) {
      return res.status(400).json({
        status: 'error',
        message: 'Field key is required'
      });
    }

    if (!customFieldData.fieldLabel) {
      return res.status(400).json({
        status: 'error',
        message: 'Field label is required'
      });
    }

    if (!customFieldData.fieldType) {
      return res.status(400).json({
        status: 'error',
        message: 'Field type is required'
      });
    }

    // Validate field type
    const validFieldTypes = ['text', 'number', 'date', 'select', 'checkbox', 'textarea'];
    if (!validFieldTypes.includes(customFieldData.fieldType)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid field type. Must be one of: ${validFieldTypes.join(', ')}`
      });
    }

    // If field type is 'select', options must be provided
    if (customFieldData.fieldType === 'select' && !customFieldData.options) {
      return res.status(400).json({
        status: 'error',
        message: 'Options are required for select field type'
      });
    }

    // Check if custom field with same key already exists for the entity in company
    const existingCustomField = await prisma.customField.findFirst({
      where: {
        companyId: BigInt(companyId),
        entity: customFieldData.entity,
        fieldKey: customFieldData.fieldKey
      }
    });

    if (existingCustomField) {
      return res.status(409).json({
        status: 'error',
        message: 'Custom field with this key already exists for this entity in the company'
      });
    }

    // Prepare data for creation
    const createData = {
      companyId: BigInt(companyId),
      entity: customFieldData.entity,
      fieldKey: customFieldData.fieldKey,
      fieldLabel: customFieldData.fieldLabel,
      fieldType: customFieldData.fieldType,
      isRequired: customFieldData.isRequired || false
    };

    // Handle options if provided
    if (customFieldData.options) {
      try {
        // Parse options if it's a string, otherwise use as-is
        const options = typeof customFieldData.options === 'string' 
          ? JSON.parse(customFieldData.options)
          : customFieldData.options;
        createData.options = options;
      } catch (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid options JSON format'
        });
      }
    }

    // Create custom field
    const customField = await prisma.customField.create({
      data: createData
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'custom_field',
      entityId: customField.id.toString(),
      action: 'CREATE',
      description: `Created custom field: ${customField.fieldLabel} for entity ${customField.entity}`,
      diff: {
        before: null,
        after: customField
      }
    });

    const transformedCustomField = {
      id: customField.id.toString(),
      companyId: customField.companyId.toString(),
      entity: customField.entity,
      fieldKey: customField.fieldKey,
      fieldLabel: customField.fieldLabel,
      fieldType: customField.fieldType,
      options: customField.options,
      isRequired: customField.isRequired,
      createdAt: customField.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Custom field created successfully',
      data: transformedCustomField
    });
  } catch (error) {
    console.error('Error creating custom field:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create custom field',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a custom field
 */
const updateCustomField = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const customFieldId = req.params.id;
    const updateData = req.body;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!customFieldId) {
      return res.status(400).json({
        status: 'error',
        message: 'Custom Field ID is required'
      });
    }

    // Check if custom field exists
    const existingCustomField = await prisma.customField.findFirst({
      where: {
        id: BigInt(customFieldId),
        companyId: BigInt(companyId)
      }
    });

    if (!existingCustomField) {
      return res.status(404).json({
        status: 'error',
        message: 'Custom field not found'
      });
    }

    // Check if field key is being changed and if new key already exists for the entity
    if (updateData.fieldKey && updateData.fieldKey !== existingCustomField.fieldKey) {
      const duplicateCustomField = await prisma.customField.findFirst({
        where: {
          companyId: BigInt(companyId),
          entity: existingCustomField.entity,
          fieldKey: updateData.fieldKey,
          NOT: {
            id: BigInt(customFieldId)
          }
        }
      });

      if (duplicateCustomField) {
        return res.status(409).json({
          status: 'error',
          message: 'Custom field with this key already exists for this entity in the company'
        });
      }
    }

    // Prepare update data
    const dataToUpdate = {};
    if (updateData.entity !== undefined) dataToUpdate.entity = updateData.entity;
    if (updateData.fieldKey !== undefined) dataToUpdate.fieldKey = updateData.fieldKey;
    if (updateData.fieldLabel !== undefined) dataToUpdate.fieldLabel = updateData.fieldLabel;
    if (updateData.fieldType !== undefined) dataToUpdate.fieldType = updateData.fieldType;
    if (updateData.isRequired !== undefined) dataToUpdate.isRequired = updateData.isRequired;

    // Handle options if provided
    if (updateData.options !== undefined) {
      try {
        // Parse options if it's a string, otherwise use as-is
        const options = typeof updateData.options === 'string' 
          ? JSON.parse(updateData.options)
          : updateData.options;
        dataToUpdate.options = options;
      } catch (error) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid options JSON format'
        });
      }
    }

    // Update custom field
    const updatedCustomField = await prisma.customField.update({
      where: {
        id: BigInt(customFieldId)
      },
      data: dataToUpdate
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'custom_field',
      entityId: updatedCustomField.id.toString(),
      action: 'UPDATE',
      description: `Updated custom field: ${updatedCustomField.fieldLabel}`,
      diff: {
        before: existingCustomField,
        after: updatedCustomField
      }
    });

    const transformedCustomField = {
      id: updatedCustomField.id.toString(),
      companyId: updatedCustomField.companyId.toString(),
      entity: updatedCustomField.entity,
      fieldKey: updatedCustomField.fieldKey,
      fieldLabel: updatedCustomField.fieldLabel,
      fieldType: updatedCustomField.fieldType,
      options: updatedCustomField.options,
      isRequired: updatedCustomField.isRequired,
      createdAt: updatedCustomField.createdAt
    };

    res.status(200).json({
      status: 'success',
      message: 'Custom field updated successfully',
      data: transformedCustomField
    });
  } catch (error) {
    console.error('Error updating custom field:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update custom field',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a custom field
 */
const deleteCustomField = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    const customFieldId = req.params.id;
    
    if (!companyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID not found in token'
      });
    }

    if (!customFieldId) {
      return res.status(400).json({
        status: 'error',
        message: 'Custom Field ID is required'
      });
    }

    // Check if custom field exists
    const existingCustomField = await prisma.customField.findFirst({
      where: {
        id: BigInt(customFieldId),
        companyId: BigInt(companyId)
      }
    });

    if (!existingCustomField) {
      return res.status(404).json({
        status: 'error',
        message: 'Custom field not found'
      });
    }

    // Delete custom field
    await prisma.customField.delete({
      where: {
        id: BigInt(customFieldId)
      }
    });

    // Log audit trail
    await auditFromRequest(req, {
      entityType: 'custom_field',
      entityId: existingCustomField.id.toString(),
      action: 'DELETE',
      description: `Deleted custom field: ${existingCustomField.fieldLabel}`,
      diff: {
        before: existingCustomField,
        after: null
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Custom field deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete custom field',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Search custom fields
 */
const searchCustomFields = async (req, res) => {
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

    // Search custom fields by field label, field key, or entity
    const customFields = await prisma.customField.findMany({
      where: {
        companyId: BigInt(companyId),
        OR: [
          {
            fieldLabel: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            fieldKey: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            entity: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: [
        { entity: 'asc' },
        { fieldLabel: 'asc' }
      ],
      take: 50 // Limit results
    });

    const transformedCustomFields = customFields.map(field => ({
      id: field.id.toString(),
      companyId: field.companyId.toString(),
      entity: field.entity,
      fieldKey: field.fieldKey,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      options: field.options,
      isRequired: field.isRequired,
      createdAt: field.createdAt
    }));

    res.status(200).json({
      status: 'success',
      data: transformedCustomFields
    });
  } catch (error) {
    console.error('Error searching custom fields:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search custom fields',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllCustomFields,
  getCustomFieldById,
  getCustomFieldsByEntity,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  searchCustomFields
};