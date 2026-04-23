import { timesheetApprovals } from '../features/myteam/timesheet/data/approvals';

const storageKey = 'payroll_timesheet_handoff_v1';

function normalizeStatus(value) {
  return String(value || '').trim().toLowerCase();
}

function buildRecordKey(record) {
  if (record?.id) return String(record.id);
  return [record?.employee, record?.project, record?.week, record?.submitted].filter(Boolean).join('|');
}

function mapStatus(value) {
  const normalized = normalizeStatus(value);
  if (normalized.includes('payroll processed')) return 'Payroll Processed';
  if (normalized.includes('payroll ready') || normalized.includes('hr approved') || normalized === 'approved') {
    return 'Payroll Ready';
  }
  if (normalized.includes('manager approved')) return 'Manager Approved';
  if (normalized.includes('submitted')) return 'Submitted';
  if (normalized.includes('rejected') || normalized.includes('returned') || normalized.includes('changes requested')) {
    return 'Rejected';
  }
  if (normalized.includes('draft')) return 'Draft';
  return value || 'Draft';
}

export function normalizePayrollReadyStatus(value) {
  return mapStatus(value);
}

export function isPayrollReadyStatus(value) {
  const normalized = normalizeStatus(value);
  return normalized === 'payroll ready' || normalized === 'hr approved';
}

export function isPayrollProcessedStatus(value) {
  return normalizeStatus(value) === 'payroll processed';
}

export function createPayrollHandoffState(seed = timesheetApprovals) {
  return seed.map((record) => ({
    ...record,
    status: mapStatus(record.status),
  }));
}

export function loadPayrollHandoffState() {
  if (typeof window === 'undefined') return createPayrollHandoffState();

  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
    if (Array.isArray(stored) && stored.length) {
      return stored.map((record) => ({
        ...record,
        status: mapStatus(record.status),
      }));
    }
  } catch {
    // Fall through to seed data.
  }

  return createPayrollHandoffState();
}

export function savePayrollHandoffState(state) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }
}

export function syncPayrollHandoffRecords(records = []) {
  const current = loadPayrollHandoffState();
  const nextMap = current.reduce((acc, record) => {
    acc[buildRecordKey(record)] = record;
    return acc;
  }, {});

  records.forEach((record) => {
    const nextRecord = {
      ...record,
      status: mapStatus(record.status),
    };
    nextMap[buildRecordKey(record)] = nextRecord;
  });

  const nextState = Object.values(nextMap);
  savePayrollHandoffState(nextState);
  return nextState;
}

export function getPayrollHandoffIndex(state = loadPayrollHandoffState()) {
  return state.reduce((acc, record) => {
    acc[buildRecordKey(record)] = record;
    return acc;
  }, {});
}

export function getPayrollHandoffSummary(state = loadPayrollHandoffState()) {
  const approvedTimesheets = state.filter((record) => isPayrollReadyStatus(record.status) || isPayrollProcessedStatus(record.status)).length;
  const pendingApprovals = state.filter(
    (record) => !isPayrollReadyStatus(record.status) && !isPayrollProcessedStatus(record.status),
  ).length;
  const payrollProcessed = state.filter((record) => isPayrollProcessedStatus(record.status)).length;

  return {
    approvedTimesheets,
    pendingApprovals,
    payrollProcessed,
    totalTimesheets: state.length,
  };
}
