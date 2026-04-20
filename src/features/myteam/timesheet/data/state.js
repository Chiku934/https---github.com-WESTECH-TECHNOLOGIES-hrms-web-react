import { timesheetActivityLogs } from './activityLogs';
import { timesheetApprovals } from './approvals';
import { timesheetEmployees } from './employees';
import { timesheetProjects } from './projects';
import { timesheetStatuses } from './statuses';
import { timesheetTasks } from './tasks';
import { timesheetWeeklyEntries } from './weeklyEntries';

const storageKey = 'myteam_timesheet_manager_v1';

export function createTimesheetManagerState(seed = {}) {
  return {
    approvals: seed.approvals || timesheetApprovals,
    activity: seed.activity || timesheetActivityLogs,
    selectedId: seed.selectedId ?? timesheetApprovals[0]?.id ?? null,
    managerComment: seed.managerComment ?? timesheetApprovals[0]?.reviewerNote ?? '',
  };
}

export function loadTimesheetManagerState() {
  if (typeof window === 'undefined') return createTimesheetManagerState();

  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    const fallback = createTimesheetManagerState();
    return {
      approvals: Array.isArray(stored?.approvals) && stored.approvals.length ? stored.approvals : fallback.approvals,
      activity: Array.isArray(stored?.activity) && stored.activity.length ? stored.activity : fallback.activity,
      selectedId: stored?.selectedId ?? fallback.selectedId,
      managerComment: stored?.managerComment ?? fallback.managerComment,
    };
  } catch {
    return createTimesheetManagerState();
  }
}

export function saveTimesheetManagerState(state) {
  if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export function buildTimesheetDataSnapshot() {
  return {
    employees: timesheetEmployees,
    projects: timesheetProjects,
    tasks: timesheetTasks,
    weeklyEntries: timesheetWeeklyEntries,
    approvals: timesheetApprovals,
    statuses: timesheetStatuses,
    activityLogs: timesheetActivityLogs,
  };
}

export function getTimesheetLookupMaps() {
  return {
    employeesById: timesheetEmployees.reduce((acc, employee) => {
      acc[employee.id] = employee;
      return acc;
    }, {}),
    projectsById: timesheetProjects.reduce((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {}),
    tasksById: timesheetTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {}),
    approvalsById: timesheetApprovals.reduce((acc, approval) => {
      acc[approval.id] = approval;
      return acc;
    }, {}),
  };
}
