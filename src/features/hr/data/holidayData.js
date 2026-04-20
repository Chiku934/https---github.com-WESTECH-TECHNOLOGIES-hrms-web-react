export const hrHolidayTypes = ['National', 'Festival', 'Company', 'Regional'];
export const hrHolidayStatuses = ['All', 'Active', 'Draft', 'Inactive'];
export const hrHolidayLocations = ['All', 'Odisha', 'Karnataka', 'Remote', 'Pan India'];

export const hrHolidayMetrics = [
  { label: 'Holidays', value: '18', change: 'Current calendar' },
  { label: 'Active', value: '14', change: 'Published dates' },
  { label: 'Draft', value: '3', change: 'Pending review' },
  { label: 'Locations', value: '4', change: 'Scope ready' },
];

export const hrHolidayHighlights = [
  { label: 'Upcoming Holiday', value: 'Utkal Dibasa', note: '01 Apr 2026' },
  { label: 'Approval Queue', value: '3 items', note: 'Awaiting review' },
  { label: 'Calendar', value: 'Year view ready', note: 'Frontend demo' },
];

export const hrHolidayQuickActions = [
  { label: 'Add Holiday', description: 'Create a new holiday record.' },
  { label: 'Open Calendar', description: 'Jump to the calendar view.' },
  { label: 'Review List', description: 'Review existing holiday rows.' },
  { label: 'View Reports', description: 'Check holiday distribution.' },
];

export const hrHolidayList = [
  { id: 'h-001', name: 'Utkal Dibasa', date: '2026-04-01', type: 'Regional', location: 'Odisha', status: 'Active', note: 'State foundation day' },
  { id: 'h-002', name: 'Good Friday', date: '2026-04-03', type: 'National', location: 'Pan India', status: 'Active', note: 'National holiday' },
  { id: 'h-003', name: 'Ram Navami', date: '2026-04-14', type: 'Festival', location: 'Pan India', status: 'Active', note: 'Religious observance' },
  { id: 'h-004', name: 'Internal Hack Day', date: '2026-04-18', type: 'Company', location: 'Remote', status: 'Draft', note: 'Team collaboration day' },
  { id: 'h-005', name: 'Independence Day', date: '2026-08-15', type: 'National', location: 'Pan India', status: 'Active', note: 'National holiday' },
  { id: 'h-006', name: 'Diwali', date: '2026-11-08', type: 'Festival', location: 'Pan India', status: 'Active', note: 'Festival of lights' },
];
