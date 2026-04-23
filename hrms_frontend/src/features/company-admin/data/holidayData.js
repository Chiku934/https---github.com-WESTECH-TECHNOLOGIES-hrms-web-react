export const companyAdminHolidayMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const companyAdminHolidayTypes = ['National', 'Festival', 'Company', 'Regional'];
export const companyAdminHolidayStatuses = ['All', 'Active', 'Draft', 'Inactive'];
export const companyAdminHolidayLocations = ['All', 'Odisha', 'Karnataka', 'Remote', 'Pan India'];

export const companyAdminHolidayMetrics = [
  { label: 'Holidays', value: '18', change: 'Current calendar' },
  { label: 'Active', value: '14', change: 'Published dates' },
  { label: 'Draft', value: '1', change: 'Pending review' },
];

export const companyAdminHolidayHighlights = [
  { label: 'Next Holiday', value: 'Utkal Dibasa', note: '01 Apr 2026' },
  { label: 'Pending Drafts', value: '1 holiday', note: 'Awaiting review' },
];

export const companyAdminHolidayQuickActions = [
  { label: 'Add Holiday', description: 'Create a new holiday record.' },
  { label: 'Open Calendar', description: 'Jump to the calendar view.' },
];

export const companyAdminHolidayList = [
  { id: 'h-001', name: 'Utkal Dibasa', date: '2026-04-01', type: 'Regional', location: 'Odisha', status: 'Active', note: 'State foundation day' },
  { id: 'h-002', name: 'Good Friday', date: '2026-04-03', type: 'National', location: 'Pan India', status: 'Active', note: 'National holiday' },
  { id: 'h-003', name: 'Ram Navami', date: '2026-04-14', type: 'Festival', location: 'Pan India', status: 'Active', note: 'Religious observance' },
  { id: 'h-004', name: 'Internal Hack Day', date: '2026-04-18', type: 'Company', location: 'Remote', status: 'Draft', note: 'Team collaboration day' },
  { id: 'h-005', name: 'Independence Day', date: '2026-08-15', type: 'National', location: 'Pan India', status: 'Active', note: 'National holiday' },
  { id: 'h-006', name: 'Diwali', date: '2026-11-08', type: 'Festival', location: 'Pan India', status: 'Active', note: 'Festival of lights' },
];
