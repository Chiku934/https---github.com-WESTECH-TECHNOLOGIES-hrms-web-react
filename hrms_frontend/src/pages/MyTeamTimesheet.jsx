import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import SummaryCards from '../features/employee/timesheet/components/SummaryCards';
import TimesheetAgGrid from '../features/employee/timesheet/components/TimesheetAgGrid';
import TimesheetGridHeader from '../features/employee/timesheet/components/TimesheetGridHeader';
import TimesheetGridStatusCell from '../features/employee/timesheet/components/TimesheetGridStatusCell';
import TimesheetGridActionsCell from '../features/employee/timesheet/components/TimesheetGridActionsCell';
import TimesheetStatusChip from '../features/employee/timesheet/components/TimesheetStatusChip';
import TimesheetApprovalPanel from '../features/employee/timesheet/components/TimesheetApprovalPanel';
import WorkflowStepper from '../features/employee/timesheet/components/WorkflowStepper';
import ApprovalToolbar from '../features/employee/timesheet/components/ApprovalToolbar';
import WeekNavigator from '../features/employee/timesheet/components/WeekNavigator';
import EmptyState from '../features/employee/timesheet/components/EmptyState';
import ActivityPanel from '../features/employee/timesheet/components/ActivityPanel';
import Icon from '../components/Icon';
import { ROLES } from '../app/config/roles';
import { resolveRoleFromStorage } from '../data/navigation/index.js';
import { ROUTES } from '../router/routePaths';
import { syncPayrollHandoffRecords } from '../data/payrollHandoff';
import {
  buildTimesheetDataSnapshot,
  myTeamTimesheetExceptionStates,
  myTeamTimesheetFilters,
  myTeamTimesheetProjects,
  myTeamTimesheetReportProjects,
  myTeamTimesheetReportWeeks,
  myTeamTimesheetTabs,
  myTeamTimesheetWeekPeriods,
  myTeamTimesheetWeekSummary,
  loadTimesheetManagerState,
  saveTimesheetManagerState,
  getTimesheetLookupMaps,
} from '../features/myteam/timesheet/data/timesheetManagerData';

const moduleNavItems = [
  { label: 'Summary', path: ROUTES.myTeamSummary, activeKey: 'myteam_summary' },
  { label: 'Leave', path: ROUTES.myTeamLeaveOverview, activeKey: 'myteam_leave_overview' },
  { label: 'Attendance', path: ROUTES.myTeamAttendance, activeKey: 'myteam_attendance' },
  { label: 'Expenses & Travel', path: ROUTES.myTeamExpenses, activeKey: 'myteam_expenses' },
  { label: 'Timesheet', path: ROUTES.myTeamTimesheet, activeKey: 'myteam_timesheet' },
  { label: 'Profile Changes', path: ROUTES.myTeamProfileChanges, activeKey: 'myteam_profile_changes' },
  { label: 'Performance', path: ROUTES.myTeamPerformance, activeKey: 'myteam_performance' },
];

const subNavItems = myTeamTimesheetTabs.map((tab) => ({ label: tab.label, path: `${ROUTES.myTeamTimesheet}${tab.hash}`, activeKey: `myteam_timesheet_${tab.key}` }));
const tabToHash = myTeamTimesheetTabs.reduce((acc, tab) => ({ ...acc, [tab.key]: tab.hash }), {});
const hashToTab = myTeamTimesheetTabs.reduce((acc, tab) => ({ ...acc, [tab.hash]: tab.key }), {});
const sidebarActiveKeyMap = {
  approvals: 'myteam_timesheet_approvals',
  'project-time': 'myteam_timesheet_project_time',
  'week-summary': 'myteam_timesheet_week_summary',
  exceptions: 'myteam_timesheet_exceptions',
};

function formatDateFilter(value) {
  return String(value || '').split(' ').slice(0, 3).join(' ');
}
function SectionCard({ title, subtitle, children, actions, className = '' }) {
  return (
    <section className={`timesheet-card ${className}`.trim()}>
      <div className="timesheet-card-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="timesheet-card-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function parseDuration(value) {
  const [hours = '0', minutes = '0'] = String(value || '0:00').split(':');
  return Number(hours) * 60 + Number(minutes);
}

function formatDuration(totalMinutes) {
  return `${Math.floor(totalMinutes / 60)}:${String(Math.abs(totalMinutes % 60)).padStart(2, '0')}`;
}

function matchesQuery(row, query) {
  const term = String(query || '').trim().toLowerCase();
  if (!term) return true;
  return [row.employee, row.team, row.role, row.project, row.task, row.week, row.status, row.note, row.reviewerNote]
    .some((value) => String(value || '').toLowerCase().includes(term));
}

function scopeMatches(row, scope) {
  if (scope === myTeamTimesheetFilters.scope[0]) return true;
  if (scope === 'Direct Reports') return ['Delivery', 'Product'].includes(row.team);
  if (scope === 'Indirect Reports') return ['Support', 'Operations'].includes(row.team);
  return true;
}

function toneForStatus(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('approved')) return 'green';
  if (normalized.includes('pending') || normalized.includes('submitted') || normalized.includes('review')) return 'amber';
  if (normalized.includes('rejected') || normalized.includes('overdue') || normalized.includes('returned')) return 'red';
  if (normalized.includes('changes')) return 'blue';
  if (normalized.includes('locked') || normalized.includes('payroll')) return 'violet';
  return 'slate';
}

function SimpleNameCell({ data, primary, secondary }) {
  if (!data) return null;
  return (
    <div className="timesheet-grid-name-cell">
      <strong>{data[primary]}</strong>
      <span>{data[secondary]}</span>
    </div>
  );
}

function parseHours(value) {
  const [hours = '0', minutes = '0'] = String(value || '0:00').split(':');
  return Number(hours) + Number(minutes) / 60;
}

function ExceptionCard({ state, onAction, onSecondaryAction, onSelect }) {
  return (
    <div
      className={`myteam-timesheet-exception-card tone-${state.tone}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect?.();
      }}
    >
      <div className="myteam-timesheet-exception-card-head">
        <div>
          <strong>{state.title}</strong>
          <span>{state.subtitle}</span>
        </div>
        <TimesheetStatusChip value={`${state.count} items`} tone={state.tone} />
      </div>
      <div className="myteam-timesheet-exception-card-list">
        {state.items.length > 0 ? state.items.map((item) => (
          <div key={item.id} className="myteam-timesheet-exception-card-row">
            <div className="myteam-timesheet-exception-card-main">
              <strong>{item.employee}</strong>
              <span>{item.project}</span>
              <small>{item.week}</small>
            </div>
            <p>{item.reason}</p>
            <TimesheetStatusChip value={item.status} tone={state.tone} />
          </div>
        )) : (
          <div className="myteam-timesheet-exception-empty">
            <Icon name="circle-check" size={24} />
            <strong>Nothing pending</strong>
            <span>This exception bucket is clear for the current filters.</span>
          </div>
        )}
      </div>
      <div className="myteam-timesheet-exception-actions">
        <button type="button" className="timesheet-secondary-button" onClick={onSecondaryAction}>
          View reason
        </button>
        <button type="button" className="timesheet-primary-button" onClick={onAction}>
          {state.actionLabel}
        </button>
      </div>
    </div>
  );
}

function ReasonDrawer({ state, onAction, onSecondaryAction, onClose }) {
  return (
    <section className={`myteam-timesheet-reason-drawer tone-${state.tone}`}>
      <div className="myteam-timesheet-reason-drawer-head">
        <div>
          <strong>{state.title}</strong>
          <span>{state.subtitle}</span>
        </div>
        <button type="button" className="myteam-timesheet-reason-close" onClick={onClose} aria-label="Close reason drawer">
          <Icon name="circle-xmark" size={14} />
        </button>
      </div>
      <div className="myteam-timesheet-reason-drawer-summary">
        <TimesheetStatusChip value={`${state.count} items`} tone={state.tone} />
        <TimesheetStatusChip value={state.actionLabel} tone="slate" />
      </div>
      <div className="myteam-timesheet-reason-drawer-body">
        {state.items.length > 0 ? state.items.slice(0, 2).map((item) => (
          <article key={item.id} className="myteam-timesheet-reason-drawer-item">
            <div className="myteam-timesheet-reason-drawer-item-head">
              <strong>{item.employee}</strong>
              <span>{item.week}</span>
            </div>
            <p>{item.reason}</p>
            <div className="myteam-timesheet-reason-drawer-item-foot">
              <TimesheetStatusChip value={item.project} tone="blue" />
              <button type="button" className="timesheet-secondary-button" onClick={onSecondaryAction}>
                View reason
              </button>
            </div>
          </article>
        )) : (
          <EmptyState title="Queue clear" subtitle="There are no records in this exception bucket right now." icon="circle-check" />
        )}
      </div>
      <div className="myteam-timesheet-reason-drawer-actions">
        <button type="button" className="timesheet-secondary-button" onClick={onSecondaryAction}>
          View reason
        </button>
        <button type="button" className="timesheet-primary-button" onClick={onAction}>
          {state.actionLabel}
        </button>
      </div>
    </section>
  );
}

function formatHours(value) {
  return `${Number(value || 0).toFixed(1)}h`;
}

function ReportMetric({ label, value, hint, tone = 'slate' }) {
  return (
    <div className={`myteam-timesheet-report-metric tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function ReportBar({ label, value, max, tone = 'blue', caption }) {
  const percent = max > 0 ? Math.max(10, Math.round((value / max) * 100)) : 0;
  return (
    <div className="myteam-timesheet-report-bar">
      <div className="myteam-timesheet-report-bar-head">
        <strong>{label}</strong>
        <span>{caption || formatHours(value)}</span>
      </div>
      <div className="myteam-timesheet-report-bar-track">
        <div className={`myteam-timesheet-report-bar-fill tone-${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function MyTeamTimesheet() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const currentRole = resolveRoleFromStorage();
  const roleMode = currentRole === ROLES.COMPANY_ADMIN || currentRole === ROLES.SUPER_ADMIN ? 'manager' : 'viewer';
  const [weekIndex, setWeekIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState(myTeamTimesheetFilters.teams[0]);
  const [projectFilter, setProjectFilter] = useState(myTeamTimesheetFilters.projects[0]);
  const [statusFilter, setStatusFilter] = useState(myTeamTimesheetFilters.statuses[0]);
  const [employeeFilter, setEmployeeFilter] = useState('All Employees');
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [scopeFilter, setScopeFilter] = useState(myTeamTimesheetFilters.scope[0]);
  const [exceptionFilter, setExceptionFilter] = useState('all');
  const [activeExceptionKey, setActiveExceptionKey] = useState('past-due');
  const [selectedIds, setSelectedIds] = useState([]);
  const [state, setState] = useState(() => loadTimesheetManagerState());
  const activeTab = hashToTab[hash] || 'approvals';

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} myteam-page myteam-timesheet-page`.trim();
    return () => { document.body.className = previous; };
  }, []);

  useEffect(() => saveTimesheetManagerState(state), [state]);

  useEffect(() => {
    if (!hash) navigate(`${pathname}#approvals`, { replace: true, preventScrollReset: true });
  }, [hash, navigate, pathname]);

  const goToTab = (tabKey) => {
    const nextHash = tabToHash[tabKey] || '#approvals';
    navigate(`${pathname}${nextHash}`, { replace: true, preventScrollReset: true });
  };

  const currentWeek = useMemo(() => myTeamTimesheetWeekPeriods[weekIndex], [weekIndex]);
  const dataSnapshot = useMemo(() => buildTimesheetDataSnapshot(), []);
  const lookupMaps = useMemo(() => getTimesheetLookupMaps(), []);
  const filteredApprovals = useMemo(
    () => state.approvals.filter((row) => teamFilter === myTeamTimesheetFilters.teams[0] || row.team === teamFilter)
      .filter((row) => projectFilter === myTeamTimesheetFilters.projects[0] || row.project === projectFilter)
      .filter((row) => statusFilter === myTeamTimesheetFilters.statuses[0] || row.status === statusFilter)
      .filter((row) => employeeFilter === 'All Employees' || row.employee === employeeFilter)
      .filter((row) => dateFilter === 'All Dates' || row.week === dateFilter)
      .filter((row) => scopeMatches(row, scopeFilter))
      .filter((row) => matchesQuery(row, searchTerm)),
    [dateFilter, employeeFilter, projectFilter, scopeFilter, searchTerm, state.approvals, statusFilter, teamFilter],
  );

  const exceptionStates = useMemo(() => {
    const hasPendingApprovals = filteredApprovals.some((row) => ['Draft', 'Submitted', 'Manager Approved', 'HR Approved', 'Rejected'].includes(row.status));
    return {
      'past-due': myTeamTimesheetExceptionStates['past-due'],
      rejected: myTeamTimesheetExceptionStates.rejected,
      partial: myTeamTimesheetExceptionStates.partial,
      noEntries: myTeamTimesheetExceptionStates.noEntries,
      noApprovals: {
        ...myTeamTimesheetExceptionStates.noApprovals,
        title: hasPendingApprovals ? 'No approvals pending for this filter' : myTeamTimesheetExceptionStates.noApprovals.title,
        subtitle: hasPendingApprovals
          ? 'Use this view when the current approvals filter has been cleared.'
          : myTeamTimesheetExceptionStates.noApprovals.subtitle,
        count: 0,
        items: [],
      },
    };
  }, [filteredApprovals]);

  const exceptionKeyList = useMemo(() => ['past-due', 'rejected', 'partial', 'noEntries', 'noApprovals'], []);
  const visibleExceptionKeys = useMemo(
    () => (exceptionFilter === 'all' ? exceptionKeyList : [exceptionFilter]),
    [exceptionFilter, exceptionKeyList],
  );
  const activeExceptionState = exceptionStates[activeExceptionKey] || exceptionStates['past-due'];

  const selectedApproval = useMemo(
    () => {
      if (!filteredApprovals.length) return null;
      const selectedRow = filteredApprovals.find((row) => row.id === state.selectedId) || filteredApprovals[0] || null;
      if (!selectedRow) return null;
      return {
        ...selectedRow,
        employeeRecord: lookupMaps.employeesById[selectedRow.employeeId] || null,
        projectRecord: lookupMaps.projectsById[selectedRow.projectId] || null,
        taskRecord: lookupMaps.tasksById[selectedRow.taskId] || null,
      };
    },
    [filteredApprovals, lookupMaps, state.selectedId],
  );

  useEffect(() => {
    if (!selectedApproval || selectedApproval.id === state.selectedId) return;
    setState((current) => ({ ...current, selectedId: selectedApproval.id, managerComment: selectedApproval.reviewerNote || '' }));
  }, [selectedApproval, state.selectedId]);

  const filteredProjectRows = useMemo(() => myTeamTimesheetProjects
    .filter((row) => teamFilter === myTeamTimesheetFilters.teams[0] || row.team === teamFilter)
    .filter((row) => statusFilter === myTeamTimesheetFilters.statuses[0] || row.status === statusFilter)
    .filter((row) => matchesQuery({ ...row, note: row.status }, searchTerm)), [searchTerm, statusFilter, teamFilter]);

  const filteredSummaryRows = useMemo(() => myTeamTimesheetWeekSummary
    .filter((row) => teamFilter === myTeamTimesheetFilters.teams[0] || row.team === teamFilter)
    .filter((row) => statusFilter === myTeamTimesheetFilters.statuses[0] || row.status === statusFilter)
    .filter((row) => matchesQuery(row, searchTerm)), [searchTerm, statusFilter, teamFilter]);

  const selectedSummary = selectedApproval ? [
    ['Employee', selectedApproval.employee],
    ['Project', selectedApproval.project],
    ['Week', selectedApproval.week],
    ['Status', selectedApproval.status],
    ['Submitted', selectedApproval.submitted],
    ['Overdue', selectedApproval.overdueDays ? `${selectedApproval.overdueDays} day(s)` : 'None'],
  ] : [];

  const employeeOptions = useMemo(() => ['All Employees', ...Array.from(new Set(state.approvals.map((row) => row.employee)))], [state.approvals]);
  const dateOptions = useMemo(() => ['All Dates', ...Array.from(new Set(state.approvals.map((row) => row.week)))], [state.approvals]);

  const updateActivity = (action, row, tone) => {
    setState((current) => ({
      ...current,
      activity: [{ id: `act-${Date.now()}`, time: 'Just now', action, employee: row?.employee || 'Queue', note: row ? `${row.project} - ${row.week}` : 'Queue updated.', tone }, ...current.activity].slice(0, 6),
    }));
  };

  const applyStatusChange = (ids, nextStatus, actionLabel) => {
    if (!ids.length) return;
    const target = state.approvals.find((row) => ids.includes(row.id));
    if (nextStatus === 'Manager Approved' && ids.some((id) => {
      const row = state.approvals.find((item) => item.id === id);
      return ['HR Approved', 'Payroll Ready', 'Payroll Processed'].includes(row?.status);
    })) {
      return;
    }
    if ((nextStatus === 'HR Approved' || nextStatus === 'Payroll Ready') && ids.some((id) => {
      const row = state.approvals.find((item) => item.id === id);
      return row?.status === 'Payroll Processed';
    })) {
      return;
    }
    const payrollStatus = roleMode === 'hr' && nextStatus === 'HR Approved' ? 'Payroll Ready' : nextStatus;
    const nextApprovals = state.approvals.map((row) => (ids.includes(row.id)
      ? {
        ...row,
        status: payrollStatus,
        reviewerNote: state.managerComment || row.reviewerNote,
        note: state.managerComment || row.note,
        lastUpdated: 'Just now',
        auditTrail: [
          {
            id: `audit-${Date.now()}-${row.id}`,
            actor: roleMode === 'hr' ? 'HR' : 'Manager',
            action: payrollStatus,
            note: state.managerComment || row.reviewerNote || row.note || actionLabel,
            time: 'Just now',
          },
          ...(row.auditTrail || []),
        ].slice(0, 6),
      }
      : row));
    setState((current) => ({
      ...current,
      approvals: nextApprovals,
    }));
    syncPayrollHandoffRecords(nextApprovals.filter((row) => ids.includes(row.id)));
    if (target) updateActivity(actionLabel, target, toneForStatus(nextStatus));
    setSelectedIds([]);
    setState((current) => ({ ...current, managerComment: '' }));
  };

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedCount = selectedIds.length;

  const kpis = useMemo(() => {
    const total = filteredApprovals.reduce((sum, row) => sum + parseDuration(row.total), 0);
    const submitted = filteredApprovals.reduce((sum, row) => sum + parseDuration(row.submitted), 0);
    const approved = filteredApprovals.filter((row) => ['Manager Approved', 'HR Approved', 'Payroll Ready'].includes(row.status)).reduce((sum, row) => sum + parseDuration(row.total), 0);
    const pending = filteredApprovals.filter((row) => ['Draft', 'Submitted'].includes(row.status)).reduce((sum, row) => sum + parseDuration(row.submitted), 0);
    return [
      { label: 'Total Hours', value: formatDuration(total), note: 'Filtered approval workload', tone: 'primary' },
      { label: 'Submitted Hours', value: formatDuration(submitted), note: 'Ready for review', tone: 'blue' },
      { label: 'Approved Hours', value: formatDuration(approved), note: 'Closed out', tone: 'green' },
      { label: 'Pending Hours', value: formatDuration(pending), note: 'Waiting on manager action', tone: 'amber' },
      { label: 'Rejected Entries', value: String(filteredApprovals.filter((row) => ['Rejected', 'Returned'].includes(row.status)).length), note: 'Needs correction', tone: 'red' },
      { label: 'Overdue Timesheets', value: String(filteredApprovals.filter((row) => row.status === 'Overdue').length), note: 'Past due items', tone: 'violet' },
    ];
  }, [filteredApprovals]);

  const snapshotCounts = useMemo(() => ({
    employees: dataSnapshot.employees.length,
    projects: dataSnapshot.projects.length,
    tasks: dataSnapshot.tasks.length,
    weeklyEntries: dataSnapshot.weeklyEntries.length,
    statuses: dataSnapshot.statuses.length,
  }), [dataSnapshot]);

  const approvalColumns = useMemo(() => ([
    { field: 'employee', headerName: 'Employee', minWidth: 200, flex: 1.05, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'user' }, cellRenderer: (p) => <SimpleNameCell data={p.data} primary="employee" secondary="project" /> },
    { field: 'team', headerName: 'Team', width: 130, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'people-group' } },
    { field: 'week', headerName: 'Week', width: 180, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'calendar' } },
    { field: 'submitted', headerName: 'Submitted', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock' } },
    { field: 'total', headerName: 'Total', width: 100, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'bullseye' } },
    { field: 'status', headerName: 'Status', width: 150, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'circle-check' }, cellRenderer: TimesheetGridStatusCell },
    { field: 'overdueDays', headerName: 'Overdue', width: 100, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock-rotate-left' }, valueFormatter: (p) => (p.value ? `${p.value}d` : '0d') },
    { headerName: 'Actions', colId: 'actions', width: 150, sortable: false, filter: false, resizable: false, headerComponent: TimesheetGridHeader, headerComponentParams: { showMenu: false, enableFilterButton: false, headerIcon: 'ellipsis-vertical' }, cellRenderer: TimesheetGridActionsCell, cellRendererParams: { actions: [
      { label: 'View timesheet', icon: 'eye', tone: 'view', onClick: (row) => setState((current) => ({ ...current, selectedId: row.id, managerComment: row.reviewerNote || '' })) },
      { label: 'Send to HR', icon: 'circle-check', tone: 'primary', onClick: (row) => applyStatusChange([row.id], 'Manager Approved', 'Sent to HR review') },
      { label: 'Reject timesheet', icon: 'circle-xmark', tone: 'danger', onClick: (row) => applyStatusChange([row.id], 'Rejected', 'Returned to employee') },
    ] } },
  ]), [applyStatusChange]);

  const projectColumns = useMemo(() => ([
    { field: 'project', headerName: 'Project', minWidth: 220, flex: 1.05, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'briefcase' }, cellRenderer: (p) => <SimpleNameCell data={p.data} primary="project" secondary="client" /> },
    { field: 'owner', headerName: 'Owner', width: 150, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'user' } },
    { field: 'team', headerName: 'Team', width: 130, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'people-group' } },
    { field: 'allocated', headerName: 'Allocated', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'calendar-check' } },
    { field: 'logged', headerName: 'Logged', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock' } },
    { field: 'pending', headerName: 'Pending', width: 110, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock-rotate-left' } },
    { field: 'status', headerName: 'Status', width: 140, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'circle-check' }, cellRenderer: TimesheetGridStatusCell },
  ]), []);

  const summaryColumns = useMemo(() => ([
    { field: 'employee', headerName: 'Employee', minWidth: 200, flex: 1.05, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'user' }, cellRenderer: (p) => <SimpleNameCell data={p.data} primary="employee" secondary="team" /> },
    { field: 'timesheets', headerName: 'Timesheets', width: 110, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clipboard' } },
    { field: 'submittedHours', headerName: 'Submitted', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock' } },
    { field: 'approvedHours', headerName: 'Approved', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'circle-check' } },
    { field: 'pendingHours', headerName: 'Pending', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock-rotate-left' } },
    { field: 'rejectedEntries', headerName: 'Rejected', width: 110, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'circle-xmark' } },
    { field: 'status', headerName: 'Status', width: 140, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'circle-check' }, cellRenderer: TimesheetGridStatusCell },
  ]), []);

  const reportWeekRows = useMemo(() => myTeamTimesheetReportWeeks.map((row) => ({
    ...row,
    submittedValue: parseHours(row.submitted),
    approvedValue: parseHours(row.approved),
    pendingValue: parseHours(row.pending),
    overtimeValue: parseHours(row.overtime),
    missingValue: parseHours(row.missing),
  })), []);

  const reportProjectRows = useMemo(() => myTeamTimesheetReportProjects.map((row) => ({
    ...row,
    hoursValue: parseHours(row.hours),
    approvedValue: parseHours(row.approved),
    pendingValue: parseHours(row.pending),
  })), []);

  const reportWeekMax = useMemo(() => Math.max(...reportWeekRows.map((row) => row.submittedValue), 1), [reportWeekRows]);
  const reportProjectMax = useMemo(() => Math.max(...reportProjectRows.map((row) => row.hoursValue), 1), [reportProjectRows]);
  const reportTotals = useMemo(() => ({
    totalHours: reportWeekRows.reduce((sum, row) => sum + row.submittedValue, 0),
    submittedHours: reportWeekRows.reduce((sum, row) => sum + row.submittedValue, 0),
    approvedHours: reportWeekRows.reduce((sum, row) => sum + row.approvedValue, 0),
    pendingHours: reportWeekRows.reduce((sum, row) => sum + row.pendingValue, 0),
    overtimeHours: reportWeekRows.reduce((sum, row) => sum + row.overtimeValue, 0),
    missingHours: reportWeekRows.reduce((sum, row) => sum + row.missingValue, 0),
  }), [reportWeekRows]);

  const reportTrendColumns = useMemo(() => ([
    { field: 'week', headerName: 'Week', minWidth: 180, flex: 1.1, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'calendar' } },
    { field: 'submitted', headerName: 'Submitted', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock' } },
    { field: 'approved', headerName: 'Approved', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'circle-check' } },
    { field: 'pending', headerName: 'Pending', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock-rotate-left' } },
    { field: 'overtime', headerName: 'Overtime', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock' } },
    { field: 'missing', headerName: 'Missing', width: 110, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'circle-xmark' } },
  ]), []);

  const reportProjectColumns = useMemo(() => ([
    { field: 'project', headerName: 'Project', minWidth: 220, flex: 1.2, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'briefcase' }, cellRenderer: (p) => <SimpleNameCell data={p.data} primary="project" secondary="rejectionRate" /> },
    { field: 'hours', headerName: 'Hours', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock' } },
    { field: 'approved', headerName: 'Approved', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'circle-check' } },
    { field: 'pending', headerName: 'Pending', width: 120, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'clock-rotate-left' } },
    { field: 'rejectionRate', headerName: 'Reject %', width: 110, headerComponent: TimesheetGridHeader, headerComponentParams: { headerIcon: 'circle-xmark' } },
  ]), []);

  const rowSelection = { mode: 'multiRow', checkboxes: true, headerCheckbox: true, enableClickSelection: true };
  const baseFilters = (
    <div className="timesheet-toolbar-filters myteam-timesheet-filters">
      <label className="timesheet-toolbar-field"><span>Team</span><select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>{myTeamTimesheetFilters.teams.map((o) => <option key={o}>{o}</option>)}</select></label>
      <label className="timesheet-toolbar-field"><span>Project</span><select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>{myTeamTimesheetFilters.projects.map((o) => <option key={o}>{o}</option>)}</select></label>
      <label className="timesheet-toolbar-field"><span>Status</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>{myTeamTimesheetFilters.statuses.map((o) => <option key={o}>{o}</option>)}</select></label>
      <label className="timesheet-toolbar-field"><span>Employee</span><select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}><option>All Employees</option>{Array.from(new Set(state.approvals.map((row) => row.employee))).map((o) => <option key={o}>{o}</option>)}</select></label>
      <label className="timesheet-toolbar-field"><span>Date</span><select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}><option>All Dates</option>{Array.from(new Set(state.approvals.map((row) => row.week))).map((o) => <option key={o}>{o}</option>)}</select></label>
      <label className="timesheet-toolbar-field"><span>Scope</span><select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}>{myTeamTimesheetFilters.scope.map((o) => <option key={o}>{o}</option>)}</select></label>
    </div>
  );

  const activeSelectionIds = selectedIds.length ? selectedIds : [selectedApproval?.id].filter(Boolean);

  const reviewNotePanel = (
    <TimesheetApprovalPanel
      mode={roleMode === 'hr' ? 'hr' : 'manager'}
      selectedItem={selectedApproval}
      selectedCount={selectedCount}
      comment={state.managerComment}
      onCommentChange={(value) => setState((current) => ({ ...current, managerComment: value }))}
      onApprove={() => applyStatusChange(activeSelectionIds, roleMode === 'hr' ? 'Payroll Ready' : 'Manager Approved', roleMode === 'hr' ? 'Final approved timesheet' : 'Approved timesheet')}
      onReject={() => applyStatusChange(activeSelectionIds, 'Rejected', 'Requested resubmission')}
      onBulkApprove={() => applyStatusChange(activeSelectionIds, 'Payroll Ready', 'Bulk approved timesheets')}
      onSendToPayroll={() => applyStatusChange(activeSelectionIds, 'Payroll Processed', 'Sent to payroll')}
      readOnly={roleMode === 'viewer'}
      auditTrail={selectedApproval?.auditTrail || []}
    />
  );

  const activityPanel = (
    <ActivityPanel title="Activity Panel" subtitle="Recent approval actions and queue changes.">
      <div className="myteam-timesheet-activity-list">
        {state.activity.map((item) => (
          <div key={item.id} className="myteam-timesheet-activity-item">
            <div className="myteam-timesheet-activity-head"><strong>{item.action}</strong><span>{item.time}</span></div>
            <div className="myteam-timesheet-activity-body"><TimesheetStatusChip value={item.employee} tone={item.tone || toneForStatus(item.action)} /><p>{item.note}</p></div>
          </div>
        ))}
      </div>
    </ActivityPanel>
  );

  const approvalsView = (
    <div className="myteam-timesheet-workspace">
      <div className="myteam-timesheet-main">
        <SectionCard
          title={roleMode === 'hr' ? 'HR Final Approval' : 'Manager Approvals Queue'}
          subtitle={roleMode === 'hr' ? 'Finalize manager-approved timesheets, send them to payroll, and record the audit trail.' : 'Review submitted timesheets, leave comments, and route them forward.'}
          actions={(
            <div className="myteam-timesheet-queue-summary">
              <TimesheetStatusChip value={roleMode === 'hr' ? 'HR Final Approval' : roleMode === 'manager' ? 'Manager Review' : 'Read Only'} tone={roleMode === 'hr' ? 'green' : 'blue'} />
              <TimesheetStatusChip value={`${filteredApprovals.length} visible`} tone="blue" />
              <TimesheetStatusChip value={`${selectedCount} selected`} tone="slate" />
            </div>
          )}
        >
          <ApprovalToolbar search={searchTerm} onSearchChange={setSearchTerm}>
            {roleMode === 'manager' ? (
              <>
                <button type="button" className="timesheet-secondary-button" onClick={() => applyStatusChange(activeSelectionIds, 'Rejected', 'Requested changes')} disabled={!selectedApproval}>Reject</button>
                <button type="button" className="timesheet-primary-button" onClick={() => applyStatusChange(activeSelectionIds, 'Manager Approved', 'Forwarded to HR')} disabled={!selectedApproval}>Approve</button>
              </>
            ) : roleMode === 'hr' ? (
              <>
            <button type="button" className="timesheet-secondary-button" onClick={() => applyStatusChange(activeSelectionIds, 'Rejected', 'Returned for correction')} disabled={!selectedApproval}>Reject</button>
                <button type="button" className="timesheet-secondary-button" onClick={() => applyStatusChange(activeSelectionIds, 'Payroll Ready', 'Bulk approved by HR')} disabled={!selectedApproval}>Bulk Approve</button>
                <button type="button" className="timesheet-primary-button" onClick={() => applyStatusChange(activeSelectionIds, 'Payroll Processed', 'Sent to payroll')} disabled={!selectedApproval || selectedApproval?.status !== 'Payroll Ready'}>Send to Payroll</button>
              </>
            ) : null}
          </ApprovalToolbar>
          {baseFilters}
          {filteredApprovals.length > 0 ? (
            <TimesheetAgGrid
              rowData={filteredApprovals}
              columnDefs={approvalColumns}
              getRowId={(params) => params.data.id}
              rowSelection={rowSelection}
              onSelectionChanged={(event) => { const rows = event.api.getSelectedRows(); setSelectedIds(rows.map((row) => row.id)); if (rows[0]?.id) setState((current) => ({ ...current, selectedId: rows[0].id, managerComment: rows[0].reviewerNote || '' })); }}
              onRowClicked={(event) => { if (event.data?.id) setState((current) => ({ ...current, selectedId: event.data.id, managerComment: event.data.reviewerNote || '' })); }}
              paginationPageSize={5}
              noRowsTitle="No approvals found"
              noRowsSubtitle="Try another filter or search term."
              rowClassRules={{ 'timesheet-row-selected': (params) => params.data?.id === selectedApproval?.id || selectedSet.has(params.data?.id) }}
            />
          ) : (
            <div className="myteam-timesheet-grid-empty-wrap">
              <EmptyState title="No approvals found" subtitle="This filter combination returned no pending approvals." actionLabel="Clear search" onAction={() => { setSearchTerm(''); setTeamFilter(myTeamTimesheetFilters.teams[0]); setProjectFilter(myTeamTimesheetFilters.projects[0]); setStatusFilter(myTeamTimesheetFilters.statuses[0]); setEmployeeFilter('All Employees'); setDateFilter('All Dates'); setScopeFilter(myTeamTimesheetFilters.scope[0]); }} icon="clipboard" />
              <div className="myteam-timesheet-grid-empty-actions">
                <button type="button" className="timesheet-secondary-button" onClick={() => goToTab('exceptions')}>
                  View exceptions
                </button>
                <button type="button" className="timesheet-primary-button" onClick={() => goToTab('week-summary')}>
                  Go to week summary
                </button>
              </div>
            </div>
          )}
        </SectionCard>
        <div className="myteam-timesheet-bottom-grid">{reviewNotePanel}{activityPanel}</div>
      </div>
      <aside className="myteam-timesheet-sidebar">
        <SectionCard title="Selected Timesheet" subtitle="Review the latest submission before taking action." actions={<TimesheetStatusChip value={selectedApproval?.status || 'None'} />}>
          {selectedApproval ? (
            <>
              <div className="myteam-timesheet-detail-list">{selectedSummary.map(([label, value]) => <div key={label} className="myteam-timesheet-detail-item"><span>{label}</span><strong>{value}</strong></div>)}</div>
              <div className="myteam-timesheet-review-note"><strong>Manager note</strong><p>{selectedApproval.reviewerNote || 'Add a note before closing this record.'}</p></div>
              <div className="myteam-timesheet-review-note">
                <strong>Workflow</strong>
                <WorkflowStepper status={selectedApproval.status} note={selectedApproval.note || selectedApproval.reason} compact />
              </div>
              <div className="myteam-timesheet-review-note">
                <strong>Audit Trail</strong>
                <div className="myteam-timesheet-audit-list">
                  {(selectedApproval.auditTrail || []).slice(0, 4).map((entry) => (
                    <div key={entry.id} className="myteam-timesheet-audit-item">
                      <div>
                        <span>{entry.action}</span>
                        <small>{entry.time}</small>
                      </div>
                      <p>{entry.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : <EmptyState title="No timesheet selected" subtitle="Select an approval row to inspect hours, comments, and next actions." icon="clipboard" />}
        </SectionCard>
        <SectionCard title="Approval Panel" subtitle="Workflow, approval state, and payroll handoff for the selected row.">
          <TimesheetApprovalPanel
            mode={roleMode === 'hr' ? 'hr' : 'manager'}
            selectedItem={selectedApproval}
            selectedCount={selectedCount}
            comment={state.managerComment}
            onCommentChange={(value) => setState((current) => ({ ...current, managerComment: value }))}
            onApprove={() => applyStatusChange(activeSelectionIds, roleMode === 'hr' ? 'Payroll Ready' : 'Manager Approved', roleMode === 'hr' ? 'Final approved timesheet' : 'Approved timesheet')}
      onReject={() => applyStatusChange(activeSelectionIds, 'Rejected', 'Requested resubmission')}
      onBulkApprove={() => applyStatusChange(activeSelectionIds, 'Payroll Ready', 'Bulk approved timesheets')}
      onSendToPayroll={() => applyStatusChange(activeSelectionIds, 'Payroll Processed', 'Sent to payroll')}
      readOnly={roleMode === 'viewer'}
      auditTrail={selectedApproval?.auditTrail || []}
    />
        </SectionCard>
        <SectionCard title="Week Navigator" subtitle="Move across weeks to review the current approval window.">
          <WeekNavigator period={currentWeek} onPrev={() => setWeekIndex((current) => (current - 1 + myTeamTimesheetWeekPeriods.length) % myTeamTimesheetWeekPeriods.length)} onNext={() => setWeekIndex((current) => (current + 1) % myTeamTimesheetWeekPeriods.length)} />
        </SectionCard>
      </aside>
    </div>
  );

  const projectView = (
    <div className="myteam-timesheet-workspace">
      <div className="myteam-timesheet-main">
        <SectionCard title="Project Allocation" subtitle="Scan project-level hours and review who is over or under allocation." actions={<TimesheetStatusChip value={`${filteredProjectRows.length} projects`} tone="blue" />}>
          {baseFilters}
          <TimesheetAgGrid rowData={filteredProjectRows} columnDefs={projectColumns} getRowId={(params) => params.data.id} noRowsTitle="No projects found" noRowsSubtitle="Project allocation rows will appear here." paginationPageSize={5} />
        </SectionCard>
      </div>
      <aside className="myteam-timesheet-sidebar">
        <SectionCard title="Project Focus" subtitle="Compact view of the selected allocation bucket.">
          <div className="myteam-timesheet-detail-list">{filteredProjectRows.slice(0, 3).map((project) => <div key={project.id} className="myteam-timesheet-detail-item"><span>{project.project}</span><strong>{project.logged} logged</strong></div>)}</div>
        </SectionCard>
        {reviewNotePanel}
      </aside>
    </div>
  );

  const summaryView = (
    <div className="myteam-timesheet-workspace">
      <div className="myteam-timesheet-main">
        <SectionCard title="Report Overview" subtitle="Compact HR-style reporting built for weekly review, project control, and exception scanning." actions={<TimesheetStatusChip value={`${filteredSummaryRows.length} employees`} tone="blue" />}>
          <div className="myteam-timesheet-report-metrics">
            <ReportMetric label="Total Hours by Week" value={formatHours(reportTotals.totalHours)} hint="Submitted across the visible range" tone="primary" />
            <ReportMetric label="Submitted vs Approved" value={`${formatHours(reportTotals.submittedHours)} / ${formatHours(reportTotals.approvedHours)}`} hint="Approval closure ratio" tone="green" />
            <ReportMetric label="Overtime Hours" value={formatHours(reportTotals.overtimeHours)} hint="Extra effort or variance" tone="amber" />
            <ReportMetric label="Missing Hours" value={formatHours(reportTotals.missingHours)} hint="Hours still missing in the queue" tone="red" />
          </div>
          <div className="myteam-timesheet-report-grid">
            <div className="myteam-timesheet-report-panel">
              <div className="myteam-timesheet-report-panel-head">
                <strong>Weekly Trend</strong>
                <span>Submitted, approved, and pending hours over time.</span>
              </div>
              <div className="myteam-timesheet-report-bars">
                {reportWeekRows.map((row) => (
                  <div key={row.id} className="myteam-timesheet-report-bar-group">
                    <div className="myteam-timesheet-report-bar-group-head">
                      <strong>{row.week}</strong>
                      <span>{row.submitted}</span>
                    </div>
                    <ReportBar label="Submitted" value={row.submittedValue} max={reportWeekMax} tone="blue" caption={row.submitted} />
                    <ReportBar label="Approved" value={row.approvedValue} max={reportWeekMax} tone="green" caption={row.approved} />
                    <ReportBar label="Pending" value={row.pendingValue} max={reportWeekMax} tone="amber" caption={row.pending} />
                  </div>
                ))}
              </div>
            </div>
            <div className="myteam-timesheet-report-panel">
              <div className="myteam-timesheet-report-panel-head">
                <strong>Project Mix</strong>
                <span>Hours concentration by project with compact variance markers.</span>
              </div>
              <div className="myteam-timesheet-report-bars">
                {reportProjectRows.map((row) => (
                  <div key={row.id} className="myteam-timesheet-report-bar-group">
                    <div className="myteam-timesheet-report-bar-group-head">
                      <strong>{row.project}</strong>
                      <span>{row.hours}</span>
                    </div>
                    <ReportBar label="Project hours" value={row.hoursValue} max={reportProjectMax} tone="violet" caption={`${row.approved} approved`} />
                    <ReportBar label="Pending" value={row.pendingValue} max={reportProjectMax} tone="amber" caption={row.pending} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Weekly Report Table" subtitle="Clean rollup for submitted vs approved, overtime, and missing time." actions={<TimesheetStatusChip value={`${reportWeekRows.length} weeks`} tone="slate" />}>
          <TimesheetAgGrid
            rowData={reportWeekRows}
            columnDefs={reportTrendColumns}
            getRowId={(params) => params.data.id}
            pagination={false}
            noRowsTitle="No weekly report rows"
            noRowsSubtitle="Weekly reporting rows will appear here."
          />
        </SectionCard>

        <SectionCard title="Project Report Table" subtitle="Project-wise hours and reject rate snapshot." actions={<TimesheetStatusChip value={`${reportProjectRows.length} projects`} tone="slate" />}>
          <TimesheetAgGrid
            rowData={reportProjectRows}
            columnDefs={reportProjectColumns}
            getRowId={(params) => params.data.id}
            pagination={false}
            noRowsTitle="No project report rows"
            noRowsSubtitle="Project reporting rows will appear here."
          />
        </SectionCard>

        <SectionCard title="Week Summary" subtitle="Manager-facing rollup of team-level submitted, approved, pending, and rejected hours." actions={<TimesheetStatusChip value={`${filteredSummaryRows.length} employees`} tone="blue" />}>
          {baseFilters}
          <TimesheetAgGrid rowData={filteredSummaryRows} columnDefs={summaryColumns} getRowId={(params) => params.data.id} noRowsTitle="No summary rows found" noRowsSubtitle="Team summary data will appear here." paginationPageSize={5} />
        </SectionCard>
      </div>
      <aside className="myteam-timesheet-sidebar">
        <SectionCard title="Exception Snapshot" subtitle="Quick scan of rejected and overdue work.">
          <div className="myteam-timesheet-exception-list">
            <div className="myteam-timesheet-exception-item tone-red"><strong>{filteredApprovals.filter((row) => ['Rejected', 'Returned'].includes(row.status)).length} rejected</strong><span>Review allocation and notes.</span></div>
            <div className="myteam-timesheet-exception-item tone-amber"><strong>{filteredApprovals.filter((row) => row.status === 'Overdue').length} overdue</strong><span>Chase submissions before payroll close.</span></div>
            <div className="myteam-timesheet-exception-item tone-blue"><strong>{filteredApprovals.filter((row) => row.status === 'Rejected').length} returned</strong><span>Waiting for employee resubmission.</span></div>
          </div>
        </SectionCard>
        {activityPanel}
      </aside>
    </div>
  );

  const exceptionView = (
    <div className="myteam-timesheet-exception-layout">
      <SectionCard
        title="Exception Center"
        subtitle="Dedicated states for past due, rejected, partially submitted, and missing entries."
        actions={<TimesheetStatusChip value="Operational" tone="amber" />}
      >
        <div className="myteam-timesheet-exception-filters">
          <button type="button" className={`myteam-timesheet-exception-filter ${exceptionFilter === 'all' ? 'active' : ''}`} onClick={() => setExceptionFilter('all')}>
            All
          </button>
          {exceptionKeyList.map((key) => (
            <button
              key={key}
              type="button"
              className={`myteam-timesheet-exception-filter ${exceptionFilter === key ? 'active' : ''}`}
              onClick={() => setExceptionFilter(key)}
            >
              {exceptionStates[key].label}
            </button>
          ))}
        </div>
        <div className="myteam-timesheet-exception-summary">
          <div className="myteam-timesheet-exception-summary-item tone-red">
            <strong>{exceptionStates['past-due'].count}</strong>
            <span>Past due</span>
          </div>
          <div className="myteam-timesheet-exception-summary-item tone-amber">
            <strong>{exceptionStates.rejected.count}</strong>
            <span>Rejected</span>
          </div>
          <div className="myteam-timesheet-exception-summary-item tone-blue">
            <strong>{exceptionStates.partial.count}</strong>
            <span>Partial</span>
          </div>
          <div className="myteam-timesheet-exception-summary-item tone-slate">
            <strong>{exceptionStates.noEntries.count}</strong>
            <span>No entries</span>
          </div>
          <div className="myteam-timesheet-exception-summary-item tone-green">
            <strong>{exceptionStates.noApprovals.count}</strong>
            <span>No approvals</span>
          </div>
        </div>
      </SectionCard>

      <div className="myteam-timesheet-exception-grid">
        {visibleExceptionKeys.map((key) => (
          <ExceptionCard
            key={key}
            state={exceptionStates[key]}
            onSelect={() => setActiveExceptionKey(key)}
            onAction={() => {
              if (key === 'past-due') goToTab('approvals');
              if (key === 'rejected') setStatusFilter('Rejected');
              if (key === 'partial') goToTab('week-summary');
              if (key === 'noEntries') goToTab('approvals');
              if (key === 'noApprovals') goToTab('approvals');
            }}
            onSecondaryAction={() => {
              if (key === 'past-due') setScopeFilter('All Scope');
              if (key === 'rejected') goToTab('approvals');
              if (key === 'partial') setWeekIndex(0);
              if (key === 'noEntries') setSearchTerm('');
              if (key === 'noApprovals') goToTab('week-summary');
            }}
          />
        ))}
      </div>

      <ReasonDrawer
        state={activeExceptionState}
        onAction={() => {
          if (activeExceptionKey === 'past-due') goToTab('approvals');
          if (activeExceptionKey === 'rejected') setStatusFilter('Rejected');
          if (activeExceptionKey === 'partial') goToTab('week-summary');
          if (activeExceptionKey === 'noEntries') goToTab('approvals');
          if (activeExceptionKey === 'noApprovals') goToTab('approvals');
        }}
        onSecondaryAction={() => {
          if (activeExceptionKey === 'past-due') setScopeFilter('All Scope');
          if (activeExceptionKey === 'rejected') goToTab('approvals');
          if (activeExceptionKey === 'partial') setWeekIndex(0);
          if (activeExceptionKey === 'noEntries') setSearchTerm('');
          if (activeExceptionKey === 'noApprovals') goToTab('week-summary');
        }}
        onClose={() => setActiveExceptionKey(visibleExceptionKeys[0] || 'past-due')}
      />
    </div>
  );

  const tabView = activeTab === 'project-time' ? projectView : activeTab === 'week-summary' ? summaryView : activeTab === 'exceptions' ? exceptionView : approvalsView;

  return (
    <MainLayout activeKey={sidebarActiveKeyMap[activeTab] || sidebarActiveKeyMap.approvals} moduleActiveKey="myteam_timesheet" subNavActiveKey={sidebarActiveKeyMap[activeTab] || sidebarActiveKeyMap.approvals} brandText="HRPulse" companyText="" showModuleNav showSubNav moduleNavItems={moduleNavItems} subNavItems={subNavItems}>
      <div className="myteam-timesheet-page">
        <header className="timesheet-hero myteam-timesheet-hero">
          <div className="timesheet-hero-copy">
            <div className="timesheet-kicker">Manager Timesheet</div>
            <h1>Approve weekly hours, keep allocations clean, and close the queue faster.</h1>
            <p>A compact review workspace inspired by Odoo and SeamlessHR, built for high-volume approval scanning, quick comments, and exception handling.</p>
          </div>
        <div className="timesheet-hero-meta">
          <div className="timesheet-hero-pill"><span>Week</span><strong>{currentWeek.label}</strong></div>
          <div className="timesheet-hero-pill"><span>Queue</span><strong>{filteredApprovals.length} open</strong></div>
          <div className="timesheet-hero-pill"><span>Data</span><strong>{snapshotCounts.weeklyEntries} rows</strong></div>
        </div>
      </header>

        <div className="timesheet-tabbar" role="tablist" aria-label="Timesheet views">
          {myTeamTimesheetTabs.map((tab) => (
            <button key={tab.key} type="button" className={`timesheet-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => goToTab(tab.key)} aria-current={activeTab === tab.key ? 'page' : undefined}>
              <span>{tab.label}</span>{tab.badge ? <span className="timesheet-tab-badge">{tab.badge}</span> : null}
            </button>
          ))}
        </div>

        <SummaryCards metrics={kpis} />

        <div className="timesheet-toolbar myteam-timesheet-toolbar">
          <WeekNavigator period={currentWeek} onPrev={() => setWeekIndex((current) => (current - 1 + myTeamTimesheetWeekPeriods.length) % myTeamTimesheetWeekPeriods.length)} onNext={() => setWeekIndex((current) => (current + 1) % myTeamTimesheetWeekPeriods.length)} />
          <ApprovalToolbar search={searchTerm} onSearchChange={setSearchTerm}>
            {roleMode === 'manager' ? (
              <>
                <button type="button" className="timesheet-secondary-button" onClick={() => applyStatusChange(selectedIds.length ? selectedIds : [selectedApproval?.id].filter(Boolean), 'Rejected', 'Requested changes')} disabled={!selectedApproval}>Reject</button>
                <button type="button" className="timesheet-primary-button" onClick={() => applyStatusChange(selectedIds.length ? selectedIds : [selectedApproval?.id].filter(Boolean), 'Manager Approved', 'Approved timesheet')} disabled={!selectedApproval}>Approve</button>
              </>
            ) : roleMode === 'hr' ? (
              <>
                <button type="button" className="timesheet-secondary-button" onClick={() => applyStatusChange(selectedIds.length ? selectedIds : [selectedApproval?.id].filter(Boolean), 'Rejected', 'Returned for correction')} disabled={!selectedApproval}>Reject</button>
                <button type="button" className="timesheet-secondary-button" onClick={() => applyStatusChange(selectedIds.length ? selectedIds : [selectedApproval?.id].filter(Boolean), 'Payroll Ready', 'Bulk approved timesheets')} disabled={!selectedApproval}>Bulk Approve</button>
                <button type="button" className="timesheet-primary-button" onClick={() => applyStatusChange(selectedIds.length ? selectedIds : [selectedApproval?.id].filter(Boolean), 'Payroll Processed', 'Sent to payroll')} disabled={!selectedApproval || selectedApproval?.status !== 'Payroll Ready'}>Send to Payroll</button>
              </>
            ) : null}
          </ApprovalToolbar>
        </div>

        <div className="myteam-timesheet-filter-summary">
          <TimesheetStatusChip value={teamFilter} />
          <TimesheetStatusChip value={projectFilter} />
          <TimesheetStatusChip value={statusFilter} />
          <TimesheetStatusChip value={scopeFilter} />
        </div>

        <div key={activeTab} className="timesheet-tab-panel">
          {tabView}
        </div>
      </div>
    </MainLayout>
  );
}
