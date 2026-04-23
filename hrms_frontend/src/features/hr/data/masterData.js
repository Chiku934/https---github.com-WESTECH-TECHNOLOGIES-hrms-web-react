export const hrMasterTypes = ['Department', 'Designation'];
export const hrMasterStatusOptions = ['Active', 'Draft', 'Inactive'];

export const hrMasterMetrics = [
  { label: 'Masters', value: '12', change: 'Department + Designation' },
  { label: 'Departments', value: '5', change: 'Structure ready' },
  { label: 'Designations', value: '7', change: 'Role hierarchy' },
  { label: 'Ready', value: '100%', change: 'Frontend demo' },
];

export const hrMasterHighlights = [
  { label: 'Department Queue', value: '2 pending', note: 'Needs review' },
  { label: 'Designation Queue', value: '1 draft', note: 'Awaiting approval' },
  { label: 'Reports', value: 'Weekly summary', note: 'Export-ready' },
];

export const hrMasterQuickActions = [
  { label: 'Add Department', description: 'Create a new department record.' },
  { label: 'Add Designation', description: 'Create a new designation record.' },
  { label: 'Open Reports', description: 'Review master activity summaries.' },
  { label: 'Review Records', description: 'Inspect current master data.' },
];

export const hrMasterList = [
  { id: 'm-001', type: 'Department', name: 'React development', code: 'DEP-01', note: 'Core operations team', status: 'Active' },
  { id: 'm-002', type: 'Department', name: 'Php Development', code: 'DEP-02', note: 'HR operations', status: 'Active' },
  { id: 'm-003', type: 'Department', name: 'Finance Department', code: 'DEP-03', note: 'Project coordination', status: 'Draft' },
  { id: 'm-004', type: 'Department', name: 'IT Department', code: 'DEP-04', note: 'Project coordination', status: 'Draft' },
  { id: 'm-005', type: 'Designation', name: 'Sr PHP Developer', code: 'DES-01', note: 'Team owner', status: 'Active' },
  { id: 'm-006', type: 'Designation', name: 'Jr Php Developer', code: 'DES-02', note: 'Task lead', status: 'Draft' },
  { id: 'm-007', type: 'Designation', name: 'React Developer', code: 'DES-04', note: 'Entry role', status: 'Active' },
  { id: 'm-008', type: 'Designation', name: 'Intern', code: 'DES-05', note: 'Entry role', status: 'Active' },
  { id: 'm-009', type: 'Designation', name: 'Mobile App Developer', code: 'DES-06', note: 'Entry role', status: 'Active' },
  { id: 'm-010', type: 'Designation', name: 'Accountant', code: 'DES-07', note: 'Entry role', status: 'Active' },
  { id: 'm-011', type: 'Designation', name: 'Node Developer', code: 'DES-08', note: 'Entry role', status: 'Active' },
  { id: 'm-012', type: 'Designation', name: 'Networking', code: 'DES-09', note: 'Entry role', status: 'Active' },
  { id: 'm-013', type: 'Designation', name: 'Manager', code: 'DES-10', note: 'Entry role', status: 'Active' },
];
