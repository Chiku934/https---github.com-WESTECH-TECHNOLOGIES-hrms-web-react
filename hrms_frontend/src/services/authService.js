import { authAPI } from './api';
import { ROLES } from '../app/config/roles';

/**
 * Maps backend role codes to frontend role constants
 * @param {string} backendRole - Role code from backend (e.g., 'super-admin', 'hr-manager')
 * @returns {string} Frontend role constant
 */
function mapBackendRoleToFrontend(backendRole) {
  if (!backendRole) return ROLES.EMPLOYEE;
  
  const roleMap = {
    // Direct mapping (backend uses same codes as frontend)
    'super-admin': ROLES.SUPER_ADMIN,
    'sub-admin': ROLES.SUB_ADMIN,
    'company-admin': ROLES.COMPANY_ADMIN,
    'hr-manager': ROLES.HR_MANAGER,
    'hr-executive': ROLES.HR_EXECUTIVE,
    'manager': ROLES.MANAGER,
    'employee': ROLES.EMPLOYEE,
    
    // Legacy mappings
    'admin': ROLES.COMPANY_ADMIN,
    'user': ROLES.EMPLOYEE,
    'hr': ROLES.HR_MANAGER,
  };
  
  return roleMap[backendRole] || ROLES.EMPLOYEE;
}

/**
 * Resolves the current user's role from backend API
 * Falls back to localStorage if API call fails
 * @returns {Promise<string>} Resolved role constant
 */
export async function resolveCurrentRole() {
  // First, try to get role from localStorage as quick fallback
  const storedRole = localStorage.getItem('hrms_role');
  const storedToken = localStorage.getItem('hrms_token');
  
  // If no token, we can't call API
  if (!storedToken) {
    return storedRole ? mapBackendRoleToFrontend(storedRole) : ROLES.EMPLOYEE;
  }
  
  try {
    // Try to get fresh user data from backend
    const response = await authAPI.getMe();
    const userData = response.data;
    
    // Backend returns primaryRole field
    const backendRole = userData.primaryRole || userData.role;
    
    if (backendRole) {
      const frontendRole = mapBackendRoleToFrontend(backendRole);
      
      // Update localStorage with fresh role (optional, for fallback)
      localStorage.setItem('hrms_role', frontendRole);
      
      return frontendRole;
    }
    
    // If backend doesn't return role, fall back to stored role
    throw new Error('No role returned from backend');
  } catch (error) {
    console.warn('Failed to resolve role from backend, falling back to localStorage:', error);
    
    // Fallback to localStorage role
    if (storedRole) {
      return mapBackendRoleToFrontend(storedRole);
    }
    
    // Ultimate fallback
    return ROLES.EMPLOYEE;
  }
}

/**
 * Gets current user data from backend
 * Falls back to localStorage if API call fails
 * @returns {Promise<object>} User data object
 */
export async function getCurrentUser() {
  const storedToken = localStorage.getItem('hrms_token');
  
  if (!storedToken) {
    // Try to get from localStorage fallback
    const storedUser = localStorage.getItem('hrms_user');
    return storedUser ? JSON.parse(storedUser) : null;
  }
  
  try {
    const response = await authAPI.getMe();
    const userData = response.data;
    
    // Store in localStorage for fallback
    localStorage.setItem('hrms_user', JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    console.warn('Failed to get user from backend, falling back to localStorage:', error);
    
    const storedUser = localStorage.getItem('hrms_user');
    return storedUser ? JSON.parse(storedUser) : null;
  }
}

/**
 * Checks if user is authenticated (has valid token)
 * @returns {boolean} True if authenticated
 */
export function isAuthenticated() {
  const token = localStorage.getItem('hrms_token');
  return !!token;
}

/**
 * Clears all auth data from localStorage
 */
export function clearAuthData() {
  localStorage.removeItem('hrms_token');
  localStorage.removeItem('hrms_role');
  localStorage.removeItem('hrms_user');
}

/**
 * Gets navigation items for the current role
 * This function can be used to dynamically get navigation based on backend role
 * @returns {Promise<Array>} Navigation items for the current role
 */
export async function getNavigationForCurrentRole() {
  const role = await resolveCurrentRole();
  
  // Import navigation data dynamically to avoid circular dependencies
  const { roleNavigation } = await import('../data/navigation/index.js');
  
  return roleNavigation[role] || [];
}