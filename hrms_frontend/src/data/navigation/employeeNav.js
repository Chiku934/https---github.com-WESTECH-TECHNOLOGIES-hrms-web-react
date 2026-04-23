import { ROUTES } from '../../router/routePaths';

export const employeeNav = [
  { label: 'Attendance', path: ROUTES.userAttendance, activeKey: 'user-attendance' },
  { label: 'Timesheet', path: ROUTES.timesheet, activeKey: 'timesheet' },
  { label: 'Leave', path: ROUTES.userLeave, activeKey: 'user-leave' },
  { label: 'Performance', path: ROUTES.userPerformance, activeKey: 'user-performance' },
  { label: 'Expenses & Travel', path: ROUTES.userExpenses, activeKey: 'user-expenses' },
  { label: 'Helpdesk', path: ROUTES.userSupport, activeKey: 'user-support' },
];
