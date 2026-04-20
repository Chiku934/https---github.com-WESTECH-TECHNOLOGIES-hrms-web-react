export const hrEmployeeStatuses = ['All', 'Active', 'Onboarding', 'Inactive'];

export const hrEmployeeRoles = ['HR', 'Employee', 'Team Lead'];

export const hrEmployeeMetrics = [
  { label: 'Employees', value: '186', change: 'HR roster' },
  { label: 'Active', value: '171', change: 'Currently active' },
  { label: 'Onboarding', value: '9', change: 'New joiners' },
  { label: 'Inactive', value: '6', change: 'Archived' },
];

export const hrEmployeeHighlights = [
  { label: 'Directory Health', value: 'Stable', note: 'Profiles synced' },
  { label: 'Open Actions', value: '4 items', note: 'Needs review' },
  { label: 'Reports', value: 'Monthly summary', note: 'Frontend ready' },
];

export const hrEmployeeQuickActions = [
  { label: 'Add Employee', description: 'Create a new employee record.' },
  { label: 'Open List', description: 'Review current employee records.' },
  { label: 'View Reports', description: 'Check employee summaries.' },
  { label: 'Manage Status', description: 'Handle onboarding and inactive records.' },
];

export const hrEmployeeList = [
  {
    id: 'e-001',
    fullName: 'Mamata Das',
    userName: 'mamata.d',
    employeeCode: 'EMP-001',
    department: 'Operations',
    designation: 'HR Executive',
    role: 'HR',
    status: 'Active',
    email: 'mamata@plat.com',
    contact: '9876543210',
  },
  {
    id: 'e-002',
    fullName: 'Ramesh Sahoo',
    userName: 'ramesh.s',
    employeeCode: 'EMP-004',
    department: 'Support',
    designation: 'Senior Associate',
    role: 'Employee',
    status: 'Active',
    email: 'ramesh@plat.com',
    contact: '9123456780',
  },
  {
    id: 'e-003',
    fullName: 'Priya Panda',
    userName: 'priya.p',
    employeeCode: 'EMP-010',
    department: 'HR',
    designation: 'Team Lead',
    role: 'Team Lead',
    status: 'Onboarding',
    email: 'priya@plat.com',
    contact: '9001234567',
  },
  {
    id: 'e-004',
    fullName: 'Amit Kumar',
    userName: 'amit.k',
    employeeCode: 'EMP-006',
    department: 'Projects',
    designation: 'Developer',
    role: 'Employee',
    status: 'Inactive',
    email: 'amit@plat.com',
    contact: '9898989898',
  },
];
