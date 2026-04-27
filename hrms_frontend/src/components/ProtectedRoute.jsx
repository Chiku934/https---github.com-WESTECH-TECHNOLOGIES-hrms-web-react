import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {Array<string>} [props.allowedRoles] - Optional array of allowed roles
 * @param {boolean} [props.requireAuth=true] - Whether authentication is required (default: true)
 * @param {string} [props.redirectTo] - Custom redirect path (default: '/login')
 * @returns {React.ReactNode}
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true,
  redirectTo = null 
}) => {
  const { user, loading, isAuthenticated, getUserRole } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return children;
  }

  // Check if user is authenticated
  const authenticated = isAuthenticated() && user;

  // If not authenticated, redirect to login
  if (!authenticated) {
    const redirectPath = redirectTo || '/login';
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles.length > 0) {
    const userRole = getUserRole();
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User doesn't have required role, redirect to dashboard or unauthorized page
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and has required role (if any)
  return children;
};

export default ProtectedRoute;