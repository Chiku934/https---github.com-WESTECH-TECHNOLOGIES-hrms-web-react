export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  COMPANY_ADMIN: 'company-admin',
  EMPLOYEE: 'employee',
};

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
  'sub-admin': ROLES.COMPANY_ADMIN,
  'hr-manager': ROLES.COMPANY_ADMIN,
  'hr-executive': ROLES.COMPANY_ADMIN,
  manager: ROLES.COMPANY_ADMIN,
  admin: ROLES.COMPANY_ADMIN,
  hr: ROLES.COMPANY_ADMIN,
  user: ROLES.EMPLOYEE,
};

export function normalizeRole(role) {
  if (!role) {
    return ROLES.EMPLOYEE;
  }

  const normalized = String(role).toLowerCase();

  if ([ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.EMPLOYEE].includes(normalized)) {
    return normalized;
  }

  return LEGACY_ROLE_ALIASES[normalized] || ROLES.EMPLOYEE;
}
