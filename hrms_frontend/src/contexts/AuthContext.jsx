import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';

// Create Auth Context
const AuthContext = createContext();

/**
 * AuthProvider Component
 * Provides authentication state and methods to the entire application
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const syncAuthState = (responseData = {}) => {
    const freshUser = responseData.user || responseData;
    const freshCompany = responseData.company;
    const roles = responseData.roles || [];
    const permissions = responseData.permissions || [];

    const userWithRoles = {
      ...freshUser,
      roles,
      permissions,
    };

    setUser(userWithRoles);
    setCompany(freshCompany);

    localStorage.setItem('user', JSON.stringify(userWithRoles));
    localStorage.setItem('permissions', JSON.stringify(permissions));
    if (freshCompany) {
      localStorage.setItem('company', JSON.stringify(freshCompany));
    }

    return { user: userWithRoles, company: freshCompany, permissions };
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = authService.getAccessToken();
        const storedUser = authService.getUser();
        const storedCompany = authService.getCompany();

        if (accessToken && storedUser) {
          setUser(storedUser);
          setCompany(storedCompany);
          
          // Try to refresh user data from backend
          try {
            const userData = await authService.getCurrentUser();
            if (userData.data) {
              syncAuthState(userData.data);
              
              // Extract and store role from backend response
              try {
                // Import the refreshRoleFromBackend function
                const { refreshRoleFromBackend } = await import('../data/navigation/index.js');
                await refreshRoleFromBackend();
                console.log('Role refreshed and stored from backend');
              } catch (roleError) {
                console.warn('Failed to refresh role from backend:', roleError);
              }
            }
          } catch (refreshError) {
            console.warn('Failed to refresh user data:', refreshError);
            // Continue with stored data
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login function
   */
  const login = async (email, password, company_slug = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(email, password, company_slug);
      const { access_token, refresh_token, user: userData, company: companyData } = response.data;
      
      // Update state with initial user data
      setUser(userData);
      setCompany(companyData);
      
      // Also fetch complete user data with roles from /auth/me endpoint
      try {
        const userDataWithRoles = await authService.getCurrentUser();
        if (userDataWithRoles.data) {
          syncAuthState(userDataWithRoles.data);
        }
      } catch (fetchError) {
        console.warn('Failed to fetch user data with roles after login:', fetchError);
        // Continue with basic user data
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('permissions', JSON.stringify([]));
        if (companyData) {
          localStorage.setItem('company', JSON.stringify(companyData));
        }
      }
      
      // Refresh and store role from backend after login
      try {
        // Import the refreshRoleFromBackend function
        const { refreshRoleFromBackend } = await import('../data/navigation/index.js');
        await refreshRoleFromBackend();
        console.log('Role refreshed and stored after login');
      } catch (roleError) {
        console.warn('Failed to refresh role after login:', roleError);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new tenant company
   */
  const registerTenant = async (companyData, adminData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.registerTenant(companyData, adminData);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setCompany(null);
    setError(null);
    
    // Redirect to login page
    window.location.href = '/login';
  }, []);

  /**
   * Change password
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.changePassword(currentPassword, newPassword);
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Password change failed. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  /**
   * Get user role
   */
  const getUserRole = useCallback(() => {
    if (!user) return null;
    
    // Check if user has roles array (from API response)
    if (user.roles && Array.isArray(user.roles)) {
      for (const role of user.roles) {
        if (role && role.name) {
          const roleName = role.name.toLowerCase().trim();
          
          // Check for super admin variations
          if (
            roleName === 'super_admin' ||
            roleName === 'super admin' ||
            roleName === 'superadmin' ||
            roleName === 'super administrator' ||
            roleName === 'super-administrator' ||
            roleName === 'super_administrator' ||
            (roleName.includes('super') && roleName.includes('admin')) ||
            roleName === 'sa' ||
            roleName === 'super'
          ) {
            return 'SUPER_ADMIN';
          }
          
          // Check for company admin variations
          if (
            roleName === 'company_admin' ||
            roleName === 'company admin' ||
            roleName === 'companyadmin' ||
            roleName === 'company administrator' ||
            roleName === 'company-administrator' ||
            roleName === 'company_administrator' ||
            (roleName.includes('company') && roleName.includes('admin')) ||
            roleName === 'ca' ||
            roleName === 'company'
          ) {
            return 'COMPANY_ADMIN';
          }
          
          // Check for admin variations
          if (
            roleName === 'admin' ||
            roleName === 'administrator' ||
            roleName === 'system admin' ||
            roleName === 'system administrator' ||
            roleName === 'system_admin' ||
            roleName === 'system-administrator' ||
            roleName === 'system_administrator' ||
            roleName === 'hr admin' ||
            roleName === 'hradmin' ||
            roleName === 'hr_admin'
          ) {
            return 'COMPANY_ADMIN';
          }
        }
      }
    }
    
    // Fallback to legacy boolean fields (for backward compatibility)
    if (user.is_super_admin) {
      return 'SUPER_ADMIN';
    } else if (user.is_company_admin) {
      return 'COMPANY_ADMIN';
    }
    
    // Default to employee
    return 'EMPLOYEE';
  }, [user]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role) => {
    const userRole = getUserRole();
    return userRole === role;
  }, [getUserRole]);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roles) => {
    const userRole = getUserRole();
    return roles.includes(userRole);
  }, [getUserRole]);

  /**
   * Refresh user data from backend
   */
  const refreshUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData.data) {
        return syncAuthState(userData.data);
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      throw err;
    }
  };

  // Context value
  const contextValue = {
    user,
    company,
    loading,
    error,
    login,
    logout,
    registerTenant,
    changePassword,
    isAuthenticated,
    getUserRole,
    hasRole,
    hasAnyRole,
    refreshUserData,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
