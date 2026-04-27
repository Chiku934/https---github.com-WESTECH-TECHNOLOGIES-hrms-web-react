import axiosClient from './axiosClient';

/**
 * Employee Service
 * Handles all employee-related API calls
 */
const employeeService = {
  /**
   * Get list of employees with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @param {Object} filters - Additional filters
   * @returns {Promise} List of employees
   */
  getEmployees: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = { page, limit, ...filters };
      const response = await axiosClient.get('/employees', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get employee by ID
   * @param {number|string} id - Employee ID
   * @returns {Promise} Employee details with profile, assignments, roles
   */
  getEmployeeById: async (id) => {
    try {
      const response = await axiosClient.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Create new employee (onboard)
   * @param {Object} employeeData - Employee data including profile, assignment, roles
   * @returns {Promise} Created employee
   */
  createEmployee: async (employeeData) => {
    try {
      const response = await axiosClient.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update employee
   * @param {number|string} id - Employee ID
   * @param {Object} employeeData - Updated employee data
   * @returns {Promise} Updated employee
   */
  updateEmployee: async (id, employeeData) => {
    try {
      const response = await axiosClient.put(`/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete/soft-deactivate employee
   * @param {number|string} id - Employee ID
   * @returns {Promise} Delete response
   */
  deleteEmployee: async (id) => {
    try {
      const response = await axiosClient.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Add new assignment (promote/transfer)
   * @param {number|string} employeeId - Employee ID
   * @param {Object} assignmentData - Assignment data
   * @returns {Promise} New assignment
   */
  addAssignment: async (employeeId, assignmentData) => {
    try {
      const response = await axiosClient.post(`/employees/${employeeId}/assignment`, assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get employee assignment history
   * @param {number|string} employeeId - Employee ID
   * @returns {Promise} List of assignments
   */
  getAssignments: async (employeeId) => {
    try {
      const response = await axiosClient.get(`/employees/${employeeId}/assignments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update specific assignment
   * @param {number|string} employeeId - Employee ID
   * @param {number|string} assignmentId - Assignment ID
   * @param {Object} assignmentData - Updated assignment data
   * @returns {Promise} Updated assignment
   */
  updateAssignment: async (employeeId, assignmentId, assignmentData) => {
    try {
      const response = await axiosClient.put(`/employees/${employeeId}/assignments/${assignmentId}`, assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete assignment
   * @param {number|string} employeeId - Employee ID
   * @param {number|string} assignmentId - Assignment ID
   * @returns {Promise} Delete response
   */
  deleteAssignment: async (employeeId, assignmentId) => {
    try {
      const response = await axiosClient.delete(`/employees/${employeeId}/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Activate/deactivate employee
   * @param {number|string} id - Employee ID
   * @param {boolean} active - True to activate, false to deactivate
   * @returns {Promise} Response
   */
  setEmployeeStatus: async (id, active = true) => {
    try {
      const response = await axiosClient.patch(`/users/${id}/activate`, { active });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Reset employee password (admin)
   * @param {number|string} id - Employee ID
   * @returns {Promise} Temporary password
   */
  resetPassword: async (id) => {
    try {
      const response = await axiosClient.post(`/users/${id}/reset-password`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default employeeService;