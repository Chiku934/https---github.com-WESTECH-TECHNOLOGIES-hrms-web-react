export const superAdminReportMetrics = [
  { label: 'Revenue', value: 'Rs 18.2L', change: '+12% vs last period' },
  { label: 'Active Plans', value: '8', change: 'Billing running' },
  { label: 'Renewals', value: '16', change: 'Next 14 days' },
  { label: 'Health Score', value: '94%', change: 'Healthy portfolio' },
];

export const superAdminReportOverviewGuides = [
  { period: 'Monthly', title: 'Quick pulse', note: 'Best for fast billing and signup checks.' },
  { period: 'Quarterly', title: 'Trend review', note: 'Useful for balanced performance comparisons.' },
  { period: 'Yearly', title: 'Leadership view', note: 'Ideal for annual planning and targets.' },
];

export const superAdminReportOverviewSummary = [
  { label: 'Revenue', value: 'Rs 18.2L', note: 'Current reporting window' },
  { label: 'Active Plans', value: '8', note: 'Plans running now' },
  { label: 'Renewals', value: '16', note: 'Due in next 14 days' },
  { label: 'Health Score', value: '94%', note: 'Stable portfolio' },
];

export const superAdminReportOverviewStats = [
  { label: 'Best Cycle', value: 'Quarterly', note: 'Most stable renewals' },
  { label: 'Top Revenue', value: 'Yearly', note: 'Highest value plans' },
  { label: 'Ready for Export', value: 'Yes', note: 'Frontend summary only' },
];

export const superAdminReportHighlights = [
  { label: 'Best Cycle', value: 'Quarterly', note: 'Most stable renewals' },
  { label: 'Top Revenue', value: 'Yearly', note: 'Highest value plans' },
  { label: 'Growth Signal', value: 'Monthly', note: 'Fast sign-ups' },
  { label: 'Ready for Export', value: '3 views', note: 'Frontend only' },
];

export const superAdminReportQuickActions = [
  { label: 'Monthly View', description: 'Open month-wise revenue.', icon: 'chart-line' },
  { label: 'Quarterly View', description: 'Inspect quarter performance.', icon: 'briefcase' },
  { label: 'Yearly View', description: 'Review annual trend.', icon: 'clipboard' },
  { label: 'Export Report', description: 'Download mock summary.', icon: 'download' },
];

export const superAdminReportPeriods = {
  monthly: [
    { label: 'New Signups', value: '28', note: 'Current month onboarding', trend: '+8' },
    { label: 'Renewals', value: '14', note: 'Due this month', trend: '+3' },
    { label: 'Revenue', value: 'Rs 4.8L', note: 'Monthly billing', trend: '+11%' },
    { label: 'Cancellations', value: '2', note: 'Low churn', trend: '-1' },
  ],
  quarterly: [
    { label: 'New Signups', value: '61', note: 'Quarter intake', trend: '+19' },
    { label: 'Renewals', value: '42', note: 'Cycle completions', trend: '+11' },
    { label: 'Revenue', value: 'Rs 5.2L', note: 'Quarter billing mix', trend: '+14%' },
    { label: 'Cancellations', value: '4', note: 'Controlled churn', trend: '-2' },
  ],
  yearly: [
    { label: 'New Signups', value: '214', note: 'Annual growth', trend: '+38' },
    { label: 'Renewals', value: '168', note: 'Yearly retention', trend: '+26' },
    { label: 'Revenue', value: 'Rs 8.2L', note: 'Annual contracts', trend: '+21%' },
    { label: 'Cancellations', value: '9', note: 'Managed exits', trend: '-3' },
  ],
};
