import axiosClient from './axiosClient';

/**
 * Designation Service
 * Handles all designation-related API calls
 */
const designationService = {
  /**
   * Get all designations for a company
   * @param {number} companyId - Company ID
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise} API response
   */
  getAllDesignations: async (companyId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/designations`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get designation by ID
   * @param {number} companyId - Company ID
   * @param {number} designationId - Designation ID
   * @returns {Promise} API response
   */
  getDesignationById: async (companyId, designationId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/designations/${designationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create a new designation
   * @param {number} companyId - Company ID
   * @param {Object} designationData - Designation data
   * @returns {Promise} API response
   */
  createDesignation: async (companyId, designationData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/designations`, designationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update an existing designation
   * @param {number} companyId - Company ID
   * @param {number} designationId - Designation ID
   * @param {Object} designationData - Updated designation data
   * @returns {Promise} API response
   */
  updateDesignation: async (companyId, designationId, designationData) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/designations/${designationId}`, designationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a designation
   * @param {number} companyId - Company ID
   * @param {number} designationId - Designation ID
   * @returns {Promise} API response
   */
  deleteDesignation: async (companyId, designationId) => {
    try {
      const response = await axiosClient.delete(`/companies/${companyId}/designations/${designationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get designations with department information
   * @param {number} companyId - Company ID
   * @returns {Promise} API response
   */
  getDesignationsWithDepartments: async (companyId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/designations/with-departments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Assign designation to multiple employees
   * @param {number} companyId - Company ID
   * @param {number} designationId - Designation ID
   * @param {Array<number>} employeeIds - Array of employee IDs
   * @returns {Promise} API response
   */
  assignToEmployees: async (companyId, designationId, employeeIds) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/designations/${designationId}/assign`, {
        employee_ids: employeeIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get employees by designation
   * @param {number} companyId - Company ID
   * @param {number} designationId - Designation ID
   * @returns {Promise} API response
   */
  getEmployeesByDesignation: async (companyId, designationId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/designations/${designationId}/employees`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default designationService;