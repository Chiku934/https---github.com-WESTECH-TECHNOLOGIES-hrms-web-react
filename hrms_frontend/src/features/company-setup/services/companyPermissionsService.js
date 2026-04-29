// src/features/company-setup/services/companyPermissionsService.js
import api from '../../../services/api';

// Get all permissions for a company
export const getCompanyPermissions = async (companyId) => {
  try {
    const response = await api.get(`/company-permissions/company/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching company permissions:', error);
    throw error;
  }
};

// Create or update company permissions
export const upsertCompanyPermissions = async (companyId, permissions) => {
  try {
    const response = await api.put(`/company-permissions/company/${companyId}`, { permissions });
    return response.data;
  } catch (error) {
    console.error('Error updating company permissions:', error);
    throw error;
  }
};

// Delete a company permission
export const deleteCompanyPermission = async (companyId, permissionKey) => {
  try {
    const response = await api.delete(`/company-permissions/company/${companyId}/permission/${permissionKey}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting company permission:', error);
    throw error;
  }
};

// Get default permissions for a new company (based on company plan)
export const getDefaultPermissions = async (plan = 'basic') => {
  try {
    const response = await api.get(`/company-permissions/defaults?plan=${plan}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching default permissions:', error);
    throw error;
  }
};

// Check if a company has a specific permission
export const checkCompanyPermission = async (companyId, permissionKey) => {
  try {
    const response = await api.get(`/company-permissions/company/${companyId}/check/${permissionKey}`);
    return response.data;
  } catch (error) {
    console.error('Error checking company permission:', error);
    return false;
  }
};

// Get all enabled permissions for a company
export const getEnabledCompanyPermissions = async (companyId) => {
  try {
    const response = await api.get(`/company-permissions/company/${companyId}/enabled`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enabled company permissions:', error);
    return [];
  }
};