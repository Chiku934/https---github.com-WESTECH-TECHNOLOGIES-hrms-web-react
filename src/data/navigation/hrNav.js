import { ROUTES } from '../../router/routePaths';

export const hrNav = [
  { label: 'Dashboard', path: ROUTES.dashboard, activeKey: 'dashboard' },
  { label: 'User Setup', path: ROUTES.userSetup, activeKey: 'user-setup' },
  { label: 'Employee Management', path: ROUTES.hrEmployeeManagement, activeKey: 'hr-employee-management' },
  { label: 'Master', path: ROUTES.hrMaster, activeKey: 'hr-master' },
  { label: 'Leave Management', path: ROUTES.hrLeaveManagement, activeKey: 'hr-leave-management' },
  { label: 'Holiday List', path: ROUTES.hrHolidayList, activeKey: 'hr-holiday-list' },
  { label: 'Attendance', path: ROUTES.hrAttendance, activeKey: 'hr-attendance' },
  { label: 'Project Management', path: ROUTES.hrProjectManagement, activeKey: 'hr-project-management' },
  { label: 'Reports', path: ROUTES.hrReports, activeKey: 'hr-reports' },
];
