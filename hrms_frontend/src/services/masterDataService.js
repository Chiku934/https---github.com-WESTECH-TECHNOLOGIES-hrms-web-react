import { departmentAPI, designationAPI } from './api';

// Storage keys
const DEPARTMENT_STORAGE_KEY = 'hrms_departments';
const DESIGNATION_STORAGE_KEY = 'hrms_designations';

// Storage helpers
function readStorage(key, fallback = []) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// Data transformation functions
function transformBackendDepartmentToFrontend(department) {
  return {
    id: department.id,
    name: department.name,
    code: department.code || `DEP-${department.id.toString().slice(-3)}`,
    status: 'Active',
    type: 'Department',
    note: department.head?.user?.name ? `Head: ${department.head.user.name}` : 'Department',
    employeeCount: department.employeeCount || 0,
    childrenCount: department.childrenCount || 0,
    parent_id: department.parent_id,
    head_id: department.head_id,
  };
}

function transformBackendDesignationToFrontend(designation) {
  return {
    id: designation.id,
    name: designation.title,
    status: 'Active',
    type: 'Designation',
    note: `Level ${designation.level}`,
    level: designation.level,
  };
}

function transformFrontendDepartmentToBackend(department) {
  return {
    name: department.name,
    code: department.code,
    parent_id: department.parent_id,
    head_id: department.head_id,
  };
}

function transformFrontendDesignationToBackend(designation) {
  return {
    title: designation.name,
    level: designation.level || 1,
  };
}

// Department API functions
export async function loadDepartments() {
  try {
    const response = await departmentAPI.getAll();
    // The backend directly returns the array, not wrapped in a data property
    const departments = response.data || [];
    
    // Only use localStorage as cache, not as fallback for default data
    if (departments.length > 0) {
      const transformed = departments.map(transformBackendDepartmentToFrontend);
      writeStorage(DEPARTMENT_STORAGE_KEY, transformed);
      return transformed;
    }
    
    // If no departments from API, check localStorage cache
    const cached = readStorage(DEPARTMENT_STORAGE_KEY, []);
    return cached;
  } catch (error) {
    console.error('Error loading departments from API:', error);
    // Only return cached data if available, don't use default data
    return readStorage(DEPARTMENT_STORAGE_KEY, []);
  }
}

export async function saveDepartments(departments) {
  try {
    // Save to localStorage as cache
    writeStorage(DEPARTMENT_STORAGE_KEY, departments);
    return { success: true, message: 'Departments saved locally' };
  } catch (error) {
    console.error('Error saving departments:', error);
    return { success: false, message: 'Failed to save departments' };
  }
}

export async function createDepartment(departmentData) {
  try {
    const backendData = transformFrontendDepartmentToBackend(departmentData);
    const response = await departmentAPI.create(backendData);
    
    if (response.status === 'success' || response.data) {
      const newDepartment = transformBackendDepartmentToFrontend(response.data);
      
      // Update local storage cache
      const currentDepartments = readStorage(DEPARTMENT_STORAGE_KEY, []);
      const updatedDepartments = [...currentDepartments, newDepartment];
      writeStorage(DEPARTMENT_STORAGE_KEY, updatedDepartments);
      
      return { success: true, data: newDepartment };
    }
    
    return { success: false, message: response.message || 'Failed to create department' };
  } catch (error) {
    console.error('Error creating department:', error);
    return { success: false, message: 'An error occurred while creating department' };
  }
}

export async function updateDepartment(id, departmentData) {
  try {
    const backendData = transformFrontendDepartmentToBackend(departmentData);
    const response = await departmentAPI.update(id, backendData);
    
    if (response.status === 'success' || response.data) {
      const updatedDepartment = transformBackendDepartmentToFrontend(response.data);
      
      // Update local storage cache
      const currentDepartments = readStorage(DEPARTMENT_STORAGE_KEY, []);
      const updatedDepartments = currentDepartments.map(dept => 
        dept.id === id ? updatedDepartment : dept
      );
      writeStorage(DEPARTMENT_STORAGE_KEY, updatedDepartments);
      
      return { success: true, data: updatedDepartment };
    }
    
    return { success: false, message: response.message || 'Failed to update department' };
  } catch (error) {
    console.error('Error updating department:', error);
    return { success: false, message: 'An error occurred while updating department' };
  }
}

export async function deleteDepartment(id) {
  try {
    const response = await departmentAPI.delete(id);
    
    if (response.status === 'success' || response.data !== undefined) {
      // Update local storage cache
      const currentDepartments = readStorage(DEPARTMENT_STORAGE_KEY, []);
      const updatedDepartments = currentDepartments.filter(dept => dept.id !== id);
      writeStorage(DEPARTMENT_STORAGE_KEY, updatedDepartments);
      
      return { success: true, message: 'Department deleted successfully' };
    }
    
    return { success: false, message: response.message || 'Failed to delete department' };
  } catch (error) {
    console.error('Error deleting department:', error);
    return { success: false, message: 'An error occurred while deleting department' };
  }
}

// Designation API functions
export async function loadDesignations() {
  try {
    const response = await designationAPI.getAll();
    // The backend directly returns the array, not wrapped in a data property
    const designations = response.data || [];
    
    // Only use localStorage as cache, not as fallback for default data
    if (designations.length > 0) {
      const transformed = designations.map(transformBackendDesignationToFrontend);
      writeStorage(DESIGNATION_STORAGE_KEY, transformed);
      return transformed;
    }
    
    // If no designations from API, check localStorage cache
    const cached = readStorage(DESIGNATION_STORAGE_KEY, []);
    return cached;
  } catch (error) {
    console.error('Error loading designations from API:', error);
    // Only return cached data if available, don't use default data
    return readStorage(DESIGNATION_STORAGE_KEY, []);
  }
}

export async function saveDesignations(designations) {
  try {
    // Save to localStorage as cache
    writeStorage(DESIGNATION_STORAGE_KEY, designations);
    return { success: true, message: 'Designations saved locally' };
  } catch (error) {
    console.error('Error saving designations:', error);
    return { success: false, message: 'Failed to save designations' };
  }
}

export async function createDesignation(designationData) {
  try {
    const backendData = transformFrontendDesignationToBackend(designationData);
    const response = await designationAPI.create(backendData);
    
    if (response.status === 'success' || response.data) {
      const newDesignation = transformBackendDesignationToFrontend(response.data);
      
      // Update local storage cache
      const currentDesignations = readStorage(DESIGNATION_STORAGE_KEY, []);
      const updatedDesignations = [...currentDesignations, newDesignation];
      writeStorage(DESIGNATION_STORAGE_KEY, updatedDesignations);
      
      return { success: true, data: newDesignation };
    }
    
    return { success: false, message: response.message || 'Failed to create designation' };
  } catch (error) {
    console.error('Error creating designation:', error);
    return { success: false, message: 'An error occurred while creating designation' };
  }
}

export async function updateDesignation(id, designationData) {
  try {
    const backendData = transformFrontendDesignationToBackend(designationData);
    const response = await designationAPI.update(id, backendData);
    
    if (response.status === 'success' || response.data) {
      const updatedDesignation = transformBackendDesignationToFrontend(response.data);
      
      // Update local storage cache
      const currentDesignations = readStorage(DESIGNATION_STORAGE_KEY, []);
      const updatedDesignations = currentDesignations.map(des => 
        des.id === id ? updatedDesignation : des
      );
      writeStorage(DESIGNATION_STORAGE_KEY, updatedDesignations);
      
      return { success: true, data: updatedDesignation };
    }
    
    return { success: false, message: response.message || 'Failed to update designation' };
  } catch (error) {
    console.error('Error updating designation:', error);
    return { success: false, message: 'An error occurred while updating designation' };
  }
}

export async function deleteDesignation(id) {
  try {
    const response = await designationAPI.delete(id);
    
    if (response.status === 'success' || response.data !== undefined) {
      // Update local storage cache
      const currentDesignations = readStorage(DESIGNATION_STORAGE_KEY, []);
      const updatedDesignations = currentDesignations.filter(des => des.id !== id);
      writeStorage(DESIGNATION_STORAGE_KEY, updatedDesignations);
      
      return { success: true, message: 'Designation deleted successfully' };
    }
    
    return { success: false, message: response.message || 'Failed to delete designation' };
  } catch (error) {
    console.error('Error deleting designation:', error);
    return { success: false, message: 'An error occurred while deleting designation' };
  }
}

// Combined function to load all master data
export async function loadMasterData() {
  try {
    const [departments, designations] = await Promise.all([
      loadDepartments(),
      loadDesignations(),
    ]);
    
    return {
      departments,
      designations,
      masters: [...departments, ...designations].map(item => ({
        id: item.id,
        name: item.name,
        status: item.status,
        type: item.type,
        note: item.note,
      })),
    };
  } catch (error) {
    console.error('Error loading master data:', error);
    return {
      departments: [],
      designations: [],
      masters: [],
    };
  }
}