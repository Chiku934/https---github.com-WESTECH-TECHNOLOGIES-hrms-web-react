export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  SUB_ADMIN: 'sub-admin',
  COMPANY_ADMIN: 'company-admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.SUB_ADMIN]: 'Sub Admin',
  [ROLES.COMPANY_ADMIN]: 'Company Admin',
  [ROLES.HR]: 'HR',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.EMPLOYEE]: 'Employee',
};

export const ROLE_ORDER = [
  ROLES.SUPER_ADMIN,
  ROLES.SUB_ADMIN,
  ROLES.COMPANY_ADMIN,
  ROLES.HR,
  ROLES.MANAGER,
  ROLES.EMPLOYEE,
];
