export const companyAdminReportPeriods = ['Monthly', 'Quarterly', 'Yearly'];

export const companyAdminReportMetrics = [
  { label: 'Projects', value: '14', change: 'Tracked in frontend' },
  { label: 'Active', value: '8', change: 'Currently running' },
  { label: 'Completed', value: '4', change: 'Delivered work' },
  { label: 'On Hold', value: '2', change: 'Needs review' },
];

export const companyAdminReportHighlights = [
  { label: 'Delivery Health', value: 'Balanced', note: 'No major blockers' },
  { label: 'Team Allocation', value: '4 teams', note: 'Spread across projects' },
  { label: 'Budget Usage', value: '72%', note: 'Within planned range' },
];

export const companyAdminReportSummary = [
  { label: 'Active Projects', value: '8', note: 'In progress' },
  { label: 'On Hold Projects', value: '2', note: 'Awaiting follow-up' },
  { label: 'Completed Projects', value: '4', note: 'Closed out' },
  { label: 'High Priority', value: '3', note: 'Immediate focus' },
];

export const companyAdminReportRows = {
  Monthly: [
    { title: 'Project Completion', value: '61%', note: 'Monthly average' },
    { title: 'Team Utilization', value: '78%', note: 'Current load' },
    { title: 'Budget Spend', value: '72%', note: 'Within plan' },
  ],
  Quarterly: [
    { title: 'Project Completion', value: '84%', note: 'Quarter trend' },
    { title: 'Team Utilization', value: '81%', note: 'Across all teams' },
    { title: 'Budget Spend', value: '69%', note: 'Healthy spend' },
  ],
  Yearly: [
    { title: 'Project Completion', value: '92%', note: 'Yearly target' },
    { title: 'Team Utilization', value: '85%', note: 'Sustained growth' },
    { title: 'Budget Spend', value: '74%', note: 'Aligned with forecast' },
  ],
};

export const companyAdminReportTabs = [
  { label: 'Monthly', hint: 'Current month overview' },
  { label: 'Quarterly', hint: 'Quarter based rollup' },
  { label: 'Yearly', hint: 'Year end summary' },
];
