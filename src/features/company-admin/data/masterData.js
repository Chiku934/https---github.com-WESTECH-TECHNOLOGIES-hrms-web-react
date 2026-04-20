export const companyAdminOrganizationTypes = ['Department', 'Designation'];

export const companyAdminOrganizationStatusOptions = ['Active', 'Draft', 'Inactive'];

export const companyAdminOrganizationMetrics = [
  { label: 'Departments', value: '4', change: 'Operational structure' },
  { label: 'Designations', value: '4', change: 'Role hierarchy' },
  { label: 'Total Records', value: '8', change: 'Lookup values' },
  { label: 'Ready', value: '100%', change: 'Frontend ready' },
];

export const companyAdminOrganizationHighlights = [
  { label: 'Department Focus', value: 'Operations', note: 'Current primary team' },
  { label: 'Designation Focus', value: 'Manager', note: 'Current top role' },
  { label: 'Status', value: 'Active records', note: 'Most entries are live' },
];

export const companyAdminOrganizationQuickActions = [
  { label: 'Open Department', description: 'Create or review department records.' },
  { label: 'Open Designation', description: 'Create or review designation records.' },
];

export const companyAdminOrganizationSeed = {
  departments: [
    { id: '1', name: 'React development', status: 'Active' },
    { id: '2', name: 'Php Development', status: 'Active' },
    { id: '3', name: 'Finance Department', status: 'Active' },
    { id: '4', name: 'Php Development', status: 'Active' },
    { id: '5', name: 'IT Department', status: 'Draft' },
  ],
  designations: [
    { id: '1', name: 'Sr PHP Developer', status: 'Active' },
    { id: '2', name: 'Jr Php Developer', status: 'Active' },
    { id: '3', name: 'React Developer', status: 'Active' },
    { id: '4', name: 'Intern', status: 'Draft' },
    { id: '5', name: 'Mobile App Developer', status: 'Active' },
    { id: '6', name: 'Accountant', status: 'Active' },
    { id: '7', name: 'Node Developer', status: 'Active' },
    { id: '8', name: 'Networking', status: 'Active' },
    { id: '9', name: 'Manager', status: 'Active' },
  ],
};

export const companyAdminMasterTypes = companyAdminOrganizationTypes;
export const companyAdminMasterStatusOptions = companyAdminOrganizationStatusOptions;
export const companyAdminMasterMetrics = companyAdminOrganizationMetrics;
export const companyAdminMasterHighlights = companyAdminOrganizationHighlights;
export const companyAdminMasterQuickActions = companyAdminOrganizationQuickActions;
export const companyAdminMasterList = [
  ...companyAdminOrganizationSeed.departments.map((item) => ({ ...item, type: 'Department', code: `DEP-${item.id.slice(-3)}`, note: `${item.name} department` })),
  ...companyAdminOrganizationSeed.designations.map((item) => ({ ...item, type: 'Designation', code: `DES-${item.id.slice(-3)}`, note: `${item.name} designation` })),
];
