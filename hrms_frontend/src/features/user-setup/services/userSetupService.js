import { employeeAPI } from '../../../services/api';
import { ROLES } from '../../../app/config/roles';

// Fallback data (kept for compatibility during transition)
import { userSetupAddresses, userSetupDocuments, userSetupUsers } from '../data/userSetupData';

const USER_KEY = 'hrms_user_setup_users';
const DOCUMENT_KEY = 'hrms_user_setup_documents';
const ADDRESS_KEY = 'hrms_user_setup_addresses';

// Helper function to map backend role to frontend ROLES constant
function mapBackendRoleToFrontend(backendRoleName) {
  const roleMap = {
    'Super Admin': ROLES.SUPER_ADMIN,
    'Sub Admin': ROLES.SUB_ADMIN,
    'Company Admin': ROLES.COMPANY_ADMIN,
    'HR Manager': ROLES.HR_MANAGER,
    'HR Executive': ROLES.HR_EXECUTIVE,
    'Team Lead': ROLES.TEAM_LEAD,
    'Employee': ROLES.EMPLOYEE,
  };
  
  return roleMap[backendRoleName] || ROLES.EMPLOYEE;
}

// Transform backend employee data to frontend user setup format
function transformBackendEmployeeToUserSetup(employee) {
  // Get primary role from roles array
  const primaryRole = employee.roles && employee.roles.length > 0 
    ? mapBackendRoleToFrontend(employee.roles[0])
    : ROLES.EMPLOYEE;
  
  // Create a userType mapping based on role
  const roleToUserType = {
    [ROLES.SUPER_ADMIN]: '1',
    [ROLES.SUB_ADMIN]: '2',
    [ROLES.COMPANY_ADMIN]: '3',
    [ROLES.HR_MANAGER]: '4',
    [ROLES.HR_EXECUTIVE]: '5',
    [ROLES.TEAM_LEAD]: '6',
    [ROLES.EMPLOYEE]: '7',
  };
  
  return {
    id: `u-${employee.id.padStart(3, '0')}`, // Convert numeric ID to string like 'u-001'
    fullName: employee.name || `${employee.firstName} ${employee.lastName}`.trim(),
    email: employee.email || '',
    contact: employee.phone || '',
    altContact: '',
    userName: employee.email?.split('@')[0] || '',
    password: '******',
    userType: roleToUserType[primaryRole] || '7',
    gender: '',
    profileImage: '',
    companyName: 'HRMS Company', // TODO: Get from company data
    companyLogo: '',
    packageId: 'pkg-01',
    bioDetails: '',
    locationId: 'loc-01',
    companyTypeId: 'ct-01',
    empCode: employee.employeeCode || `EMP-${employee.id}`,
    depDesigId: employee.designationId || 'des-01',
    dobOrCompanyStartDate: '',
    bloodGroup: '',
    joiningDate: employee.joinDate || '',
    leavingDate: employee.leftAt || '',
    bannerImage: '',
    status: employee.status === 'active' ? 'Active' : 'Inactive',
    role: primaryRole,
    parentUser: '-',
    createdDate: employee.createdAt ? new Date(employee.createdAt).toISOString().split('T')[0] : '2026-04-01',
    updatedDate: new Date().toISOString().split('T')[0],
  };
}

// Transform backend document data to frontend format
function transformBackendDocumentToUserSetup(document, userId) {
  // Map document type names
  const docTypeMap = {
    'Aadhaar Card': 'adhar',
    'PAN Card': 'pan',
    'Passport': 'passport',
    'Driving Licence': 'driving',
    '10th Marksheet': 'education',
    '12th Marksheet': 'education',
    'Degree Certificate': 'education',
    'Offer Letter': 'employment',
    'Relieving Letter': 'employment',
    'Experience Letter': 'employment',
  };
  
  const docType = docTypeMap[document.documentType] || 'other';
  const docName = document.documentType || 'Document';
  
  return {
    id: `doc-${document.id}`,
    userId: userId,
    documentType: docType,
    docName: docName,
    attachment: document.fileName || 'document.pdf',
    date: document.issuedDate || document.uploadedAt?.split('T')[0] || '2026-04-01',
    status: document.verified ? 'Verified' : 'Pending',
  };
}

// Transform backend profile address data to frontend format
function transformBackendProfileToAddresses(employeeProfile, userId) {
  const addresses = [];
  
  if (employeeProfile.address_line1 || employeeProfile.city || employeeProfile.state) {
    addresses.push({
      id: `addr-${userId}-present`,
      userId: userId,
      address1: employeeProfile.address_line1 || '',
      address2: employeeProfile.address_line2 || '',
      addressType: 'present',
      locationId: 'loc-01',
      pin: employeeProfile.postal_code || '',
      status: 'Active',
      createdDate: '2026-04-01',
      updatedDate: new Date().toISOString().split('T')[0],
    });
  }
  
  // For permanent address, we could duplicate or leave empty
  // Since database doesn't have separate permanent address, we'll create an empty one
  addresses.push({
    id: `addr-${userId}-permanent`,
    userId: userId,
    address1: '',
    address2: '',
    addressType: 'permanent',
    locationId: 'loc-01',
    pin: '',
    status: 'Active',
    createdDate: '2026-04-01',
    updatedDate: new Date().toISOString().split('T')[0],
  });
  
  return addresses;
}

// API-based functions
export async function loadUserSetupUsers() {
  try {
    const response = await employeeAPI.getAll();
    const employees = response.data || [];
    
    // Transform backend employees to frontend user setup format
    const users = employees.map(employee => transformBackendEmployeeToUserSetup(employee));
    
    // Fallback to localStorage if API returns empty
    if (users.length === 0) {
      const stored = readStorage(USER_KEY, userSetupUsers);
      return stored;
    }
    
    return users;
  } catch (error) {
    console.error('Error loading users from API:', error);
    // Fallback to localStorage
    return readStorage(USER_KEY, userSetupUsers);
  }
}

/**
 * Transform frontend user setup format to backend employee format
 */
function transformUserSetupToBackendEmployee(user) {
  // Extract first and last name from fullName
  const nameParts = user.fullName?.split(' ') || ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  // Map frontend role to backend role IDs
  // This is a simplified mapping - in a real app, we'd need to fetch role IDs from the backend
  const roleIdMap = {
    [ROLES.SUPER_ADMIN]: '1', // Assuming role ID 1 is super-admin
    [ROLES.SUB_ADMIN]: '2',   // Assuming role ID 2 is sub-admin
    [ROLES.COMPANY_ADMIN]: '3', // Assuming role ID 3 is company-admin
    [ROLES.HR_MANAGER]: '4',    // Assuming role ID 4 is hr-manager
    [ROLES.HR_EXECUTIVE]: '5',  // Assuming role ID 5 is hr-executive
    [ROLES.EMPLOYEE]: '6',      // Assuming role ID 6 is employee
  };
  
  const roleIds = user.role ? [roleIdMap[user.role] || '6'] : ['6'];
  
  return {
    email: user.email || '',
    firstName: firstName,
    lastName: lastName,
    phone: user.contact || '',
    personalPhone: user.altContact || '',
    employeeCode: user.empCode || '',
    status: user.status === 'Active' ? 'active' : 'inactive',
    joinDate: user.joiningDate || new Date().toISOString().split('T')[0],
    dob: user.dobOrCompanyStartDate || null,
    gender: user.gender?.toLowerCase() || null,
    bloodGroup: user.bloodGroup || null,
    personalEmail: user.email || '', // Using same as work email for now
    addressLine1: '', // Not available in user setup
    city: '', // Not available in user setup
    state: '', // Not available in user setup
    country: '', // Not available in user setup
    postalCode: '', // Not available in user setup
    roleIds: roleIds,
    // Note: departmentId, designationId, managerId would need to be mapped from depDesigId
    // For now, we'll leave them null
    departmentId: null,
    designationId: null,
    managerId: null,
    employmentType: 'full-time',
    workLocation: user.locationId || null,
    isActive: user.status === 'Active',
  };
}

export async function saveUserSetupUsers(users) {
  try {
    let successCount = 0;
    let errorCount = 0;
    
    // Process each user
    for (const user of users) {
      try {
        const backendData = transformUserSetupToBackendEmployee(user);
        
        // Check if user has an ID that indicates it exists in backend
        // Frontend IDs like 'u-001' need to be mapped to backend IDs
        // u-001, u-002, etc. are existing users with synthetic IDs
        // Plain numeric IDs are also existing users
        let backendId = null;
        let isNewUser = true;
        
        if (user.id) {
          if (user.id.startsWith('u-')) {
            // Extract numeric part from synthetic ID (e.g., '001' from 'u-001')
            const numericPart = user.id.substring(2); // Remove 'u-'
            const parsedId = parseInt(numericPart, 10);
            if (!isNaN(parsedId)) {
              backendId = parsedId.toString();
              isNewUser = false;
            }
          } else if (!isNaN(parseInt(user.id, 10))) {
            // Already a numeric ID
            backendId = user.id;
            isNewUser = false;
          }
        }
        
        if (isNewUser) {
          // Create new employee
          await employeeAPI.create(backendData);
          console.log(`Created new employee: ${user.fullName}`);
        } else {
          // Update existing employee
          await employeeAPI.update(backendId, backendData);
          console.log(`Updated employee ${backendId}: ${user.fullName}`);
        }
        
        successCount++;
      } catch (userError) {
        console.error(`Error saving user ${user.id || user.fullName}:`, userError);
        errorCount++;
      }
    }
    
    // Also store in localStorage as a fallback/cache
    writeStorage(USER_KEY, users);
    
    console.log(`User save completed: ${successCount} successful, ${errorCount} failed`);
    
    return successCount > 0 || errorCount === 0; // Return true if at least one succeeded or all were skipped
  } catch (error) {
    console.error('Error saving users:', error);
    // Fallback to localStorage
    writeStorage(USER_KEY, users);
    return false;
  }
}

export async function loadUserSetupDocuments() {
  try {
    const response = await employeeAPI.getAll();
    const employees = response.data || [];
    
    // Collect all documents from all employees
    const allDocuments = [];
    
    employees.forEach(employee => {
      if (employee.documents && Array.isArray(employee.documents)) {
        const userId = `u-${employee.id.padStart(3, '0')}`;
        employee.documents.forEach(doc => {
          allDocuments.push(transformBackendDocumentToUserSetup(doc, userId));
        });
      }
    });
    
    // Fallback to localStorage if API returns empty
    if (allDocuments.length === 0) {
      const stored = readStorage(DOCUMENT_KEY, userSetupDocuments);
      return stored;
    }
    
    return allDocuments;
  } catch (error) {
    console.error('Error loading documents from API:', error);
    // Fallback to localStorage
    return readStorage(DOCUMENT_KEY, userSetupDocuments);
  }
}

/**
 * Transform frontend document format to backend document format
 */
function transformUserSetupDocumentToBackend(document) {
  // Map frontend document type to backend document type ID
  // This is a simplified mapping - in a real app, we'd need to fetch document type IDs from the backend
  const docTypeMap = {
    'PAN Card': '1',
    'Aadhaar Card': '2',
    'Passport': '3',
    'Driving License': '4',
    'Voter ID': '5',
    'Bank Passbook': '6',
    'Salary Slip': '7',
    'Form 16': '8',
    'Appointment Letter': '9',
    'Experience Certificate': '10',
  };
  
  return {
    documentTypeId: docTypeMap[document.documentType] || '1',
    documentNumber: document.documentNumber || '',
    fileUrl: document.fileUrl || '',
    fileName: document.fileName || document.documentType || 'document',
    verified: document.verified === 'Yes',
    verificationDate: document.verificationDate || null,
    verifiedBy: document.verifiedBy || null,
    expiryDate: document.expiryDate || null,
    remarks: document.remarks || '',
  };
}

export async function saveUserSetupDocuments(documents) {
  try {
    // Group documents by user ID
    const documentsByUser = {};
    
    documents.forEach(doc => {
      if (!doc.userId) return;
      
      if (!documentsByUser[doc.userId]) {
        documentsByUser[doc.userId] = [];
      }
      documentsByUser[doc.userId].push(doc);
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process documents for each user
    for (const [userId, userDocs] of Object.entries(documentsByUser)) {
      try {
        // Extract the numeric part from userId (e.g., 'u-001' -> 1)
        // Use same logic as saveUserSetupUsers for consistency
        let employeeId = userId;
        if (userId.startsWith('u-')) {
          const numericPart = userId.substring(2); // Remove 'u-'
          const parsedId = parseInt(numericPart, 10);
          if (!isNaN(parsedId)) {
            employeeId = parsedId.toString();
          }
        }
        
        // Transform documents to backend format
        const backendDocuments = userDocs.map(transformUserSetupDocumentToBackend);
        
        // Try to update employee with documents
        // Note: The backend may not support documents field yet, but we're establishing the pattern
        await employeeAPI.update(employeeId, {
          documents: backendDocuments
        });
        
        console.log(`Saved ${userDocs.length} documents for user ${userId}`);
        successCount++;
      } catch (userError) {
        console.error(`Error saving documents for user ${userId}:`, userError);
        errorCount++;
      }
    }
    
    // Also store in localStorage as a fallback/cache
    writeStorage(DOCUMENT_KEY, documents);
    
    console.log(`Document save completed: ${successCount} users successful, ${errorCount} users failed`);
    
    return successCount > 0 || errorCount === 0; // Return true if at least one succeeded or all were skipped
  } catch (error) {
    console.error('Error saving documents:', error);
    // Fallback to localStorage
    writeStorage(DOCUMENT_KEY, documents);
    return false;
  }
}

export async function loadUserSetupAddresses() {
  try {
    const response = await employeeAPI.getAll();
    const employees = response.data || [];
    
    // Collect all addresses from all employee profiles
    const allAddresses = [];
    
    employees.forEach(employee => {
      if (employee.profile) {
        const userId = `u-${employee.id.padStart(3, '0')}`;
        const addresses = transformBackendProfileToAddresses(employee.profile, userId);
        allAddresses.push(...addresses);
      }
    });
    
    // Fallback to localStorage if API returns empty
    if (allAddresses.length === 0) {
      const stored = readStorage(ADDRESS_KEY, userSetupAddresses);
      return stored;
    }
    
    return allAddresses;
  } catch (error) {
    console.error('Error loading addresses from API:', error);
    // Fallback to localStorage
    return readStorage(ADDRESS_KEY, userSetupAddresses);
  }
}

/**
 * Transform frontend address format to backend address fields
 */
function transformUserSetupAddressToBackend(address) {
  // We'll use the 'present' address for backend storage
  // If addressType is 'permanent', we might need to handle it differently
  // For now, we'll only process 'present' addresses
  if (address.addressType !== 'present') {
    return null;
  }
  
  return {
    addressLine1: address.address1 || '',
    addressLine2: address.address2 || '',
    city: address.city || '',
    state: address.state || '',
    country: address.country || '',
    postalCode: address.pin || '',
  };
}

export async function saveUserSetupAddresses(addresses) {
  try {
    // Group addresses by user ID
    const addressesByUser = {};
    
    addresses.forEach(addr => {
      if (!addr.userId) return;
      
      if (!addressesByUser[addr.userId]) {
        addressesByUser[addr.userId] = [];
      }
      addressesByUser[addr.userId].push(addr);
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process addresses for each user
    for (const [userId, userAddresses] of Object.entries(addressesByUser)) {
      try {
        // Extract the numeric part from userId (e.g., 'u-001' -> '001')
        const userIdMatch = userId.match(/u-(\d+)/);
        const employeeId = userIdMatch ? userIdMatch[1] : userId;
        
        // Find the 'present' address (or use the first address if no present address)
        const presentAddress = userAddresses.find(addr => addr.addressType === 'present') || userAddresses[0];
        
        if (!presentAddress) {
          console.log(`No address found for user ${userId}`);
          continue;
        }
        
        // Transform address to backend format
        const backendAddress = transformUserSetupAddressToBackend(presentAddress);
        
        if (!backendAddress) {
          console.log(`Skipping non-present address for user ${userId}`);
          continue;
        }
        
        // Update employee with address data
        await employeeAPI.update(employeeId, backendAddress);
        
        console.log(`Saved address for user ${userId}`);
        successCount++;
      } catch (userError) {
        console.error(`Error saving address for user ${userId}:`, userError);
        errorCount++;
      }
    }
    
    // Also store in localStorage as a fallback/cache
    writeStorage(ADDRESS_KEY, addresses);
    
    console.log(`Address save completed: ${successCount} users successful, ${errorCount} users failed`);
    
    return successCount > 0 || errorCount === 0; // Return true if at least one succeeded or all were skipped
  } catch (error) {
    console.error('Error saving addresses:', error);
    // Fallback to localStorage
    writeStorage(ADDRESS_KEY, addresses);
    return false;
  }
}

// Keep localStorage functions for backward compatibility
function readStorage(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}
