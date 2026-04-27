import axiosClient from './axiosClient';

/**
 * User Service
 * Handles all user-related API calls (company users, not employees)
 */
const userService = {
  /**
   * Get all users for a company
   * @param {number} companyId - Company ID
   * @param {Object} params - Query parameters (page, limit, search, role, status, etc.)
   * @returns {Promise} API response
   */
  getAllUsers: async (companyId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/users`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user by ID
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @returns {Promise} API response
   */
  getUserById: async (companyId, userId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create a new user
   * @param {number} companyId - Company ID
   * @param {Object} userData - User data
   * @returns {Promise} API response
   */
  createUser: async (companyId, userData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/users`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update an existing user
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} API response
   */
  updateUser: async (companyId, userId, userData) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a user
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @returns {Promise} API response
   */
  deleteUser: async (companyId, userId) => {
    try {
      const response = await axiosClient.delete(`/companies/${companyId}/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user status (activate/deactivate)
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @param {string} status - New status (active/inactive)
   * @returns {Promise} API response
   */
  updateUserStatus: async (companyId, userId, status) => {
    try {
      const response = await axiosClient.patch(`/companies/${companyId}/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Reset user password (admin function)
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @param {Object} passwordData - New password data
   * @returns {Promise} API response
   */
  resetUserPassword: async (companyId, userId, passwordData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/users/${userId}/reset-password`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user permissions
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @returns {Promise} API response
   */
  getUserPermissions: async (companyId, userId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/users/${userId}/permissions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user permissions
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @param {Array<number>} permissionIds - Array of permission IDs
   * @returns {Promise} API response
   */
  updateUserPermissions: async (companyId, userId, permissionIds) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/users/${userId}/permissions`, {
        permission_ids: permissionIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user roles
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @returns {Promise} API response
   */
  getUserRoles: async (companyId, userId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Assign roles to user
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @param {Array<number>} roleIds - Array of role IDs
   * @returns {Promise} API response
   */
  assignUserRoles: async (companyId, userId, roleIds) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/users/${userId}/assign-roles`, {
        role_ids: roleIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user activity logs
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @param {Object} params - Query parameters (page, limit, start_date, end_date, etc.)
   * @returns {Promise} API response
   */
  getUserActivityLogs: async (companyId, userId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/users/${userId}/activity-logs`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user dashboard statistics
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @returns {Promise} API response
   */
  getUserDashboardStats: async (companyId, userId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/users/${userId}/dashboard-stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Search users
   * @param {number} companyId - Company ID
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise} API response
   */
  searchUsers: async (companyId, query, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/users/search`, {
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Bulk import users from CSV
   * @param {number} companyId - Company ID
   * @param {FormData} formData - Form data containing CSV file
   * @returns {Promise} API response
   */
  importUsers: async (companyId, formData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/users/import`, formData, {
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
   * Export users to CSV
   * @param {number} companyId - Company ID
   * @param {Object} params - Export parameters
   * @returns {Promise} Blob response
   */
  exportUsers: async (companyId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/users/export`, {
        params,
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Send welcome email to user
   * @param {number} companyId - Company ID
   * @param {number} userId - User ID
   * @returns {Promise} API response
   */
  sendWelcomeEmail: async (companyId, userId) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/users/${userId}/send-welcome`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default userService;