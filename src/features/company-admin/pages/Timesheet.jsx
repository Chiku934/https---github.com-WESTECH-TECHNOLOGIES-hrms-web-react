import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import CompanyAdminGridHeader from '../components/CompanyAdminGridHeader';
import TimesheetStatusChip from '../../employee/timesheet/components/TimesheetStatusChip';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  buildCompanyAdminTimesheetApprovals,
  buildCompanyAdminTimesheetExceptions,
  buildCompanyAdminTimesheetSnapshot,
  buildCompanyAdminTimesheetSummary,
  companyAdminTimesheetTabs,
} from '../data/timesheetData';

ModuleRegistry.registerModules([AllCommunityModule]);

const STORAGE_KEY = 'company_admin_timesheet_state_v2';
const sidebarActiveKey = 'company-admin-timesheet';

const workDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const tabToHash = companyAdminTimesheetTabs.reduce((acc, tab) => ({ ...acc, [tab.key]: tab.hash }), {});
const hashToTab = companyAdminTimesheetTabs.reduce((acc, tab) => ({ ...acc, [tab.hash]: tab.key }), {});

const gridTextFilterParams = {
  defaultOption: 'contains',
  maxNumConditions: 1,
  suppressAndOrCondition: true,
};

function formatMinutes(totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  return `${Math.floor(minutes / 60)}:${String(Math.abs(minutes % 60)).padStart(2, '0')}`;
}

function parseMinutes(value) {
  const [hours = '0', minutes = '0'] = String(value || '0:00').split(':');
  return Number(hours) * 60 + Number(minutes);
}

function buildWeekRow(entry, index) {
  const hours = Array.isArray(entry.hours) ? entry.hours : [];
  const totalMinutes = hours.reduce((sum, value) => sum + parseMinutes(value), 0);
  return {
    id: entry.id || `row-${index + 1}`,
    employee: entry.employee,
    role: entry.role,
    team: entry.team,
    manager: entry.manager,
    project: entry.project,
    task: entry.task,
    billable: entry.billable,
    status: entry.status,
    week: entry.week,
    comments: entry.comments,
    attachments: entry.attachments,
    updatedAt: entry.updatedAt,
    hours,
    mon: hours[0] || '0:00',
    tue: hours[1] || '0:00',
    wed: hours[2] || '0:00',
    thu: hours[3] || '0:00',
    fri: hours[4] || '0:00',
    sat: hours[5] || '0:00',
    sun: hours[6] || '0:00',
    total: formatMinutes(totalMinutes),
    totalMinutes,
  };
}

function buildProjectRows(entries) {
  const grouped = entries.reduce((acc, entry) => {
    const key = entry.project || 'Unknown Project';
    if (!acc[key]) {
      acc[key] = {
        project: key,
        manager: entry.manager || 'N/A',
        team: entry.team || 'N/A',
        totalMinutes: 0,
        submittedMinutes: 0,
        approvedMinutes: 0,
        pendingMinutes: 0,
      };
    }
    const bucket = acc[key];
    bucket.totalMinutes += Number(entry.totalMinutes || 0);
    if (['Submitted', 'Manager Approved', 'Approved', 'Payroll Ready', 'Payroll Processed'].includes(entry.status)) {
      bucket.submittedMinutes += Number(entry.totalMinutes || 0);
    }
    if (['Approved', 'Payroll Ready', 'Payroll Processed'].includes(entry.status)) {
      bucket.approvedMinutes += Number(entry.totalMinutes || 0);
    }
    if (['Draft', 'Submitted', 'Rejected'].includes(entry.status)) {
      bucket.pendingMinutes += Number(entry.totalMinutes || 0);
    }
    return acc;
  }, {});

  return Object.values(grouped).map((item, index) => ({
    id: `project-${index + 1}`,
    project: item.project,
    manager: item.manager,
    team: item.team,
    total: formatMinutes(item.totalMinutes),
    submitted: formatMinutes(item.submittedMinutes),
    approved: formatMinutes(item.approvedMinutes),
    pending: formatMinutes(item.pendingMinutes),
  }));
}

function loadState(fallbackEntries, fallbackActivity) {
  if (typeof window === 'undefined') return { entries: fallbackEntries, activity: fallbackActivity };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: fallbackEntries, activity: fallbackActivity };
    const parsed = JSON.parse(raw);
    return {
      entries: Array.isArray(parsed.entries) && parsed.entries.length ? parsed.entries : fallbackEntries,
      activity: Array.isArray(parsed.activity) && parsed.activity.length ? parsed.activity : fallbackActivity,
    };
  } catch {
    return { entries: fallbackEntries, activity: fallbackActivity };
  }
}

function saveState(state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function SectionCard({ title, subtitle, actions, children, className = '' }) {
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

function GridEmptyOverlay({ title, subtitle }) {
  return (
    <div className="timesheet-grid-empty">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function NameCell({ data, primary, secondary }) {
  if (!data) return null;
  return (
    <div className="timesheet-grid-name-cell">
      <strong>{data[primary]}</strong>
      <span>{data[secondary]}</span>
    </div>
  );
}

function ToggleSwitch({ on, label, onToggle }) {
  return (
    <div className="ts-toggle-group">
      <span>{label}</span>
      <button type="button" className={`ts-switch ${on ? 'on' : ''}`.trim()} onClick={onToggle} aria-pressed={on} aria-label={label} />
    </div>
  );
}

function StatCard({ label, value, note, tone = 'primary' }) {
  return (
    <div className={`timesheet-kpi-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

export default function CompanyAdminTimesheet() {
  const location = useLocation();
  const navigate = useNavigate();
  const snapshot = useMemo(() => buildCompanyAdminTimesheetSnapshot(), []);
  const seed = useMemo(
    () => loadState(snapshot.entries, [
      {
        id: 'activity-seed',
        time: 'Just now',
        action: 'Company admin timesheet ready',
        employee: 'System',
        note: 'Review, approve, and summarize weekly hours.',
        tone: 'slate',
      },
    ]),
    [snapshot.entries],
  );

  const [tab, setTab] = useState('all');
  const [weekIndex, setWeekIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [density, setDensity] = useState('list');
  const [dailyEntryMode, setDailyEntryMode] = useState(false);
  const [entries, setEntries] = useState(seed.entries);
  const [activity, setActivity] = useState(seed.activity);
  const [selectedId, setSelectedId] = useState(entries[0]?.id || null);
  const [commentDraft, setCommentDraft] = useState('');
  const [hourDrafts, setHourDrafts] = useState({});

  useEffect(() => {
    const nextTab = hashToTab[location.hash] || 'all';
    if (tab !== nextTab) setTab(nextTab);
  }, [location.hash, tab]);

  useEffect(() => {
    if (!location.hash) {
      navigate({ pathname: location.pathname, search: '', hash: tabToHash[tab] || tabToHash.all }, { replace: true });
    }
  }, [location.hash, location.pathname, navigate, tab]);

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} timesheet-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  useEffect(() => {
    saveState({ entries, activity });
  }, [activity, entries]);

  const weekPeriods = snapshot.weekPeriods.length ? snapshot.weekPeriods : [{ label: 'All Weeks', status: 'Current Week', subtitle: '' }];
  const currentWeek = weekPeriods[weekIndex] || weekPeriods[0];
  const currentWeekLabel = currentWeek.label;

  const currentWeekEntries = useMemo(
    () => entries.filter((entry) => !currentWeekLabel || entry.week === currentWeekLabel),
    [currentWeekLabel, entries],
  );

  const weekRows = useMemo(
    () => currentWeekEntries.map(buildWeekRow),
    [currentWeekEntries],
  );

  const approvalRows = useMemo(
    () => buildCompanyAdminTimesheetApprovals(entries).map((row, index) => ({ ...row, index: index + 1 })),
    [entries],
  );

  const summaryRows = useMemo(() => buildCompanyAdminTimesheetSummary(entries), [entries]);
  const exceptionBuckets = useMemo(() => buildCompanyAdminTimesheetExceptions(entries), [entries]);
  const projectRows = useMemo(() => buildProjectRows(entries), [entries]);
  const taskRows = snapshot.tasks;

  const allRows = useMemo(() => weekRows, [weekRows]);
  const pastDueRows = useMemo(() => exceptionBuckets.pastDue, [exceptionBuckets.pastDue]);
  const rejectedRows = useMemo(() => exceptionBuckets.rejected, [exceptionBuckets.rejected]);
  const projectTimeRows = useMemo(() => projectRows, [projectRows]);
  const timeSummaryRows = useMemo(() => summaryRows, [summaryRows]);
  const myTaskRows = useMemo(() => taskRows, [taskRows]);
  const allocatedRows = useMemo(
    () => projectRows.map((row) => ({
      id: `allocated-${row.project}`,
      project: row.project,
      manager: row.manager,
      team: row.team,
      duration: row.total,
      type: 'Client Project',
      status: Number(row.pending.replace(':', '')) > 0 ? 'In Progress' : 'Completed',
    })),
    [projectRows],
  );

  const activeRows = tab === 'all'
    ? allRows
    : tab === 'past-due'
      ? pastDueRows
      : tab === 'rejected'
        ? rejectedRows
        : tab === 'project-time'
          ? projectTimeRows
          : tab === 'time-summary'
            ? timeSummaryRows
            : tab === 'my-tasks'
              ? myTaskRows
              : allocatedRows;

  useEffect(() => {
    if (!activeRows.some((row) => row.id === selectedId)) {
      setSelectedId(activeRows[0]?.id || null);
    }
  }, [activeRows, selectedId]);

  const selectedRow = useMemo(
    () => activeRows.find((row) => row.id === selectedId) || activeRows[0] || null,
    [activeRows, selectedId],
  );

  const metrics = useMemo(() => {
    const totalMinutes = currentWeekEntries.reduce((sum, entry) => sum + (entry.totalMinutes || 0), 0);
    const timeOffMinutes = currentWeekEntries
      .filter((entry) => String(entry.billable || '').toLowerCase().includes('non'))
      .reduce((sum, entry) => sum + (entry.totalMinutes || 0), 0);
    return {
      totalMinutes,
      timeOffMinutes,
      submitted: currentWeekEntries.filter((entry) => ['Submitted', 'Manager Approved', 'Approved', 'Payroll Ready', 'Payroll Processed'].includes(entry.status)).length,
      pending: currentWeekEntries.filter((entry) => ['Draft', 'Submitted'].includes(entry.status)).length,
      rejected: currentWeekEntries.filter((entry) => entry.status === 'Rejected').length,
    };
  }, [currentWeekEntries]);

  const updateActivity = (action, entry, tone = 'slate') => {
    setActivity((current) => [
      { id: `act-${Date.now()}`, time: 'Just now', action, employee: entry?.employee || 'Timesheet queue', note: entry ? `${entry.project} - ${entry.week}` : 'Queue updated.', tone },
      ...current,
    ].slice(0, 6));
  };

  const updateSelectedEntry = (patch, actionLabel, tone = 'blue') => {
    if (!selectedRow) return;
    const targetId = selectedRow.id;
    setEntries((current) => current.map((entry) => (entry.id === targetId ? { ...entry, ...patch, updatedAt: 'Just now' } : entry)));
    updateActivity(actionLabel, selectedRow, tone);
  };

  const handleCopyLastWeek = () => {
    if (!currentWeekEntries.length) return;
    const next = currentWeekEntries.map((entry, index) => ({
      ...entry,
      id: `${entry.id}-copy-${Date.now()}-${index}`,
      status: 'Draft',
      comments: entry.comments ? `${entry.comments} (Copied from prior week)` : 'Copied from prior week.',
      updatedAt: 'Just now',
    }));
    setEntries((current) => [...next, ...current]);
    updateActivity('Copied last week hours', currentWeekEntries[0], 'blue');
  };

  const handleSaveDraft = () => {
    updateSelectedEntry({
      status: 'Draft',
      comments: commentDraft || selectedRow?.comments || '',
      hours: selectedRow?.hours || [],
    }, 'Saved draft', 'green');
    setCommentDraft('');
  };

  const handleSubmitWeek = () => {
    setEntries((current) => current.map((entry) => (
      entry.week === currentWeekLabel
        ? { ...entry, status: 'Submitted', updatedAt: 'Just now' }
        : entry
    )));
    updateActivity('Submitted weekly timesheet', selectedRow, 'blue');
  };

  const handleApprove = () => {
    if (!selectedRow) return;
    updateSelectedEntry({ status: 'Approved' }, 'Approved selected row', 'green');
  };

  const handleReject = () => {
    if (!selectedRow) return;
    updateSelectedEntry({ status: 'Rejected' }, 'Returned selected row', 'red');
  };

  const handleDelete = () => {
    if (!selectedRow) return;
    setEntries((current) => current.filter((entry) => entry.id !== selectedRow.id));
    updateActivity('Deleted selected row', selectedRow, 'amber');
  };

  const handleHourChange = (dayIndex, value) => {
    if (!selectedRow || tab !== 'all') return;
    setHourDrafts((current) => ({ ...current, [dayIndex]: value }));
    const currentHours = Array.isArray(selectedRow.hours) ? [...selectedRow.hours] : ['', '', '', '', '', '', ''];
    currentHours[dayIndex] = value;
    setEntries((current) => current.map((entry) => (entry.id === selectedRow.id ? { ...entry, hours: currentHours, totalHours: formatMinutes(currentHours.reduce((sum, item) => sum + parseMinutes(item), 0)) } : entry)));
  };

  const renderTitle = () => {
    if (tab === 'all') return 'All Timesheets';
    if (tab === 'past-due') return 'Past Due';
    if (tab === 'rejected') return 'Rejected Timesheets';
    if (tab === 'project-time') return 'Project Time';
    if (tab === 'time-summary') return 'Time Summary';
    if (tab === 'my-tasks') return 'My Tasks';
    return 'Projects Allocated';
  };

  const gridConfig = useMemo(() => {
    if (tab === 'all') {
      return [
        { field: 'project', headerName: 'Projects', minWidth: 220, flex: 1.25, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'briefcase' }, cellRenderer: ({ data }) => (data ? <NameCell data={data} primary="project" secondary={data.task || data.employee || data.week} /> : null) },
        { field: 'status', headerName: 'Status', width: 140, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'circle-check' }, cellRenderer: ({ value }) => <TimesheetStatusChip value={value} tone={value === 'Approved' ? 'green' : value === 'Rejected' ? 'red' : value === 'Submitted' ? 'amber' : 'slate'} /> },
        { field: 'mon', headerName: 'Mon', width: 90, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar-day' } },
        { field: 'tue', headerName: 'Tue', width: 90, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar-day' } },
        { field: 'wed', headerName: 'Wed', width: 90, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar-day' } },
        { field: 'thu', headerName: 'Thu', width: 90, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar-day' } },
        { field: 'fri', headerName: 'Fri', width: 90, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar-day' } },
        { field: 'sat', headerName: 'Sat', width: 90, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar-day' } },
        { field: 'sun', headerName: 'Sun', width: 90, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar-day' } },
        { field: 'total', headerName: 'Task Total hrs/week', width: 150, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'clock' } },
      ];
    }
    if (tab === 'past-due' || tab === 'rejected') {
      return [
        { field: 'employee', headerName: 'Employee', minWidth: 190, flex: 1, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'user' }, cellRenderer: ({ data }) => (data ? <NameCell data={data} primary="employee" secondary="project" /> : null) },
        { field: 'project', headerName: 'Project', minWidth: 180, flex: 1, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'briefcase' } },
        { field: 'week', headerName: 'Week', width: 160, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar' } },
        { field: 'reason', headerName: 'Reason', minWidth: 220, flex: 1.25, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'comment-dots' } },
        { field: 'status', headerName: 'Status', width: 140, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'circle-check' }, cellRenderer: ({ value }) => <TimesheetStatusChip value={value} tone={tab === 'rejected' ? 'red' : 'amber'} /> },
      ];
    }
    if (tab === 'project-time') {
      return [
        { field: 'project', headerName: 'Project', minWidth: 210, flex: 1.15, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'briefcase' }, cellRenderer: ({ data }) => (data ? <NameCell data={data} primary="project" secondary={data.team} /> : null) },
        { field: 'manager', headerName: 'Manager', minWidth: 170, flex: 0.9, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'user' } },
        { field: 'team', headerName: 'Team', width: 140, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'people-group' } },
        { field: 'total', headerName: 'Total', width: 110, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'clock' } },
        { field: 'submitted', headerName: 'Submitted', width: 120, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'paper-plane' } },
        { field: 'approved', headerName: 'Approved', width: 120, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'circle-check' } },
        { field: 'pending', headerName: 'Pending', width: 120, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'clock-rotate-left' } },
      ];
    }
    if (tab === 'time-summary') {
      return [
        { field: 'period', headerName: 'Period', minWidth: 220, flex: 1.15, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar' }, cellRenderer: ({ data }) => (data ? <NameCell data={data} primary="period" secondary="Weekly summary" /> : null) },
        { field: 'total', headerName: 'Total', width: 110, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'clock' } },
        { field: 'submitted', headerName: 'Submitted', width: 120, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'paper-plane' } },
        { field: 'approved', headerName: 'Approved', width: 120, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'circle-check' } },
        { field: 'pending', headerName: 'Pending', width: 120, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'clock-rotate-left' } },
      ];
    }
    if (tab === 'my-tasks') {
      return [
        { field: 'task', headerName: 'Task', minWidth: 220, flex: 1.2, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'clipboard' }, cellRenderer: ({ data }) => (data ? <NameCell data={data} primary="task" secondary={data.project} /> : null) },
        { field: 'project', headerName: 'Project', minWidth: 180, flex: 0.9, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'briefcase' } },
        { field: 'owner', headerName: 'Owner', minWidth: 160, flex: 0.8, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'user' } },
        { field: 'dueDate', headerName: 'Due Date', width: 140, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar' } },
        { field: 'hours', headerName: 'Hours', width: 150, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'clock' } },
        { field: 'status', headerName: 'Stage', width: 130, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'circle-check' }, cellRenderer: ({ value }) => <TimesheetStatusChip value={value} tone={value === 'Completed' ? 'green' : value === 'In Progress' ? 'amber' : 'slate'} /> },
      ];
    }
    return [
      { field: 'project', headerName: 'Project', minWidth: 220, flex: 1.15, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'briefcase' } },
      { field: 'manager', headerName: 'Manager', minWidth: 170, flex: 0.9, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'user' } },
      { field: 'team', headerName: 'Team', width: 140, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'people-group' } },
      { field: 'duration', headerName: 'Duration', width: 180, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'calendar' } },
      { field: 'type', headerName: 'Type', width: 150, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'layer-group' } },
      { field: 'status', headerName: 'Status', width: 140, headerComponent: CompanyAdminGridHeader, headerComponentParams: { headerIcon: 'circle-check' }, cellRenderer: ({ value }) => <TimesheetStatusChip value={value} tone={value === 'Completed' ? 'green' : value === 'In Progress' ? 'amber' : 'slate'} /> },
    ];
  }, [allocatedRows, myTaskRows, pastDueRows, rejectedRows, projectTimeRows, tab, timeSummaryRows]);

  const activeTitle = renderTitle();
  const totalMinutes = metrics.totalMinutes;
  const timeOffMinutes = metrics.timeOffMinutes;
  const progress = totalMinutes > 0 ? Math.min(100, Math.round((totalMinutes / (40 * 60)) * 100)) : 0;

  const toolbarSearchPlaceholder = tab === 'all'
    ? 'Search project, task, week, comment'
    : tab === 'past-due' || tab === 'rejected'
      ? 'Search employee, project, reason'
      : tab === 'project-time'
        ? 'Search project, manager, team'
        : tab === 'time-summary'
          ? 'Search period, totals, approval state'
          : tab === 'my-tasks'
            ? 'Search task, project, owner'
            : 'Search project, manager, type';

  const currentGridSelection = selectedRow || activeRows[0] || null;

  const updateHoursByDay = (dayIndex, value) => {
    if (!currentGridSelection || tab !== 'all') return;
    const dayKey = workDays[dayIndex].toLowerCase();
    const currentHours = Array.isArray(currentGridSelection.hours) ? [...currentGridSelection.hours] : ['', '', '', '', '', '', ''];
    currentHours[dayIndex] = value;
    const patch = {
      hours: currentHours,
      totalHours: formatMinutes(currentHours.reduce((sum, item) => sum + parseMinutes(item), 0)),
      [dayKey]: value,
    };
    setHourDrafts((current) => ({ ...current, [dayIndex]: value }));
    setEntries((current) => current.map((entry) => (entry.id === currentGridSelection.id ? { ...entry, ...patch, updatedAt: 'Just now' } : entry)));
    updateActivity('Updated daily hours', currentGridSelection, 'blue');
  };

  const pageTabs = companyAdminTimesheetTabs;

  return (
    <DashboardShell activeKey={sidebarActiveKey} headerProps={{ companyText: 'Company Admin' }}>
      <div className="timesheet-shell company-admin-timesheet-shell">
        <div className="superadmin-package-tabs" role="tablist" aria-label="Timesheet views">
          {pageTabs.map((item) => (
            <Link
              key={item.key}
              to={{ pathname: location.pathname, search: '', hash: item.hash }}
              replace
              className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
              aria-current={tab === item.key ? 'page' : undefined}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="superadmin-section-header timesheet-section-header">
          <div className="dashboard-section-heading">{activeTitle}</div>
          <div className="ts-toggle-group">
            <ToggleSwitch on={dailyEntryMode} label="Submit daily time entry" onToggle={() => setDailyEntryMode((current) => !current)} />
            <button type="button" className={`icon-btn ${density === 'list' ? 'active' : ''}`} onClick={() => setDensity('list')} aria-label="List view">
              <Icon name="bars" size={12} />
            </button>
            <button type="button" className={`icon-btn ${density === 'grid' ? 'active' : ''}`} onClick={() => setDensity('grid')} aria-label="Grid view">
              <Icon name="table-cells" size={12} />
            </button>
          </div>
        </div>

        {tab === 'all' ? (
          <>
            <div className="timesheet-toolbar">
              <div className="week-nav">
                <button type="button" className="nav-btn" onClick={() => setWeekIndex((current) => (current - 1 + weekPeriods.length) % weekPeriods.length)} aria-label="Previous week">
                  <Icon name="chevron-left" size={12} />
                </button>
                <div className="date-pill">
                  <strong>{currentWeek.label}</strong>
                </div>
                <button type="button" className="nav-btn" onClick={() => setWeekIndex((current) => (current + 1) % weekPeriods.length)} aria-label="Next week">
                  <Icon name="chevron-right" size={12} />
                </button>
                <button type="button" className="nav-btn" aria-label="Calendar">
                  <Icon name="calendar" size={12} />
                </button>
              </div>

              <div className="toolbar-actions">
                <button type="button" className="copy-btn" onClick={handleCopyLastWeek}>
                  Copy last week hours
                </button>
                <button type="button" className="nav-btn" aria-label="More actions">
                  <Icon name="ellipsis" size={12} />
                </button>
              </div>
            </div>

            <div className="timesheet-summary">
              <StatCard
                label="Total"
                value={`${formatMinutes(totalMinutes)} / 40:00`}
                note={`Submitted ${metrics.submitted} rows, ${metrics.pending} pending`}
                tone="primary"
              />
              <StatCard
                label="Time Off"
                value={formatMinutes(timeOffMinutes)}
                note={`${metrics.rejected} rejected rows need attention`}
                tone="blue"
              />
              <div className="summary-block">
                <div className="summary-label">
                  Weekly progress
                  <span className="summary-dot" />
                </div>
                <div className="summary-value">{progress}% complete</div>
                <div className="summary-bar">
                  <div className="summary-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="timesheet-card ts-grid-card timesheet-ag-grid-shell">
              <div className="superadmin-master-searchbar superadmin-master-grid-headerbar" style={{ padding: '12px 14px 0' }}>
                <div className="superadmin-master-searchbar-left">
                  <div className="superadmin-package-search superadmin-master-search">
                    <Icon name="search" size={14} />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder={toolbarSearchPlaceholder}
                    />
                  </div>
                </div>
                <div className="superadmin-master-searchbar-right">
                  <TimesheetStatusChip value={`${activeRows.length} rows`} tone="blue" />
                </div>
              </div>

              <AgGridReact
                theme="legacy"
                rowData={activeRows.filter((row) => {
                  const term = String(searchTerm || '').trim().toLowerCase();
                  if (!term) return true;
                  return Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term));
                })}
                columnDefs={gridConfig}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                  filter: true,
                  floatingFilter: false,
                  suppressMovable: true,
                }}
                domLayout="autoHeight"
                animateRows
                getRowId={(params) => params.data.id}
                suppressCellFocus
                rowHeight={density === 'grid' ? 48 : 56}
                pagination={activeRows.length > 8}
                paginationPageSize={8}
                paginationPageSizeSelector={[8, 12, 20]}
                headerHeight={52}
                noRowsOverlayComponent={GridEmptyOverlay}
                noRowsOverlayComponentParams={{
                  title: 'No timesheets found',
                  subtitle: 'Try another filter or a different week.',
                }}
                rowSelection={{ mode: 'singleRow', enableClickSelection: true }}
                onRowClicked={(event) => setSelectedId(event.data?.id || null)}
                rowClassRules={{
                  'timesheet-row-selected': (params) => params.data?.id === currentGridSelection?.id,
                }}
              />
            </div>

            <div className="timesheet-card">
              <div className="timesheet-card-head">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Save the current draft, submit the week, or make targeted corrections on the selected row.</p>
                </div>
                <div className="timesheet-card-actions">
                  <button type="button" className="timesheet-secondary-button" onClick={handleSaveDraft}>
                    Save
                  </button>
                  <button type="button" className="timesheet-primary-button" onClick={handleSubmitWeek}>
                    Submit weekly timesheet
                  </button>
                </div>
              </div>
              <div className="timesheet-empty-state-actions" style={{ justifyContent: 'space-between' }}>
                <button type="button" className="timesheet-secondary-button">Request Leave</button>
                <button type="button" className="timesheet-secondary-button">Attach file</button>
                <button type="button" className="timesheet-secondary-button">More</button>
              </div>
            </div>

            <div className="comment-grid">
              <SectionCard
                title="Comment Summary"
                subtitle={currentGridSelection ? `${currentGridSelection.project} | ${currentGridSelection.week}` : 'Select a row to inspect details.'}
                actions={currentGridSelection ? <TimesheetStatusChip value={currentGridSelection.status} tone={currentGridSelection.status === 'Approved' ? 'green' : currentGridSelection.status === 'Rejected' ? 'red' : currentGridSelection.status === 'Submitted' ? 'amber' : 'slate'} /> : null}
              >
                {currentGridSelection ? (
                  <>
                    <div className="superadmin-list">
                      <div className="superadmin-list-item"><span>Project</span><strong>{currentGridSelection.project}</strong></div>
                      <div className="superadmin-list-item"><span>Task</span><strong>{currentGridSelection.task || 'N/A'}</strong></div>
                      <div className="superadmin-list-item"><span>Billable</span><strong>{currentGridSelection.billable}</strong></div>
                      <div className="superadmin-list-item"><span>Updated</span><strong>{currentGridSelection.updatedAt || 'Just now'}</strong></div>
                    </div>

                    <label className="timesheet-toolbar-field" style={{ marginTop: 12 }}>
                      <span>Manager Comment</span>
                      <textarea
                        rows={4}
                        value={commentDraft}
                        onChange={(event) => setCommentDraft(event.target.value)}
                        placeholder="Add a short note before saving or submitting"
                        style={{ minHeight: 92, padding: 12, border: '1px solid #dde3ee', borderRadius: 2, font: 'inherit' }}
                      />
                    </label>

                    <div className="timesheet-empty-state-actions" style={{ marginTop: 12 }}>
                      <button type="button" className="timesheet-secondary-button" onClick={handleApprove} disabled={!currentGridSelection}>
                        Approve
                      </button>
                      <button type="button" className="timesheet-secondary-button" onClick={handleReject} disabled={!currentGridSelection}>
                        Reject
                      </button>
                      <button type="button" className="timesheet-secondary-button" onClick={handleDelete} disabled={!currentGridSelection}>
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="timesheet-empty-state">
                    <strong>No timesheet selected</strong>
                    <span>Choose a row in the grid to show the comment summary and row-level actions.</span>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Timesheet Activity"
                subtitle={currentWeek.label}
                actions={<TimesheetStatusChip value={`${activity.length} items`} tone="blue" />}
              >
                <div className="timesheet-workflow-history">
                  {activity.map((item) => (
                    <div key={item.id} className="timesheet-workflow-history-item">
                      <div>
                        <strong>{item.action}</strong>
                        <small>{item.time}</small>
                      </div>
                      <p>{item.employee} - {item.note}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Daily Time Entry" subtitle="Edit the selected row one day at a time.">
              {currentGridSelection ? (
                <div className="timesheet-week-grid-shell">
                  <table className="timesheet-week-grid">
                    <thead>
                      <tr>
                        <th className="col-project">Project</th>
                        {workDays.map((day) => <th key={day}>{day}</th>)}
                        <th className="col-total">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="col-project">
                          <strong>{currentGridSelection.project}</strong>
                          <div className="ts-subtext">{currentGridSelection.task || currentGridSelection.employee}</div>
                        </td>
                        {workDays.map((day, index) => (
                          <td key={day}>
                            <input
                              value={hourDrafts[index] ?? currentGridSelection.hours?.[index] ?? '0:00'}
                              onChange={(event) => handleHourChange(index, event.target.value)}
                            />
                          </td>
                        ))}
                        <td className="col-total">
                          <strong>{currentGridSelection.total}</strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="timesheet-empty-state">
                  <strong>No row selected</strong>
                  <span>Click any row above to open the day-by-day editor.</span>
                </div>
              )}
            </SectionCard>
          </>
        ) : null}

        {tab === 'project-time' ? (
          <SectionCard title="Project Focus" subtitle="Project totals and team coverage in an AG Grid list.">
            <div className="timesheet-grid-shell">
              <AgGridReact
                theme="legacy"
                rowData={projectTimeRows}
                columnDefs={gridConfig}
                defaultColDef={{ sortable: true, resizable: true, filter: true, floatingFilter: false, suppressMovable: true }}
                domLayout="autoHeight"
                animateRows
                getRowId={(params) => params.data.id}
                suppressCellFocus
                rowHeight={density === 'grid' ? 48 : 56}
                pagination={false}
                headerHeight={52}
                noRowsOverlayComponent={GridEmptyOverlay}
                noRowsOverlayComponentParams={{
                  title: 'No project rows',
                  subtitle: 'There are no project totals for the selected filter.',
                }}
              />
            </div>
          </SectionCard>
        ) : null}

        {tab === 'time-summary' ? (
          <SectionCard title="Time Summary" subtitle="Weekly totals and approval closure.">
            <div className="timesheet-summary-layout">
              <div className="timesheet-summary-lines">
                <div><span>Total Hours</span><strong>{formatMinutes(totalMinutes)}</strong></div>
                <div><span>Submitted</span><strong>{metrics.submitted}</strong></div>
                <div><span>Pending</span><strong>{metrics.pending}</strong></div>
              </div>
              <div className="timesheet-grid-shell">
                <AgGridReact
                  theme="legacy"
                  rowData={timeSummaryRows}
                  columnDefs={gridConfig}
                  defaultColDef={{ sortable: true, resizable: true, filter: true, floatingFilter: false, suppressMovable: true }}
                  domLayout="autoHeight"
                  animateRows
                  getRowId={(params) => params.data.id}
                  suppressCellFocus
                  rowHeight={density === 'grid' ? 48 : 56}
                  pagination={false}
                  headerHeight={52}
                  noRowsOverlayComponent={GridEmptyOverlay}
                  noRowsOverlayComponentParams={{
                    title: 'No summary rows',
                    subtitle: 'There are no weekly totals for the selected filters.',
                  }}
                />
              </div>
            </div>
          </SectionCard>
        ) : null}

        {tab === 'my-tasks' ? (
          <SectionCard title="My Tasks" subtitle="Task-wise allocation and stage tracking.">
            <div className="timesheet-grid-shell">
              <AgGridReact
                theme="legacy"
                rowData={myTaskRows}
                columnDefs={gridConfig}
                defaultColDef={{ sortable: true, resizable: true, filter: true, floatingFilter: false, suppressMovable: true }}
                domLayout="autoHeight"
                animateRows
                getRowId={(params) => params.data.id}
                suppressCellFocus
                rowHeight={density === 'grid' ? 48 : 56}
                pagination={false}
                headerHeight={52}
                noRowsOverlayComponent={GridEmptyOverlay}
                noRowsOverlayComponentParams={{
                  title: 'No task rows',
                  subtitle: 'There are no task records available.',
                }}
              />
            </div>
          </SectionCard>
        ) : null}

        {tab === 'projects-allocated' ? (
          <SectionCard title="Projects Allocated" subtitle="Project assignments and durations.">
            <div className="timesheet-grid-shell">
              <AgGridReact
                theme="legacy"
                rowData={allocatedRows}
                columnDefs={gridConfig}
                defaultColDef={{ sortable: true, resizable: true, filter: true, floatingFilter: false, suppressMovable: true }}
                domLayout="autoHeight"
                animateRows
                getRowId={(params) => params.data.id}
                suppressCellFocus
                rowHeight={density === 'grid' ? 48 : 56}
                pagination={false}
                headerHeight={52}
                noRowsOverlayComponent={GridEmptyOverlay}
                noRowsOverlayComponentParams={{
                  title: 'No allocated projects',
                  subtitle: 'There are no allocated project rows available.',
                }}
              />
            </div>
          </SectionCard>
        ) : null}

        {(tab === 'past-due' || tab === 'rejected') ? (
          <SectionCard
            title={tab === 'past-due' ? 'Past Due Timesheets' : 'Rejected Timesheets'}
            subtitle={tab === 'past-due' ? 'Entries that need immediate attention.' : 'Returned timesheets that need corrections.'}
          >
            <div className="timesheet-grid-shell">
              <AgGridReact
                theme="legacy"
                rowData={activeRows}
                columnDefs={gridConfig}
                defaultColDef={{ sortable: true, resizable: true, filter: true, floatingFilter: false, suppressMovable: true }}
                domLayout="autoHeight"
                animateRows
                getRowId={(params) => params.data.id}
                suppressCellFocus
                rowHeight={density === 'grid' ? 48 : 56}
                pagination={false}
                headerHeight={52}
                noRowsOverlayComponent={GridEmptyOverlay}
                noRowsOverlayComponentParams={{
                  title: 'No exception rows',
                  subtitle: 'Try a different filter or week.',
                }}
              />
            </div>
          </SectionCard>
        ) : null}

        <div className="timesheet-empty-state-actions">
          <Link to={{ pathname: location.pathname, search: '', hash: tabToHash.all }} replace className="timesheet-secondary-button" onClick={() => setTab('all')}>
            All Timesheets
          </Link>
          <button type="button" className="timesheet-secondary-button" onClick={() => setCommentDraft('')}>
            Clear Comment
          </button>
          <button type="button" className="timesheet-primary-button" onClick={handleSaveDraft}>
            Save Draft
          </button>
          <button type="button" className="timesheet-primary-button" onClick={handleSubmitWeek}>
            Submit Weekly Timesheet
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
