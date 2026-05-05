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
    'attendance.mark',
    'attendance.approve',
    'attendance.manage',
  ],
  leave: [
    'leave.view',
    'leave.approve',
    'leave.manage',
  ],
  timesheet: [
    'timesheet.view',
    'timesheet.create',
    'timesheet.update',
    'timesheet.approve',
    'timesheet.manage',
  ],
  projects: [
    'project.view',
    'project.create',
    'project.update',
    'project.delete',
    'project.assign',
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
    'support.view',
    'support.manage',
    'document.view',
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

      if (COMPANY_FEATURE_PERMISSION_CODES[code]) {
        COMPANY_FEATURE_PERMISSION_CODES[code].forEach((mappedCode) => normalized.add(mappedCode));
      }

      if (code.startsWith('employee.') || code.startsWith('department.') || code.startsWith('role.')) {
        normalized.add('employee-management');
      }

      if (code.startsWith('attendance.')) {
        normalized.add('attendance');
      }

      if (code.startsWith('leave.')) {
        normalized.add('leave');
      }

      if (code.startsWith('timesheet.')) {
        normalized.add('timesheet');
      }

      if (code.startsWith('project.')) {
        normalized.add('projects');
      }

      if (code.startsWith('payroll.')) {
        normalized.add('payroll');
      }

      if (code.startsWith('report.')) {
        normalized.add('reports');
      }

      if (code.startsWith('performance.')) {
        normalized.add('performance');
      }

      if (code.startsWith('expense.')) {
        normalized.add('expenses');
      }

      if (code.startsWith('support.') || code.startsWith('document.')) {
        normalized.add('helpdesk');
      }
    });

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
