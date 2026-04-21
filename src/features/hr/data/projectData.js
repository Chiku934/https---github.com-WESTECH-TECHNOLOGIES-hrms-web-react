export const hrProjectStatuses = ['All', 'Active', 'On Hold', 'Completed', 'Draft'];
export const hrProjectPriorityOptions = ['High', 'Medium', 'Low'];
export const hrProjectTypes = ['Internal Project', 'HR Project', 'Support Project'];
export const hrProjectOwnerOptions = ['HR Manager', 'HR Executive', 'Team Lead', 'Project Manager'];
export const hrProjectTeamOptions = ['HR Core', 'Operations', 'Support', 'Projects'];

export const hrProjectMetrics = [
  { label: 'Projects', value: '9', change: 'HR scope' },
  { label: 'Active', value: '6', change: 'In progress' },
  { label: 'On Hold', value: '1', change: 'Needs review' },
  { label: 'Completed', value: '2', change: 'Delivered' },
];

export const hrProjectHighlights = [
  { label: 'Priority Queue', value: '2 high priority', note: 'Requires focus' },
  { label: 'Team Load', value: '4 active teams', note: 'Balanced allocation' },
  { label: 'Reports', value: 'Monthly summary', note: 'Frontend ready' },
];

export const hrProjectQuickActions = [
  { label: 'Add Project', description: 'Create a new project record.' },
  { label: 'Review List', description: 'Open the current project table.' },
  { label: 'Open Reports', description: 'Check project health and progress.' },
  { label: 'Assign Team', description: 'Review team allocation flow.' },
];

export const hrProjectList = [
  {
    id: 'p-001',
    name: 'HRMS Rollout',
    code: 'PRJ-001',
    client: 'HRPulse Internal',
    type: 'Internal Project',
    owner: 'HR Manager',
    team: 'HR Core',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    budget: '180000',
    priority: 'High',
    status: 'Active',
    description: 'Core HRMS module rollout with phased UI and workflow delivery.',
  },
  {
    id: 'p-002',
    name: 'Attendance Enhancements',
    code: 'PRJ-002',
    client: 'HRPulse Internal',
    type: 'Support Project',
    owner: 'HR Executive',
    team: 'Operations',
    startDate: '2026-04-08',
    endDate: '2026-04-28',
    budget: '95000',
    priority: 'Medium',
    status: 'On Hold',
    description: 'Attendance rule tuning and reporting improvements.',
  },
  {
    id: 'p-003',
    name: 'Holiday Calendar Sync',
    code: 'PRJ-003',
    client: 'HRPulse Internal',
    type: 'HR Project',
    owner: 'Team Lead',
    team: 'Support',
    startDate: '2026-03-21',
    endDate: '2026-07-04',
    budget: '120000',
    priority: 'Medium',
    status: 'Completed',
    description: 'Holiday calendar and leave policy coordination updates.',
  },
];
