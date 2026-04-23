import { timesheetEmployees } from '../../myteam/timesheet/data/employees';
import { timesheetProjects } from '../../myteam/timesheet/data/projects';
import { timesheetTasks } from '../../myteam/timesheet/data/tasks';
import { timesheetWeeklyEntries } from '../../myteam/timesheet/data/weeklyEntries';

export const companyAdminTimesheetTabs = [
  { key: 'all', label: 'All Timesheets', hash: '#all' },
  { key: 'past-due', label: 'Past Due', hash: '#past-due' },
  { key: 'rejected', label: 'Rejected Timesheets', hash: '#rejected' },
  { key: 'project-time', label: 'Project Time', hash: '#project-time' },
  { key: 'time-summary', label: 'Time Summary', hash: '#time-summary' },
  { key: 'my-tasks', label: 'My Tasks', hash: '#my-tasks' },
  { key: 'projects-allocated', label: 'Projects Allocated', hash: '#projects-allocated' },
];

export const companyAdminTimesheetStatuses = ['All', 'Draft', 'Submitted', 'Approved', 'Rejected'];
export const companyAdminTimesheetBillable = ['All', 'Billable', 'Non-billable'];
export const companyAdminTimesheetTeams = ['All Teams', ...Array.from(new Set(timesheetEmployees.map((item) => item.team)))];
export const companyAdminTimesheetRoles = ['All Roles', ...Array.from(new Set(timesheetEmployees.map((item) => item.role)))];
export const companyAdminTimesheetProjects = ['All Projects', ...Array.from(new Set(timesheetProjects.map((item) => item.name)))];
export const companyAdminTimesheetWorkflowCards = [
  {
    title: 'Capture',
    value: 'Draft and save',
    description: 'Review task-wise work, keep entries editable, and preserve weekly edits before submission.',
  },
  {
    title: 'Review',
    value: 'Approve or return',
    description: 'Scan submitted rows, add manager notes, and send records back when the allocation needs changes.',
  },
  {
    title: 'Close',
    value: 'Payroll ready',
    description: 'Finalize approved entries, lock completed weeks, and hand off clean data to payroll or reporting.',
  },
];

function parseDuration(value) {
  const [hours = '0', minutes = '0'] = String(value || '0:00').split(':');
  return Number(hours) * 60 + Number(minutes);
}

function parseTaskHourText(value) {
  const normalized = String(value || '').trim();
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*hrs?/i);
  if (!match) return 0;
  return Math.round(Number(match[1]) * 60);
}

function formatMinutes(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  return `${Math.floor(minutes / 60)}:${String(Math.abs(minutes % 60)).padStart(2, '0')}`;
}

function formatHours(totalMinutes) {
  return `${(Number(totalMinutes) || 0) / 60}`;
}

function getEmployee(employeeId) {
  return timesheetEmployees.find((item) => item.id === employeeId) || null;
}

function getProject(projectId) {
  return timesheetProjects.find((item) => item.id === projectId) || null;
}

function getTask(taskId) {
  return timesheetTasks.find((item) => item.id === taskId) || null;
}

function groupByWeek(rows) {
  const grouped = rows.reduce((acc, row) => {
    const key = row.week || 'Unknown Week';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {});
  return Object.entries(grouped)
    .map(([week, rowsForWeek], index) => ({
      id: `week-${index + 1}`,
      week,
      total: formatMinutes(rowsForWeek.reduce((sum, row) => sum + parseDuration(row.totalHours), 0)),
      submitted: formatMinutes(rowsForWeek.filter((row) => ['Submitted', 'Approved', 'Rejected'].includes(row.status)).reduce((sum, row) => sum + parseDuration(row.totalHours), 0)),
      approved: formatMinutes(rowsForWeek.filter((row) => row.status === 'Approved').reduce((sum, row) => sum + parseDuration(row.totalHours), 0)),
      pending: formatMinutes(rowsForWeek.filter((row) => row.status === 'Draft').reduce((sum, row) => sum + parseDuration(row.totalHours), 0)),
      rows: rowsForWeek,
    }))
    .sort((a, b) => String(b.week).localeCompare(String(a.week)));
}

export function buildCompanyAdminTimesheetTasks() {
  return timesheetTasks.map((task, index) => {
    const employee = getEmployee(task.employeeId);
    const project = getProject(task.projectId);
    const [loggedText = '', allocatedText = ''] = String(task.hours || '').split('/').map((value) => value.trim());
    const allocatedMinutes = parseTaskHourText(allocatedText);
    const loggedMinutes = parseTaskHourText(loggedText);

    return {
      id: task.id,
      index: index + 1,
      task: task.task,
      project: project?.name || task.project,
      projectClient: project?.client || 'N/A',
      owner: task.owner || employee?.manager || 'Unassigned',
      employee: employee?.name || 'Unassigned',
      role: employee?.role || 'N/A',
      team: employee?.team || 'N/A',
      dueDate: task.dueDate,
      status: task.status,
      logged: formatMinutes(loggedMinutes),
      allocated: task.hours?.includes('NA') ? 'NA' : formatMinutes(allocatedMinutes),
      billable: employee?.billable ? 'Billable' : 'Non-billable',
    };
  });
}

export function buildCompanyAdminTimesheetEntries() {
  return timesheetWeeklyEntries.map((entry, index) => {
    const employee = getEmployee(entry.employeeId);
    const project = getProject(entry.projectId);
    const task = getTask(entry.taskId);
    const totalMinutes = (entry.hours || []).reduce((sum, value) => sum + parseDuration(value), 0);

    return {
      id: entry.id,
      index: index + 1,
      employee: entry.employee,
      employeeId: entry.employeeId,
      role: employee?.role || 'N/A',
      team: entry.team || employee?.team || 'N/A',
      manager: employee?.manager || 'N/A',
      project: project?.name || entry.project,
      task: task?.task || entry.task,
      billable: entry.billable,
      status: entry.status,
      week: entry.week,
      hours: entry.hours || [],
      totalHours: formatMinutes(totalMinutes),
      totalMinutes,
      comments: entry.comment || '',
      attachments: entry.attachmentCount || 0,
      updatedAt: entry.updatedAt || '',
    };
  });
}

export function buildCompanyAdminTimesheetApprovals(entries = buildCompanyAdminTimesheetEntries()) {
  return entries.map((entry, index) => ({
    id: `${entry.id}-approval-${index + 1}`,
    entryId: entry.id,
    employee: entry.employee,
    role: entry.role,
    team: entry.team,
    manager: entry.manager,
    project: entry.project,
    task: entry.task,
    week: entry.week,
    submitted: entry.totalHours,
    status: entry.status,
    billable: entry.billable,
    comments: entry.comments,
    attachments: entry.attachments,
    updatedAt: entry.updatedAt,
  }));
}

export function buildCompanyAdminTimesheetSummary(entries = buildCompanyAdminTimesheetEntries()) {
  return groupByWeek(entries).map((row) => ({
    id: row.id,
    period: row.week,
    total: row.total,
    submitted: row.submitted,
    approved: row.approved,
    pending: row.pending,
  }));
}

export function buildCompanyAdminTimesheetExceptions(entries = buildCompanyAdminTimesheetEntries()) {
  const pastDue = entries.filter((entry) => entry.status === 'Draft' || entry.status === 'Submitted');
  const rejected = entries.filter((entry) => entry.status === 'Rejected');
  return {
    pastDue: pastDue.map((entry) => ({
      id: `past-due-${entry.id}`,
      employee: entry.employee,
      project: entry.project,
      week: entry.week,
      status: 'Overdue',
      reason: entry.status === 'Draft' ? 'Still waiting for submission' : 'Waiting for manager review',
    })),
    rejected: rejected.map((entry) => ({
      id: `rejected-${entry.id}`,
      employee: entry.employee,
      project: entry.project,
      week: entry.week,
      status: 'Rejected',
      reason: entry.comments || 'Returned for correction',
    })),
  };
}

export function buildCompanyAdminTimesheetSnapshot() {
  const tasks = buildCompanyAdminTimesheetTasks();
  const entries = buildCompanyAdminTimesheetEntries();
  const approvals = buildCompanyAdminTimesheetApprovals(entries);
  const summary = buildCompanyAdminTimesheetSummary(entries);
  const exceptions = buildCompanyAdminTimesheetExceptions(entries);
  const totalMinutes = entries.reduce((sum, entry) => sum + parseDuration(entry.totalHours), 0);
  const submittedCount = entries.filter((entry) => entry.status === 'Submitted').length;
  const approvedCount = entries.filter((entry) => entry.status === 'Approved').length;
  const rejectedCount = entries.filter((entry) => entry.status === 'Rejected').length;
  const draftCount = entries.filter((entry) => entry.status === 'Draft').length;
  const weekPeriods = groupByWeek(entries).map((item) => ({
    label: item.week,
    status: item.rows.some((row) => row.status === 'Draft') ? 'Needs Review' : item.rows.some((row) => row.status === 'Rejected') ? 'Rejected' : 'Current Week',
    subtitle: `${item.rows.length} row(s), ${item.submitted} submitted`,
  }));

  return {
    tasks,
    entries,
    approvals,
    summary,
    exceptions,
    weekPeriods,
    workflowCards: companyAdminTimesheetWorkflowCards,
    metrics: [
      { label: 'Task Rows', value: String(tasks.length), note: 'Task-wise assignments' },
      { label: 'Entry Rows', value: String(entries.length), note: 'Weekly timesheet entries' },
      { label: 'Draft', value: String(draftCount), note: 'Editable rows' },
      { label: 'Submitted', value: String(submittedCount), note: 'Awaiting action' },
      { label: 'Approved', value: String(approvedCount), note: 'Ready for payroll' },
      { label: 'Rejected', value: String(rejectedCount), note: 'Needs rework' },
    ],
    roleSummary: timesheetEmployees.reduce((acc, employee) => {
      acc[employee.role] = (acc[employee.role] || 0) + 1;
      return acc;
    }, {}),
    teamSummary: timesheetEmployees.reduce((acc, employee) => {
      acc[employee.team] = (acc[employee.team] || 0) + 1;
      return acc;
    }, {}),
    totalHours: formatMinutes(totalMinutes),
    totalHoursDecimal: Number(formatHours(totalMinutes)).toFixed(1),
    rejectedCount,
  };
}
