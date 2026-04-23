import { ROLES } from '../../../app/config/roles';

export const userSetupTabLabels = {
  overview: 'Overview',
  users: 'User List',
  create: 'Create / Edit User',
  documents: 'Documents',
  address: 'Address',
};

export function getUserSetupSectionTitle(tab, isEditing = false, role = ROLES.EMPLOYEE) {
  if (role === ROLES.COMPANY_ADMIN) {
    const companyAdminLabels = {
      overview: 'Employee Management',
      users: 'Employee List',
      create: isEditing ? 'Edit Employee' : 'Create Employee',
      documents: 'Employee Documents',
      address: 'Employee Address',
    };

    return companyAdminLabels[tab] || 'Employee Management';
  }

  if (role === ROLES.HR) {
    const hrLabels = {
      overview: 'HR Management',
      users: 'Employee Directory',
      create: isEditing ? 'Edit Employee' : 'Create Employee',
      documents: 'Employee Documents',
      address: 'Employee Address',
    };

    return hrLabels[tab] || 'HR Management';
  }

  if (role === ROLES.MANAGER) {
    const managerLabels = {
      overview: 'Manager Workspace',
      users: 'Team Directory',
      create: isEditing ? 'Edit Team Member' : 'Create Team Member',
      documents: 'Team Documents',
      address: 'Team Address',
    };

    return managerLabels[tab] || 'Manager Workspace';
  }

  if (tab === 'create') {
    return isEditing ? 'Edit User' : 'Create User';
  }

  return userSetupTabLabels[tab] || 'Overview';
}

export function createEmptyUser(role = ROLES.EMPLOYEE, parentUser = '') {
  return {
    fullName: '',
    email: '',
    contact: '',
    altContact: '',
    userName: '',
    password: '',
    userType: '5',
    gender: 'Male',
    profileImage: '',
    companyName: '',
    companyLogo: '',
    packageId: 'pkg-01',
    bioDetails: '',
    locationId: 'loc-01',
    businessTypeId: 'bt-01',
    companyTypeId: 'ct-01',
    empCode: '',
    depDesigId: 'des-04',
    dobOrCompanyStartDate: '',
    bloodGroup: 'B+',
    joiningDate: '',
    bannerImage: '',
    status: 'Active',
    role,
    parentUser,
  };
}

export function createEmptyDocument(userId = '') {
  return {
    userId,
    documentType: 'adhar',
    docName: '',
    attachment: '',
    date: '',
    status: 'Pending',
  };
}

export function getDocumentNumberLabel(documentType) {
  switch (documentType) {
    case 'adhar':
      return 'Aadhar Number';
    case 'pan':
      return 'PAN Number';
    case 'company-pan':
      return 'Company PAN Number';
    case 'gst':
      return 'GST Number';
    default:
      return 'Document Number';
  }
}

export function getDocumentNumberPlaceholder(documentType) {
  switch (documentType) {
    case 'adhar':
      return 'Enter Aadhar number';
    case 'pan':
      return 'Enter PAN number';
    case 'company-pan':
      return 'Enter Company PAN number';
    case 'gst':
      return 'Enter GST number';
    default:
      return 'Enter document number';
  }
}

export function createEmptyAddress(userId = '') {
  return {
    userId,
    permanent: {
      address1: '',
      address2: '',
      city: '',
      state: '',
      pin: '',
    },
    present: {
      address1: '',
      address2: '',
      city: '',
      state: '',
      pin: '',
    },
  };
}

export function createEmptyEducation(userId = '') {
  return {
    userId,
    degreeName: '',
    instituteName: '',
    result: '',
    passingYear: '',
    attachment: '',
  };
}

export function createEmptyExperience(userId = '') {
  return {
    userId,
    companyName: '',
    position: '',
    address: '',
    workingDuration: '',
    attachment: '',
  };
}

export function createEmptyBankAccount(userId = '') {
  return {
    userId,
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    attachment: '',
  };
}

export function createEmptySalary(userId = '') {
  return {
    userId,
    salaryType: 'Hourly',
    totalSalary: '',
    basic: '',
    houseRent: '',
    medical: '',
    conveyance: '',
    bima: '',
    tax: '',
    providentFund: '',
    others: '',
  };
}

export const validateEmail = (value) => /^\S+@\S+\.\S+$/.test(value.trim());
export const validateContact = (value) => /^[0-9]{10}$/.test(value.trim());

export function validateUserForm(form, visibility) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!validateEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (!form.contact.trim()) errors.contact = 'Contact number is required.';
  else if (!validateContact(form.contact)) errors.contact = 'Enter a 10-digit mobile number.';
  if (!form.userName.trim()) errors.userName = 'Username is required.';
  if (!form.password.trim()) errors.password = 'Password is required.';
  if (!form.gender) errors.gender = 'Gender is required.';
  if (visibility.login && !form.userType) errors.userType = 'User type is required.';
  return errors;
}

export function validateDocumentForm(form) {
  const errors = {};
  if (!form.documentType) errors.documentType = 'Document type is required.';
  if (!form.docName.trim()) errors.docName = `${getDocumentNumberLabel(form.documentType)} is required.`;
  if (!form.attachment.trim()) errors.attachment = 'Attachment is required.';
  return errors;
}

export function validateAddressForm(form) {
  const errors = {};
  if (!form.permanent.address1.trim()) errors.permanentAddress1 = 'Permanent address line 1 is required.';
  if (!form.permanent.city.trim()) errors.permanentCity = 'Permanent city is required.';
  if (!form.permanent.state.trim()) errors.permanentState = 'Permanent state is required.';
  if (!form.permanent.pin.trim()) errors.permanentPin = 'Permanent PIN is required.';
  if (!form.present.address1.trim()) errors.presentAddress1 = 'Present address line 1 is required.';
  if (!form.present.city.trim()) errors.presentCity = 'Present city is required.';
  if (!form.present.state.trim()) errors.presentState = 'Present state is required.';
  if (!form.present.pin.trim()) errors.presentPin = 'Present PIN is required.';
  return errors;
}

export function getRoleDescription(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return 'Full access to users, companies, packages, masters, and permissions.';
    case ROLES.SUB_ADMIN:
      return 'Controlled access for user management and permission review.';
    case ROLES.COMPANY_ADMIN:
      return 'Company-wide employee setup with operational controls.';
    case ROLES.HR:
      return 'HR-focused profile management with documents and address records.';
    case ROLES.MANAGER:
      return 'Team-focused workspace for project leaders and approvals.';
    default:
      return 'Self-service profile access with personal information updates.';
  }
}

export function getRoleActionLabel(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return 'Full access';
    case ROLES.MANAGER:
      return 'Team lead access';
    case ROLES.EMPLOYEE:
      return 'Self service';
    default:
      return 'Controlled access';
  }
}

export function buildNextId(prefix) {
  return `${prefix}-${String(Date.now()).slice(-5)}`;
}
