import api from './api';

const roleService = {
  /**
   * Get all roles for the current company
   * @returns {Promise<Object>} - API response with roles array
   */
  listRoles: async () => {
    try {
      const response = await api.get('/roles');
      return response;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  /**
   * Get a single role by ID with its permissions
   * @param {number|string} id - Role ID
   * @returns {Promise<Object>} - API response with role data
   */
  getRoleById: async (id) => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching role with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new role
   * @param {Object} roleData - Role data
   * @param {string} roleData.name - Role name (required)
   * @param {string} roleData.description - Role description (optional)
   * @param {number[]} roleData.permission_ids - Array of permission IDs (optional)
   * @returns {Promise<Object>} - API response with created role
   */
  createRole: async (roleData) => {
    try {
      const response = await api.post('/roles', roleData);
      return response;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  /**
   * Update an existing role
   * @param {number|string} id - Role ID
   * @param {Object} roleData - Updated role data
   * @param {string} roleData.name - Role name
   * @param {string} roleData.description - Role description (optional)
   * @param {number[]} roleData.permission_ids - Array of permission IDs (optional)
   * @returns {Promise<Object>} - API response with updated role
   */
  updateRole: async (id, roleData) => {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response;
    } catch (error) {
      console.error(`Error updating role with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a role
   * @param {number|string} id - Role ID
   * @returns {Promise<Object>} - API response confirming deletion
   */
  deleteRole: async (id) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response;
    } catch (error) {
      console.error(`Error deleting role with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all available permission codes in the system
   * This is a global endpoint and not company-scoped
   * @returns {Promise<Object>} - API response with permissions array
   */
  loadPermissionCatalog: async () => {
    try {
      const response = await api.get('/permissions/catalog');
      return response;
    } catch (error) {
      console.error('Error loading permission catalog:', error);
      throw error;
    }
  }
};

export default roleService;