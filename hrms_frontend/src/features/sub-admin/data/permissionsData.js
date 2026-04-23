export const subAdminPermissionMetrics = [
  { label: 'Permission Rules', value: '12', change: 'Role-mapped' },
  { label: 'Approved', value: '8', change: 'Ready to use' },
  { label: 'Pending', value: '3', change: 'Needs review' },
  { label: 'Rejected', value: '1', change: 'Action required' },
];

export const subAdminPermissionHighlights = [
  { label: 'Access Queue', value: '3 approvals', note: 'Waiting on response' },
  { label: 'Critical Roles', value: '4 locked roles', note: 'Cannot be skipped' },
  { label: 'Reporting', value: 'Daily audit', note: 'Export-ready' },
  { label: 'API Ready', value: '12 records', note: 'Payload-ready data' },
];

export const subAdminPermissionQuickActions = [
  { label: 'Approve Queue', description: 'Clear pending requests.' },
  { label: 'Create Rule', description: 'Add a new permission rule.' },
  { label: 'Review Logs', description: 'Inspect recent access logs.' },
  { label: 'Export Audit', description: 'Download permission summary.' },
];

export const subAdminPermissionList = [
  { id: 'p-001', module: 'Clients', access: 'Read', scope: 'Assigned clients', status: 'Approved' },
  { id: 'p-002', module: 'Packages', access: 'Read / Update', scope: 'Billing plans', status: 'Approved' },
  { id: 'p-003', module: 'Reports', access: 'Read', scope: 'Analytic views', status: 'Pending' },
  { id: 'p-004', module: 'User Setup', access: 'Limited', scope: 'Profile changes', status: 'Approved' },
  { id: 'p-005', module: 'Master Settings', access: 'Read', scope: 'Lookup values', status: 'Rejected' },
];

