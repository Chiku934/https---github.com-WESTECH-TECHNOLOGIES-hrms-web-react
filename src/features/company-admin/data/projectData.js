export const companyAdminProjectStatuses = ['All', 'Active', 'On Hold', 'Completed', 'Draft'];
export const companyAdminProjectPriorityOptions = ['High', 'Medium', 'Low'];
export const companyAdminProjectTypes = ['Client Project', 'Internal Project', 'Support Project'];
export const companyAdminProjectOwnerOptions = ['Company Admin', 'HR Manager', 'Project Manager', 'Team Lead'];
export const companyAdminProjectTeamOptions = ['Core Delivery', 'Implementation', 'Platform', 'Operations'];

export const companyAdminProjectMetrics = [
  { label: 'Projects', value: '5', change: 'Current pipeline' },
  { label: 'Active', value: '2', change: 'In progress' },
  { label: 'On Hold', value: '1', change: 'Needs review' },
  { label: 'Completed', value: '1', change: 'Delivered' },
];

export const companyAdminProjectHighlights = [
  { label: 'Priority Queue', value: '3 high priority', note: 'Requires focus' },
  { label: 'Team Load', value: '4 active teams', note: 'Balanced allocation' },
  { label: 'Reports', value: 'Monthly summary', note: 'Frontend ready' },
];

export const companyAdminProjectQuickActions = [
  { label: 'Add Project', description: 'Create a new project record.' },
  { label: 'Review List', description: 'Open the current project table.' },
  { label: 'Open Reports', description: 'Check project health and progress.' },
  { label: 'Assign Team', description: 'Review team allocation flow.' },
];

export const companyAdminProjectList = [
  {
    id: 'p-001',
    name: 'Fast Communication Website & App',
    code: '9811122233',
    client: 'Fast Communication',
    type: 'Client Project',
    owner: 'Project Manager',
    team: 'Implementation',
    startDate: '2026-04-01',
    endDate: '2026-06-20',
    budget: '240000',
    priority: 'High',
    status: 'Active',
    summary: 'Website and app delivery for the Fast Communication brand.',
    details: 'Track frontend, backend, and release coordination for the client launch.',
    description: 'Website and app delivery for the Fast Communication brand.',
  },
  {
    id: 'p-002',
    name: 'Book AMC',
    code: '9876543210',
    client: 'Book AMC',
    type: 'Client Project',
    owner: 'Company Admin',
    team: 'Core Delivery',
    startDate: '2026-04-05',
    endDate: '2026-05-10',
    budget: '150000',
    priority: 'Medium',
    status: 'Active',
    summary: 'AMC booking workflow with lead capture and follow-up.',
    details: 'Capture service interest, assign ownership, and manage booking progress.',
    description: 'AMC booking workflow with lead capture and follow-up.',
  },
  {
    id: 'p-003',
    name: 'EV Garage',
    code: '9123456780',
    client: 'EV Garage',
    type: 'Client Project',
    owner: 'Project Manager',
    team: 'Operations',
    startDate: '2026-03-28',
    endDate: '2026-05-22',
    budget: '210000',
    priority: 'High',
    status: 'On Hold',
    summary: 'EV service project paused for scope confirmation.',
    details: 'Waiting for client approval on the final feature list and delivery sequence.',
    description: 'EV service project paused for scope confirmation.',
  },
  {
    id: 'p-004',
    name: 'Chikitsa Web',
    code: '9001123344',
    client: 'Chikitsa Health',
    type: 'Client Project',
    owner: 'Team Lead',
    team: 'Platform',
    startDate: '2026-03-21',
    endDate: '2026-06-15',
    budget: '320000',
    priority: 'Medium',
    status: 'Completed',
    summary: 'Healthcare website completed for the Chikitsa team.',
    details: 'Delivered responsive pages, service content, and admin-ready UI updates.',
    description: 'Healthcare website completed for the Chikitsa team.',
  },
  {
    id: 'p-005',
    name: 'Manjil App & Website',
    code: '9988776655',
    client: 'Manjil Realty',
    type: 'Client Project',
    owner: 'Project Manager',
    team: 'Implementation',
    startDate: '2026-04-09',
    endDate: '2026-07-01',
    budget: '275000',
    priority: 'Medium',
    status: 'Active',
    summary: 'Real estate app and website delivery in progress.',
    details: 'Coordinate listings, enquiry flow, and responsive screens for the Manjil rollout.',
    description: 'Real estate app and website delivery in progress.',
  },
];
