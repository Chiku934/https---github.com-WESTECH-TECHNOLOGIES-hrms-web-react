import axiosClient from './axiosClient';

/**
 * Custom Field Service
 * Handles all custom field-related API calls
 */
const customFieldService = {
  /**
   * Get all custom fields for a company
   * @param {number} companyId - Company ID
   * @param {Object} params - Query parameters (page, limit, search, entity_type, etc.)
   * @returns {Promise} API response
   */
  getAllCustomFields: async (companyId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/custom-fields`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get custom field by ID
   * @param {number} companyId - Company ID
   * @param {number} customFieldId - Custom field ID
   * @returns {Promise} API response
   */
  getCustomFieldById: async (companyId, customFieldId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/custom-fields/${customFieldId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create a new custom field
   * @param {number} companyId - Company ID
   * @param {Object} customFieldData - Custom field data
   * @returns {Promise} API response
   */
  createCustomField: async (companyId, customFieldData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/custom-fields`, customFieldData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update an existing custom field
   * @param {number} companyId - Company ID
   * @param {number} customFieldId - Custom field ID
   * @param {Object} customFieldData - Updated custom field data
   * @returns {Promise} API response
   */
  updateCustomField: async (companyId, customFieldId, customFieldData) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/custom-fields/${customFieldId}`, customFieldData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a custom field
   * @param {number} companyId - Company ID
   * @param {number} customFieldId - Custom field ID
   * @returns {Promise} API response
   */
  deleteCustomField: async (companyId, customFieldId) => {
    try {
      const response = await axiosClient.delete(`/companies/${companyId}/custom-fields/${customFieldId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get custom fields by entity type
   * @param {number} companyId - Company ID
   * @param {string} entityType - Entity type (employee, department, etc.)
   * @returns {Promise} API response
   */
  getCustomFieldsByEntity: async (companyId, entityType) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/custom-fields/entity/${entityType}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get custom field values for a specific entity
   * @param {number} companyId - Company ID
   * @param {string} entityType - Entity type
   * @param {number} entityId - Entity ID
   * @returns {Promise} API response
   */
  getCustomFieldValues: async (companyId, entityType, entityId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/custom-fields/entity/${entityType}/${entityId}/values`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update custom field values for a specific entity
   * @param {number} companyId - Company ID
   * @param {string} entityType - Entity type
   * @param {number} entityId - Entity ID
   * @param {Array<Object>} values - Array of custom field values
   * @returns {Promise} API response
   */
  updateCustomFieldValues: async (companyId, entityType, entityId, values) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/custom-fields/entity/${entityType}/${entityId}/values`, {
        values
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get custom field options (for select fields)
   * @param {number} companyId - Company ID
   * @param {number} customFieldId - Custom field ID
   * @returns {Promise} API response
   */
  getCustomFieldOptions: async (companyId, customFieldId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/custom-fields/${customFieldId}/options`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update custom field options
   * @param {number} companyId - Company ID
   * @param {number} customFieldId - Custom field ID
   * @param {Array<Object>} options - Array of options
   * @returns {Promise} API response
   */
  updateCustomFieldOptions: async (companyId, customFieldId, options) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/custom-fields/${customFieldId}/options`, {
        options
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Reorder custom fields
   * @param {number} companyId - Company ID
   * @param {Array<Object>} order - Array of objects with id and display_order
   * @returns {Promise} API response
   */
  reorderCustomFields: async (companyId, order) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/custom-fields/reorder`, {
        order
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get custom field usage statistics
   * @param {number} companyId - Company ID
   * @returns {Promise} API response
   */
  getCustomFieldStatistics: async (companyId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/custom-fields/statistics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Import custom field values from CSV
   * @param {number} companyId - Company ID
   * @param {FormData} formData - Form data containing CSV file
   * @returns {Promise} API response
   */
  importCustomFieldValues: async (companyId, formData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/custom-fields/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Export custom field values to CSV
   * @param {number} companyId - Company ID
   * @param {Object} params - Export parameters
   * @returns {Promise} Blob response
   */
  exportCustomFieldValues: async (companyId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/custom-fields/export`, {
        params,
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default customFieldService;