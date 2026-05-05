// ✅ SYNCED WITH BACKEND - EXACT SAME CODES NOW
const COMPANY_FEATURE_PERMISSION_CODES = {
  'employee-management': [
    'employee.view',
    'employee.create',
    'employee.update',
    'employee.delete',
    'role.manage',
    'department.view',
    'department.manage',
  ],
  attendance: [
    'attendance.view',
    'attendance.view_all',
    'attendance.manage',
  ],
  leave: [
    'leave.view',
    'leave.approve',
    'leave.request',
    'leave.manage',
  ],
  timesheet: [
    'timesheet.log',
    'timesheet.view_all',
    'timesheet.approve',
  ],
  projects: [
    'project.view',
    'project.manage',
  ],
  payroll: [
    'payroll.view',
    'payroll.process',
  ],
  reports: [
    'report.view',
    'report.export',
  ],
  performance: [
    'performance.view',
    'performance.manage',
  ],
  expenses: [
    'expense.view',
    'expense.manage',
  ],
  helpdesk: [
    'document.view',
    'document.upload',
    'document.verify',
  ],
};

const WIZARD_PERMISSION_KEYS = Object.keys(COMPANY_FEATURE_PERMISSION_CODES);

function flattenPermissionValue(permission) {
  if (!permission) return '';
  if (typeof permission === 'string') return permission;
  return permission.code || permission.permission_code || permission.name || '';
}

export function normalizeCompanyPermissionCodes(permissions = []) {
  const normalized = new Set();

  permissions
    .map(flattenPermissionValue)
    .map((code) => String(code || '').trim().toLowerCase())
    .filter(Boolean)
    .forEach((code) => {
      normalized.add(code);
    });

  // ✅ STOPPED RECURSIVE LOOP - Only map top level feature codes once, not nested
  for (const [featureKey, featureCodes] of Object.entries(COMPANY_FEATURE_PERMISSION_CODES)) {
    for (const code of featureCodes) {
      if (normalized.has(code)) {
        normalized.add(featureKey);
        break;
      }
    }
  }

  return normalized;
}

export function hasCompanyFeatureAccess(permissions = [], featureKey) {
  if (!featureKey) return false;
  return normalizeCompanyPermissionCodes(permissions).has(String(featureKey).trim().toLowerCase());
}

export function getCompanyPermissionCodesForFeature(featureKey) {
  return COMPANY_FEATURE_PERMISSION_CODES[String(featureKey || '').trim().toLowerCase()] || [];
}

export function filterTabsByCompanyFeature(tabs = [], permissions = [], featureKey) {
  if (!featureKey) return tabs;
  return hasCompanyFeatureAccess(permissions, featureKey) ? tabs : [];
}

export function getWizardPermissionKeys() {
  return [...WIZARD_PERMISSION_KEYS];
}

export function clearCompanyPermissionCache() {
  if (typeof window === 'undefined') return;
  
  // ✅ Clear all permission cache locations completely
  window.localStorage.removeItem('permissions');
  
  // Clear cached company/user objects which contain old permissions
  const company = window.localStorage.getItem('company');
  const user = window.localStorage.getItem('user');
  
  if (company) {
    try {
      const parsed = JSON.parse(company);
      delete parsed.permissions;
      if (parsed.extra_data) delete parsed.extra_data.permissions;
      window.localStorage.setItem('company', JSON.stringify(parsed));
    } catch {}
  }
  
  if (user) {
    try {
      const parsed = JSON.parse(user);
      delete parsed.permissions;
      if (parsed.profile?.extra_data) delete parsed.profile.extra_data.permissions;
      window.localStorage.setItem('user', JSON.stringify(parsed));
    } catch {}
  }
}

export function getStoredCompanyPermissions() {
  if (typeof window === 'undefined') {
    return [];
  }

  const collected = [];

  const sources = [
    window.localStorage.getItem('permissions'),
    window.localStorage.getItem('company'),
    window.localStorage.getItem('user'),
  ];

  sources.forEach((source, index) => {
    if (!source) return;

    try {
      const parsed = JSON.parse(source);
      if (index === 0 && Array.isArray(parsed)) {
        collected.push(...parsed);
        return;
      }

      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.permissions)) {
          collected.push(...parsed.permissions);
        }
        if (Array.isArray(parsed.extra_data?.permissions)) {
          collected.push(...parsed.extra_data.permissions);
        }
        if (Array.isArray(parsed.profile?.extra_data?.permissions)) {
          collected.push(...parsed.profile.extra_data.permissions);
        }
      }
    } catch {
      // Ignore malformed local storage entries.
    }
  });

  return [...normalizeCompanyPermissionCodes(collected)];
}
