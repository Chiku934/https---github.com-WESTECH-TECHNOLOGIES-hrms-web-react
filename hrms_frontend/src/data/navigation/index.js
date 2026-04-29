import { ROUTES } from '../../router/routePaths';
import { superAdminNav } from './superAdminNav';
import { companyAdminNav } from './companyAdminNav';
import { employeeNav } from './employeeNav';
import { ROLES, normalizeRole } from '../../app/config/roles';
import authService from '../../services/authService';

const resolveCurrentRoleFromAuthService = authService.resolveCurrentRole;

export const roleNavigation = {
  [ROLES.SUPER_ADMIN]: superAdminNav,
  [ROLES.COMPANY_ADMIN]: companyAdminNav,
  [ROLES.EMPLOYEE]: employeeNav,
};

export const topNavItems = employeeNav;
export const subNavItems = [];
export const sidebarSections = [
  {
    key: 'company-setup',
    label: 'Company Setup',
    icon: 'user',
    activeKeys: ['company-setup'],
    items: [
      { label: 'Overview', path: ROUTES.companySetup, activeKey: 'company-setup-overview' },
      { label: 'Companies', path: `${ROUTES.companySetup}#companies`, activeKey: 'company-setup-companies' },
      { label: 'Create Company', path: '/super-admin/company-setup/create', activeKey: 'company-setup-create' },
    ],
  },
  {
    key: 'me',
    label: 'My Dashboard',
    icon: 'user',
    activeKeys: [
      'user-attendance',
      'timesheet',
      'timesheet-overview',
      'timesheet-weekly-entry',
      'timesheet-project-time',
      'timesheet-tasks',
      'timesheet-projects',
      'timesheet-summary',
      'timesheet-approvals',
      'timesheet-past-due',
      'timesheet-rejected',
      'user-leave',
      'user-performance',
      'user-performance-meetings',
      'user-performance-feedback',
      'user-performance-pip',
      'user-performance-reviews',
      'user-performance-skills',
      'user-performance-competencies',
      'user-expenses',
      'user-support',
    ],
    items: [
{ label: 'Attendance', path: ROUTES.userAttendance, activeKey: 'user-attendance',
  children: [
    { label: 'Overview', path: `${ROUTES.userAttendance}#overview`, activeKey: 'user-attendance-overview' },
    { label: 'Regularization', path: `${ROUTES.userAttendance}#regularization`, activeKey: 'user-attendance-regularization' },
    { label: 'Reports', path: `${ROUTES.userAttendance}#reports`, activeKey: 'user-attendance-reports' }
  ] },
      {
        label: 'Timesheet',
        path: ROUTES.timesheet,
        activeKey: 'timesheet-overview',
        children: [
          { label: 'Overview', path: ROUTES.timesheet, activeKey: 'timesheet-overview' },
          { label: 'Weekly Entry', path: `${ROUTES.timesheet}#weekly-entry`, activeKey: 'timesheet-weekly-entry' },
          { label: 'Project Time', path: `${ROUTES.timesheet}#project-time`, activeKey: 'timesheet-project-time' },
          { label: 'My Tasks', path: `${ROUTES.timesheet}#tasks`, activeKey: 'timesheet-tasks' },
          { label: 'Projects Allocated', path: `${ROUTES.timesheet}#projects`, activeKey: 'timesheet-projects' },
          { label: 'Time Summary', path: `${ROUTES.timesheet}#summary`, activeKey: 'timesheet-summary' },
          { label: 'Approvals', path: `${ROUTES.timesheet}#approvals`, activeKey: 'timesheet-approvals' },
          { label: 'Past Due', path: `${ROUTES.timesheet}#past-due`, activeKey: 'timesheet-past-due' },
          { label: 'Rejected Timesheets', path: `${ROUTES.timesheet}#rejected`, activeKey: 'timesheet-rejected' },
        ],
      },
{ label: 'Leave', path: ROUTES.userLeave, activeKey: 'user-leave',
  children: [
    { label: 'Apply', path: `${ROUTES.userLeave}#apply`, activeKey: 'user-leave-apply' },
    { label: 'Status', path: `${ROUTES.userLeave}#status`, activeKey: 'user-leave-status' },
    { label: 'Summary', path: `${ROUTES.userLeave}#summary`, activeKey: 'user-leave-summary' }
  ] },
      {
        label: 'Performance',
        path: ROUTES.userPerformance,
        activeKey: 'user-performance',
        children: [
          { label: 'KRAs', path: ROUTES.userPerformance, activeKey: 'user-performance' },
          { label: '1:1 Meetings', path: ROUTES.userPerformanceMeetings, activeKey: 'user-performance-meetings' },
          { label: 'Feedback', path: ROUTES.userPerformanceFeedback, activeKey: 'user-performance-feedback' },
          { label: 'PIP', path: ROUTES.userPerformancePip, activeKey: 'user-performance-pip' },
          { label: 'Reviews', path: ROUTES.userPerformanceReviews, activeKey: 'user-performance-reviews' },
          { label: 'Skills', path: ROUTES.userPerformanceSkills, activeKey: 'user-performance-skills' },
          { label: 'Competencies & Core values', path: ROUTES.userPerformanceCompetencies, activeKey: 'user-performance-competencies' },
        ],
      },
{ label: 'Expenses & Travel', path: ROUTES.userExpenses, activeKey: 'user-expenses',
  children: [
    { label: 'Claims', path: `${ROUTES.userExpenses}#claims`, activeKey: 'user-expenses-claims' },
    { label: 'Advances', path: `${ROUTES.userExpenses}#advances`, activeKey: 'user-expenses-advances' },
    { label: 'Reports', path: `${ROUTES.userExpenses}#reports`, activeKey: 'user-expenses-reports' }
  ] },
{ label: 'Helpdesk', path: ROUTES.userSupport, activeKey: 'user-support',
  children: [
    { label: 'Tickets', path: `${ROUTES.userSupport}#tickets`, activeKey: 'user-support-tickets' },
    { label: 'FAQ', path: `${ROUTES.userSupport}#faq`, activeKey: 'user-support-faq' },
    { label: 'Knowledge Base', path: `${ROUTES.userSupport}#knowledge`, activeKey: 'user-support-knowledge' }
  ] },
    ],
  },
  {
    key: 'myteam',
    label: 'My Team',
    icon: 'people-group',
    activeKeys: [
      'myteam_summary',
      'myteam_summary_digital_services',
      'myteam_summary_direct',
      'myteam_summary_indirect',
      'myteam_summary_peers',
      'myteam_attendance',
      'myteam_attendance_approvals',
      'myteam_attendance_ot',
      'myteam_attendance_regularize',
      'myteam_attendance_shift',
      'myteam_attendance_efforts',
      'myteam_attendance_negligence',
      'myteam_attendance_assignments',
      'myteam_attendance_reports',
      'myteam_expenses',
      'myteam_expenses_waiting',
      'myteam_expenses_approved',
      'myteam_expenses_past_claims',
      'myteam_expenses_past_advances',
      'myteam_timesheet',
      'myteam_timesheet_approvals',
      'myteam_timesheet_project_time',
      'myteam_timesheet_week_summary',
      'myteam_timesheet_exceptions',
      'myteam_profile_changes',
      'myteam_profile_changes_requests',
      'myteam_profile_changes_approvals',
      'myteam_profile_changes_history',
      'myteam_performance',
      'myteam_performance_kpis',
      'myteam_performance_meetings',
      'myteam_performance_feedback',
      'myteam_hiring',
      'myteam_hiring_open_roles',
      'myteam_hiring_candidates',
      'myteam_hiring_interviews',
      'myteam_leave_overview',
      'myteam_leave_approvals',
    ],
    items: [
      { label: 'Summary', path: ROUTES.myTeamSummary, activeKey: 'myteam_summary' },
      {
        label: 'Leave',
        path: ROUTES.myTeamLeaveOverview,
        activeKey: 'myteam_leave_overview',
        children: [
          { label: 'Leave Overview', path: ROUTES.myTeamLeaveOverview, activeKey: 'myteam_leave_overview' },
          { label: 'Leave Approvals', path: ROUTES.myTeamLeaveApprovals, activeKey: 'myteam_leave_approvals' },
          { label: 'Penalized Leave', path: null, activeKey: null },
          { label: 'Past Leave Requests', path: null, activeKey: null },
          { label: 'Encashment Requests', path: null, activeKey: null },
          { label: 'Reports', path: null, activeKey: null },
        ],
      },
      {
        label: 'Attendance',
        path: `${ROUTES.myTeamAttendance}#attendance-approvals`,
        activeKey: 'myteam_attendance',
        children: [
          { label: 'Attendance Approvals', path: `${ROUTES.myTeamAttendance}#attendance-approvals`, activeKey: 'myteam_attendance_approvals' },
          { label: 'OT Request Approvals', path: `${ROUTES.myTeamAttendance}#ot-requests`, activeKey: 'myteam_attendance_ot' },
          { label: 'Regularize & Cancel Penalties', path: `${ROUTES.myTeamAttendance}#regularize`, activeKey: 'myteam_attendance_regularize' },
          { label: 'Shift & Weekly Off Approvals', path: `${ROUTES.myTeamAttendance}#shift-off`, activeKey: 'myteam_attendance_shift' },
          { label: 'Efforts / Punctuality', path: `${ROUTES.myTeamAttendance}#efforts`, activeKey: 'myteam_attendance_efforts' },
          { label: 'Negligence', path: `${ROUTES.myTeamAttendance}#negligence`, activeKey: 'myteam_attendance_negligence' },
          { label: 'Employee Assignments', path: `${ROUTES.myTeamAttendance}#assignments`, activeKey: 'myteam_attendance_assignments' },
          { label: 'Reports', path: `${ROUTES.myTeamAttendance}#reports`, activeKey: 'myteam_attendance_reports' },
        ],
      },
      {
        label: 'Expenses & Travel',
        path: `${ROUTES.myTeamExpenses}#waiting-approval`,
        activeKey: 'myteam_expenses',
        children: [
          { label: 'Waiting For Approval', path: `${ROUTES.myTeamExpenses}#waiting-approval`, activeKey: 'myteam_expenses_waiting' },
          { label: 'Approved Claims', path: `${ROUTES.myTeamExpenses}#approved-claims`, activeKey: 'myteam_expenses_approved' },
          { label: 'Past Claims', path: `${ROUTES.myTeamExpenses}#past-claims`, activeKey: 'myteam_expenses_past_claims' },
          { label: 'Past Advances', path: `${ROUTES.myTeamExpenses}#past-advances`, activeKey: 'myteam_expenses_past_advances' },
        ],
      },
      {
        label: 'Timesheet',
        path: `${ROUTES.myTeamTimesheet}#approvals`,
        activeKey: 'myteam_timesheet',
        children: [
          { label: 'Approvals', path: `${ROUTES.myTeamTimesheet}#approvals`, activeKey: 'myteam_timesheet_approvals' },
          { label: 'Project Time', path: `${ROUTES.myTeamTimesheet}#project-time`, activeKey: 'myteam_timesheet_project_time' },
          { label: 'Week Summary', path: `${ROUTES.myTeamTimesheet}#week-summary`, activeKey: 'myteam_timesheet_week_summary' },
          { label: 'Exceptions', path: `${ROUTES.myTeamTimesheet}#exceptions`, activeKey: 'myteam_timesheet_exceptions' },
        ],
      },
      {
        label: 'Profile Changes',
        path: `${ROUTES.myTeamProfileChanges}#requests`,
        activeKey: 'myteam_profile_changes',
        children: [
          { label: 'Requests', path: `${ROUTES.myTeamProfileChanges}#requests`, activeKey: 'myteam_profile_changes_requests' },
          { label: 'Approvals', path: `${ROUTES.myTeamProfileChanges}#approvals`, activeKey: 'myteam_profile_changes_approvals' },
          { label: 'History', path: `${ROUTES.myTeamProfileChanges}#history`, activeKey: 'myteam_profile_changes_history' },
        ],
      },
      {
        label: 'Performance',
        path: `${ROUTES.myTeamPerformance}#kpis`,
        activeKey: 'myteam_performance',
        children: [
          { label: 'KPIs', path: `${ROUTES.myTeamPerformance}#kpis`, activeKey: 'myteam_performance_kpis' },
          { label: '1:1 Meetings', path: `${ROUTES.myTeamPerformance}#meetings`, activeKey: 'myteam_performance_meetings' },
          { label: 'Feedback', path: `${ROUTES.myTeamPerformance}#feedback`, activeKey: 'myteam_performance_feedback' },
        ],
      },
      // {
      //   label: 'Hiring',
      //   path: `${ROUTES.myTeamHiring}#open-roles`,
      //   activeKey: 'myteam_hiring',
      //   children: [
      //     { label: 'Open Roles', path: `${ROUTES.myTeamHiring}#open-roles`, activeKey: 'myteam_hiring_open_roles' },
      //     { label: 'Candidates', path: `${ROUTES.myTeamHiring}#candidates`, activeKey: 'myteam_hiring_candidates' },
      //     { label: 'Interviews', path: `${ROUTES.myTeamHiring}#interviews`, activeKey: 'myteam_hiring_interviews' },
      //   ],
      // },
    ],
  },
  {
    key: 'inbox',
    label: 'Inbox',
    icon: 'inbox',
    activeKeys: ['requests', 'requests-take-action', 'requests-notifications', 'requests-archive'],
    items: [
      { label: 'Take Action', path: ROUTES.requestsTakeAction, activeKey: 'requests-take-action' },
      { label: 'Notifications', path: ROUTES.requestsNotifications, activeKey: 'requests-notifications' },
      { label: 'Archive', path: ROUTES.requestsArchive, activeKey: 'requests-archive' },
    ],
  },
];

export const employeeSidebarSections = sidebarSections.filter((section) => section.key !== 'company-setup');

export const roleSidebarSections = {
  [ROLES.SUPER_ADMIN]: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'house',
      activeKeys: ['dashboard'],
      items: [{ label: 'Dashboard Overview', path: ROUTES.dashboard, activeKey: 'dashboard' }],
    },
    {
      key: 'company-setup',
      label: 'Company Setup',
      icon: 'user',
      activeKeys: [
        'company-setup',
        'company-setup-overview',
        'company-setup-companies',
        'company-setup-create',
      ],
      items: [
        { label: 'Overview', path: ROUTES.companySetup, activeKey: 'company-setup-overview' },
        { label: 'Companies', path: `${ROUTES.companySetup}#companies`, activeKey: 'company-setup-companies' },
        { label: 'Create Company', path: '/super-admin/company-setup/create', activeKey: 'company-setup-create' },
      ],
    },
    {
      key: 'packages',
      label: 'Package Management',
      icon: 'briefcase',
      activeKeys: [
        'super-admin-packages-overview',
        'super-admin-packages-list',
        'super-admin-packages-create',
      ],
      items: [
        { label: 'Overview', path: ROUTES.superAdminPackages, activeKey: 'super-admin-packages-overview' },
        { label: 'Package List', path: `${ROUTES.superAdminPackages}#list`, activeKey: 'super-admin-packages-list' },
        { label: 'Create Package', path: `${ROUTES.superAdminPackages}#create`, activeKey: 'super-admin-packages-create' },
      ],
    },
    {
      key: 'master',
      label: 'Master Settings',
      icon: 'clipboard',
      activeKeys: [
        'super-admin-master-overview',
        'super-admin-master-list',
        'super-admin-master-create',
      ],
      items: [
        { label: 'Overview', path: ROUTES.superAdminMaster, activeKey: 'super-admin-master-overview' },
        { label: 'Master List', path: `${ROUTES.superAdminMaster}#list`, activeKey: 'super-admin-master-list' },
        { label: 'Create Master', path: `${ROUTES.superAdminMaster}#create`, activeKey: 'super-admin-master-create' },
      ],
    },
    {
      key: 'reports',
      label: 'Reporting',
      icon: 'chart-line',
      activeKeys: [
        'super-admin-reports-overview',
        'super-admin-reports-monthly',
        'super-admin-reports-quarterly',
        'super-admin-reports-yearly',
      ],
      items: [
        { label: 'Overview', path: ROUTES.superAdminReports, activeKey: 'super-admin-reports-overview' },
        { label: 'Monthly Report', path: `${ROUTES.superAdminReports}#monthly`, activeKey: 'super-admin-reports-monthly' },
        { label: 'Quarterly Report', path: `${ROUTES.superAdminReports}#quarterly`, activeKey: 'super-admin-reports-quarterly' },
        { label: 'Yearly Report', path: `${ROUTES.superAdminReports}#yearly`, activeKey: 'super-admin-reports-yearly' },
      ],
    },
  ],
  [ROLES.COMPANY_ADMIN]: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'house',
      activeKeys: ['dashboard'],
      items: [{ label: 'Overview', path: ROUTES.dashboard, activeKey: 'dashboard' }],
    },
    {
      key: 'company-setup',
      label: 'Employee Management',
      icon: 'user',
      activeKeys: [
        'company-setup-overview',
        'company-setup-users',
      ],
      items: [
        { label: 'Overview', path: ROUTES.companyAdminEmployeeManagement, activeKey: 'company-setup-overview' },
        { label: 'Employee List', path: `${ROUTES.companyAdminEmployeeManagement}#users`, activeKey: 'company-setup-users' },
        { label: 'Create Employee', path: `${ROUTES.companyAdminEmployeeManagement}#create`, activeKey: 'company-setup-users' },
      ],
    },
    {
      key: 'organization',
      label: 'Organization',
      icon: 'clipboard',
      activeKeys: [
        'company-admin-organization-overview',
        'company-admin-organization-department',
        'company-admin-organization-designation',
      ],
      items: [
        { label: 'Overview', path: `${ROUTES.companyAdminMaster}#overview`, activeKey: 'company-admin-organization-overview' },
        { label: 'Department', path: `${ROUTES.companyAdminMaster}#department`, activeKey: 'company-admin-organization-department' },
        { label: 'Designation', path: `${ROUTES.companyAdminMaster}#designation`, activeKey: 'company-admin-organization-designation' },
      ],
    },
    {
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
        { label: 'Overview', path: `${ROUTES.companyAdminLeaveManagement}#overview`, activeKey: 'company-admin-leave-overview' },
        { label: 'Requests', path: `${ROUTES.companyAdminLeaveManagement}#requests`, activeKey: 'company-admin-leave-requests' },
        { label: 'Policies', path: `${ROUTES.companyAdminLeaveManagement}#policies`, activeKey: 'company-admin-leave-policies' },
        { label: 'Create Policy', path: `${ROUTES.companyAdminLeaveManagement}#create`, activeKey: 'company-admin-leave-create' },
      ],
    },
    {
      key: 'attendance',
      label: 'Attendance',
      icon: 'clock',
      activeKeys: [
        'company-admin-attendance-overview',
        'company-admin-attendance-list',
        'company-admin-attendance-mark',
      ],
      items: [
        { label: 'Overview', path: `${ROUTES.companyAdminAttendance}#overview`, activeKey: 'company-admin-attendance-overview' },
        { label: 'Attendance List', path: `${ROUTES.companyAdminAttendance}#attendance`, activeKey: 'company-admin-attendance-list' },
        { label: 'Mark Attendance', path: `${ROUTES.companyAdminAttendance}#mark`, activeKey: 'company-admin-attendance-mark' },
      ],
    },
    {
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
        { label: 'Overview', path: `${ROUTES.companyAdminHolidayList}#overview`, activeKey: 'company-admin-holiday-overview' },
        { label: 'Calendar', path: `${ROUTES.companyAdminHolidayList}#calendar`, activeKey: 'company-admin-holiday-calendar' },
        { label: 'Holiday List', path: `${ROUTES.companyAdminHolidayList}#holidays`, activeKey: 'company-admin-holiday-list' },
        { label: 'Create Holiday', path: `${ROUTES.companyAdminHolidayList}#create`, activeKey: 'company-admin-holiday-create' },
      ],
    },
    {
      key: 'project',
      label: 'Project Management',
      icon: 'briefcase',
      activeKeys: [
        'company-admin-project-overview',
        'company-admin-project-list',
        'company-admin-project-create',
      ],
      items: [
        { label: 'Overview', path: `${ROUTES.companyAdminProjectManagement}#overview`, activeKey: 'company-admin-project-overview' },
        { label: 'Project List', path: `${ROUTES.companyAdminProjectManagement}#projects`, activeKey: 'company-admin-project-list' },
        { label: 'Create Project', path: `${ROUTES.companyAdminProjectManagement}#create`, activeKey: 'company-admin-project-create' },
      ],
    },
    {
      key: 'team-setup',
      label: 'Project Assign',
      icon: 'people-group',
      activeKeys: [
        'company-admin-create-team-overview',
        'company-admin-create-team-list',
        'company-admin-create-team-create',
      ],
      items: [
        { label: 'Overview', path: `${ROUTES.companyAdminCreateTeam}#overview`, activeKey: 'company-admin-create-team-overview' },
        { label: 'Project Assign List', path: `${ROUTES.companyAdminCreateTeam}#list`, activeKey: 'company-admin-create-team-list' },
        { label: 'Project Assign', path: `${ROUTES.companyAdminCreateTeam}#create`, activeKey: 'company-admin-create-team-create' },
      ],
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: 'chart-line',
      activeKeys: [
        'company-admin-reports-overview',
        'company-admin-reports-list',
        'company-admin-reports-summary',
      ],
      items: [
        { label: 'Overview', path: `${ROUTES.companyAdminReports}#overview`, activeKey: 'company-admin-reports-overview' },
        { label: 'Report List', path: `${ROUTES.companyAdminReports}#reports`, activeKey: 'company-admin-reports-list' },
        { label: 'Summary', path: `${ROUTES.companyAdminReports}#summary`, activeKey: 'company-admin-reports-summary' },
      ],
    },
  ],
  [ROLES.EMPLOYEE]: employeeSidebarSections,
};

export const roleTopNavItems = {
  [ROLES.SUPER_ADMIN]: superAdminNav,
  [ROLES.COMPANY_ADMIN]: companyAdminNav,
  [ROLES.EMPLOYEE]: employeeNav,
};

/**
 * Synchronously resolve role from localStorage (legacy function for backward compatibility)
 * This function provides immediate role resolution for components that need synchronous access.
 * For fresh role data from backend, use resolveCurrentRoleAsync() instead.
 */
export function resolveRoleFromStorage() {
  if (typeof window === 'undefined') {
    return ROLES.EMPLOYEE;
  }

  const storedRole = window.localStorage.getItem('hrms_role');
  return normalizeRole(storedRole);
}

/**
 * Resolve the role that should be used for the current UI view.
 * If a super-admin switches to company or employee view, honor that mode
 * while keeping the underlying login role intact.
 */
export function resolveEffectiveRoleFromStorage() {
  if (typeof window === 'undefined') {
    return resolveRoleFromStorage();
  }

  const viewMode = window.localStorage.getItem('hrms_view_mode');
  if (viewMode) {
    return normalizeRole(viewMode);
  }

  return resolveRoleFromStorage();
}

/**
 * Asynchronously resolve the current user's role from backend API with localStorage fallback
 * This is the preferred method for getting fresh role data.
 * @returns {Promise<string>} Promise resolving to the user's role constant
 */
export async function resolveCurrentRoleAsync() {
  try {
    return await resolveCurrentRoleFromAuthService();
  } catch (error) {
    console.warn('Failed to resolve role from auth service, falling back to localStorage:', error);
    return resolveRoleFromStorage();
  }
}

/**
 * Refresh role from backend and update localStorage cache
 * This can be called after login or when role might have changed
 * @returns {Promise<string>} Promise resolving to the updated role
 */
export async function refreshRoleFromBackend() {
  try {
    const role = await resolveCurrentRoleFromAuthService();
    // Update localStorage cache
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hrms_role', role);
    }
    return role;
  } catch (error) {
    console.warn('Failed to refresh role from backend:', error);
    return resolveRoleFromStorage();
  }
}
