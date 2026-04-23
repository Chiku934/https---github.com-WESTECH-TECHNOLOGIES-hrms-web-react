import { timesheetWeeklyEntrySeedRows } from './timesheetUiData';

const draftStatusSet = new Set(['draft', 'saved', 'changes requested', 'rejected']);
const reviewStatusSet = new Set(['submitted', 'manager approved', 'hr approved', 'payroll ready', 'payroll processed']);
const workflowStatusLabels = new Set([
  'draft',
  'submitted',
  'manager approved',
  'hr approved',
  'payroll ready',
  'payroll processed',
  'rejected',
  'manager review',
  'hr review',
  'returned',
  'approved',
  'sent to payroll',
]);

export const timesheetWorkflowSteps = [
  {
    key: 'draft',
    label: 'Draft',
    owner: 'Employee',
    tone: 'slate',
    description: 'The timesheet is being built and can be edited freely.',
  },
  {
    key: 'submitted',
    label: 'Submitted',
    owner: 'Manager',
    tone: 'amber',
    description: 'The employee has submitted the week for manager review.',
  },
  {
    key: 'manager-approved',
    label: 'Manager Approved',
    owner: 'HR',
    tone: 'blue',
    description: 'The manager has signed off and the record is waiting on HR.',
  },
  {
    key: 'hr-approved',
    label: 'Payroll Ready',
    owner: 'Payroll',
    tone: 'green',
    description: 'The workflow is complete and ready for payroll processing.',
  },
  {
    key: 'payroll-processed',
    label: 'Payroll Processed',
    owner: 'Payroll',
    tone: 'violet',
    description: 'The timesheet has been handed off to payroll and is locked for updates.',
  },
  {
    key: 'rejected',
    label: 'Rejected',
    owner: 'Employee',
    tone: 'red',
    description: 'The record was returned with comments and can be edited again.',
  },
];

export const timesheetWorkflowStages = timesheetWorkflowSteps;

export const timesheetWorkflowActions = [
  { key: 'save-draft', label: 'Save Draft', tone: 'slate' },
  { key: 'submit-for-review', label: 'Submit for Review', tone: 'amber' },
  { key: 'manager-approve', label: 'Manager Approve', tone: 'blue' },
  { key: 'manager-reject', label: 'Reject', tone: 'red' },
  { key: 'hr-approve', label: 'HR Approve', tone: 'green' },
  { key: 'bulk-approve', label: 'Bulk Approve', tone: 'green' },
];

export const timesheetWorkflowStoragePrefix = 'timesheet_weekly_workflow_';

export function buildTimesheetWorkflowStorageKey(weekLabel) {
  return `${timesheetWorkflowStoragePrefix}${String(weekLabel || '').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
}

function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase();
}

export function getTimesheetStatusMeta(value) {
  const normalized = normalizeStatus(value);
  if (normalized.includes('payroll ready') || normalized.includes('hr approved') || normalized === 'approved' || normalized.includes('locked')) {
    return { key: 'hr-approved', label: 'Payroll Ready', tone: 'green', stepIndex: 3, editable: false, payrollReady: true };
  }
  if (normalized.includes('payroll processed') || normalized.includes('sent to payroll')) {
    return { key: 'payroll-processed', label: 'Payroll Processed', tone: 'violet', stepIndex: 4, editable: false };
  }
  if (normalized.includes('manager approved') || normalized.includes('sent to hr')) {
    return { key: 'manager-approved', label: 'Manager Approved', tone: 'blue', stepIndex: 2, editable: false };
  }
  if (normalized.includes('rejected') || normalized.includes('returned') || normalized.includes('changes requested')) {
    return { key: 'rejected', label: 'Rejected', tone: 'red', stepIndex: 5, editable: true };
  }
  if (normalized.includes('submitted') || normalized.includes('pending') || normalized.includes('review')) {
    return { key: 'submitted', label: 'Submitted', tone: 'amber', stepIndex: 1, editable: false };
  }
  return { key: 'draft', label: 'Draft', tone: 'slate', stepIndex: 0, editable: true };
}

export function getTimesheetWorkflowSteps(value) {
  const meta = getTimesheetStatusMeta(value);
  return timesheetWorkflowSteps.map((step, index) => ({
    ...step,
    state:
      meta.key === 'rejected'
        ? index < meta.stepIndex
          ? 'complete'
          : index === meta.stepIndex
            ? 'error'
            : 'pending'
        : index < meta.stepIndex
          ? 'complete'
          : index === meta.stepIndex
            ? 'current'
            : 'pending',
  }));
}

export function isTimesheetEditable(value) {
  const meta = getTimesheetStatusMeta(value);
  return meta.editable && meta.key !== 'submitted' && meta.key !== 'manager-approved' && meta.key !== 'hr-approved' && meta.key !== 'payroll-processed';
}

export function deriveTimesheetWeekStage(rows = timesheetWeeklyEntrySeedRows) {
  const normalizedStatuses = rows.map((row) => normalizeStatus(row.status));
  if (normalizedStatuses.some((status) => status.includes('rejected') || status.includes('returned') || status.includes('changes requested'))) {
    return 'rejected';
  }
  if (normalizedStatuses.some((status) => status.includes('payroll processed') || status.includes('sent to payroll'))) {
    return 'payroll-processed';
  }
  if (normalizedStatuses.some((status) => status.includes('payroll ready') || status.includes('hr approved') || status.includes('locked') || status.includes('approved'))) {
    return 'hr-approved';
  }
  if (normalizedStatuses.some((status) => status.includes('manager approved'))) {
    return 'manager-approved';
  }
  if (normalizedStatuses.some((status) => status.includes('submitted') || status.includes('review'))) {
    return 'submitted';
  }
  if (normalizedStatuses.every((status) => draftStatusSet.has(status) || status === '')) return 'draft';
  if (normalizedStatuses.some((status) => draftStatusSet.has(status))) return 'draft';
  return 'draft';
}

export function deriveTimesheetWorkflowSummary(rows = timesheetWeeklyEntrySeedRows) {
  const summary = {
    draftCount: 0,
    submittedCount: 0,
    approvedCount: 0,
    returnedCount: 0,
    lockedCount: 0,
    totalRows: rows.length,
  };

  rows.forEach((row) => {
    const status = normalizeStatus(row.status);
    if (status.includes('payroll ready') || status.includes('hr approved') || status.includes('approved')) {
      summary.approvedCount += 1;
      return;
    }
    if (status.includes('return') || status.includes('reject') || status.includes('changes requested')) {
      summary.returnedCount += 1;
      return;
    }
    if (status.includes('submitted') || status.includes('review') || status.includes('manager approved')) {
      summary.submittedCount += 1;
      return;
    }
    summary.draftCount += 1;
  });

  return summary;
}

export function buildTimesheetWorkflowHistoryEntry(action, actor, note = '') {
  return {
    id: `wf-${Date.now()}`,
    action,
    actor,
    note,
    time: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
  };
}

export function createTimesheetWorkflowState(seed = {}) {
  return {
    stage: seed.stage || 'draft',
    note: seed.note || '',
    lastAction: seed.lastAction || 'Draft saved',
    updatedAt: seed.updatedAt || null,
    history: Array.isArray(seed.history) && seed.history.length
      ? seed.history
      : [buildTimesheetWorkflowHistoryEntry('Draft opened', 'System', 'You can update entries before submission.')],
  };
}

export function loadTimesheetWorkflowState(storageKey, fallbackRows = timesheetWeeklyEntrySeedRows) {
  if (typeof window === 'undefined') {
    return createTimesheetWorkflowState({ stage: deriveTimesheetWeekStage(fallbackRows) });
  }

  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    if (stored && typeof stored === 'object') {
      return {
        ...createTimesheetWorkflowState({ stage: deriveTimesheetWeekStage(fallbackRows) }),
        ...stored,
        history: Array.isArray(stored.history) && stored.history.length
          ? stored.history
          : createTimesheetWorkflowState({ stage: deriveTimesheetWeekStage(fallbackRows) }).history,
      };
    }
  } catch {
    // Ignore storage corruption and fall back to seed data.
  }

  return createTimesheetWorkflowState({ stage: deriveTimesheetWeekStage(fallbackRows) });
}

export function saveTimesheetWorkflowState(storageKey, state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }
}

export function getWorkflowStageMeta(stageKey) {
  const normalized = normalizeStatus(stageKey);
  if (normalized === 'manager-review') return timesheetWorkflowStages.find((stage) => stage.key === 'submitted') || timesheetWorkflowStages[0];
  if (normalized === 'hr-review') return timesheetWorkflowStages.find((stage) => stage.key === 'manager-approved') || timesheetWorkflowStages[0];
  if (normalized === 'returned' || normalized === 'approved' || normalized === 'locked') {
    const mapped = normalized === 'approved' || normalized === 'locked' ? 'hr-approved' : 'rejected';
    return timesheetWorkflowStages.find((stage) => stage.key === mapped) || timesheetWorkflowStages[0];
  }
  return timesheetWorkflowStages.find((stage) => stage.key === normalized) || timesheetWorkflowStages[0];
}

export function getWorkflowToneForStatus(value) {
  const normalized = normalizeStatus(value);
  if (normalized.includes('hr approved') || normalized.includes('approved') || normalized.includes('locked') || normalized.includes('final')) return 'green';
  if (normalized.includes('payroll processed') || normalized.includes('sent to payroll')) return 'violet';
  if (normalized.includes('manager approved') || normalized.includes('submitted') || normalized.includes('pending') || normalized.includes('review')) return 'amber';
  if (normalized.includes('returned') || normalized.includes('reject') || normalized.includes('changes requested')) return 'red';
  if (normalized.includes('draft')) return 'slate';
  return 'blue';
}

export function updateWorkflowHistory(state, action, actor, note = '') {
  return {
    ...state,
    lastAction: action,
    updatedAt: new Date().toISOString(),
    history: [buildTimesheetWorkflowHistoryEntry(action, actor, note), ...(state.history || [])].slice(0, 6),
  };
}

export function buildSubmittedRowStatus(rowStatus, submitted = false, approved = false, payrollProcessed = false) {
  const normalized = normalizeStatus(rowStatus);
  if (payrollProcessed || normalized.includes('payroll processed')) return 'Payroll Processed';
  if (approved) return 'Payroll Ready';
  if (normalized.includes('reject') || normalized.includes('return') || normalized.includes('changes requested')) return 'Rejected';
  if (normalized.includes('manager approved')) return 'Manager Approved';
  if (submitted || reviewStatusSet.has(normalized) || normalized.includes('submitted')) return 'Submitted';
  return rowStatus || 'Draft';
}

export function getWorkflowProgressValue(value) {
  return getTimesheetStatusMeta(value).stepIndex;
}

export function isWorkflowFinal(value) {
  const normalized = normalizeStatus(value);
  return normalized.includes('payroll ready') || normalized.includes('hr approved') || normalized.includes('payroll processed') || normalized.includes('approved') || normalized.includes('locked');
}

export function isWorkflowTerminal(value) {
  return isWorkflowFinal(value) || normalizeStatus(value).includes('reject');
}

export function isWorkflowStatus(value) {
  return workflowStatusLabels.has(normalizeStatus(value));
}
