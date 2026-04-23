import { timesheetEmployees } from './employees';
import { timesheetProjects } from './projects';
import { timesheetTasks } from './tasks';
import { timesheetWeeklyEntries, buildWeeklyEntryState } from './weeklyEntries';
import { timesheetApprovals, buildApprovalIndex } from './approvals';
import { timesheetStatuses, statusTone } from './statuses';
import { timesheetActivityLogs } from './activityLogs';
import { timesheetExceptionStates } from './exceptions';
import { timesheetReportWeeks, timesheetReportProjects } from './reports';
import { timesheetWeekSummary } from './summary';
import { timesheetTabs, timesheetWeekPeriods } from './weeklyPeriods';
import { timesheetFilters } from './filters';
import {
  buildTimesheetDataSnapshot,
  createTimesheetManagerState,
  getTimesheetLookupMaps,
  loadTimesheetManagerState,
  saveTimesheetManagerState,
} from './state';

export {
  timesheetEmployees,
  timesheetProjects,
  timesheetTasks,
  timesheetWeeklyEntries,
  buildWeeklyEntryState,
  timesheetApprovals,
  buildApprovalIndex,
  timesheetStatuses,
  statusTone,
  timesheetActivityLogs,
  timesheetExceptionStates,
  timesheetReportWeeks,
  timesheetReportProjects,
  timesheetWeekSummary,
  timesheetTabs,
  timesheetWeekPeriods,
  timesheetFilters,
  buildTimesheetDataSnapshot,
  createTimesheetManagerState,
  getTimesheetLookupMaps,
  loadTimesheetManagerState,
  saveTimesheetManagerState,
};

export const myTeamTimesheetTabs = timesheetTabs;
export const myTeamTimesheetWeekPeriods = timesheetWeekPeriods;
export const myTeamTimesheetFilters = timesheetFilters;
export const myTeamTimesheetQueue = timesheetApprovals;
export const myTeamTimesheetProjects = timesheetProjects;
export const myTeamTimesheetTasks = timesheetTasks;
export const myTeamTimesheetWeeklyEntries = timesheetWeeklyEntries;
export const myTeamTimesheetWeekSummary = timesheetWeekSummary;
export const myTeamTimesheetActivity = timesheetActivityLogs;
export const myTeamTimesheetExceptionStates = timesheetExceptionStates;
export const myTeamTimesheetReportWeeks = timesheetReportWeeks;
export const myTeamTimesheetReportProjects = timesheetReportProjects;
export const myTeamTimesheetEmployees = timesheetEmployees;
export const myTeamTimesheetStatuses = timesheetStatuses;
export const myTeamTimesheetState = {
  buildTimesheetDataSnapshot,
  createTimesheetManagerState,
  getTimesheetLookupMaps,
  loadTimesheetManagerState,
  saveTimesheetManagerState,
};
