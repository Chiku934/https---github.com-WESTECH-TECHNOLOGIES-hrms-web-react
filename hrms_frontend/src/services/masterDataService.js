import { departmentAPI, designationAPI } from './api';

// Storage keys for fallback
const DEPARTMENT_STORAGE_KEY = 'hrms_departments';
const DESIGNATION_STORAGE_KEY = 'hrms_designations';

// Default static data for fallback
const defaultDepartments = [
  { id: '1', name: 'React development', status: 'Active' },
  { id: '2', name: 'Php Development', status: 'Active' },
  { id: '3', name: 'Finance Department', status: 'Active' },
  { id: '4', name: 'Php Development', status: 'Active' },
  { id: '5', name: 'IT Department', status: 'Draft' },
];

const defaultDesignations = [
  { id: '1', name: 'Sr PHP Developer', status: 'Active' },
  { id: '2', name: 'Jr Php Developer', status: 'Active' },
  { id: '3', name: 'React Developer', status: 'Active' },
  { id: '4', name: 'Intern', status: 'Draft' },
  { id: '5', name: 'Mobile App Developer', status: 'Active' },
  { id: '6', name: 'Accountant', status: 'Active' },
  { id: '7', name: 'Node Developer', status: 'Active' },
  { id: '8', name: 'Networking', status: 'Active' },
  { id: '9', name: 'Manager', status: 'Active' },
];

// Helper functions for localStorage fallback
function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
  }
  return fallback;
}

function writeStorage(key, value) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage for key ${key}:`, error);
    }
  }
}

// Transformation functions
function transformBackendDepartmentToFrontend(department) {
  return {
    id: department.id,
    name: department.name,
    code: department.code || `DEP-${department.id.slice(-3)}`,
    status: 'Active', // Default status since backend doesn't have status field
    type: 'Department',
    note: department.head?.user?.name ? `Head: ${department.head.user.name}` : 'Department',
    employeeCount: department.employeeCount || 0,
    childrenCount: department.childrenCount || 0,
  };
}

function transformBackendDesignationToFrontend(designation) {
  return {
    id: designation.id,
    name: designation.title,
    code: `DES-${designation.id.slice(-3)}`,
    status: 'Active', // Default status since backend doesn't have status field
    type: 'Designation',
    note: `Level ${designation.level}`,
    employeeCount: designation.employeeCount || 0,
  };
}

function transformFrontendDepartmentToBackend(department) {
  return {
    name: department.name,
    code: department.code.replace('DEP-', ''),
    // Note: status is not a field in backend department model
    // We'll need to handle active/inactive differently if needed
  };
}

function transformFrontendDesignationToBackend(designation) {
  return {
    title: designation.name,
    level: parseInt(designation.note?.replace('Level ', '') || '1'),
    // Note: status is not a field in backend designation model
  };
}

// Department API functions
export async function loadDepartments() {
  try {
    const response = await departmentAPI.getAll();
    const departments = response.data?.data || [];
    
    if (departments.length === 0) {
      const stored = readStorage(DEPARTMENT_STORAGE_KEY, defaultDepartments);
      return stored;
    }
    
    const transformed = departments.map(transformBackendDepartmentToFrontend);
    writeStorage(DEPARTMENT_STORAGE_KEY, transformed);
    return transformed;
  } catch (error) {
    console.error('Error loading departments from API:', error);
    return readStorage(DEPARTMENT_STORAGE_KEY, defaultDepartments);
  }
}

export async function saveDepartments(departments) {
  try {
    // For now, we'll save to localStorage as fallback
    // In a real implementation, we would make API calls for each department
    writeStorage(DEPARTMENT_STORAGE_KEY, departments);
    
    // Note: In a real app, we would need to:
    // 1. Check which departments are new (create via POST)
    // 2. Check which departments exist (update via PUT)
    // 3. Check which departments were deleted (delete via DELETE)
    // For simplicity, we're just saving to localStorage
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
    
    if (response.data?.status === 'success') {
      const newDepartment = transformBackendDepartmentToFrontend(response.data.data);
      
      // Update local storage
      const currentDepartments = readStorage(DEPARTMENT_STORAGE_KEY, defaultDepartments);
      const updatedDepartments = [...currentDepartments, newDepartment];
      writeStorage(DEPARTMENT_STORAGE_KEY, updatedDepartments);
      
      return { success: true, data: newDepartment };
    }
    return { success: false, message: response.data?.message || 'Failed to create department' };
  } catch (error) {
    console.error('Error creating department:', error);
    
    // Fallback: add to localStorage with a temporary ID
    const tempId = `temp-${Date.now()}`;
    const newDepartment = {
      ...departmentData,
      id: tempId,
      code: departmentData.code || `DEP-${tempId.slice(-6)}`,
    };
    
    const currentDepartments = readStorage(DEPARTMENT_STORAGE_KEY, defaultDepartments);
    const updatedDepartments = [...currentDepartments, newDepartment];
    writeStorage(DEPARTMENT_STORAGE_KEY, updatedDepartments);
    
    return { success: true, data: newDepartment, isLocal: true };
  }
}

export async function updateDepartment(id, departmentData) {
  try {
    const backendData = transformFrontendDepartmentToBackend(departmentData);
    const response = await departmentAPI.update(id, backendData);
    
    if (response.data?.status === 'success') {
      const updatedDepartment = transformBackendDepartmentToFrontend(response.data.data);
      
      // Update local storage
      const currentDepartments = readStorage(DEPARTMENT_STORAGE_KEY, defaultDepartments);
      const updatedDepartments = currentDepartments.map(dept => 
        dept.id === id ? updatedDepartment : dept
      );
      writeStorage(DEPARTMENT_STORAGE_KEY, updatedDepartments);
      
      return { success: true, data: updatedDepartment };
    }
    return { success: false, message: response.data?.message || 'Failed to update department' };
  } catch (error) {
    console.error('Error updating department:', error);
    
    // Fallback: update in localStorage
    const currentDepartments = readStorage(DEPARTMENT_STORAGE_KEY, defaultDepartments);
    const updatedDepartments = currentDepartments.map(dept => 
      dept.id === id ? { ...dept, ...departmentData } : dept
    );
    writeStorage(DEPARTMENT_STORAGE_KEY, updatedDepartments);
    
    return { success: true, data: { ...departmentData, id }, isLocal: true };
  }
}

export async function deleteDepartment(id) {
  try {
    const response = await departmentAPI.delete(id);
    
    if (response.data?.status === 'success') {
      // Update local storage
      const currentDepartments = readStorage(DEPARTMENT_STORAGE_KEY, defaultDepartments);
      const updatedDepartments = currentDepartments.filter(dept => dept.id !== id);
      writeStorage(DEPARTMENT_STORAGE_KEY, updatedDepartments);
      
      return { success: true };
    }
    return { success: false, message: response.data?.message || 'Failed to delete department' };
  } catch (error) {
    console.error('Error deleting department:', error);
    
    // Fallback: remove from localStorage
    const currentDepartments = readStorage(DEPARTMENT_STORAGE_KEY, defaultDepartments);
    const updatedDepartments = currentDepartments.filter(dept => dept.id !== id);
    writeStorage(DEPARTMENT_STORAGE_KEY, updatedDepartments);
    
    return { success: true, isLocal: true };
  }
}

// Designation API functions
export async function loadDesignations() {
  try {
    const response = await designationAPI.getAll();
    const designations = response.data?.data || [];
    
    if (designations.length === 0) {
      const stored = readStorage(DESIGNATION_STORAGE_KEY, defaultDesignations);
      return stored;
    }
    
    const transformed = designations.map(transformBackendDesignationToFrontend);
    writeStorage(DESIGNATION_STORAGE_KEY, transformed);
    return transformed;
  } catch (error) {
    console.error('Error loading designations from API:', error);
    return readStorage(DESIGNATION_STORAGE_KEY, defaultDesignations);
  }
}

export async function saveDesignations(designations) {
  try {
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
    
    if (response.data?.status === 'success') {
      const newDesignation = transformBackendDesignationToFrontend(response.data.data);
      
      // Update local storage
      const currentDesignations = readStorage(DESIGNATION_STORAGE_KEY, defaultDesignations);
      const updatedDesignations = [...currentDesignations, newDesignation];
      writeStorage(DESIGNATION_STORAGE_KEY, updatedDesignations);
      
      return { success: true, data: newDesignation };
    }
    return { success: false, message: response.data?.message || 'Failed to create designation' };
  } catch (error) {
    console.error('Error creating designation:', error);
    
    // Fallback: add to localStorage with a temporary ID
    const tempId = `temp-${Date.now()}`;
    const newDesignation = {
      ...designationData,
      id: tempId,
      code: designationData.code || `DES-${tempId.slice(-6)}`,
    };
    
    const currentDesignations = readStorage(DESIGNATION_STORAGE_KEY, defaultDesignations);
    const updatedDesignations = [...currentDesignations, newDesignation];
    writeStorage(DESIGNATION_STORAGE_KEY, updatedDesignations);
    
    return { success: true, data: newDesignation, isLocal: true };
  }
}

export async function updateDesignation(id, designationData) {
  try {
    const backendData = transformFrontendDesignationToBackend(designationData);
    const response = await designationAPI.update(id, backendData);
    
    if (response.data?.status === 'success') {
      const updatedDesignation = transformBackendDesignationToFrontend(response.data.data);
      
      // Update local storage
      const currentDesignations = readStorage(DESIGNATION_STORAGE_KEY, defaultDesignations);
      const updatedDesignations = currentDesignations.map(des => 
        des.id === id ? updatedDesignation : des
      );
      writeStorage(DESIGNATION_STORAGE_KEY, updatedDesignations);
      
      return { success: true, data: updatedDesignation };
    }
    return { success: false, message: response.data?.message || 'Failed to update designation' };
  } catch (error) {
    console.error('Error updating designation:', error);
    
    // Fallback: update in localStorage
    const currentDesignations = readStorage(DESIGNATION_STORAGE_KEY, defaultDesignations);
    const updatedDesignations = currentDesignations.map(des => 
      des.id === id ? { ...des, ...designationData } : des
    );
    writeStorage(DESIGNATION_STORAGE_KEY, updatedDesignations);
    
    return { success: true, data: { ...designationData, id }, isLocal: true };
  }
}

export async function deleteDesignation(id) {
  try {
    const response = await designationAPI.delete(id);
    
    if (response.data?.status === 'success') {
      // Update local storage
      const currentDesignations = readStorage(DESIGNATION_STORAGE_KEY, defaultDesignations);
      const updatedDesignations = currentDesignations.filter(des => des.id !== id);
      writeStorage(DESIGNATION_STORAGE_KEY, updatedDesignations);
      
      return { success: true };
    }
    return { success: false, message: response.data?.message || 'Failed to delete designation' };
  } catch (error) {
    console.error('Error deleting designation:', error);
    
    // Fallback: remove from localStorage
    const currentDesignations = readStorage(DESIGNATION_STORAGE_KEY, defaultDesignations);
    const updatedDesignations = currentDesignations.filter(des => des.id !== id);
    writeStorage(DESIGNATION_STORAGE_KEY, updatedDesignations);
    
    return { success: true, isLocal: true };
  }
}

// Combined master data functions (for screens that show both departments and designations)
export async function loadMasterData() {
  try {
    const [departments, designations] = await Promise.all([
      loadDepartments(),
      loadDesignations()
    ]);
    
    return {
      departments,
      designations,
      masters: [...departments, ...designations].map(item => ({
        ...item,
        type: item.type || (item.code?.startsWith('DEP-') ? 'Department' : 'Designation'),
        note: item.note || (item.type === 'Department' ? 'Department' : 'Designation')
      }))
    };
  } catch (error) {
    console.error('Error loading master data:', error);
    const departments = readStorage(DEPARTMENT_STORAGE_KEY, defaultDepartments);
    const designations = readStorage(DESIGNATION_STORAGE_KEY, defaultDesignations);
    
    return {
      departments,
      designations,
      masters: [...departments, ...designations].map(item => ({
        ...item,
        type: item.type || (item.code?.startsWith('DEP-') ? 'Department' : 'Designation'),
        note: item.note || (item.type === 'Department' ? 'Department' : 'Designation')
      }))
    };
  }
}