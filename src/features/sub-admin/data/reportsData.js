export const subAdminReportMetrics = [
  { label: 'Revenue', value: '₹18.2L', change: '+12% vs last period' },
  { label: 'Active Plans', value: '8', change: 'Billing running' },
  { label: 'Renewals', value: '16', change: 'Next 14 days' },
  { label: 'Health Score', value: '94%', change: 'Healthy portfolio' },
];

export const subAdminReportHighlights = [
  { label: 'Best Cycle', value: 'Quarterly', note: 'Most stable renewals' },
  { label: 'Top Revenue', value: 'Yearly', note: 'Highest value plans' },
  { label: 'Growth Signal', value: 'Monthly', note: 'Fast sign-ups' },
  { label: 'Ready for Export', value: '3 views', note: 'Frontend only' },
];

export const subAdminReportQuickActions = [
  { label: 'Monthly View', description: 'Open month-wise revenue.' },
  { label: 'Quarterly View', description: 'Inspect quarter performance.' },
  { label: 'Yearly View', description: 'Review annual trend.' },
  { label: 'Export Report', description: 'Download mock summary.' },
];

export const subAdminReportPeriods = {
  monthly: [
    { label: 'Assigned Clients', value: '24', note: 'Current month changes', trend: '+8' },
    { label: 'Approvals', value: '14', note: 'Pending and completed', trend: '+3' },
    { label: 'Audit Tasks', value: '6', note: 'Queue items', trend: '+1' },
    { label: 'Escalations', value: '2', note: 'Needs attention', trend: '-1' },
  ],
  quarterly: [
    { label: 'Assigned Clients', value: '61', note: 'Quarter intake', trend: '+19' },
    { label: 'Approvals', value: '42', note: 'Permission cycles', trend: '+11' },
    { label: 'Audit Tasks', value: '11', note: 'Review cadence', trend: '+4' },
    { label: 'Escalations', value: '4', note: 'Controlled churn', trend: '-2' },
  ],
  yearly: [
    { label: 'Assigned Clients', value: '214', note: 'Annual growth', trend: '+38' },
    { label: 'Approvals', value: '168', note: 'Yearly retention', trend: '+26' },
    { label: 'Audit Tasks', value: '29', note: 'Audit coverage', trend: '+9' },
    { label: 'Escalations', value: '9', note: 'Managed exits', trend: '-3' },
  ],
};

