export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  COMPANY_ADMIN: 'company-admin',
  EMPLOYEE: 'employee',
  // Legacy role constants kept so older code paths still compile.
  SUB_ADMIN: 'sub-admin',
  HR_MANAGER: 'hr-manager',
  HR_EXECUTIVE: 'hr-executive',
  MANAGER: 'manager',
};

export const ACTIVE_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.COMPANY_ADMIN,
  ROLES.EMPLOYEE,
];

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.COMPANY_ADMIN]: 'Company Admin',
  [ROLES.EMPLOYEE]: 'Employee',
};

export const ROLE_ORDER = [
  ROLES.SUPER_ADMIN,
  ROLES.COMPANY_ADMIN,
  ROLES.EMPLOYEE,
];

const LEGACY_ROLE_ALIASES = {
  [ROLES.SUB_ADMIN]: ROLES.COMPANY_ADMIN,
  [ROLES.HR_MANAGER]: ROLES.COMPANY_ADMIN,
  [ROLES.HR_EXECUTIVE]: ROLES.COMPANY_ADMIN,
  [ROLES.MANAGER]: ROLES.COMPANY_ADMIN,
  admin: ROLES.COMPANY_ADMIN,
  hr: ROLES.COMPANY_ADMIN,
  user: ROLES.EMPLOYEE,
};

export function normalizeRole(role) {
  if (!role) {
    return ROLES.EMPLOYEE;
  }

  const normalized = String(role).toLowerCase();

  if (ACTIVE_ROLES.includes(normalized)) {
    return normalized;
  }

  return LEGACY_ROLE_ALIASES[normalized] || ROLES.EMPLOYEE;
}
