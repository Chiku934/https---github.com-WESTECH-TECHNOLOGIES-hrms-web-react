import axiosClient from './axiosClient';

/**
 * Role Service
 * Handles all role and permission-related API calls
 */
const roleService = {
  /**
   * Get all roles for a company
   * @param {number} companyId - Company ID
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise} API response
   */
  getAllRoles: async (companyId, params = {}) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/roles`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get role by ID
   * @param {number} companyId - Company ID
   * @param {number} roleId - Role ID
   * @returns {Promise} API response
   */
  getRoleById: async (companyId, roleId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create a new role
   * @param {number} companyId - Company ID
   * @param {Object} roleData - Role data
   * @returns {Promise} API response
   */
  createRole: async (companyId, roleData) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/roles`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update an existing role
   * @param {number} companyId - Company ID
   * @param {number} roleId - Role ID
   * @param {Object} roleData - Updated role data
   * @returns {Promise} API response
   */
  updateRole: async (companyId, roleId, roleData) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/roles/${roleId}`, roleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a role
   * @param {number} companyId - Company ID
   * @param {number} roleId - Role ID
   * @returns {Promise} API response
   */
  deleteRole: async (companyId, roleId) => {
    try {
      const response = await axiosClient.delete(`/companies/${companyId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all permissions
   * @param {number} companyId - Company ID
   * @returns {Promise} API response
   */
  getAllPermissions: async (companyId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/permissions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get permissions for a specific role
   * @param {number} companyId - Company ID
   * @param {number} roleId - Role ID
   * @returns {Promise} API response
   */
  getRolePermissions: async (companyId, roleId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update permissions for a role
   * @param {number} companyId - Company ID
   * @param {number} roleId - Role ID
   * @param {Array<number>} permissionIds - Array of permission IDs
   * @returns {Promise} API response
   */
  updateRolePermissions: async (companyId, roleId, permissionIds) => {
    try {
      const response = await axiosClient.put(`/companies/${companyId}/roles/${roleId}/permissions`, {
        permission_ids: permissionIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Assign role to users
   * @param {number} companyId - Company ID
   * @param {number} roleId - Role ID
   * @param {Array<number>} userIds - Array of user IDs
   * @returns {Promise} API response
   */
  assignToUsers: async (companyId, roleId, userIds) => {
    try {
      const response = await axiosClient.post(`/companies/${companyId}/roles/${roleId}/assign`, {
        user_ids: userIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get users by role
   * @param {number} companyId - Company ID
   * @param {number} roleId - Role ID
   * @returns {Promise} API response
   */
  getUsersByRole: async (companyId, roleId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/roles/${roleId}/users`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get role hierarchy (for reporting structure)
   * @param {number} companyId - Company ID
   * @returns {Promise} API response
   */
  getRoleHierarchy: async (companyId) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/roles/hierarchy`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Check if user has specific permission
   * @param {number} companyId - Company ID
   * @param {string} permissionCode - Permission code to check
   * @returns {Promise} API response
   */
  checkPermission: async (companyId, permissionCode) => {
    try {
      const response = await axiosClient.get(`/companies/${companyId}/permissions/check`, {
        params: { code: permissionCode }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default roleService;