/**
 * Role normalization utilities
 * Maps database role names to application role codes
 */

/**
 * Normalize a database role name to application role code
 * @param {string} dbRoleName - Role name from database (e.g., 'Super Admin', 'HR Manager')
 * @returns {string} Normalized role code (e.g., 'super-admin', 'hr')
 */
const normalizeRole = (dbRoleName) => {
  if (!dbRoleName) return 'employee';
  
  const roleMap = {
    // Database role names -> Application role codes
    'Super Admin': 'super-admin',
    'HR Manager': 'hr-manager',
    'HR Executive': 'hr-executive',
    'Team Lead': 'manager',
    'Employee': 'employee',
    // Add any other database role names as needed
  };
  
  // Direct mapping
  if (roleMap[dbRoleName]) {
    return roleMap[dbRoleName];
  }
  
  // Fallback: convert to lowercase and replace spaces with hyphens
  return dbRoleName.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Normalize an array of database role names
 * @param {string[]} dbRoleNames - Array of role names from database
 * @returns {string[]} Array of normalized role codes
 */
const normalizeRoles = (dbRoleNames) => {
  if (!Array.isArray(dbRoleNames)) return [];
  
  const normalized = dbRoleNames.map(normalizeRole);
  const uniqueRoles = [...new Set(normalized)];
  
  // Special case: Super Admin should also have company-admin access
  if (uniqueRoles.includes('super-admin') && !uniqueRoles.includes('company-admin')) {
    uniqueRoles.push('company-admin');
  }
  
  return uniqueRoles;
};

/**
 * Get the primary role from an array of database role names
 * @param {string[]} dbRoleNames - Array of role names from database
 * @returns {string} Primary normalized role code
 */
const getPrimaryRole = (dbRoleNames) => {
  if (!Array.isArray(dbRoleNames) || dbRoleNames.length === 0) {
    return 'employee';
  }
  
  const normalized = normalizeRoles(dbRoleNames);
  
  // Priority order for primary role
  const priorityOrder = [
    'super-admin',
    'company-admin',
    'hr-manager',
    'hr-executive',
    'manager',
    'employee'
  ];
  
  // Find the highest priority role
  for (const role of priorityOrder) {
    if (normalized.includes(role)) {
      return role;
    }
  }
  
  // Return the first role if no priority match
  return normalized[0] || 'employee';
};

/**
 * Check if a user has any of the required roles
 * @param {string[]} userRoles - User's normalized role codes
 * @param {string[]} requiredRoles - Required role codes to check against
 * @returns {boolean} True if user has at least one required role
 */
const hasAnyRole = (userRoles, requiredRoles) => {
  if (!Array.isArray(userRoles) || !Array.isArray(requiredRoles)) {
    return false;
  }
  
  return requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Get role display label for a normalized role code
 * @param {string} roleCode - Normalized role code (e.g., 'super-admin')
 * @returns {string} Display label (e.g., 'Super Admin')
 */
const getRoleLabel = (roleCode) => {
  const labelMap = {
    'super-admin': 'Super Admin',
    'company-admin': 'Company Admin',
    'hr-manager': 'HR Manager',
    'hr-executive': 'HR Executive',
    'manager': 'Manager',
    'employee': 'Employee',
    'sub-admin': 'Sub Admin',
  };
  
  return labelMap[roleCode] || roleCode;
};

module.exports = {
  normalizeRole,
  normalizeRoles,
  getPrimaryRole,
  hasAnyRole,
  getRoleLabel,
};