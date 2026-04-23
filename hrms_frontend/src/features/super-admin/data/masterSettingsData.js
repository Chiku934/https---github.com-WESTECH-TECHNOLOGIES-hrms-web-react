export const superAdminMasterMetrics = [
  { label: 'Total Masters', value: '18', change: '6 active categories' },
  { label: 'Location', value: '6', change: 'Live locations' },
  { label: 'Department', value: '4', change: 'Org structure' },
  { label: 'Designation', value: '5', change: 'Role mapping' },
];

export const superAdminMasterHighlights = [
  { label: 'Top Usage', value: 'Location', note: 'Most referenced' },
  { label: 'Stable Type', value: 'Designation', note: 'Used across users' },
  { label: 'Recently Added', value: 'Department', note: 'Updated this week' },
  { label: 'Ready for API', value: '18 records', note: 'Payload-ready' },
];

export const superAdminMasterQuickActions = [
  { label: 'Create Master', description: 'Add a new lookup value.', icon: 'clipboard' },
  { label: 'Review Location', description: 'Focus on location level setup.', icon: 'users' },
  { label: 'Sync Fields', description: 'Keep codes aligned for backend.', icon: 'briefcase' },
  { label: 'Export Masters', description: 'Download the master list.', icon: 'chart-line' },
];

export const superAdminMasterTypes = ['Location', 'Department', 'Designation', 'Grade'];
export const superAdminMasterStatusOptions = ['Active', 'Inactive', 'Draft'];

export const superAdminMasterList = [
  { id: 'm-001', type: 'Location', name: 'Bhubaneswar HQ', code: 'LOC-01', note: 'Primary office', status: 'Active' },
  { id: 'm-002', type: 'Location', name: 'Pune Office', code: 'LOC-02', note: 'Delivery center', status: 'Active' },
  { id: 'm-003', type: 'Location', name: 'Bengaluru Center', code: 'LOC-03', note: 'Product team hub', status: 'Active' },
  { id: 'm-004', type: 'Department', name: 'Human Resource', code: 'DEP-02', note: 'Hiring and policies', status: 'Active' },
  { id: 'm-005', type: 'Department', name: 'Development', code: 'DEP-03', note: 'Engineering org', status: 'Active' },
  { id: 'm-006', type: 'Designation', name: 'Manager', code: 'DES-01', note: 'Leadership role', status: 'Active' },
  { id: 'm-007', type: 'Designation', name: 'Associate', code: 'DES-04', note: 'Entry profile', status: 'Draft' },
  { id: 'm-008', type: 'Grade', name: 'Grade A', code: 'GRD-01', note: 'Top billing grade', status: 'Inactive' },
];

export const superAdminMasterReports = {
  monthly: [
    { label: 'New Masters', value: '4', note: 'Created in the current month' },
    { label: 'Updated Masters', value: '11', note: 'Maintenance activity' },
    { label: 'Location Coverage', value: '6', note: 'Locations mapped' },
    { label: 'API Ready', value: '18', note: 'All payload shapes aligned' },
  ],
  quarterly: [
    { label: 'New Masters', value: '9', note: 'Quarterly additions' },
    { label: 'Updated Masters', value: '21', note: 'Cross-team sync' },
    { label: 'Type Coverage', value: '4', note: 'All categories active' },
    { label: 'Pending Review', value: '2', note: 'Needs approval' },
  ],
  yearly: [
    { label: 'New Masters', value: '18', note: 'Annual setup growth' },
    { label: 'Updated Masters', value: '41', note: 'Ongoing maintenance' },
    { label: 'Departments', value: '4', note: 'Organization coverage' },
    { label: 'Locations', value: '6', note: 'Office footprint' },
  ],
};

