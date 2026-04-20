export const companyAdminAttendanceStatuses = ['All', 'Present', 'Late', 'Absent', 'WFH', 'Regularized'];
export const companyAdminAttendanceModes = ['Present', 'Late', 'Absent', 'WFH'];
export const companyAdminAttendanceShifts = ['General', 'Morning', 'Evening', 'Night'];

export const companyAdminAttendanceMetrics = [
  { label: 'Records', value: '18', change: 'Monthly attendance' },
  { label: 'Present', value: '13', change: 'On site or remote' },
  { label: 'Late', value: '3', change: 'Needs review' },
  { label: 'Regularized', value: '2', change: 'Frontend ready' },
];

export const companyAdminAttendanceHighlights = [
  { label: 'Attendance Health', value: 'Good', note: 'Stable trend' },
  { label: 'Exception Queue', value: '3 records', note: 'Awaiting action' },
  { label: 'Reports', value: 'Monthly summary', note: 'Export ready' },
];

export const companyAdminAttendanceQuickActions = [
  { label: 'Mark Attendance', description: 'Create a new attendance entry.' },
  { label: 'Open List', description: 'Review current attendance records.' },
  { label: 'View Reports', description: 'Check attendance summaries.' },
  { label: 'Regularize', description: 'Handle exception entries.' },
];

export const companyAdminAttendanceList = [
  {
    id: 'a-001',
    employee: 'Mamata Das',
    employeeId: 'u-001',
    date: '2026-04-06',
    mode: 'Present',
    shift: 'General',
    checkIn: '09:15',
    checkOut: '18:12',
    status: 'Present',
    note: 'On time',
  },
  {
    id: 'a-002',
    employee: 'Ramesh Sahoo',
    employeeId: 'u-004',
    date: '2026-04-06',
    mode: 'Late',
    shift: 'Morning',
    checkIn: '10:08',
    checkOut: '18:20',
    status: 'Late',
    note: 'Traffic delay',
  },
  {
    id: 'a-003',
    employee: 'Amit Kumar',
    employeeId: 'u-006',
    date: '2026-04-06',
    mode: 'WFH',
    shift: 'General',
    checkIn: '09:45',
    checkOut: '18:05',
    status: 'WFH',
    note: 'Work from home',
  },
  {
    id: 'a-004',
    employee: 'Priya Panda',
    employeeId: 'u-010',
    date: '2026-04-05',
    mode: 'Regularized',
    shift: 'Evening',
    checkIn: '09:20',
    checkOut: '18:00',
    status: 'Regularized',
    note: 'Approved by manager',
  },
];
