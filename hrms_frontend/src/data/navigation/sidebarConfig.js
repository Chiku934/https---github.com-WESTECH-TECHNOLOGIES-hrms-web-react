import { ROLES, normalizeRole } from '../../app/config/roles';
import { ROUTES } from '../../router/routePaths';

const createItem = (label, path, activeKey, children = [], requiredPermissions = []) => ({
  label,
  path,
  activeKey,
  children,
  requiredPermissions,
});

const collectActiveKeys = (items = []) =>
  items.flatMap((item) => [item.activeKey, ...collectActiveKeys(item.children)].filter(Boolean));

const createSection = ({ key, label, icon, items, activeKeys, path }) => ({
  key,
  label,
  icon,
  path, // Optional path for sections without sub-items
  activeKeys: activeKeys?.length ? activeKeys : collectActiveKeys(items),
  items,
});

const normalizePermissionCodes = (permissions = []) =>
  permissions
    .map((permission) => {
      if (typeof permission === 'string') return permission;
      return permission?.code || permission?.permission_code || permission?.name || '';
    })
    .map((code) => String(code).trim())
    .filter(Boolean);

const hasAnyPermission = (userPermissionSet, requiredPermissions = []) =>
  requiredPermissions.some((permission) => userPermissionSet.has(permission));

const filterSectionByPermissions = (section, userPermissionSet, role) => {
  if (role !== ROLES.COMPANY_ADMIN) {
    return section;
  }

  if (section.key === 'dashboard') {
    return section;
  }

  const filteredItems = (section.items || [])
    .map((item) => {
      const childItems = Array.isArray(item.children) && item.children.length
        ? item.children.filter((child) => hasAnyPermission(userPermissionSet, child.requiredPermissions || []))
        : [];

      const itemAllowed = hasAnyPermission(userPermissionSet, item.requiredPermissions || []);
      const hasVisibleChildren = childItems.length > 0;

      if (!itemAllowed && !hasVisibleChildren) {
        return null;
      }

      return {
        ...item,
        children: childItems,
      };
    })
    .filter(Boolean);

  if (!filteredItems.length) {
    return null;
  }

  return {
    ...section,
    items: filteredItems,
    activeKeys: collectActiveKeys(filteredItems),
  };
};

const dashboardSection = createSection({
  key: 'dashboard',
  label: 'Dashboard',
  icon: 'house',
  path: ROUTES.dashboard, // Direct path for dashboard section
  items: [], // Empty items array since we don't want a submenu
});

const employeeTimesheetItems = [
  createItem('Overview', ROUTES.timesheet, 'timesheet-overview'),
  createItem('Weekly Entry', `${ROUTES.timesheet}#weekly-entry`, 'timesheet-weekly-entry'),
  createItem('Project Time', `${ROUTES.timesheet}#project-time`, 'timesheet-project-time'),
  createItem('My Tasks', `${ROUTES.timesheet}#tasks`, 'timesheet-tasks'),
  createItem('Allocated Projects', `${ROUTES.timesheet}#projects`, 'timesheet-projects'),
  createItem('Summary', `${ROUTES.timesheet}#summary`, 'timesheet-summary'),
  createItem('Approvals', `${ROUTES.timesheet}#approvals`, 'timesheet-approvals'),
  createItem('Past Due', `${ROUTES.timesheet}#past-due`, 'timesheet-past-due'),
  createItem('Rejected', `${ROUTES.timesheet}#rejected`, 'timesheet-rejected'),
];

const managerTimesheetItems = [
  createItem('Approvals', `${ROUTES.myTeamTimesheet}#approvals`, 'myteam_timesheet_approvals'),
  createItem('Project Time', `${ROUTES.myTeamTimesheet}#project-time`, 'myteam_timesheet_project_time'),
  createItem('Week Summary', `${ROUTES.myTeamTimesheet}#week-summary`, 'myteam_timesheet_week_summary'),
  createItem('Exceptions', `${ROUTES.myTeamTimesheet}#exceptions`, 'myteam_timesheet_exceptions'),
];

const companyAdminTimesheetItems = [
  createItem('All Timesheets', `${ROUTES.companyAdminTimesheet}#all`, 'company-admin-timesheet-all'),
  createItem('Past Due', `${ROUTES.companyAdminTimesheet}#past-due`, 'company-admin-timesheet-past-due'),
  createItem('Rejected Timesheets', `${ROUTES.companyAdminTimesheet}#rejected`, 'company-admin-timesheet-rejected'),
  createItem('Project Time', `${ROUTES.companyAdminTimesheet}#project-time`, 'company-admin-timesheet-project-time'),
  createItem('Time Summary', `${ROUTES.companyAdminTimesheet}#time-summary`, 'company-admin-timesheet-time-summary'),
  createItem('My Tasks', `${ROUTES.companyAdminTimesheet}#my-tasks`, 'company-admin-timesheet-my-tasks'),
  createItem('Projects Allocated', `${ROUTES.companyAdminTimesheet}#projects-allocated`, 'company-admin-timesheet-projects-allocated'),
];

const superAdminSections = [
  dashboardSection,
  createSection({
    key: 'company-setup',
    label: 'Company Setup',
    icon: 'user',
    items: [
      createItem('Overview', ROUTES.companySetup, 'company-setup-overview'),
      createItem('Companies', `${ROUTES.companySetup}#companies`, 'company-setup-companies'),
      createItem('Create Company', '/super-admin/company-setup/create', 'company-setup-create'),
    ],
  }),
  createSection({
    key: 'packages',
    label: 'Package Management',
    icon: 'briefcase',
    items: [
      createItem('Overview', ROUTES.superAdminPackages, 'super-admin-packages-overview'),
      createItem('Package List', `${ROUTES.superAdminPackages}#list`, 'super-admin-packages-list'),
      createItem('Create Package', `${ROUTES.superAdminPackages}#create`, 'super-admin-packages-create'),
    ],
  }),
  createSection({
    key: 'master',
    label: 'Master Settings',
    icon: 'clipboard',
    items: [
      createItem('Overview', ROUTES.superAdminMaster, 'super-admin-master-overview'),
      createItem('Master List', `${ROUTES.superAdminMaster}#list`, 'super-admin-master-list'),
      createItem('Create Master', `${ROUTES.superAdminMaster}#create`, 'super-admin-master-create'),
    ],
  }),
  createSection({
    key: 'reports',
    label: 'Reporting',
    icon: 'chart-line',
    items: [
      createItem('Overview', ROUTES.superAdminReports, 'super-admin-reports-overview'),
      createItem('Monthly Report', `${ROUTES.superAdminReports}#monthly`, 'super-admin-reports-monthly'),
      createItem('Quarterly Report', `${ROUTES.superAdminReports}#quarterly`, 'super-admin-reports-quarterly'),
      createItem('Yearly Report', `${ROUTES.superAdminReports}#yearly`, 'super-admin-reports-yearly'),
    ],
  }),
];

const employeeSections = [
  dashboardSection,
  createSection({
    key: 'attendance',
    label: 'Attendance',
    icon: 'clock',
    items: [createItem('Attendance', ROUTES.userAttendance, 'user-attendance')],
  }),
  createSection({
    key: 'leave',
    label: 'Leave',
    icon: 'calendar',
    items: [createItem('Leave', ROUTES.userLeave, 'user-leave')],
  }),
  createSection({
    key: 'timesheet',
    label: 'Timesheet',
    icon: 'clipboard',
    activeKeys: ['timesheet', ...employeeTimesheetItems.map((item) => item.activeKey)],
    items: employeeTimesheetItems,
  }),
  createSection({
    key: 'performance',
    label: 'Performance',
    icon: 'chart-line',
    items: [createItem('Performance', ROUTES.userPerformance, 'user-performance')],
  }),
  createSection({
    key: 'expenses',
    label: 'Expenses',
    icon: 'wallet',
    items: [createItem('Expenses', ROUTES.userExpenses, 'user-expenses')],
  }),
  createSection({
    key: 'helpdesk',
    label: 'Helpdesk',
    icon: 'circle-question',
    items: [createItem('Helpdesk', ROUTES.userSupport, 'user-support')],
  }),
];

const companyAdminSections = [
  dashboardSection,
  createSection({
    key: 'organization',
    label: 'Organization',
    icon: 'clipboard',
    activeKeys: [
      'company-admin-organization-overview',
      'company-admin-organization-department',
      'company-admin-organization-designation',
    ],
    items: [
      createItem(
        'Overview',
        `${ROUTES.companyAdminMaster}#overview`,
        'company-admin-organization-overview',
        [],
        ['department.view', 'department.manage', 'role.manage'],
      ),
      createItem(
        'Department',
        `${ROUTES.companyAdminMaster}#department`,
        'company-admin-organization-department',
        [],
        ['department.view', 'department.manage'],
      ),
      createItem(
        'Designation',
        `${ROUTES.companyAdminMaster}#designation`,
        'company-admin-organization-designation',
        [],
        ['department.manage', 'role.manage'],
      ),
    ],
  }),
  createSection({
    key: 'employee-management',
    label: 'Employee Management',
    icon: 'users',
    activeKeys: [
      'company-admin-employee-management',
      'company-setup-overview',
      'company-setup-users',
    ],
    items: [
      createItem(
        'Overview',
        ROUTES.companyAdminEmployeeManagement,
        'company-setup-overview',
        [],
        ['employee.view', 'employee.create', 'employee.update', 'employee.delete', 'role.manage'],
      ),
      createItem(
        'Employee List',
        `${ROUTES.companyAdminEmployeeManagement}#users`,
        'company-setup-users',
        [],
        ['employee.view'],
      ),
      createItem(
        'Create Employee',
        `${ROUTES.companyAdminEmployeeManagement}#create`,
        'company-setup-users',
        [],
        ['employee.create'],
      ),
    ],
  }),
  createSection({
    key: 'attendance',
    label: 'Attendance',
    icon: 'clock',
    activeKeys: [
      'company-admin-attendance-overview',
      'company-admin-attendance-list',
      'company-admin-attendance-mark',
    ],
    items: [
      createItem('Overview', `${ROUTES.companyAdminAttendance}#overview`, 'company-admin-attendance-overview'),
      createItem('Attendance List', `${ROUTES.companyAdminAttendance}#attendance`, 'company-admin-attendance-list'),
      createItem('Mark Attendance', `${ROUTES.companyAdminAttendance}#mark`, 'company-admin-attendance-mark'),
    ],
  }),
  createSection({
    key: 'holiday',
    label: 'Holiday List',
    icon: 'calendar',
    activeKeys: [
      'company-admin-holiday-overview',
      'company-admin-holiday-calendar',
      'company-admin-holiday-list',
      'company-admin-holiday-create',
    ],
    items: [
      createItem('Overview', `${ROUTES.companyAdminHolidayList}#overview`, 'company-admin-holiday-overview'),
      createItem('Calendar', `${ROUTES.companyAdminHolidayList}#calendar`, 'company-admin-holiday-calendar'),
      createItem('Holiday List', `${ROUTES.companyAdminHolidayList}#holidays`, 'company-admin-holiday-list'),
      createItem('Create Holiday', `${ROUTES.companyAdminHolidayList}#create`, 'company-admin-holiday-create'),
    ],
  }),
  createSection({
    key: 'leave',
    label: 'Leave Management',
    icon: 'calendar',
    activeKeys: [
      'company-admin-leave-overview',
      'company-admin-leave-requests',
      'company-admin-leave-policies',
      'company-admin-leave-create',
    ],
    items: [
      createItem(
        'Overview',
        `${ROUTES.companyAdminLeaveManagement}#overview`,
        'company-admin-leave-overview',
        [],
        ['leave.view', 'leave.approve'],
      ),
      createItem(
        'Requests',
        `${ROUTES.companyAdminLeaveManagement}#requests`,
        'company-admin-leave-requests',
        [],
        ['leave.view', 'leave.approve'],
      ),
      createItem(
        'Policies',
        `${ROUTES.companyAdminLeaveManagement}#policies`,
        'company-admin-leave-policies',
        [],
        ['leave.approve'],
      ),
      createItem(
        'Create Policy',
        `${ROUTES.companyAdminLeaveManagement}#create`,
        'company-admin-leave-create',
        [],
        ['leave.approve'],
      ),
    ],
  }),
  createSection({
    key: 'projects',
    label: 'Project Management',
    icon: 'briefcase',
    activeKeys: [
      'company-admin-project-overview',
      'company-admin-project-list',
      'company-admin-project-create',
    ],
    items: [
      createItem('Overview', `${ROUTES.companyAdminProjectManagement}#overview`, 'company-admin-project-overview'),
      createItem('Project List', `${ROUTES.companyAdminProjectManagement}#projects`, 'company-admin-project-list'),
      createItem('Create Project', `${ROUTES.companyAdminProjectManagement}#create`, 'company-admin-project-create'),
    ],
  }),
  createSection({
    key: 'team-setup',
    label: 'Project Assign',
    icon: 'people-group',
    activeKeys: [
      'company-admin-create-team-overview',
      'company-admin-create-team-list',
      'company-admin-create-team-create',
    ],
    items: [
      createItem('Overview', `${ROUTES.companyAdminCreateTeam}#overview`, 'company-admin-create-team-overview'),
      createItem('Project Assign List', `${ROUTES.companyAdminCreateTeam}#list`, 'company-admin-create-team-list'),
      createItem('Project Assign', `${ROUTES.companyAdminCreateTeam}#create`, 'company-admin-create-team-create'),
    ],
  }),
  createSection({
    key: 'timesheet',
    label: 'Timesheet',
    icon: 'clipboard',
    activeKeys: ['company-admin-timesheet', ...companyAdminTimesheetItems.map((item) => item.activeKey)],
    items: companyAdminTimesheetItems,
  }),
  createSection({
    key: 'payroll',
    label: 'Payroll',
    icon: 'wallet',
    activeKeys: [
      'payroll',
      'company-admin-payroll-overview',
      'company-admin-payroll-run',
      'company-admin-payroll-table',
      'company-admin-payroll-approval',
    ],
    items: [
      createItem(
        'Overview',
        `${ROUTES.payroll}#overview`,
        'company-admin-payroll-overview',
        [],
        ['payroll.view', 'payroll.process'],
      ),
      createItem(
        'Run Payroll',
        `${ROUTES.payroll}#run-payroll`,
        'company-admin-payroll-run',
        [],
        ['payroll.process'],
      ),
      createItem(
        'Payroll Table',
        `${ROUTES.payroll}#payroll-table`,
        'company-admin-payroll-table',
        [],
        ['payroll.view', 'payroll.process'],
      ),
      createItem(
        'Approval Flow',
        `${ROUTES.payroll}#approval-flow`,
        'company-admin-payroll-approval',
        [],
        ['payroll.process'],
      ),
    ],
  }),
  createSection({
    key: 'reports',
    label: 'Reports',
    icon: 'chart-line',
    activeKeys: [
      'company-admin-reports-overview',
      'company-admin-reports-list',
      'company-admin-reports-summary',
    ],
    items: [
      createItem('Overview', `${ROUTES.companyAdminReports}#overview`, 'company-admin-reports-overview'),
      createItem('Report List', `${ROUTES.companyAdminReports}#reports`, 'company-admin-reports-list'),
      createItem('Summary', `${ROUTES.companyAdminReports}#summary`, 'company-admin-reports-summary'),
    ],
  }),
];

export const roleSidebarSections = {
  [ROLES.SUPER_ADMIN]: superAdminSections,
  [ROLES.COMPANY_ADMIN]: companyAdminSections,
  [ROLES.EMPLOYEE]: employeeSections,
};

export function getSidebarSectionsForRole(role) {
  return roleSidebarSections[normalizeRole(role)] ?? employeeSections;
}

export function getSidebarSectionsForRoleAndPermissions(role, permissions = []) {
  const normalizedRole = normalizeRole(role);
  const sections = roleSidebarSections[normalizedRole] ?? employeeSections;

  if (normalizedRole !== ROLES.COMPANY_ADMIN) {
    return sections;
  }

  const permissionSet = new Set(normalizePermissionCodes(permissions));
  return sections
    .map((section) => filterSectionByPermissions(section, permissionSet, normalizedRole))
    .filter(Boolean);
}
