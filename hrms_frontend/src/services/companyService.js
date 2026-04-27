import axiosClient from './axiosClient';

/**
 * Company Service
 * Handles all company/tenant-related API calls
 */
const companyService = {
  /**
   * Get current company information
   * @returns {Promise} Company details
   */
  getCurrentCompany: async () => {
    try {
      const response = await axiosClient.get('/companies/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update current company information
   * @param {Object} companyData - Updated company data
   * @returns {Promise} Updated company
   */
  updateCurrentCompany: async (companyData) => {
    try {
      const response = await axiosClient.put('/companies/me', companyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get company statistics
   * @returns {Promise} Company stats (employee count, department count, etc.)
   */
  getCompanyStats: async () => {
    try {
      const response = await axiosClient.get('/companies/me/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all companies (for super admin)
   * @returns {Promise} List of companies
   */
  getAllCompanies: async () => {
    try {
      const response = await axiosClient.get('/companies');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get company by ID
   * @param {number|string} id - Company ID
   * @returns {Promise} Company details
   */
  getCompanyById: async (id) => {
    try {
      const response = await axiosClient.get(`/companies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create new company
   * @param {Object} companyData - Company data
   * @returns {Promise} Created company
   */
  createCompany: async (companyData) => {
    try {
      const response = await axiosClient.post('/companies', companyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update company
   * @param {number|string} id - Company ID
   * @param {Object} companyData - Updated company data
   * @returns {Promise} Updated company
   */
  updateCompany: async (id, companyData) => {
    try {
      const response = await axiosClient.put(`/companies/${id}`, companyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete company
   * @param {number|string} id - Company ID
   * @returns {Promise} Delete response
   */
  deleteCompany: async (id) => {
    try {
      const response = await axiosClient.delete(`/companies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get company users/employees
   * @param {number|string} companyId - Company ID
   * @param {Object} params - Query parameters
   * @returns {Promise} List of company users
   */
  getCompanyUsers: async (companyId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/users`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Add user to company
   * @param {number|string} companyId - Company ID
   * @param {Object} userData - User data
   * @returns {Promise} Added user
   */
  addUserToCompany: async (companyId, userData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/users`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Remove user from company
   * @param {number|string} companyId - Company ID
   * @param {number|string} userId - User ID
   * @returns {Promise} Remove response
   */
  removeUserFromCompany: async (companyId, userId) => {
    try {
      const response = await axiosClient.delete(`/companies/${companyId}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default companyService;