import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../../../../layouts/MainLayout';
import { ROLES } from '../../../../app/config/roles';
import { resolveRoleFromStorage } from '../../../../data/navigation/index.js';
import TimesheetAgGrid from '../components/TimesheetAgGrid';
import TimesheetHeader from '../components/TimesheetHeader';
import WeekNavigator from '../components/WeekNavigator';
import SummaryCards from '../components/SummaryCards';
import TimesheetStatusChip from '../components/TimesheetStatusChip';
import ActionToolbar from '../components/ActionToolbar';
import FiltersBar from '../components/FiltersBar';
import EmptyState from '../components/EmptyState';
import ApprovalToolbar from '../components/ApprovalToolbar';
import ProjectRail from '../components/ProjectRail';
import TimesheetGridHeader from '../components/TimesheetGridHeader';
import TimesheetGridStatusCell from '../components/TimesheetGridStatusCell';
import TimesheetGridActionsCell from '../components/TimesheetGridActionsCell';
import CommentPanel from '../components/CommentPanel';
import ActivityPanel from '../components/ActivityPanel';
import AttachmentPanel from '../components/AttachmentPanel';
import WeeklyEntryGrid from '../components/WeeklyEntryGrid';
import TimesheetList from '../components/TimesheetList';
import TimesheetForm from '../components/TimesheetForm';
import WorkflowStepper from '../components/WorkflowStepper';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import ToastStack from '../components/ToastStack';
import { buildEmptyTimesheetRow } from '../utils/timeEntryUtils';
import {
  buildTimesheetWorkflowStorageKey,
  deriveTimesheetWorkflowSummary,
  deriveTimesheetWeekStage,
  getWorkflowStageMeta,
  loadTimesheetWorkflowState,
  saveTimesheetWorkflowState,
  updateWorkflowHistory,
  isTimesheetEditable,
} from '../data/workflow';
import {
  timesheetAllocationRows,
  timesheetApprovalRows,
  timesheetExceptionRows,
  timesheetFilters,
  timesheetKpis,
  timesheetProjectRail,
  timesheetProjectOptions,
  timesheetTaskOptions,
  timesheetWeeklyEntrySeedRows,
  timesheetSummaryRows,
  timesheetTabs,
  timesheetTaskRows,
  timesheetWeekPeriods,
  timesheetWorkflowCards,
} from '../data/timesheetUiData';

const tabToHash = timesheetTabs.reduce((acc, tab) => {
  acc[tab.key] = tab.hash;
  return acc;
}, {});

const hashToTab = timesheetTabs.reduce((acc, tab) => {
  acc[tab.hash] = tab.key;
  return acc;
}, {});

const subNavKeyMap = {
  overview: 'timesheet-overview',
  'weekly-entry': 'timesheet-weekly-entry',
  'project-time': 'timesheet-project-time',
  tasks: 'timesheet-tasks',
  projects: 'timesheet-projects',
  summary: 'timesheet-summary',
  approvals: 'timesheet-approvals',
  'past-due': 'timesheet-past-due',
  rejected: 'timesheet-rejected',
};

const weeklyEntryStoragePrefix = 'timesheet_weekly_entries_';

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

function matchesQuery(row, keys, query) {
  const term = String(query || '').trim().toLowerCase();
  if (!term) return true;
  return keys.some((key) => String(row?.[key] ?? '').toLowerCase().includes(term));
}

function buildWeeklyEntryStorageKey(weekLabel) {
  return `${weeklyEntryStoragePrefix}${String(weekLabel || '').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
}

function loadWeeklyEntryRows(storageKey) {
  if (typeof window === 'undefined') return timesheetWeeklyEntrySeedRows;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return timesheetWeeklyEntrySeedRows;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : timesheetWeeklyEntrySeedRows;
  } catch {
    return timesheetWeeklyEntrySeedRows;
  }
}

function saveWeeklyEntryRows(storageKey, rows) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(rows));
  }
}

function isFilledHour(value) {
  const normalized = String(value || '').trim();
  return normalized !== '' && normalized !== '0:00' && normalized !== '0';
}

function buildRowStatus(row) {
  if (String(row?.status || '').toLowerCase().includes('rejected') || String(row?.status || '').toLowerCase().includes('returned')) {
    return 'Changes Requested';
  }
  if (String(row?.status || '').toLowerCase().includes('approved')) return 'Approved';
  if (String(row?.status || '').toLowerCase().includes('submitted')) return 'Submitted';
  if ((row?.hours || []).some(isFilledHour)) return 'Draft';
  return 'Draft';
}

function TimesheetHero({ activeTabKey, currentWeek, roleMode }) {
  const activeLabel = timesheetTabs.find((tab) => tab.key === activeTabKey)?.label || 'Overview';
  const title = roleMode === 'employee'
    ? 'Weekly capture, personal history, and submit-only editing in one workspace.'
    : roleMode === 'hr'
      ? 'Timesheet oversight, final approval, and payroll handoff in one workspace.'
      : 'Weekly capture, approvals, and exception handling in one workspace.';

  return (
    <TimesheetHeader
      activeLabel={activeLabel}
      currentWeek={currentWeek}
      title={activeTabKey === 'overview' ? title : activeLabel}
      description={roleMode === 'employee'
        ? 'Build draft timesheets, submit them once, and review your own history after the lock kicks in.'
        : roleMode === 'hr'
          ? 'Review every submitted week, apply final approval, and move completed records to payroll.'
          : 'Structured like enterprise HR software: compact, actionable, and ready for employee entry, manager review, project allocation, and reporting.'}
    />
  );
}

function OverviewPanel({ onOpenWeeklyEntry, onOpenApprovals }) {
  return (
    <div className="timesheet-overview-grid">
      <SectionCard
        title="Weekly Operating Summary"
        subtitle="A concise snapshot of time capture, approval state, and exceptions."
        className="timesheet-overview-main"
      >
        <div className="timesheet-summary-lines">
          <div><span>Capture progress</span><strong>84% complete</strong></div>
          <div><span>Approval readiness</span><strong>12 hours pending</strong></div>
          <div><span>Exceptions</span><strong>6 overdue, 3 rejected</strong></div>
        </div>
        <div className="timesheet-workflow-grid">
          {timesheetWorkflowCards.map((card) => (
            <article key={card.title} className="timesheet-workflow-card">
              <span>{card.title}</span>
              <strong>{card.value}</strong>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Action Center"
        subtitle="Shortcuts for daily capture and week close-out."
        className="timesheet-overview-side"
      >
        <div className="timesheet-action-stack">
          <button type="button" className="timesheet-primary-button" onClick={onOpenWeeklyEntry}>Open Weekly Entry</button>
          <button type="button" className="timesheet-secondary-button" onClick={onOpenWeeklyEntry}>Resume Draft</button>
          <button type="button" className="timesheet-secondary-button" onClick={onOpenApprovals}>View Approvals</button>
        </div>
      </SectionCard>
    </div>
  );
}

function WeeklyEntryPanel({ currentWeek, search, onOpenApprovals, roleMode }) {
  const storageKey = useMemo(() => buildWeeklyEntryStorageKey(currentWeek.label), [currentWeek.label]);
  const workflowStorageKey = useMemo(() => buildTimesheetWorkflowStorageKey(currentWeek.label), [currentWeek.label]);
  const [rows, setRows] = useState(() => loadWeeklyEntryRows(storageKey));
  const [workflowState, setWorkflowState] = useState(() => loadTimesheetWorkflowState(workflowStorageKey, rows));
  const [selectedRowId, setSelectedRowId] = useState(() => loadWeeklyEntryRows(storageKey)[0]?.id || null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toasts, setToasts] = useState([]);
  const lastStorageKeyRef = useRef(storageKey);
  const lastWorkflowKeyRef = useRef(workflowStorageKey);

  useEffect(() => {
    const nextRows = loadWeeklyEntryRows(storageKey);
    setRows(nextRows);
    setSelectedRowId(nextRows[0]?.id || null);
    setWorkflowState(loadTimesheetWorkflowState(workflowStorageKey, nextRows));
    lastStorageKeyRef.current = storageKey;
    lastWorkflowKeyRef.current = workflowStorageKey;
  }, [storageKey, workflowStorageKey]);

  useEffect(() => {
    if (lastStorageKeyRef.current !== storageKey) {
      lastStorageKeyRef.current = storageKey;
      return;
    }
    saveWeeklyEntryRows(storageKey, rows);
  }, [rows, storageKey]);

  useEffect(() => {
    if (lastWorkflowKeyRef.current !== workflowStorageKey) {
      lastWorkflowKeyRef.current = workflowStorageKey;
      return;
    }
    saveTimesheetWorkflowState(workflowStorageKey, workflowState);
  }, [workflowState, workflowStorageKey]);

  useEffect(() => {
    setSelectedRowId((current) => {
      if (current && rows.some((row) => row.id === current)) return current;
      return rows[0]?.id || null;
    });
  }, [rows]);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timers = toasts.map((toast) => window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, 2600));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts]);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesQuery(row, ['project', 'task', 'billable', 'status', 'comment'], search)),
    [rows, search],
  );
  const workflowSummary = useMemo(() => deriveTimesheetWorkflowSummary(rows), [rows]);
  const workflowStage = useMemo(() => getWorkflowStageMeta(workflowState.stage || deriveTimesheetWeekStage(rows)), [rows, workflowState.stage]);
  const selectedRow = useMemo(() => rows.find((row) => row.id === selectedRowId) || filteredRows[0] || rows[0] || null, [filteredRows, rows, selectedRowId]);
  const weekEditable = roleMode === 'employee' && isTimesheetEditable(workflowState.stage || deriveTimesheetWeekStage(rows));
  const selectedEditable = Boolean(selectedRow) && weekEditable && isTimesheetEditable(selectedRow?.status);
  const pushToast = (title, message, tone = 'green') => {
    setToasts((current) => [...current, { id: `toast-${Date.now()}`, title, message, tone }].slice(-3));
  };

  const handleChangeRow = (rowId, field, value, dayIndex = null) => {
    if (!weekEditable) return;
    const currentRow = rows.find((row) => row.id === rowId);
    if (!isTimesheetEditable(currentRow?.status)) return;
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        if (field === 'hour' && dayIndex !== null) {
          const nextHours = [...row.hours];
          nextHours[dayIndex] = value;
          return { ...row, hours: nextHours, status: 'Draft' };
        }
        if (field === 'project') {
          return {
            ...row,
            project: value,
            task: timesheetTaskOptions[value]?.[0] || '',
            status: 'Draft',
          };
        }
        const nextRow = { ...row, [field]: value };
        if (field === 'task' || field === 'billable' || field === 'comment') {
          nextRow.status = 'Draft';
        }
        return nextRow;
      }),
    );
  };

  const handleAddRow = (afterRowId = null) => {
    if (!weekEditable) return;
    const newRow = buildEmptyTimesheetRow();
    setSelectedRowId(newRow.id);
    setRows((current) => {
      if (!afterRowId) return [...current, newRow];
      const next = [...current];
      const index = next.findIndex((row) => row.id === afterRowId);
      if (index === -1) return [...current, newRow];
      next.splice(index + 1, 0, newRow);
      return next;
    });
  };

  const handleRemoveRow = (rowId) => {
    if (!weekEditable) return;
    setRows((current) => current.filter((row) => row.id !== rowId));
  };

  const handleSelectRow = (row) => {
    setSelectedRowId(row?.id || null);
  };

  const handleCopyLastWeek = () => {
    if (!weekEditable) return;
    const currentIndex = timesheetWeekPeriods.findIndex((period) => period.label === currentWeek.label);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : timesheetWeekPeriods.length - 1;
    const previousStorageKey = buildWeeklyEntryStorageKey(timesheetWeekPeriods[previousIndex].label);
    const copiedRows = loadWeeklyEntryRows(previousStorageKey).map((row) => ({ ...row, id: `${row.id}-copy-${Date.now()}`, status: 'Draft' }));
    setRows(copiedRows);
    setSelectedRowId(copiedRows[0]?.id || null);
    setWorkflowState((current) => updateWorkflowHistory({
      ...current,
      stage: 'draft',
      note: 'Copied from the previous week',
    }, 'Copied last week', 'Employee', 'Previous week rows were copied into the draft.'));
    pushToast('Draft copied', 'Previous week rows were brought into the current draft.', 'blue');
  };

  const handleSaveDraft = () => {
    if (!weekEditable) return;
    const nextRows = rows.map((row) => (isTimesheetEditable(row.status) ? { ...row, status: 'Draft' } : row));
    setRows(nextRows);
    setWorkflowState((current) => updateWorkflowHistory({
      ...current,
      stage: deriveTimesheetWeekStage(nextRows),
      note: 'Draft saved for this week',
    }, 'Draft saved', 'Employee', `${nextRows.filter((row) => row.status !== 'Draft').length} row(s) updated.`));
    saveWeeklyEntryRows(storageKey, nextRows);
    pushToast('Draft saved', 'Your editable timesheets were saved locally.', 'green');
  };

  const handleSubmitWeek = () => {
    if (!weekEditable) {
      pushToast('Locked', 'Submitted weeks cannot be edited again from this workspace.', 'amber');
      return;
    }
    const nextRows = rows.map((row) => {
      if (!isTimesheetEditable(row.status)) return row;
      const hasTime = (row.hours || []).some(isFilledHour);
      if (!hasTime) return { ...row, status: 'Draft' };
      return { ...row, status: 'Submitted' };
    });
    const submittedCount = nextRows.filter((row) => row.status === 'Submitted').length;
    if (!submittedCount) {
      setRows(nextRows);
      setWorkflowState((current) => updateWorkflowHistory({
        ...current,
        stage: 'draft',
        note: 'Add at least one time entry before submitting',
      }, 'Submission blocked', 'System', 'The week still needs logged hours before it can move to review.'));
      pushToast('Submission blocked', 'Add at least one logged hour before submitting.', 'red');
      return;
    }
    setRows(nextRows);
    setWorkflowState((current) => updateWorkflowHistory({
      ...current,
      stage: 'submitted',
      note: 'Submitted for manager review',
    }, 'Submitted for review', 'Employee', 'Manager review queue updated with the latest week.'));
    pushToast('Submitted', 'Timesheets are now locked until review returns them.', 'blue');
  };

  const handleRecallSubmission = () => {
    if (!weekEditable) return;
    const nextRows = rows.map((row) => ({ ...row, status: row.status === 'Submitted' ? 'Draft' : row.status }));
    setRows(nextRows);
    setWorkflowState((current) => updateWorkflowHistory({
      ...current,
      stage: 'draft',
      note: 'Submission recalled by employee',
    }, 'Submission recalled', 'Employee', 'The week has been moved back to draft.'));
    pushToast('Submission recalled', 'Submitted rows were moved back to draft.', 'amber');
  };

  const handleFormChange = (field, value, dayIndex = null) => {
    if (!selectedRow || !selectedEditable) return;
    handleChangeRow(selectedRow.id, field, value, dayIndex);
  };

  const handleCreateDraft = () => {
    if (!weekEditable) return;
    const nextRow = buildEmptyTimesheetRow();
    setRows((current) => [...current, nextRow]);
    setSelectedRowId(nextRow.id);
    pushToast('New draft created', 'Start filling in the new timesheet row.', 'blue');
  };

  const handleDeleteDraft = () => {
    if (!selectedRow || !selectedEditable) return;
    setRows((current) => current.filter((row) => row.id !== selectedRow.id));
    setSelectedRowId(null);
    pushToast('Draft deleted', 'The selected draft has been removed.', 'amber');
  };

  const handleConfirmSubmit = () => {
    setConfirmAction('submit');
  };

  const handleResolveConfirm = () => {
    if (confirmAction === 'submit') {
      handleSubmitWeek();
    }
    setConfirmAction(null);
  };

  const totalRows = filteredRows.length;

  return (
    <div className="timesheet-entry-layout">
      <SectionCard title="Project Rail" subtitle="Quick access to active project buckets." className="timesheet-project-rail-card">
        <ProjectRail projects={timesheetProjectRail} />
      </SectionCard>

      <div className="timesheet-entry-stack">
        <SectionCard
          title="Weekly Entry"
          subtitle="Use the list and form to manage draft and rejected timesheets, then lock them on submission."
          actions={(
            <>
                <button type="button" className="timesheet-secondary-button" onClick={handleCopyLastWeek} disabled={!weekEditable}>Copy Last Week</button>
              <button type="button" className="timesheet-secondary-button" onClick={handleCreateDraft} disabled={!weekEditable}>New Draft</button>
              <button type="button" className="timesheet-secondary-button" onClick={handleSaveDraft} disabled={!weekEditable}>Save Draft</button>
              {rows.some((row) => row.status === 'Submitted') && weekEditable ? (
                <button type="button" className="timesheet-secondary-button" onClick={handleRecallSubmission}>Recall Submission</button>
              ) : null}
              <button type="button" className="timesheet-primary-button" onClick={handleConfirmSubmit} disabled={!weekEditable}>Submit Timesheet</button>
            </>
          )}
          className="timesheet-entry-card"
        >
          <div className="timesheet-week-entry-summary timesheet-week-workflow-summary">
            <div>
              <span>Current Week</span>
              <strong>{currentWeek.label}</strong>
            </div>
            <div>
              <span>Workflow Stage</span>
              <strong>{workflowStage.label}</strong>
            </div>
            <div>
              <span>Next Owner</span>
              <strong>{workflowStage.owner}</strong>
            </div>
            <div>
              <span>Rows</span>
              <strong>{totalRows}</strong>
            </div>
            <div>
              <span>Draft / Review / Approved</span>
              <strong>{workflowSummary.draftCount} / {workflowSummary.submittedCount} / {workflowSummary.approvedCount}</strong>
            </div>
          </div>

          <div className="timesheet-week-workflow-banner">
            <div>
              <StatusBadge value={workflowStage.label} tone={workflowStage.tone} />
              <strong>{workflowStage.description}</strong>
              <p>{workflowState.note || 'Keep working in draft until you are ready to move the week into the approval queue.'}</p>
              <WorkflowStepper status={workflowStage.label} note={`Last action: ${workflowState.lastAction}`} compact />
            </div>
            <div className="timesheet-week-workflow-banner-actions">
              <button type="button" className="timesheet-secondary-button" onClick={handleSaveDraft} disabled={!weekEditable}>Save Draft</button>
              <button type="button" className="timesheet-primary-button" onClick={handleConfirmSubmit} disabled={!weekEditable}>Submit for Approval</button>
            </div>
          </div>

          {!weekEditable ? (
            <div className="timesheet-approval-panel-indicator tone-slate">
              <strong>Editing locked</strong>
              <span>{roleMode === 'employee'
                ? 'This week is already submitted or finalized. Review the workflow and history instead of editing.'
                : 'This workspace is read-only for the current role.'}</span>
            </div>
          ) : null}

          <div className="timesheet-workflow-grid-layout">
            <TimesheetList
              items={filteredRows}
              selectedId={selectedRow?.id}
              onSelect={handleSelectRow}
              onCreate={weekEditable ? handleCreateDraft : null}
            />
            <TimesheetForm
              value={selectedRow}
              projectOptions={timesheetProjectOptions}
              taskOptions={timesheetTaskOptions}
              editable={selectedEditable}
              onChange={handleFormChange}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleConfirmSubmit}
              onDelete={handleDeleteDraft}
            />
          </div>

          <SectionCard title="Detailed Hour Grid" subtitle="The classic entry grid remains available for row-level hour capture." className="timesheet-grid-card-shell">
            <WeeklyEntryGrid
              rows={filteredRows}
              projectOptions={timesheetProjectOptions}
              taskOptions={timesheetTaskOptions}
              onChangeRow={handleChangeRow}
              onRemoveRow={handleRemoveRow}
              onAddRow={handleAddRow}
              onCopyLastWeek={handleCopyLastWeek}
            />
          </SectionCard>
        </SectionCard>

        <div className="timesheet-bottom-panels">
          <CommentPanel title="Comments" subtitle="Add notes for managers or payroll reviewers." />
          <AttachmentPanel count={rows.reduce((total, row) => total + (row.attachmentCount || 0), 0)} />
        </div>

        <div className="timesheet-bottom-panels">
          <ActivityPanel title="Weekly Activity" subtitle="Track saves, submissions, and row changes." />
            <SectionCard title="Week Actions" subtitle="Quick access to the next step in the workflow.">
              <div className="timesheet-action-stack">
                <button type="button" className="timesheet-secondary-button" onClick={handleSaveDraft} disabled={!weekEditable}>Save Draft</button>
                <button type="button" className="timesheet-primary-button" onClick={handleSubmitWeek} disabled={!weekEditable}>Submit for Approval</button>
                <button type="button" className="timesheet-secondary-button" onClick={onOpenApprovals}>Go to Approvals</button>
              </div>
            <div className="timesheet-workflow-history">
              {workflowState.history.map((entry) => (
                <article key={entry.id} className="timesheet-workflow-history-item">
                  <div>
                    <strong>{entry.action}</strong>
                    <span>{entry.actor}</span>
                  </div>
                  <small>{entry.time}</small>
                  {entry.note ? <p>{entry.note}</p> : null}
                </article>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
      {confirmAction ? (
        <ConfirmModal
          title="Submit timesheet"
          description="Submitting will lock the selected editable timesheets until manager review returns them."
          confirmLabel="Submit"
          tone="primary"
          onCancel={() => setConfirmAction(null)}
          onConfirm={handleResolveConfirm}
        />
      ) : null}
      <ToastStack items={toasts} />
    </div>
  );
}

function ProjectTimePanel({ onOpenWeeklyEntry }) {
  return (
    <div className="timesheet-entry-layout">
      <SectionCard title="Project Rail" subtitle="Allocate time against the right project first." className="timesheet-project-rail-card">
        <ProjectRail projects={timesheetProjectRail} />
      </SectionCard>
      <SectionCard title="Project Time" subtitle="A compact project-first entry surface for focused logging." className="timesheet-project-detail-card">
        <EmptyState
          title="No project time selected"
          subtitle="Project-specific entries will appear here with filters, task selectors, and allocated hour summaries."
          actionLabel="Go to Weekly Entry"
          onAction={onOpenWeeklyEntry}
        />
      </SectionCard>
    </div>
  );
}

function TasksPanel({ rows, search }) {
  const columnDefs = useMemo(() => ([
    {
      field: 'task',
      headerName: 'Task',
      minWidth: 220,
      flex: 1.25,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'list-check' },
      cellRenderer: (params) => (
        <div className="timesheet-grid-name-cell">
          <strong>{params.value}</strong>
          <span>{params.data.project}</span>
        </div>
      ),
    },
    {
      field: 'project',
      headerName: 'Project',
      minWidth: 180,
      flex: 0.9,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'briefcase' },
    },
    {
      field: 'owner',
      headerName: 'Owner',
      minWidth: 160,
      flex: 0.8,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'user' },
    },
    {
      field: 'due',
      headerName: 'Due Date',
      width: 140,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
    },
    {
      field: 'hours',
      headerName: 'Hours',
      width: 150,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'clock' },
    },
    {
      field: 'status',
      headerName: 'Stage',
      width: 140,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: TimesheetGridStatusCell,
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 124,
      sortable: false,
      filter: false,
      resizable: false,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { showMenu: false, enableFilterButton: false, headerIcon: 'ellipsis-vertical' },
      cellRenderer: TimesheetGridActionsCell,
      cellRendererParams: {
        actions: [
          { label: 'View task', icon: 'eye', tone: 'view' },
          { label: 'Log time', icon: 'pen-to-square', tone: 'edit' },
        ],
      },
    },
  ]), []);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesQuery(row, ['task', 'project', 'owner', 'status', 'hours'], search)),
    [rows, search],
  );

  return (
    <SectionCard
      title="My Tasks"
      subtitle="Task-focused allocation view with project linkage and stage visibility."
      actions={(
        <>
          <button type="button" className="timesheet-secondary-button">Filter Stage</button>
          <button type="button" className="timesheet-secondary-button">Search</button>
        </>
      )}
    >
      <TimesheetAgGrid
        rowData={filteredRows}
        columnDefs={columnDefs}
        getRowId={(params) => params.data.task}
        noRowsTitle="No tasks found"
        noRowsSubtitle="No task matches the current search."
      />
    </SectionCard>
  );
}

function ProjectsPanel({ rows, search }) {
  const columnDefs = useMemo(() => ([
    {
      field: 'project',
      headerName: 'Project',
      minWidth: 220,
      flex: 1.2,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'briefcase' },
      cellRenderer: (params) => (
        <div className="timesheet-grid-name-cell">
          <strong>{params.value}</strong>
          <span>{params.data.type}</span>
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: TimesheetGridStatusCell,
    },
    {
      field: 'manager',
      headerName: 'Manager',
      minWidth: 160,
      flex: 0.85,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'user' },
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 180,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'layer-group' },
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 124,
      sortable: false,
      filter: false,
      resizable: false,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { showMenu: false, enableFilterButton: false, headerIcon: 'ellipsis-vertical' },
      cellRenderer: TimesheetGridActionsCell,
      cellRendererParams: {
        actions: [
          { label: 'View project', icon: 'eye', tone: 'view' },
          { label: 'Open allocation', icon: 'link', tone: 'edit' },
        ],
      },
    },
  ]), []);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesQuery(row, ['project', 'status', 'manager', 'duration', 'type'], search)),
    [rows, search],
  );

  return (
    <SectionCard
      title="Allocated Projects"
      subtitle="Projects assigned to the employee with duration and manager context."
      actions={<button type="button" className="timesheet-secondary-button">Export List</button>}
    >
      <TimesheetAgGrid
        rowData={filteredRows}
        columnDefs={columnDefs}
        getRowId={(params) => params.data.project}
        noRowsTitle="No allocated projects"
        noRowsSubtitle="No projects match the current search."
      />
    </SectionCard>
  );
}

function SummaryPanel({ rows, search }) {
  const columnDefs = useMemo(() => ([
    {
      field: 'period',
      headerName: 'Period',
      minWidth: 210,
      flex: 1,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
      cellRenderer: (params) => (
        <div className="timesheet-grid-name-cell">
          <strong>{params.value}</strong>
          <span>Week summary</span>
        </div>
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'clock' },
    },
    {
      field: 'submitted',
      headerName: 'Submitted',
      width: 120,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'paper-plane' },
    },
    {
      field: 'approved',
      headerName: 'Approved',
      width: 120,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
    },
    {
      field: 'pending',
      headerName: 'Pending',
      width: 120,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'clock-rotate-left' },
    },
  ]), []);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesQuery(row, ['period', 'total', 'submitted', 'approved', 'pending'], search)),
    [rows, search],
  );

  return (
    <div className="timesheet-summary-layout">
      <SummaryCards metrics={timesheetKpis.slice(0, 4)} compact />
      <SectionCard title="Summary Trends" subtitle="Weekly totals and submission states across recent periods.">
        <TimesheetAgGrid
          rowData={filteredRows}
          columnDefs={columnDefs}
          getRowId={(params) => params.data.period}
          noRowsTitle="No summary rows"
          noRowsSubtitle="No report period matches the current search."
        />
      </SectionCard>
    </div>
  );
}

function ApprovalsPanel({ rows, search, onSearchChange, roleMode, onViewInPayroll }) {
  const [selectedApprovalId, setSelectedApprovalId] = useState(rows[0]?.id || null);
  const columnDefs = useMemo(() => ([
    {
      field: 'employee',
      headerName: 'Employee',
      minWidth: 190,
      flex: 1,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'user' },
      cellRenderer: (params) => (
        <div className="timesheet-grid-name-cell">
          <strong>{params.value}</strong>
          <span>{params.data.project}</span>
        </div>
      ),
    },
    {
      field: 'week',
      headerName: 'Week',
      width: 170,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
    },
    {
      field: 'submitted',
      headerName: 'Submitted',
      width: 120,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'clock' },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: TimesheetGridStatusCell,
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 160,
      sortable: false,
      filter: false,
      resizable: false,
      headerComponent: TimesheetGridHeader,
      headerComponentParams: { showMenu: false, enableFilterButton: false, headerIcon: 'ellipsis-vertical' },
      cellRenderer: TimesheetGridActionsCell,
      cellRendererParams: {
        actions: [
          { label: 'View approval', icon: 'eye', tone: 'view' },
          { label: 'Approve timesheet', icon: 'circle-check', tone: 'primary' },
          { label: 'Reject timesheet', icon: 'circle-xmark', tone: 'danger' },
        ],
      },
    },
  ]), []);

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesQuery(row, ['employee', 'project', 'week', 'submitted', 'status'], search)),
    [rows, search],
  );

  useEffect(() => {
    if (filteredRows.some((row) => row.id === selectedApprovalId)) return;
    setSelectedApprovalId(filteredRows[0]?.id || null);
  }, [filteredRows, selectedApprovalId]);

  const selectedApproval = useMemo(
    () => filteredRows.find((row) => row.id === selectedApprovalId) || filteredRows[0] || null,
    [filteredRows, selectedApprovalId],
  );
  const approvalMode = roleMode === 'hr' ? 'hr' : 'manager';

  return (
    <div className="timesheet-approvals-layout">
      <SectionCard
        title={approvalMode === 'hr' ? 'HR Final Approvals' : 'Manager Approvals'}
        subtitle={approvalMode === 'hr'
          ? 'Final approval queue with payroll-ready records and bulk closeout.'
          : 'Manager queue with review-first actions and submitted records.'}
      >
        <ApprovalToolbar search={search} onSearchChange={onSearchChange}>
          {approvalMode === 'hr' ? (
            <>
              <button type="button" className="timesheet-secondary-button">Bulk Approve</button>
              <button type="button" className="timesheet-primary-button">Send to Payroll</button>
            </>
          ) : (
            <>
              <button type="button" className="timesheet-secondary-button">Bulk Reject</button>
              <button type="button" className="timesheet-primary-button">Open Comment Panel</button>
            </>
          )}
        </ApprovalToolbar>
        <TimesheetAgGrid
          rowData={filteredRows}
          columnDefs={columnDefs}
          getRowId={(params) => params.data.employee}
          rowSelection={{ mode: 'singleRow', enableClickSelection: true }}
          onRowClicked={(event) => setSelectedApprovalId(event.data?.id || null)}
          noRowsTitle="No approvals found"
          noRowsSubtitle="No approvals match the current search."
        />
      </SectionCard>
      <SectionCard
        title="Approval Panel"
        subtitle="Selected row details, workflow state, and payroll handoff status."
        className="timesheet-approval-side-panel"
      >
        <TimesheetApprovalPanel
          mode={approvalMode}
          selectedItem={selectedApproval}
          selectedCount={filteredRows.length}
          auditTrail={selectedApproval?.auditTrail || []}
          comment={selectedApproval?.reviewerNote || ''}
          readOnly
          onViewInPayroll={onViewInPayroll}
        />
      </SectionCard>
    </div>
  );
}

function ExceptionPanel({ type }) {
  const items = timesheetExceptionRows[type] || [];
  const title = type === 'past-due' ? 'Past Due Timesheets' : 'Rejected Timesheets';
  const subtitle = type === 'past-due'
    ? 'Entries that missed the submission window and need immediate attention.'
    : 'Timesheets returned by reviewers with comments and resubmission requirements.';

  return (
    <div className="timesheet-exception-list">
      <SectionCard title={title} subtitle={subtitle}>
        <div className="timesheet-exception-grid">
          {items.map((item) => (
            <article key={`${item.employee}-${item.project}`} className="timesheet-exception-card">
              <div className="timesheet-exception-card-head">
                <strong>{item.employee}</strong>
                <TimesheetStatusChip value={item.status} />
              </div>
              <span>{item.project}</span>
              <p>{item.reason}</p>
              <div className="timesheet-exception-actions">
                <button type="button" className="timesheet-secondary-button">View Reason</button>
                <button type="button" className="timesheet-primary-button">{type === 'past-due' ? 'Fix Now' : 'Resubmit'}</button>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default function EmployeeTimesheet() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentRole = resolveRoleFromStorage();
  const roleMode = currentRole === ROLES.HR ? 'hr' : currentRole === ROLES.MANAGER ? 'manager' : 'employee';
  const [weekIndex, setWeekIndex] = useState(0);
  const [tableSearch, setTableSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState(timesheetFilters.employees[0]);
  const [projectFilter, setProjectFilter] = useState(timesheetFilters.projects[0]);
  const [teamFilter, setTeamFilter] = useState(timesheetFilters.teams[0]);
  const [statusFilter, setStatusFilter] = useState(timesheetFilters.status[0]);
  const activeTab = hashToTab[location.hash] || 'overview';

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} timesheet-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  useEffect(() => {
    if (!location.hash) {
      navigate(`${location.pathname}#overview`, { replace: true, preventScrollReset: true });
    }
  }, [location.hash, location.pathname, navigate]);

  const goToTab = (tabKey) => {
    const nextHash = tabToHash[tabKey] || '#overview';
    navigate(`${location.pathname}${nextHash}`, { replace: true, preventScrollReset: true });
  };

  const currentWeek = useMemo(() => timesheetWeekPeriods[weekIndex], [weekIndex]);
  const tabView = useMemo(() => {
    if (activeTab === 'weekly-entry') return <WeeklyEntryPanel currentWeek={currentWeek} search={tableSearch} onOpenApprovals={() => goToTab('approvals')} roleMode={roleMode} />;
    if (activeTab === 'project-time') return <ProjectTimePanel onOpenWeeklyEntry={() => goToTab('weekly-entry')} />;
    if (activeTab === 'tasks') return <TasksPanel rows={timesheetTaskRows} search={tableSearch} />;
    if (activeTab === 'projects') return <ProjectsPanel rows={timesheetAllocationRows} search={tableSearch} />;
    if (activeTab === 'summary') return <SummaryPanel rows={timesheetSummaryRows} search={tableSearch} />;
    if (activeTab === 'approvals') return <ApprovalsPanel rows={timesheetApprovalRows} search={tableSearch} onSearchChange={setTableSearch} roleMode={roleMode} onViewInPayroll={() => navigate(ROUTES.payroll)} />;
    if (activeTab === 'past-due' || activeTab === 'rejected') return <ExceptionPanel type={activeTab} />;
    return (
      <OverviewPanel
        onOpenWeeklyEntry={() => goToTab('weekly-entry')}
        onOpenApprovals={() => goToTab('approvals')}
      />
    );
  }, [activeTab, currentWeek, tableSearch, roleMode]);

  return (
    <MainLayout
      activeKey={subNavKeyMap[activeTab] || 'timesheet-overview'}
      moduleActiveKey="timesheet"
      subNavActiveKey={subNavKeyMap[activeTab] || 'timesheet-overview'}
    >
      <div className="timesheet-shell">
        <TimesheetHero activeTabKey={activeTab} currentWeek={currentWeek} roleMode={roleMode} />

        <div className="timesheet-tabbar" role="tablist" aria-label="Timesheet views">
          {timesheetTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`timesheet-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => goToTab(tab.key)}
            >
              <span>
                {tab.key === 'summary' && roleMode === 'employee'
                  ? 'History'
                  : tab.key === 'approvals' && roleMode === 'hr'
                    ? 'All Timesheets'
                    : tab.label}
              </span>
              {tab.badge ? <span className="timesheet-tab-badge">{tab.badge}</span> : null}
            </button>
          ))}
        </div>

        <SummaryCards metrics={timesheetKpis} />

        <div className="timesheet-toolbar">
          <WeekNavigator
            period={currentWeek}
            onPrev={() => setWeekIndex((current) => (current - 1 + timesheetWeekPeriods.length) % timesheetWeekPeriods.length)}
            onNext={() => setWeekIndex((current) => (current + 1) % timesheetWeekPeriods.length)}
          />
          <label className="timesheet-toolbar-search">
            <span>Search</span>
            <input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder="Search timesheet, project, task, employee" />
          </label>
          <FiltersBar
            filters={[
              { key: 'employeeFilter', label: 'Employee', value: employeeFilter, options: timesheetFilters.employees },
              { key: 'projectFilter', label: 'Project', value: projectFilter, options: timesheetFilters.projects },
              { key: 'teamFilter', label: 'Team', value: teamFilter, options: timesheetFilters.teams },
              { key: 'statusFilter', label: 'Status', value: statusFilter, options: timesheetFilters.status },
            ]}
            onChange={(key, nextValue) => {
              if (key === 'employeeFilter') setEmployeeFilter(nextValue);
              if (key === 'projectFilter') setProjectFilter(nextValue);
              if (key === 'teamFilter') setTeamFilter(nextValue);
              if (key === 'statusFilter') setStatusFilter(nextValue);
            }}
          />
          <ActionToolbar>
            <button type="button" className="timesheet-secondary-button">Copy Last Week</button>
            <button type="button" className="timesheet-secondary-button">Save Draft</button>
            <button type="button" className="timesheet-primary-button">Submit Week</button>
          </ActionToolbar>
        </div>

        <div className="timesheet-filter-summary">
          <TimesheetStatusChip value={employeeFilter} />
          <TimesheetStatusChip value={projectFilter} />
          <TimesheetStatusChip value={teamFilter} />
          <TimesheetStatusChip value={statusFilter} />
        </div>

        <div className="timesheet-panel-stack">
          <div key={activeTab} className="timesheet-tab-panel">
            {tabView}
          </div>
          {activeTab === 'approvals' ? (
            <div className="timesheet-bottom-panels">
              <CommentPanel />
              <ActivityPanel />
            </div>
          ) : null}
        </div>
      </div>
    </MainLayout>
  );
}
