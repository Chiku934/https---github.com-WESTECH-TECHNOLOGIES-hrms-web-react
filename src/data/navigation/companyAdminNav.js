import { ROUTES } from '../../router/routePaths';

export const companyAdminNav = [
  { label: 'Dashboard', path: ROUTES.dashboard, activeKey: 'dashboard' },
  { label: 'Organization', path: ROUTES.companyAdminMaster, activeKey: 'company-admin-organization' },
  { label: 'Employee Management', path: ROUTES.companyAdminEmployeeManagement, activeKey: 'user-setup-overview' },
  { label: 'Attendance', path: ROUTES.companyAdminAttendance, activeKey: 'company-admin-attendance' },
  { label: 'Holiday List', path: ROUTES.companyAdminHolidayList, activeKey: 'company-admin-holiday-list' },
  { label: 'Leave Management', path: ROUTES.companyAdminLeaveManagement, activeKey: 'company-admin-leave-management' },
  { label: 'Project Management', path: ROUTES.companyAdminProjectManagement, activeKey: 'company-admin-project-management' },
  { label: 'Project Assign', path: ROUTES.companyAdminCreateTeam, activeKey: 'company-admin-create-team' },
  { label: 'Timesheet', path: ROUTES.companyAdminTimesheet, activeKey: 'company-admin-timesheet' },
  { label: 'Payroll', path: ROUTES.payroll, activeKey: 'payroll' },
  { label: 'Reports', path: ROUTES.companyAdminReports, activeKey: 'company-admin-reports' },
];
