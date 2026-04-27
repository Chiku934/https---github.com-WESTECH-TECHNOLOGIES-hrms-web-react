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
  // Add variations for super admin
  'super admin': ROLES.SUPER_ADMIN,
  'superadmin': ROLES.SUPER_ADMIN,
  'super administrator': ROLES.SUPER_ADMIN,
  'super-administrator': ROLES.SUPER_ADMIN,
  'super_administrator': ROLES.SUPER_ADMIN,
  'sa': ROLES.SUPER_ADMIN,
  'super': ROLES.SUPER_ADMIN,
  // Add variations for company admin
  'company admin': ROLES.COMPANY_ADMIN,
  'companyadmin': ROLES.COMPANY_ADMIN,
  'company administrator': ROLES.COMPANY_ADMIN,
  'company-administrator': ROLES.COMPANY_ADMIN,
  'company_administrator': ROLES.COMPANY_ADMIN,
  'ca': ROLES.COMPANY_ADMIN,
  'company': ROLES.COMPANY_ADMIN,
  // Add other admin variations
  'administrator': ROLES.COMPANY_ADMIN,
  'system admin': ROLES.COMPANY_ADMIN,
  'system administrator': ROLES.COMPANY_ADMIN,
  'system_admin': ROLES.COMPANY_ADMIN,
  'system-administrator': ROLES.COMPANY_ADMIN,
  'system_administrator': ROLES.COMPANY_ADMIN,
  'hr admin': ROLES.COMPANY_ADMIN,
  'hradmin': ROLES.COMPANY_ADMIN,
  'hr_admin': ROLES.COMPANY_ADMIN,
};

export function normalizeRole(role) {
  if (!role) {
    return ROLES.EMPLOYEE;
  }

  const normalized = String(role).toLowerCase().trim();

  // First check exact matches
  if ([ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.EMPLOYEE].includes(normalized)) {
    return normalized;
  }

  // Check legacy aliases
  if (LEGACY_ROLE_ALIASES[normalized]) {
    return LEGACY_ROLE_ALIASES[normalized];
  }

  // Check for super admin patterns
  if (normalized.includes('super') && normalized.includes('admin')) {
    return ROLES.SUPER_ADMIN;
  }

  // Check for company admin patterns
  if (normalized.includes('company') && normalized.includes('admin')) {
    return ROLES.COMPANY_ADMIN;
  }

  // Check for general admin patterns
  if (normalized === 'admin' || normalized === 'administrator') {
    return ROLES.COMPANY_ADMIN;
  }

  // Default to employee
  return ROLES.EMPLOYEE;
}
