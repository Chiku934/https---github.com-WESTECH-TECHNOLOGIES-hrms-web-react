import { ROUTES } from '../../router/routePaths';
import { superAdminNav } from './superAdminNav';
import { subAdminNav } from './subAdminNav';
import { companyAdminNav } from './companyAdminNav';
import { hrNav } from './hrNav';
import { employeeNav } from './employeeNav';
import { ROLES } from '../../app/config/roles';

const managerNav = [
  { label: 'Dashboard', path: ROUTES.dashboard, activeKey: 'dashboard' },
  { label: 'My Team', path: ROUTES.myTeamSummary, activeKey: 'myteam_summary' },
  { label: 'My Team Timesheet', path: ROUTES.myTeamTimesheet, activeKey: 'myteam_timesheet' },
  { label: 'Project Management', path: ROUTES.projects, activeKey: 'projects' },
  { label: 'Project Assign / Team Setup', path: ROUTES.companyAdminCreateTeam, activeKey: 'company-admin-create-team' },
  { label: 'Attendance (Team View)', path: ROUTES.myTeamAttendance, activeKey: 'myteam_attendance' },
  { label: 'Leave (Team View)', path: ROUTES.myTeamLeave, activeKey: 'myteam_leave_overview' },
  { label: 'Reports', path: ROUTES.myTeamPerformance, activeKey: 'myteam_performance' },
];

const managerSidebarSections = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'house',
    activeKeys: ['dashboard'],
    items: [{ label: 'Dashboard', path: ROUTES.dashboard, activeKey: 'dashboard' }],
  },
  {
    key: 'my-team',
    label: 'My Team',
    icon: 'people-group',
    activeKeys: [
      'myteam_summary',
      'myteam_summary_digital_services',
      'myteam_summary_direct',
      'myteam_summary_indirect',
      'myteam_summary_peers',
    ],
    items: [{ label: 'My Team', path: ROUTES.myTeamSummary, activeKey: 'myteam_summary' }],
  },
  {
    key: 'timesheet',
    label: 'My Team Timesheet',
    icon: 'clipboard',
    activeKeys: [
      'myteam_timesheet',
      'myteam_timesheet_approvals',
      'myteam_timesheet_project_time',
      'myteam_timesheet_week_summary',
      'myteam_timesheet_exceptions',
    ],
    items: [{ label: 'My Team Timesheet', path: ROUTES.myTeamTimesheet, activeKey: 'myteam_timesheet' }],
  },
  {
    key: 'projects',
    label: 'Project Management',
    icon: 'briefcase',
    activeKeys: ['projects', 'company-admin-project-management'],
    items: [{ label: 'Project Management', path: ROUTES.projects, activeKey: 'projects' }],
  },
  {
    key: 'team-setup',
    label: 'Project Assign / Team Setup',
    icon: 'people-group',
    activeKeys: ['company-admin-create-team', 'company-admin-assign-team'],
    items: [{ label: 'Project Assign / Team Setup', path: ROUTES.companyAdminCreateTeam, activeKey: 'company-admin-create-team' }],
  },
  {
    key: 'attendance',
    label: 'Attendance (Team View)',
    icon: 'clock',
    activeKeys: [
      'myteam_attendance',
      'myteam_attendance_approvals',
      'myteam_attendance_ot',
      'myteam_attendance_regularize',
      'myteam_attendance_shift',
      'myteam_attendance_efforts',
      'myteam_attendance_negligence',
      'myteam_attendance_assignments',
      'myteam_attendance_reports',
    ],
    items: [{ label: 'Attendance (Team View)', path: ROUTES.myTeamAttendance, activeKey: 'myteam_attendance' }],
  },
  {
    key: 'leave',
    label: 'Leave (Team View)',
    icon: 'calendar',
    activeKeys: ['myteam_leave_overview', 'myteam_leave_approvals'],
    items: [{ label: 'Leave (Team View)', path: ROUTES.myTeamLeave, activeKey: 'myteam_leave_overview' }],
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'chart-line',
    activeKeys: [
      'myteam_performance',
      'myteam_performance_kpis',
      'myteam_performance_meetings',
      'myteam_performance_feedback',
    ],
    items: [{ label: 'Reports', path: ROUTES.myTeamPerformance, activeKey: 'myteam_performance' }],
  },
];

export const roleNavigation = {
  superAdmin: superAdminNav,
  subAdmin: subAdminNav,
  companyAdmin: companyAdminNav,
  hr: hrNav,
  manager: managerNav,
  employee: employeeNav,
};

export const topNavItems = employeeNav;
export const subNavItems = [];
export const sidebarSections = [
  {
    key: 'user-setup',
    label: 'User Setup',
    icon: 'user',
    activeKeys: ['user-setup'],
    items: [{ label: 'My Profile', path: ROUTES.userSetup, activeKey: 'user-setup' }],
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

export const employeeSidebarSections = sidebarSections.filter((section) => section.key !== 'user-setup');

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
      key: 'user-setup',
      label: 'User Setup',
      icon: 'user',
      activeKeys: [
        'user-setup',
        'user-setup-overview',
        'user-setup-users',
        'user-setup-create',
      ],
      items: [
        { label: 'Overview', path: `${ROUTES.userSetup}#overview`, activeKey: 'user-setup-overview' },
        { label: 'User List', path: `${ROUTES.userSetup}#users`, activeKey: 'user-setup-users' },
        { label: 'Create User', path: `${ROUTES.userSetup}#create`, activeKey: 'user-setup-create' },
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
  [ROLES.SUB_ADMIN]: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'house',
      activeKeys: ['dashboard'],
      items: [{ label: 'Overview', path: ROUTES.dashboard, activeKey: 'dashboard' }],
    },
    {
      key: 'user-setup',
      label: 'Employee Management',
      icon: 'user',
      activeKeys: [
        'user-setup-overview',
        'user-setup-users',
        'user-setup-create',
      ],
      items: [
        { label: 'Overview', path: `${ROUTES.userSetup}#overview`, activeKey: 'user-setup-overview' },
        { label: 'Employee List', path: `${ROUTES.userSetup}#users`, activeKey: 'user-setup-users' },
        { label: 'Create Employee', path: `${ROUTES.userSetup}#create`, activeKey: 'user-setup-create' },
      ],
    },
    {
      key: 'permissions',
      label: 'Permissions',
      icon: 'lock',
      activeKeys: ['sub-admin-permissions'],
      items: [{ label: 'Role Permissions', path: ROUTES.subAdminPermissions, activeKey: 'sub-admin-permissions' }],
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: 'chart-line',
      activeKeys: ['sub-admin-reports'],
      items: [{ label: 'Reports', path: ROUTES.subAdminReports, activeKey: 'sub-admin-reports' }],
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
      key: 'user-setup',
      label: 'Employee Management',
      icon: 'user',
      activeKeys: [
        'user-setup-overview',
        'user-setup-users',
        'user-setup-create',
      ],
      items: [
        { label: 'Overview', path: `${ROUTES.userSetup}#overview`, activeKey: 'user-setup-overview' },
        { label: 'Employee List', path: `${ROUTES.userSetup}#users`, activeKey: 'user-setup-users' },
        { label: 'Create Employee', path: `${ROUTES.userSetup}#create`, activeKey: 'user-setup-create' },
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
  [ROLES.HR]: [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: 'house',
      activeKeys: ['dashboard'],
      items: [{ label: 'Overview', path: ROUTES.dashboard, activeKey: 'dashboard' }],
    },
    {
      key: 'user-setup',
      label: 'User Setup',
      icon: 'user',
      activeKeys: ['user-setup'],
      items: [{ label: 'User Setup', path: ROUTES.userSetup, activeKey: 'user-setup' }],
    },
    {
      key: 'employees',
      label: 'Employee Management',
      icon: 'users',
      activeKeys: ['hr-employee-management'],
      items: [{ label: 'Employee List', path: ROUTES.hrEmployeeManagement, activeKey: 'hr-employee-management' }],
    },
    {
      key: 'master',
      label: 'Master',
      icon: 'clipboard',
      activeKeys: ['hr-master'],
      items: [{ label: 'Department and Designation', path: ROUTES.hrMaster, activeKey: 'hr-master' }],
    },
    {
      key: 'leave',
      label: 'Leave Management',
      icon: 'calendar',
      activeKeys: ['hr-leave-management'],
      items: [{ label: 'Leave Overview', path: ROUTES.hrLeaveManagement, activeKey: 'hr-leave-management' }],
    },
    {
      key: 'attendance',
      label: 'Attendance',
      icon: 'clock',
      activeKeys: ['hr-attendance'],
      items: [{ label: 'Attendance', path: ROUTES.hrAttendance, activeKey: 'hr-attendance' }],
    },
    {
      key: 'project',
      label: 'Project Management',
      icon: 'briefcase',
      activeKeys: ['hr-project-management'],
      items: [{ label: 'Project Management', path: ROUTES.hrProjectManagement, activeKey: 'hr-project-management' }],
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: 'chart-line',
      activeKeys: ['hr-reports'],
      items: [{ label: 'Reports', path: ROUTES.hrReports, activeKey: 'hr-reports' }],
    },
  ],
  [ROLES.MANAGER]: managerSidebarSections,
  [ROLES.EMPLOYEE]: employeeSidebarSections,
};

export const roleTopNavItems = {
  [ROLES.SUPER_ADMIN]: superAdminNav,
  [ROLES.SUB_ADMIN]: subAdminNav,
  [ROLES.COMPANY_ADMIN]: companyAdminNav,
  [ROLES.HR]: hrNav,
  [ROLES.MANAGER]: managerNav,
  [ROLES.EMPLOYEE]: employeeNav,
};

export function resolveRoleFromStorage() {
  if (typeof window === 'undefined') {
    return ROLES.EMPLOYEE;
  }

  const storedRole = window.localStorage.getItem('hrms_role');

  switch (storedRole) {
    case ROLES.SUPER_ADMIN:
    case ROLES.SUB_ADMIN:
    case ROLES.COMPANY_ADMIN:
    case ROLES.HR:
    case ROLES.MANAGER:
    case ROLES.EMPLOYEE:
      return storedRole;
    case 'admin':
      return ROLES.COMPANY_ADMIN;
    case 'user':
      return ROLES.EMPLOYEE;
    default:
      return ROLES.EMPLOYEE;
  }
}
