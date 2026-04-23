import { timesheetStatuses } from './statuses';

export const timesheetFilters = {
  teams: ['All Teams', 'Delivery', 'Product', 'Support', 'Operations'],
  projects: ['All Projects', 'AHDMS - Open Source', 'GCS - Ticketing System', 'WQAC - Design & Dev', 'Odisha Payroll Hub'],
  statuses: ['All Statuses', ...timesheetStatuses.approval],
  scope: [...timesheetStatuses.scope],
};

