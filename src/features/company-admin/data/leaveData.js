export const companyAdminLeaveStatuses = ['All', 'Pending', 'Approved', 'Rejected'];
export const companyAdminLeavePolicyStatuses = ['Active', 'Draft', 'Inactive'];
export const companyAdminLeaveTypes = ['Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave'];

export const companyAdminLeaveMetrics = [
  { label: 'Requests', value: '18', change: 'This month' },
  { label: 'Pending', value: '6', change: 'Waiting review' },
  { label: 'Policies', value: '3', change: 'Active rules' },
];

export const companyAdminLeaveHighlights = [
  { label: 'Approval Queue', value: '6 requests', note: 'Pending manager action' },
  { label: 'Next Leave Start', value: 'Aarav Patel · 09 Apr 2026', note: 'Casual Leave' },
];

export const companyAdminLeaveQuickActions = [
  { label: 'Approve Queue', description: 'Review pending leave requests.' },
  { label: 'Create Policy', description: 'Add or update leave rules.' },
];

export const companyAdminLeaveRequests = [
  { id: 'lr-001', employee: 'Aarav Patel', leaveType: 'Casual Leave', fromDate: '2026-04-09', toDate: '2026-04-10', days: '2', status: 'Pending', reason: 'Family function' },
  { id: 'lr-002', employee: 'Radharani Mohanty', leaveType: 'Earned Leave', fromDate: '2026-04-15', toDate: '2026-04-19', days: '5', status: 'Approved', reason: 'Vacation' },
  { id: 'lr-003', employee: 'Bijay Kumar Sahoo', leaveType: 'Sick Leave', fromDate: '2026-04-12', toDate: '2026-04-12', days: '1', status: 'Pending', reason: 'Medical checkup' },
  { id: 'lr-004', employee: 'Sanjaya Pradhan', leaveType: 'Casual Leave', fromDate: '2026-04-21', toDate: '2026-04-22', days: '2', status: 'Rejected', reason: 'Low balance' },
];

export const companyAdminLeavePolicies = [
  { id: 'lp-001', name: 'Casual Leave Policy', leaveType: 'Casual Leave', allowance: '12 days', carryForward: 'No', status: 'Active' },
  { id: 'lp-002', name: 'Sick Leave Policy', leaveType: 'Sick Leave', allowance: '8 days', carryForward: 'No', status: 'Active' },
  { id: 'lp-003', name: 'Earned Leave Policy', leaveType: 'Earned Leave', allowance: '18 days', carryForward: 'Yes', status: 'Draft' },
];
