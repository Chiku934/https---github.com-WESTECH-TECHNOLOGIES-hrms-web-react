import axiosClient from './axiosClient';

/**
 * Document Service
 * Handles all document-related API calls
 */
const documentService = {
  /**
   * Get all document types for a company
   * @param {number} companyId - Company ID
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise} API response
   */
  getAllDocumentTypes: async (companyId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/document-types`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get document type by ID
   * @param {number} companyId - Company ID
   * @param {number} documentTypeId - Document type ID
   * @returns {Promise} API response
   */
  getDocumentTypeById: async (companyId, documentTypeId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/document-types/${documentTypeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create a new document type
   * @param {number} companyId - Company ID
   * @param {Object} documentTypeData - Document type data
   * @returns {Promise} API response
   */
  createDocumentType: async (companyId, documentTypeData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/document-types`, documentTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update an existing document type
   * @param {number} companyId - Company ID
   * @param {number} documentTypeId - Document type ID
   * @param {Object} documentTypeData - Updated document type data
   * @returns {Promise} API response
   */
  updateDocumentType: async (companyId, documentTypeId, documentTypeData) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/document-types/${documentTypeId}`, documentTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a document type
   * @param {number} companyId - Company ID
   * @param {number} documentTypeId - Document type ID
   * @returns {Promise} API response
   */
  deleteDocumentType: async (companyId, documentTypeId) => {
    try {
      const response = await axiosClient.delete(`/companies/${companyId}/document-types/${documentTypeId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all documents for an employee
   * @param {number} companyId - Company ID
   * @param {number} employeeId - Employee ID
   * @param {Object} params - Query parameters (page, limit, document_type, etc.)
   * @returns {Promise} API response
   */
  getEmployeeDocuments: async (companyId, employeeId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/employees/${employeeId}/documents`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get document by ID
   * @param {number} companyId - Company ID
   * @param {number} employeeId - Employee ID
   * @param {number} documentId - Document ID
   * @returns {Promise} API response
   */
  getDocumentById: async (companyId, employeeId, documentId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/employees/${employeeId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Upload a new document
   * @param {number} companyId - Company ID
   * @param {number} employeeId - Employee ID
   * @param {FormData} formData - Form data containing file and metadata
   * @returns {Promise} API response
   */
  uploadDocument: async (companyId, employeeId, formData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/employees/${employeeId}/documents`, formData, {
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
   * Update document metadata
   * @param {number} companyId - Company ID
   * @param {number} employeeId - Employee ID
   * @param {number} documentId - Document ID
   * @param {Object} documentData - Updated document data
   * @returns {Promise} API response
   */
  updateDocument: async (companyId, employeeId, documentId, documentData) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/employees/${employeeId}/documents/${documentId}`, documentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a document
   * @param {number} companyId - Company ID
   * @param {number} employeeId - Employee ID
   * @param {number} documentId - Document ID
   * @returns {Promise} API response
   */
  deleteDocument: async (companyId, employeeId, documentId) => {
    try {
      const response = await axiosClient.delete(`/companies/${companyId}/employees/${employeeId}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Download a document
   * @param {number} companyId - Company ID
   * @param {number} employeeId - Employee ID
   * @param {number} documentId - Document ID
   * @returns {Promise} Blob response
   */
  downloadDocument: async (companyId, employeeId, documentId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/employees/${employeeId}/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get document statistics
   * @param {number} companyId - Company ID
   * @returns {Promise} API response
   */
  getDocumentStatistics: async (companyId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/documents/statistics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get documents requiring approval
   * @param {number} companyId - Company ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getPendingApprovals: async (companyId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/documents/pending-approvals`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Approve/reject a document
   * @param {number} companyId - Company ID
   * @param {number} employeeId - Employee ID
   * @param {number} documentId - Document ID
   * @param {Object} approvalData - Approval data (status, comments)
   * @returns {Promise} API response
   */
  updateDocumentStatus: async (companyId, employeeId, documentId, approvalData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/employees/${employeeId}/documents/${documentId}/approve`, approvalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default documentService;