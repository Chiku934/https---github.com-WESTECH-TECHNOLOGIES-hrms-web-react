import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import axiosClient from '../services/axiosClient';

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
              const freshUser = userData.data.user || userData.data;
              const freshCompany = userData.data.company;
              
              setUser(freshUser);
              setCompany(freshCompany);
              
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(freshUser));
              if (freshCompany) {
                localStorage.setItem('company', JSON.stringify(freshCompany));
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
      
      // Update state
      setUser(userData);
      setCompany(companyData);
      
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
    
    if (user.is_super_admin) {
      return 'SUPER_ADMIN';
    } else if (user.is_company_admin) {
      return 'COMPANY_ADMIN';
    } else {
      return 'EMPLOYEE';
    }
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
        const freshUser = userData.data.user || userData.data;
        const freshCompany = userData.data.company;
        
        setUser(freshUser);
        setCompany(freshCompany);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(freshUser));
        if (freshCompany) {
          localStorage.setItem('company', JSON.stringify(freshCompany));
        }
        
        return { user: freshUser, company: freshCompany };
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