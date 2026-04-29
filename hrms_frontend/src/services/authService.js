import axiosClient from './axiosClient';
import { normalizeRole } from '../app/config/roles';

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
      localStorage.setItem('hrms_token', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('company', JSON.stringify(company));
      localStorage.setItem('companyId', company?.id);
      
      // Extract and store role if available in user object
      if (user && user.role) {
        localStorage.setItem('hrms_role', user.role);
      } else if (user && user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
        // Use the first role if roles array is present
        localStorage.setItem('hrms_role', user.roles[0]);
      } else if (response.data.data.roles && Array.isArray(response.data.data.roles) && response.data.data.roles.length > 0) {
        // Check for roles in the response data
        localStorage.setItem('hrms_role', response.data.data.roles[0]);
      }

      if (Array.isArray(response.data.data.permissions)) {
        localStorage.setItem('permissions', JSON.stringify(response.data.data.permissions));
      }
      
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
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('permissions');
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
    return localStorage.getItem('accessToken') || localStorage.getItem('hrms_token');
  },

  /**
   * Resolve current user's role from backend API
   * This is used by the navigation system to get fresh role data
   * @returns {Promise<string>} Promise resolving to the user's role constant
   */
  resolveCurrentRole: async () => {
    try {
      const response = await authService.getCurrentUser();
      console.log('Full API response from /auth/me:', response);
      
      // The API response structure is: { success: true, data: { ... }, message: '' }
      // Where data contains: { user: {...}, company: {...}, roles: [...], permissions: [...] }
      let roles = [];
      
      if (response && response.data) {
        // Response has data property
        if (response.data.roles && Array.isArray(response.data.roles)) {
          roles = response.data.roles;
        } else if (response.data.data && response.data.data.roles && Array.isArray(response.data.data.roles)) {
          // Nested data structure
          roles = response.data.data.roles;
        }
      } else if (response && response.roles && Array.isArray(response.roles)) {
        // Direct response has roles
        roles = response.roles;
      }
      
      console.log('Extracted roles:', roles);
      
      if (roles.length === 0) {
        console.warn('No roles found for user, checking localStorage and defaulting to EMPLOYEE');
        const storedRole = localStorage.getItem('hrms_role');
        return storedRole || 'EMPLOYEE';
      }
      
      // Check each role for super admin or company admin
      for (const role of roles) {
        if (role && role.name) {
          const roleName = role.name.toLowerCase().trim();
          console.log(`Checking role: "${role.name}" (normalized: "${roleName}")`);
          
          // Check for super admin variations - more comprehensive
          const isSuperAdmin = (
            roleName === 'super_admin' ||
            roleName === 'super admin' ||
            roleName === 'superadmin' ||
            roleName === 'super administrator' ||
            roleName === 'super-administrator' ||
            roleName === 'super_administrator' ||
            (roleName.includes('super') && roleName.includes('admin')) ||
            roleName === 'sa' || // abbreviation
            roleName === 'super' // just super
          );
          
          if (isSuperAdmin) {
            console.log('✓ Found SUPER_ADMIN role:', role.name);
            return 'SUPER_ADMIN';
          }
          
          // Check for company admin variations
          const isCompanyAdmin = (
            roleName === 'company_admin' ||
            roleName === 'company admin' ||
            roleName === 'companyadmin' ||
            roleName === 'company administrator' ||
            roleName === 'company-administrator' ||
            roleName === 'company_administrator' ||
            (roleName.includes('company') && roleName.includes('admin')) ||
            roleName === 'ca' || // abbreviation
            roleName === 'company' // just company
          );
          
          if (isCompanyAdmin) {
            console.log('✓ Found COMPANY_ADMIN role:', role.name);
            return 'COMPANY_ADMIN';
          }
          
          // Check for admin variations (could be company admin)
          const isAdmin = (
            roleName === 'admin' ||
            roleName === 'administrator' ||
            roleName === 'system admin' ||
            roleName === 'system administrator' ||
            roleName === 'system_admin' ||
            roleName === 'system-administrator' ||
            roleName === 'system_administrator' ||
            roleName === 'administrator' ||
            roleName === 'hr admin' ||
            roleName === 'hradmin' ||
            roleName === 'hr_admin'
          );
          
          if (isAdmin) {
            console.log('✓ Found ADMIN role (treating as COMPANY_ADMIN):', role.name);
            return 'COMPANY_ADMIN';
          }
        }
      }
      
      // If we get here, no admin role was found
      console.log('No admin role found, defaulting to EMPLOYEE');
      return 'EMPLOYEE';
    } catch (error) {
      console.warn('Failed to resolve role from backend:', error);
      // Fallback to localStorage
      const storedRole = localStorage.getItem('hrms_role');
      console.log('Falling back to localStorage role:', storedRole);
      return storedRole || 'EMPLOYEE';
    }
  },
};

export default authService;
