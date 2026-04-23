export const hrReportPeriods = ['Monthly', 'Quarterly', 'Yearly'];

export const hrReportMetrics = [
  { label: 'Employees', value: '186', change: 'Tracked in frontend' },
  { label: 'Leaves', value: '18', change: 'Reviewed this month' },
  { label: 'Attendance', value: '97%', change: 'Healthy trend' },
  { label: 'Projects', value: '9', change: 'HR scope' },
];

export const hrReportHighlights = [
  { label: 'Employee Health', value: 'Stable', note: 'Profiles synced' },
  { label: 'Leave Queue', value: '6 items', note: 'Awaiting action' },
  { label: 'Budget Usage', value: '72%', note: 'Within plan' },
];

export const hrReportSummary = [
  { label: 'Active Employees', value: '171', note: 'Current roster' },
  { label: 'Onboarding', value: '9', note: 'New joiners' },
  { label: 'Attendance', value: '97%', note: 'Monthly average' },
  { label: 'Policies', value: '4', note: 'HR ready' },
];

export const hrReportRows = {
  Monthly: [
    { title: 'Attendance Compliance', value: '97%', note: 'Monthly average' },
    { title: 'Leave Approvals', value: '84%', note: 'Processing health' },
    { title: 'Project Delivery', value: '72%', note: 'Current load' },
  ],
  Quarterly: [
    { title: 'Attendance Compliance', value: '98%', note: 'Quarter trend' },
    { title: 'Leave Approvals', value: '86%', note: 'Across HR queue' },
    { title: 'Project Delivery', value: '75%', note: 'Healthy pace' },
  ],
  Yearly: [
    { title: 'Attendance Compliance', value: '99%', note: 'Yearly target' },
    { title: 'Leave Approvals', value: '90%', note: 'Long term trend' },
    { title: 'Project Delivery', value: '80%', note: 'Aligned with forecast' },
  ],
};
