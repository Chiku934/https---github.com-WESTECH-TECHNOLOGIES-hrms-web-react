export const timesheetTabs = [
  { key: 'overview', label: 'Overview', hash: '#overview' },
  { key: 'weekly-entry', label: 'Weekly Entry', hash: '#weekly-entry' },
  { key: 'project-time', label: 'Project Time', hash: '#project-time' },
  { key: 'tasks', label: 'My Tasks', hash: '#tasks' },
  { key: 'projects', label: 'Allocated Projects', hash: '#projects' },
  { key: 'summary', label: 'Summary', hash: '#summary' },
  { key: 'approvals', label: 'Approvals', hash: '#approvals', badge: 8 },
  { key: 'past-due', label: 'Past Due', hash: '#past-due', badge: 4 },
  { key: 'rejected', label: 'Rejected', hash: '#rejected', badge: 2 },
];

export const timesheetKpis = [
  { label: 'Total Hours', value: '84:00', note: 'Current week workload', tone: 'primary' },
  { label: 'Submitted Hours', value: '72:00', note: 'Logged for review', tone: 'blue' },
  { label: 'Approved Hours', value: '68:00', note: 'Manager approved', tone: 'green' },
  { label: 'Pending Hours', value: '12:00', note: 'Waiting for approval', tone: 'amber' },
  { label: 'Rejected Entries', value: '3', note: 'Needs correction', tone: 'red' },
  { label: 'Overdue Timesheets', value: '6', note: 'Past due for closure', tone: 'violet' },
];

export const timesheetWeekPeriods = [
  { label: '30 Mar - 05 Apr 2026', status: 'Current Week', subtitle: 'Submission due Friday 5:00 PM' },
  { label: '23 Mar - 29 Mar 2026', status: 'Previous Week', subtitle: '3 approved, 1 pending' },
  { label: '16 Mar - 22 Mar 2026', status: 'Archived', subtitle: 'Review only' },
];

export const timesheetFilters = {
  employees: ['All Employees', 'My Entries', 'Direct Reports', 'Project Leads'],
  projects: ['All Projects', 'AHDMS - Open Source', 'GCS - Ticketing System', 'Odisha Payroll Hub'],
  teams: ['All Teams', 'Product', 'Delivery', 'Support'],
  status: ['All Statuses', 'Draft', 'Submitted', 'Manager Approved', 'Payroll Ready', 'Rejected', 'Changes Requested', 'Overdue'],
};

export const timesheetWorkflowCards = [
  {
    title: 'Capture',
    value: 'Draft and save',
    description: 'Log hours by day, copy last week, and keep work editable until submission.',
  },
  {
    title: 'Manager review',
    value: 'Approve or return',
    description: 'Submitted weeks move into a queue with manager comments and resubmission flow.',
  },
  {
    title: 'HR / Payroll',
    value: 'Finalize period',
    description: 'Manager-approved weeks can be finalized by HR and handed off for payroll processing.',
  },
];

export const timesheetWeeklyPreview = [
  { project: 'Time-off Paid Leave', billable: 'No', status: 'Approved', hours: ['0:00', '0:00', '8:00', '0:00', '0:00', '0:00', '0:00'], total: '8:00' },
  { project: 'Project Alpha - Product Launch', billable: 'Yes', status: 'Submitted', hours: ['2:00', '1:30', '2:30', '2:00', '0:00', '0:00', '0:00'], total: '8:00' },
  { project: 'Internal Work / Standup', billable: 'No', status: 'Draft', hours: ['0:30', '0:30', '0:30', '0:30', '0:30', '0:30', '0:30'], total: '3:30' },
];

export const timesheetProjectRail = [
  { name: 'AHDMS - OPEN SOURCE', client: 'Assam Health Infrastructure...', code: 'GSU-A', active: true },
  { name: 'GCS - TICKETING SYSTEM', client: 'Gemini - Internal', code: 'GHI-PC' },
  { name: 'WQAC - DESIGN & DEV', client: 'Water Corporation of...', code: 'GHI-PC' },
  { name: 'KALINGA HEALTH CARE', client: 'Kalinga Chikitsa Hospital', code: 'GID-PC' },
];

export const timesheetProjectOptions = [
  'AHDMS - OPEN SOURCE',
  'GCS - TICKETING SYSTEM',
  'WQAC - DESIGN & DEV',
  'KALINGA HEALTH CARE',
  'ODISHA PAYROLL HUB',
];

export const timesheetTaskOptions = {
  'AHDMS - OPEN SOURCE': ['Sprint Planning', 'Bug Fixes', 'Client Review'],
  'GCS - TICKETING SYSTEM': ['Discovery', 'Implementation', 'QA Support'],
  'WQAC - DESIGN & DEV': ['UI Build', 'API Integration', 'Deployment'],
  'KALINGA HEALTH CARE': ['Maintenance', 'Training', 'Release Review'],
  'ODISHA PAYROLL HUB': ['Payroll Sync', 'Validation', 'Reporting'],
};

export const timesheetWeeklyEntrySeedRows = [
  {
    id: 'ts-row-1',
    project: 'AHDMS - OPEN SOURCE',
    task: 'Bug Fixes',
    billable: 'Billable',
    status: 'Draft',
    hours: ['2:00', '1:30', '2:30', '2:00', '0:00', '0:00', '0:00'],
    comment: 'Fixes for sprint handoff.',
    attachmentCount: 1,
  },
  {
    id: 'ts-row-2',
    project: 'GCS - TICKETING SYSTEM',
    task: 'Implementation',
    billable: 'Non-billable',
    status: 'Payroll Ready',
    hours: ['1:00', '1:00', '1:00', '1:00', '1:00', '0:00', '0:00'],
    comment: 'Internal process work.',
    attachmentCount: 0,
  },
];

export const timesheetTaskRows = [
  { task: 'Bhubaneswar Smart City Sprint', project: 'BHUBANESWAR SMART CITY', owner: 'Jitesh Kumar Das', due: '17 Nov 2026', hours: '65.00 hrs / 4 hrs', status: 'Completed' },
  { task: 'Cuttack Health Portal Demo', project: 'CUTTACK HEALTH PORTAL', owner: 'Purushottama Sahoo', due: '31 Mar 2026', hours: '0 hrs / 50 hrs', status: 'Not Started' },
  { task: 'Rourkela School ERP Visit', project: 'ROURKELA SCHOOL ERP', owner: 'Prajwal Chandra Nayak', due: '28 Feb 2026', hours: '50.00 hrs / NA', status: 'In Progress' },
];

export const timesheetAllocationRows = [
  { project: 'BHUBANESWAR SMART CITY', status: 'In Progress', manager: 'Jitesh Kumar Das', duration: '01 Mar 2025 - 31 Mar 2026', type: 'Client Project' },
  { project: 'PURI HERITAGE UPGRADE', status: 'Completed', manager: 'Soumyadarshini Dash', duration: '01 Nov 2024 - 31 Mar 2025', type: 'Delivery Project' },
  { project: 'ODISHA PAYROLL HUB', status: 'In Progress', manager: 'Prajwal Chandra Nayak', duration: '01 Aug 2025 - 28 Feb 2026', type: 'Internal' },
];

export const timesheetSummaryRows = [
  { period: '30 Mar - 05 Apr 2026', total: '84:00', submitted: '72:00', approved: '68:00', pending: '12:00' },
  { period: '23 Mar - 29 Mar 2026', total: '80:00', submitted: '78:00', approved: '74:00', pending: '4:00' },
  { period: '16 Mar - 22 Mar 2026', total: '76:00', submitted: '70:00', approved: '70:00', pending: '0:00' },
];

export const timesheetApprovalRows = [
  { employee: 'Animesh Das', project: 'AHDMS - Open Source', week: '30 Mar - 05 Apr 2026', submitted: '40:00', status: 'Pending' },
  { employee: 'Bhasha Mishra', project: 'GCS - Ticketing System', week: '30 Mar - 05 Apr 2026', submitted: '38:00', status: 'Pending' },
  { employee: 'Bijay Kumar Sahoo', project: 'WQAC - Design & Dev', week: '23 Mar - 29 Mar 2026', submitted: '36:00', status: 'Payroll Ready' },
];

export const timesheetExceptionRows = {
  'past-due': [
    { employee: 'Client Support - Pending Entry', project: 'Support Queue', status: 'Overdue', reason: 'Missing manager review' },
    { employee: 'Project Alpha - Missing Review', project: 'Project Alpha', status: 'Overdue', reason: 'Submission past deadline' },
  ],
  rejected: [
    { employee: 'Project Beta - Rework', project: 'Project Beta', status: 'Rejected', reason: 'Incorrect allocation and missing comments' },
    { employee: 'Daily Admin / Review', project: 'Operations', status: 'Rejected', reason: 'Needs correction before resubmission' },
  ],
};
