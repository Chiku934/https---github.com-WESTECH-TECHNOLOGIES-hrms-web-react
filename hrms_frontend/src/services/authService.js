import axiosClient from './axiosClient';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
  /**
   * Login user with email, password, and optional company slug
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} company_slug - Optional company slug for multi-company users
   * @returns {Promise} API response
   */
  login: async (email, password, company_slug = null) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        email,
        password,
        company_slug,
      });
      
      const { access_token, refresh_token, user, company } = response.data.data;
      
      // Store tokens and user info
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('company', JSON.stringify(company));
      localStorage.setItem('companyId', company?.id);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Register a new tenant company with admin user
   * @param {Object} companyData - Company information
   * @param {Object} adminData - Admin user information
   * @returns {Promise} API response
   */
  registerTenant: async (companyData, adminData) => {
    try {
      const response = await axiosClient.post('/companies/register', {
        company: companyData,
        admin: adminData,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get current authenticated user info
   * @returns {Promise} User information with company and permissions
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} New tokens
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await axiosClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} API response
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axiosClient.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user (client-side only)
   */
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    localStorage.removeItem('companyId');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user has access token
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Get stored user data
   * @returns {Object|null} User object or null
   */
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Get stored company data
   * @returns {Object|null} Company object or null
   */
  getCompany: () => {
    const companyStr = localStorage.getItem('company');
    return companyStr ? JSON.parse(companyStr) : null;
  },

  /**
   * Get access token
   * @returns {string|null} Access token or null
   */
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Resolve current user's role from backend API
   * This is used by the navigation system to get fresh role data
   * @returns {Promise<string>} Promise resolving to the user's role constant
   */
  resolveCurrentRole: async () => {
    try {
      const userData = await authService.getCurrentUser();
      const user = userData.data?.user || userData.data;
      
      // Determine role based on user data
      if (user.is_super_admin) {
        return 'SUPER_ADMIN';
      } else if (user.is_company_admin) {
        return 'COMPANY_ADMIN';
      } else {
        return 'EMPLOYEE';
      }
    } catch (error) {
      console.warn('Failed to resolve role from backend:', error);
      // Fallback to localStorage
      const storedRole = localStorage.getItem('hrms_role');
      return storedRole || 'EMPLOYEE';
    }
  },
};

export default authService;
