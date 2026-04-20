export const hrLeaveStatuses = ['All', 'Pending', 'Approved', 'Rejected'];
export const hrLeavePolicyStatuses = ['Active', 'Draft', 'Inactive'];
export const hrLeaveTypes = ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave'];

export const hrLeaveMetrics = [
  { label: 'Requests', value: '18', change: 'This month' },
  { label: 'Pending', value: '6', change: 'Need review' },
  { label: 'Approved', value: '10', change: 'Processed' },
  { label: 'Policies', value: '4', change: 'Frontend ready' },
];

export const hrLeaveHighlights = [
  { label: 'Approval Queue', value: '6 items', note: 'Review before EOD' },
  { label: 'Upcoming Leaves', value: '9 employees', note: 'Next 7 days' },
  { label: 'Policy Status', value: '4 active rules', note: 'HR ready' },
];

export const hrLeaveQuickActions = [
  { label: 'Approve Queue', description: 'Review pending leave requests.' },
  { label: 'Create Policy', description: 'Add or update leave rules.' },
  { label: 'Open Reports', description: 'Review leave summary.' },
  { label: 'Employee Calendar', description: 'See leave dates at a glance.' },
];

export const hrLeaveRequests = [
  { id: 'lr-001', employee: 'Mamata Das', leaveType: 'Casual Leave', fromDate: '2026-04-09', toDate: '2026-04-10', days: '2', status: 'Pending', reason: 'Family function' },
  { id: 'lr-002', employee: 'Ramesh Sahoo', leaveType: 'Earned Leave', fromDate: '2026-04-15', toDate: '2026-04-19', days: '5', status: 'Approved', reason: 'Vacation' },
  { id: 'lr-003', employee: 'Priya Panda', leaveType: 'Sick Leave', fromDate: '2026-04-12', toDate: '2026-04-12', days: '1', status: 'Pending', reason: 'Medical checkup' },
  { id: 'lr-004', employee: 'Amit Kumar', leaveType: 'Casual Leave', fromDate: '2026-04-21', toDate: '2026-04-22', days: '2', status: 'Rejected', reason: 'Low balance' },
];

export const hrLeavePolicies = [
  { id: 'lp-001', name: 'Casual Leave Policy', leaveType: 'Casual Leave', allowance: '12 days', carryForward: 'No', status: 'Active' },
  { id: 'lp-002', name: 'Sick Leave Policy', leaveType: 'Sick Leave', allowance: '8 days', carryForward: 'No', status: 'Active' },
  { id: 'lp-003', name: 'Earned Leave Policy', leaveType: 'Earned Leave', allowance: '18 days', carryForward: 'Yes', status: 'Draft' },
];
