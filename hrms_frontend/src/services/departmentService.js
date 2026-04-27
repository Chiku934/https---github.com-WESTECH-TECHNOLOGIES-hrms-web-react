import axiosClient from './axiosClient';

/**
 * Department Service
 * Handles all department-related API calls
 */
const departmentService = {
  /**
   * Get all departments for current company
   * @param {Object} params - Query parameters
   * @returns {Promise} List of departments
   */
  getDepartments: async (params = {}) => {
    try {
      const response = await axiosClient.get('/departments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get department by ID
   * @param {number|string} id - Department ID
   * @returns {Promise} Department details
   */
  getDepartmentById: async (id) => {
    try {
      const response = await axiosClient.get(`/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create new department
   * @param {Object} departmentData - Department data
   * @returns {Promise} Created department
   */
  createDepartment: async (departmentData) => {
    try {
      const response = await axiosClient.post('/departments', departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update department
   * @param {number|string} id - Department ID
   * @param {Object} departmentData - Updated department data
   * @returns {Promise} Updated department
   */
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await axiosClient.put(`/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete department
   * @param {number|string} id - Department ID
   * @returns {Promise} Delete response
   */
  deleteDepartment: async (id) => {
    try {
      const response = await axiosClient.delete(`/departments/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get department hierarchy (tree structure)
   * @returns {Promise} Department tree
   */
  getDepartmentTree: async () => {
    try {
      const response = await axiosClient.get('/departments/tree');
      return response.data;
    } catch (error) {
      // If tree endpoint doesn't exist, build tree from flat list
      const departments = await departmentService.getDepartments();
      return departmentService.buildDepartmentTree(departments.data);
    }
  },

  /**
   * Build department tree from flat list
   * @param {Array} departments - Flat list of departments
   * @returns {Array} Hierarchical department tree
   */
  buildDepartmentTree: (departments) => {
    const departmentMap = {};
    const tree = [];

    // Create map of departments
    departments.forEach(dept => {
      departmentMap[dept.id] = { ...dept, children: [] };
    });

    // Build tree
    departments.forEach(dept => {
      if (dept.parent_id) {
        const parent = departmentMap[dept.parent_id];
        if (parent) {
          parent.children.push(departmentMap[dept.id]);
        }
      } else {
        tree.push(departmentMap[dept.id]);
      }
    });

    return tree;
  },

  /**
   * Get employees in department
   * @param {number|string} departmentId - Department ID
   * @param {Object} params - Query parameters
   * @returns {Promise} List of employees in department
   */
  getDepartmentEmployees: async (departmentId, params = {}) => {
    try {
      const response = await axiosClient.get(`/departments/${departmentId}/employees`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update department head
   * @param {number|string} departmentId - Department ID
   * @param {number|string} headId - New department head ID
   * @returns {Promise} Update response
   */
  updateDepartmentHead: async (departmentId, headId) => {
    try {
      const response = await axiosClient.patch(`/departments/${departmentId}/head`, { head_id: headId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default departmentService;