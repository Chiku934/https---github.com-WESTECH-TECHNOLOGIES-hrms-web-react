export const hrAttendanceStatuses = ['All', 'Present', 'Late', 'Absent', 'WFH', 'Regularized'];
export const hrAttendanceModes = ['Present', 'Late', 'Absent', 'WFH'];
export const hrAttendanceShifts = ['General', 'Morning', 'Evening', 'Night'];

export const hrAttendanceMetrics = [
  { label: 'Records', value: '18', change: 'Monthly attendance' },
  { label: 'Present', value: '13', change: 'On site or remote' },
  { label: 'Late', value: '3', change: 'Needs review' },
  { label: 'Regularized', value: '2', change: 'Frontend ready' },
];

export const hrAttendanceHighlights = [
  { label: 'Attendance Health', value: 'Good', note: 'Stable trend' },
  { label: 'Exception Queue', value: '3 records', note: 'Awaiting action' },
  { label: 'Reports', value: 'Monthly summary', note: 'Export ready' },
];

export const hrAttendanceQuickActions = [
  { label: 'Mark Attendance', description: 'Create a new attendance entry.' },
  { label: 'Open List', description: 'Review current attendance records.' },
  { label: 'View Reports', description: 'Check attendance summaries.' },
  { label: 'Regularize', description: 'Handle exception entries.' },
];

export const hrAttendanceList = [
  {
    id: 'a-001',
    employee: 'Mamata Das',
    employeeId: 'e-001',
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
    employeeId: 'e-002',
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
    employee: 'Priya Panda',
    employeeId: 'e-003',
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
    employee: 'Amit Kumar',
    employeeId: 'e-004',
    date: '2026-04-05',
    mode: 'Regularized',
    shift: 'Evening',
    checkIn: '09:20',
    checkOut: '18:00',
    status: 'Regularized',
    note: 'Approved by manager',
  },
];
