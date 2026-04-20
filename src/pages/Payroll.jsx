import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { Link, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Icon from '../components/Icon';
import CompanyAdminGridHeader from '../features/company-admin/components/CompanyAdminGridHeader';
import { timesheetEmployees } from '../features/myteam/timesheet/data/employees';
import { timesheetApprovals } from '../features/myteam/timesheet/data/approvals';
import { companyAdminAttendanceList } from '../features/company-admin/data/attendanceData';
import { ROLES } from '../app/config/roles';
import { resolveRoleFromStorage } from '../data/navigation/index.js';
import { getPayrollHandoffIndex, getPayrollHandoffSummary, loadPayrollHandoffState } from '../data/payrollHandoff';
import '../features/super-admin/styles/packages.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ROUTES } from '../router/routePaths';

ModuleRegistry.registerModules([AllCommunityModule]);

const moduleNavItems = [
  { label: 'Summary', path: '/dashboard', activeKey: 'dashboard' },
  { label: 'Leave', path: ROUTES.userLeave, activeKey: 'user-leave' },
  { label: 'Attendance', path: ROUTES.userAttendance, activeKey: 'user-attendance' },
  { label: 'Expenses & Travel', path: ROUTES.userExpenses, activeKey: 'user-expenses' },
  { label: 'Timesheet', path: ROUTES.timesheet, activeKey: 'timesheet' },
  { label: 'Profile Changes', path: null, activeKey: null },
  { label: 'Performance', path: ROUTES.userPerformance, activeKey: 'user-performance' },
];

const payrollSubNavItems = [
  { label: 'Overview', path: `${ROUTES.payroll}#overview`, activeKey: 'company-admin-payroll-overview' },
  { label: 'Run Payroll', path: `${ROUTES.payroll}#run-payroll`, activeKey: 'company-admin-payroll-run' },
  { label: 'Payroll Table', path: `${ROUTES.payroll}#payroll-table`, activeKey: 'company-admin-payroll-table' },
  { label: 'Approval Flow', path: `${ROUTES.payroll}#approval-flow`, activeKey: 'company-admin-payroll-approval' },
];

const monthOptions = [
  { value: '2026-01', label: 'January 2026' },
  { value: '2026-02', label: 'February 2026' },
  { value: '2026-03', label: 'March 2026' },
  { value: '2026-04', label: 'April 2026' },
];

const payrollWorkflowSteps = [
  { key: 'attendance', label: 'Attendance locked', icon: 'calendar-check' },
  { key: 'timesheet', label: 'Timesheet locked', icon: 'clipboard' },
  { key: 'leave', label: 'Leave applied', icon: 'house' },
  { key: 'salary', label: 'Salary calculated', icon: 'wallet' },
];

const payrollLifecycleStatuses = ['Pending', 'Processing', 'Approved', 'Finalized'];
const payrollStatuses = ['All', ...payrollLifecycleStatuses];
const payrollDepartments = ['All Departments', ...new Set(timesheetEmployees.map((employee) => employee.team))];
const payrollTextFilterParams = {
  defaultOption: 'contains',
  maxNumConditions: 1,
  suppressAndOrCondition: true,
};
const payrollPermissionMatrix = {
  [ROLES.EMPLOYEE]: {
    canViewPayslip: true,
    canViewTeamSummary: false,
    canViewAnalytics: false,
    canRunPayroll: false,
    canApprovePayroll: false,
    canFinalizePayroll: false,
    canExportReports: false,
  },
  [ROLES.MANAGER]: {
    canViewPayslip: true,
    canViewTeamSummary: true,
    canViewAnalytics: false,
    canRunPayroll: false,
    canApprovePayroll: false,
    canFinalizePayroll: false,
    canExportReports: false,
  },
  [ROLES.HR]: {
    canViewPayslip: true,
    canViewTeamSummary: true,
    canViewAnalytics: true,
    canRunPayroll: true,
    canApprovePayroll: true,
    canFinalizePayroll: true,
    canExportReports: false,
  },
  [ROLES.COMPANY_ADMIN]: {
    canViewPayslip: true,
    canViewTeamSummary: true,
    canViewAnalytics: true,
    canRunPayroll: false,
    canApprovePayroll: false,
    canFinalizePayroll: false,
    canExportReports: true,
  },
  [ROLES.SUPER_ADMIN]: {
    canViewPayslip: true,
    canViewTeamSummary: true,
    canViewAnalytics: true,
    canRunPayroll: false,
    canApprovePayroll: false,
    canFinalizePayroll: false,
    canExportReports: true,
  },
  [ROLES.SUB_ADMIN]: {
    canViewPayslip: true,
    canViewTeamSummary: true,
    canViewAnalytics: true,
    canRunPayroll: false,
    canApprovePayroll: false,
    canFinalizePayroll: false,
    canExportReports: true,
  },
};

function getPayrollPermissions(role) {
  return payrollPermissionMatrix[role] || payrollPermissionMatrix[ROLES.EMPLOYEE];
}

function hashString(value) {
  return String(value)
    .split('')
    .reduce((acc, character) => ((acc << 5) - acc + character.charCodeAt(0)) | 0, 0);
}

function currency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function hoursToDecimal(value) {
  if (!value) return 0;
  const [hours = '0', minutes = '0'] = String(value).split(':');
  return Number(hours) + Number(minutes) / 60;
}

function getMonthSeed(monthKey, employeeId) {
  return Math.abs(hashString(`${monthKey}:${employeeId}`));
}

function buildPayrollRows() {
  const payrollHandoffRecords = loadPayrollHandoffState();
  const payrollHandoffMap = getPayrollHandoffIndex(payrollHandoffRecords);
  const attendanceRisk = companyAdminAttendanceList.reduce((acc, item) => {
    const status = String(item.status || '').toLowerCase();
    if (status === 'late' || status === 'absent') return acc + 1;
    return acc;
  }, 0) / Math.max(companyAdminAttendanceList.length, 1);

  return monthOptions.flatMap((month, monthIndex) =>
    timesheetEmployees.map((employee, employeeIndex) => {
      const matchingApproval = payrollHandoffMap[payrollHandoffRecords[employeeIndex % payrollHandoffRecords.length]?.id] || payrollHandoffRecords[employeeIndex % payrollHandoffRecords.length] || timesheetApprovals[employeeIndex % timesheetApprovals.length];
      const seed = getMonthSeed(month.value, employee.id);
      const submittedHours = hoursToDecimal(matchingApproval?.submitted || matchingApproval?.total || '40:00');
      const totalHours = hoursToDecimal(matchingApproval?.total || '40:00');
      const overtimeHours = Math.max(totalHours - 40, 0) + (seed % 4) * 0.35;
      const presentDays = 18 + (seed % 4);
      const lateDays = (seed >> 1) % 3;
      const leaveDays = (seed >> 2) % 3;
      const lopDays = Math.max((seed % 4 === 0 ? 1 : 0) + (attendanceRisk > 0.2 && employeeIndex % 4 === 0 ? 1 : 0), 0);
      const baseMonthlySalary = 56000 + employeeIndex * 5800 + monthIndex * 1400 + (seed % 1600);
      const basic = Math.round(baseMonthlySalary * 0.56);
      const hra = Math.round(basic * 0.42);
      const attendanceAllowance = Math.round(1100 + presentDays * 95 + (attendanceRisk * 750));
      const projectAllowance = Math.round(900 + (seed % 1700) + overtimeHours * 180);
      const allowances = attendanceAllowance + projectAllowance;
      const grossSalary = basic + hra + allowances;
      const pf = Math.round(basic * 0.12);
      const tax = Math.round(grossSalary * (0.065 + ((employeeIndex % 3) * 0.007)));
      const lop = Math.round((basic / 26) * lopDays);
      const deductions = pf + tax + lop;
      const netSalary = grossSalary - deductions;
      const statusSeed = (seed + monthIndex + employeeIndex) % payrollLifecycleStatuses.length;
      const status = payrollLifecycleStatuses[statusSeed];
      const sourceStatus = matchingApproval?.status || 'Submitted';
      const approvedHours = matchingApproval?.submitted || matchingApproval?.total || '40:00';
      const attendanceQuality = lopDays > 0 ? 'Needs attention' : lateDays > 1 ? 'Watch list' : 'Healthy';

      return {
        id: `${month.value}-${employee.id}`,
        monthKey: month.value,
        monthLabel: month.label,
        employeeId: employee.id,
        employee: employee.name,
        department: employee.team,
        role: employee.role,
        manager: employee.manager,
        project: employee.project,
        billable: employee.billable ? 'Billable' : 'Non-billable',
        attendance: {
          presentDays,
          lateDays,
          leaveDays,
          lopDays,
          quality: attendanceQuality,
        },
        timesheet: {
          submittedHours,
          totalHours,
          approvedHours,
          sourceStatus,
        },
        salary: {
          basic,
          hra,
          allowances,
          pf,
          tax,
          lop,
          grossSalary,
          netSalary,
        },
        status,
        runBatch:
          status === 'Finalized'
            ? 'Payroll finalised'
            : status === 'Approved'
              ? 'Payroll approved'
              : status === 'Processing'
                ? 'Payroll processing'
                : 'Awaiting HR review',
        note: `Derived from ${sourceStatus.toLowerCase()} timesheet data and month attendance signals.`,
      };
    }),
  );
}

function PayrollSummaryCard({ label, value, note, tone, icon }) {
  return (
    <article className={`payroll-summary-card tone-${tone}`}>
      <div className="payroll-summary-top">
        <span className="payroll-summary-icon">
          <Icon name={icon} size={14} />
        </span>
        <span className="payroll-summary-label">{label}</span>
      </div>
      <div className="payroll-summary-value">{value}</div>
      <div className="payroll-summary-note">{note}</div>
    </article>
  );
}

function PayrollStepItem({ step, status }) {
  return (
    <div className={`payroll-step-item ${status}`}>
      <span className="payroll-step-icon">
        <Icon name={step.icon} size={12} />
      </span>
      <div className="payroll-step-copy">
        <strong>{step.label}</strong>
        <span>{status === 'done' ? 'Completed' : status === 'active' ? 'In progress' : 'Waiting'}</span>
      </div>
    </div>
  );
}

function PayrollStatusChip({ value }) {
  const tone = String(value || '').toLowerCase();
  return <span className={`payroll-status-chip tone-${tone}`}>{value}</span>;
}

function PayrollInfoBanner() {
  return (
    <div className="payroll-inline-note">
      <strong>Data from Timesheet + Attendance + Leave.</strong> Payroll pulls from approved timesheets, attendance signals, and leave impact before a run can start.
    </div>
  );
}

function PayrollAccessBadge({ roleLabel, copy }) {
  return (
    <div className="payroll-inline-note">
      <strong>{roleLabel}</strong> {copy}
    </div>
  );
}

function PayrollTableEmpty() {
  return (
    <div className="payroll-empty-state">
      <Icon name="clipboard" size={20} />
      <strong>No payroll rows match the current filters.</strong>
      <span>Try a different month, department, or status filter.</span>
    </div>
  );
}

function PayrollSkeletonCard() {
  return (
    <div className="payroll-skeleton-card" aria-hidden="true">
      <div className="payroll-skeleton-line title" />
      <div className="payroll-skeleton-grid">
        <div className="payroll-skeleton-line" />
        <div className="payroll-skeleton-line" />
        <div className="payroll-skeleton-line" />
        <div className="payroll-skeleton-line" />
      </div>
    </div>
  );
}

function PayrollGridEmptyOverlay() {
  return <PayrollTableEmpty />;
}

function PayrollEmployeeCell({ data }) {
  if (!data) return null;
  return (
    <div className="payroll-employee-cell">
      <strong>{data.employee}</strong>
      <span>{data.employeeId}</span>
      <small>{data.role}</small>
    </div>
  );
}

function PayrollAmountCell({ value }) {
  return <span className="payroll-amount-cell">{currency(value || 0)}</span>;
}

function PayrollMetaCell({ data }) {
  if (!data) return null;
  return (
    <div className="payroll-meta-cell">
      <strong>{data.department}</strong>
      <span>{data.project}</span>
    </div>
  );
}

function PayrollActionsCell({ data, onApprove, canApprovePayroll }) {
  if (!data) return null;
  const canApprove = canApprovePayroll && data.status === 'Processing';

  return (
    <div className="payroll-row-actions">
      <button
        type="button"
        className="payroll-inline-button"
        onClick={() => onApprove?.(data)}
        disabled={!canApprove}
      >
        <Icon name="circle-check" size={13} />
        <span>Approve</span>
      </button>
    </div>
  );
}

function PayrollModal({ title, subtitle, onClose, children, footer }) {
  return (
    <div className="payroll-modal-backdrop" onClick={onClose} role="presentation">
      <div className="payroll-modal" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="payroll-modal-header">
          <div>
            <div className="payroll-modal-kicker">Payroll Control</div>
            <h3>{title}</h3>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          <button type="button" className="payroll-modal-close" onClick={onClose} aria-label="Close confirmation">
            &times;
          </button>
        </div>
        <div className="payroll-modal-body">{children}</div>
        {footer ? <div className="payroll-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export default function Payroll() {
  const location = useLocation();
  const role = resolveRoleFromStorage();
  const permissions = useMemo(() => getPayrollPermissions(role), [role]);
  const roleLabel = useMemo(() => {
    switch (role) {
      case ROLES.HR:
        return 'HR';
      case ROLES.MANAGER:
        return 'Manager';
      case ROLES.COMPANY_ADMIN:
        return 'Company Admin';
      case ROLES.SUPER_ADMIN:
        return 'Super Admin';
      case ROLES.SUB_ADMIN:
        return 'Sub Admin';
      default:
        return 'Employee';
    }
  }, [role]);
  const isEmployee = role === ROLES.EMPLOYEE;
  const isManager = role === ROLES.MANAGER;
  const canManagePayroll = permissions.canRunPayroll || permissions.canApprovePayroll || permissions.canFinalizePayroll;
  const [isLoading, setIsLoading] = useState(true);
  const [payrollRows, setPayrollRows] = useState(() => buildPayrollRows());
  const payrollHandoffRecords = useMemo(() => loadPayrollHandoffState(), []);
  const payrollHandoffSummary = useMemo(() => getPayrollHandoffSummary(payrollHandoffRecords), [payrollHandoffRecords]);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[monthOptions.length - 1].value);
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [runHint, setRunHint] = useState('Select a month and run payroll to lock the cycle.');
  const [workflowState, setWorkflowState] = useState(() =>
    Object.fromEntries(monthOptions.map((month) => [month.value, { progress: 0, running: false, lastRunAt: null }])),
  );
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [exportHint, setExportHint] = useState('');
  const timersRef = useRef([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const selectedMonthMeta = useMemo(
    () => monthOptions.find((month) => month.value === selectedMonth) || monthOptions[monthOptions.length - 1],
    [selectedMonth],
  );

  const filteredRows = useMemo(
    () =>
      payrollRows.filter((row) => {
        const monthMatch = row.monthKey === selectedMonth;
        const departmentMatch = departmentFilter === 'All Departments' || row.department === departmentFilter;
        const statusMatch = statusFilter === 'All' || row.status === statusFilter;
        return monthMatch && departmentMatch && statusMatch;
      }),
    [departmentFilter, payrollRows, selectedMonth, statusFilter],
  );

  useEffect(() => {
    if (!filteredRows.some((row) => row.id === selectedRowId)) {
      setSelectedRowId(filteredRows[0]?.id ?? null);
    }
  }, [filteredRows, selectedRowId]);

  const selectedRow = useMemo(
    () => filteredRows.find((row) => row.id === selectedRowId) || filteredRows[0] || null,
    [filteredRows, selectedRowId],
  );

  const selectedWorkflow = workflowState[selectedMonth] || { progress: 0, running: false, lastRunAt: null };
  const payrollSubNavActiveKey = useMemo(() => {
    switch (location.hash) {
      case '#run-payroll':
        return 'company-admin-payroll-run';
      case '#payroll-table':
        return 'company-admin-payroll-table';
      case '#approval-flow':
        return 'company-admin-payroll-approval';
      case '#overview':
      default:
        return 'company-admin-payroll-overview';
    }
  }, [location.hash]);
  const activePayrollTab = useMemo(() => {
    switch (location.hash) {
      case '#run-payroll':
        return 'run-payroll';
      case '#payroll-table':
        return 'payroll-table';
      case '#approval-flow':
        return 'approval-flow';
      case '#overview':
      default:
        return 'overview';
    }
  }, [location.hash]);

  const workflowStepStates = useMemo(
    () =>
      payrollWorkflowSteps.map((step, index) => {
        if (selectedWorkflow.progress > index) return 'done';
        if (selectedWorkflow.running && selectedWorkflow.progress === index) return 'active';
        return 'pending';
      }),
    [selectedWorkflow.progress, selectedWorkflow.running],
  );

  const summaryStats = useMemo(() => {
    const uniqueEmployees = filteredRows.length;
    const salaryExpense = filteredRows.reduce((sum, row) => sum + row.salary.netSalary, 0);
    const pendingPayroll = filteredRows.filter((row) => row.status === 'Pending').length;
    const processingPayroll = filteredRows.filter((row) => row.status === 'Processing').length;
    const approvedPayroll = filteredRows.filter((row) => row.status === 'Approved').length;
    const finalizedPayroll = filteredRows.filter((row) => row.status === 'Finalized').length;

    return {
      uniqueEmployees,
      salaryExpense,
      pendingPayroll,
      processingPayroll,
      approvedPayroll,
      finalizedPayroll,
    };
  }, [filteredRows]);
  const hasApprovedTimesheets = payrollHandoffSummary.approvedTimesheets > 0;

  const handleApproveRow = (row) => {
    if (!permissions.canApprovePayroll || !row || row.status !== 'Processing') return;
    setPayrollRows((current) =>
      current.map((item) =>
        item.id === row.id
          ? {
              ...item,
              status: 'Approved',
              runBatch: 'HR approved',
            }
          : item,
      ),
    );
    setRunHint(`${row.employee} approved for ${selectedMonthMeta.label}.`);
  };

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const handleRunPayroll = () => {
    if (!permissions.canRunPayroll || isRunning || !hasApprovedTimesheets) {
      if (!hasApprovedTimesheets) setRunHint('Run payroll is disabled until at least one timesheet is Payroll Ready.');
      return;
    }
    clearTimers();
    const monthKey = selectedMonth;
    const monthLabel = selectedMonthMeta.label;
    setIsRunning(true);
    setRunHint(`Running payroll for ${monthLabel}.`);
    setWorkflowState((current) => ({
      ...current,
      [monthKey]: { progress: 0, running: true, lastRunAt: current[monthKey]?.lastRunAt || null },
    }));

    payrollWorkflowSteps.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setWorkflowState((current) => {
          const next = { ...(current[monthKey] || { progress: 0, running: false, lastRunAt: null }) };
          next.progress = index + 1;
          next.running = index < payrollWorkflowSteps.length - 1;
          if (index === payrollWorkflowSteps.length - 1) {
            next.running = false;
            next.lastRunAt = new Date().toISOString();
          }
          return { ...current, [monthKey]: next };
        });

        if (index === payrollWorkflowSteps.length - 1) {
          setPayrollRows((current) =>
            current.map((item) =>
              item.monthKey === monthKey && item.status === 'Pending'
                ? {
                    ...item,
                    status: 'Processing',
                    runBatch: 'Payroll processing',
                  }
                : item,
            ),
          );
          setIsRunning(false);
          setRunHint(`Payroll processing completed for ${monthLabel}.`);
        }
      }, index * 650);
      timersRef.current.push(timer);
    });
  };

  const handleFinalizePayroll = () => {
    if (!permissions.canFinalizePayroll) return;
    setFinalizeOpen(true);
  };

  const confirmFinalizePayroll = () => {
    if (!permissions.canFinalizePayroll) return;
    const monthKey = selectedMonth;
    const monthLabel = selectedMonthMeta.label;
    setPayrollRows((current) =>
      current.map((item) =>
        item.monthKey === monthKey && item.status === 'Approved'
          ? {
              ...item,
              status: 'Finalized',
              runBatch: 'Payroll finalised',
            }
          : item,
      ),
    );
    setWorkflowState((current) => ({
      ...current,
      [monthKey]: {
        ...(current[monthKey] || { progress: 0, running: false, lastRunAt: null }),
        progress: payrollWorkflowSteps.length,
        running: false,
        lastRunAt: new Date().toISOString(),
      },
    }));
    setFinalizeOpen(false);
    setRunHint(`Payroll finalized for ${monthLabel}.`);
  };

  const handleExportClick = () => {
    if (!permissions.canExportReports) return;
    setExportHint('Export UI ready. CSV/PDF wiring can be connected later.');
  };

  const processingCandidates = filteredRows.filter((row) => row.status === 'Processing').length;
  const approvalCandidates = filteredRows.filter((row) => row.status === 'Approved').length;
  const finalizedCandidates = filteredRows.filter((row) => row.status === 'Finalized').length;
  const showSummaryGrid = !isEmployee || permissions.canViewAnalytics || permissions.canViewTeamSummary;
  const showPayrollTable = !isEmployee || permissions.canViewTeamSummary || permissions.canViewAnalytics || canManagePayroll;
  const showRunPanel = activePayrollTab === 'run-payroll';
  const showApprovalFlow = activePayrollTab === 'approval-flow';
  const showPayslipToggle = !isEmployee;
  const showEmployeeActions = permissions.canApprovePayroll || permissions.canFinalizePayroll;
  const selectedPayslipRow = selectedRow || filteredRows[0] || null;
  const payrollControlLocked = !permissions.canRunPayroll;

  const gridColumnDefs = useMemo(() => {
    const employeeColumns = [
      {
        field: 'employee',
        headerName: 'Employee',
        minWidth: 260,
        width: 260,
        filter: 'agTextColumnFilter',
        filterParams: payrollTextFilterParams,
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'user' },
        cellRenderer: PayrollEmployeeCell,
      },
      {
        field: 'department',
        headerName: 'Department',
        minWidth: 190,
        width: 190,
        filter: 'agTextColumnFilter',
        filterParams: payrollTextFilterParams,
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'users' },
        cellRenderer: PayrollMetaCell,
      },
    ];

    const summaryColumns = [
      {
        field: 'salary.netSalary',
        headerName: 'Net Salary',
        minWidth: 170,
        width: 170,
        filter: 'agNumberColumnFilter',
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'wallet' },
        cellRenderer: (params) => <strong className="payroll-net-salary">{currency(params.data?.salary.netSalary || 0)}</strong>,
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 150,
        width: 150,
        filter: 'agTextColumnFilter',
        filterParams: payrollTextFilterParams,
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'circle-check' },
        cellRenderer: ({ value }) => <PayrollStatusChip value={value} />,
      },
    ];

    const analyticsColumns = [
      {
        field: 'salary.basic',
        headerName: 'Basic',
        minWidth: 140,
        width: 140,
        filter: 'agNumberColumnFilter',
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'wallet' },
        cellRenderer: (params) => <PayrollAmountCell value={params.data?.salary.basic} />,
      },
      {
        field: 'salary.hra',
        headerName: 'HRA',
        minWidth: 140,
        width: 140,
        filter: 'agNumberColumnFilter',
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'wallet' },
        cellRenderer: (params) => <PayrollAmountCell value={params.data?.salary.hra} />,
      },
      {
        field: 'salary.allowances',
        headerName: 'Allowances',
        minWidth: 160,
        width: 160,
        filter: 'agNumberColumnFilter',
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'wallet' },
        cellRenderer: (params) => <PayrollAmountCell value={params.data?.salary.allowances} />,
      },
      {
        field: 'salary.tax',
        headerName: 'Tax',
        minWidth: 130,
        width: 130,
        filter: 'agNumberColumnFilter',
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'clipboard' },
        cellRenderer: (params) => <PayrollAmountCell value={params.data?.salary.tax} />,
      },
      {
        field: 'salary.pf',
        headerName: 'PF',
        minWidth: 130,
        width: 130,
        filter: 'agNumberColumnFilter',
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'clipboard' },
        cellRenderer: (params) => <PayrollAmountCell value={params.data?.salary.pf} />,
      },
      {
        field: 'salary.lop',
        headerName: 'LOP',
        minWidth: 130,
        width: 130,
        filter: 'agNumberColumnFilter',
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'clipboard' },
        cellRenderer: (params) => <PayrollAmountCell value={params.data?.salary.lop} />,
      },
      {
        field: 'salary.netSalary',
        headerName: 'Net Salary',
        minWidth: 170,
        width: 170,
        filter: 'agNumberColumnFilter',
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'wallet' },
        cellRenderer: (params) => <strong className="payroll-net-salary">{currency(params.data?.salary.netSalary || 0)}</strong>,
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 150,
        width: 150,
        filter: 'agTextColumnFilter',
        filterParams: payrollTextFilterParams,
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { headerIcon: 'circle-check' },
        cellRenderer: ({ value }) => <PayrollStatusChip value={value} />,
      },
    ];

    const columns = isManager ? [...employeeColumns, ...summaryColumns] : [...employeeColumns, ...analyticsColumns];

    if (permissions.canApprovePayroll) {
      columns.push({
        headerName: 'Actions',
        colId: 'actions',
        minWidth: 160,
        width: 160,
        sortable: false,
        filter: false,
        resizable: false,
        headerComponent: CompanyAdminGridHeader,
        headerComponentParams: { showMenu: false, enableFilterButton: false, headerIcon: 'ellipsis-vertical' },
        cellRenderer: PayrollActionsCell,
        cellRendererParams: {
          onApprove: (row) => handleApproveRow(row),
          canApprovePayroll: permissions.canApprovePayroll,
        },
      });
    }

    return columns;
  }, [handleApproveRow, isManager, permissions.canApprovePayroll]);

  const defaultGridColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: false,
      suppressMovable: true,
    }),
    [],
  );

  return (
    <MainLayout
      activeKey="payroll"
      moduleActiveKey="dashboard"
      moduleNavItems={moduleNavItems}
      showModuleNav={false}
      showSubNav={false}
    >
      <div className="payroll-page" data-active-tab={activePayrollTab}>
        <div className="superadmin-package-tabs payroll-tabs" role="tablist" aria-label="Payroll views">
          {payrollSubNavItems.map((item) => (
            <Link
              key={item.activeKey}
              to={item.path}
              replace
              className={`superadmin-package-tab ${payrollSubNavActiveKey === item.activeKey ? 'active' : ''}`}
              aria-current={payrollSubNavActiveKey === item.activeKey ? 'page' : undefined}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {showSummaryGrid ? (
        <section className="payroll-summary-grid" id="summary">
          {isLoading ? (
            <>
              <PayrollSkeletonCard />
              <PayrollSkeletonCard />
              <PayrollSkeletonCard />
              <PayrollSkeletonCard />
            </>
          ) : (
            <>
              <PayrollSummaryCard
                label="Total Employees"
                value={summaryStats.uniqueEmployees}
                note={`${selectedMonthMeta.label} payroll population`}
                tone="blue"
                icon="users"
              />
              <PayrollSummaryCard
                label="Total Salary Expense"
                value={currency(summaryStats.salaryExpense)}
                note="Net expense after deductions"
                tone="violet"
                icon="wallet"
              />
              <PayrollSummaryCard
                label="Approved Timesheets"
                value={payrollHandoffSummary.approvedTimesheets}
                note="Ready for payroll processing"
                tone="green"
                icon="circle-check"
              />
              <PayrollSummaryCard
                label="Pending Approvals"
                value={payrollHandoffSummary.pendingApprovals}
                note="Still moving through review"
                tone="amber"
                icon="clock"
              />
              <PayrollSummaryCard
                label="Pending Payroll"
                value={summaryStats.pendingPayroll}
                note="Pending before payroll processing"
                tone="amber"
                icon="clock"
              />
              <PayrollSummaryCard
                label="Processing Rows"
                value={summaryStats.processingPayroll}
                note="Waiting for HR approval"
                tone="blue"
                icon="sparkles"
              />
              <PayrollSummaryCard
                label="Finalized Payroll"
                value={summaryStats.finalizedPayroll}
                note="Closed payroll records"
                tone="green"
                icon="circle-check"
              />
            </>
          )}
        </section>
        ) : null}

        <section className="payroll-layout">
          <div className="payroll-main-column">
            {showRunPanel ? (
              <article className="payroll-panel" id="run-payroll">
                <div className="payroll-panel-head">
                  <div>
                    <span className="payroll-panel-kicker">Payroll Run Screen</span>
                    <h2>Select month and process payroll</h2>
                  </div>
                  <div className="payroll-panel-actions">
                    <label className="payroll-inline-field">
                      <span>Month</span>
                      <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                        {monthOptions.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button type="button" className="payroll-button primary" onClick={handleRunPayroll} disabled={isRunning || !permissions.canRunPayroll || !hasApprovedTimesheets}>
                      <Icon name="sparkles" size={14} />
                      <span>{isRunning ? 'Processing...' : 'Run Payroll'}</span>
                    </button>
                  </div>
                </div>

                {payrollControlLocked ? (
                  <div className="payroll-inline-note">
                    Company admin can review the payroll cycle here. Running payroll is restricted, but the month selector and workflow state stay visible for monitoring.
                  </div>
                ) : null}

                <div className="payroll-stepper-shell">
                  <div className="payroll-stepper-progress">
                    <div className="payroll-stepper-label">
                      <strong>{selectedWorkflow.progress}/{payrollWorkflowSteps.length} steps complete</strong>
                      <span>{selectedWorkflow.lastRunAt ? `Last run: ${new Date(selectedWorkflow.lastRunAt).toLocaleString()}` : 'No payroll run yet'}</span>
                    </div>
                    <div className="payroll-progress-track" aria-hidden="true">
                      <div
                        className="payroll-progress-fill"
                        style={{ width: `${(selectedWorkflow.progress / payrollWorkflowSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="payroll-stepper">
                    {payrollWorkflowSteps.map((step, index) => (
                      <PayrollStepItem key={step.key} step={step} status={workflowStepStates[index]} />
                    ))}
                  </div>
                </div>
                <div className="payroll-run-hint">{runHint}</div>
              </article>
            ) : null}

            {showPayrollTable ? (
            <article className="payroll-panel" id="payroll-table">
              <div className="payroll-panel-head payroll-table-head">
                <div>
                  <span className="payroll-panel-kicker">Payroll Table</span>
                  <h2>{isManager ? 'Team payroll summary' : permissions.canViewAnalytics ? 'Employee salary analytics' : 'Employee salary breakdown'}</h2>
                </div>
                <div className="payroll-toolbar">
                  <label className="payroll-inline-field">
                    <span>Department</span>
                    <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
                      {payrollDepartments.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="payroll-inline-field">
                    <span>Status</span>
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                      {payrollStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {permissions.canViewAnalytics ? (
                <div className="payroll-toolbar payroll-toolbar-strip">
                  <div className="payroll-toolbar-copy">
                    <strong>{filteredRows.length} employee records</strong>
                    <span>{selectedMonthMeta.label} payroll cycle</span>
                  </div>
                  <div className="payroll-toolbar-actions">
                    {permissions.canExportReports ? (
                      <button type="button" className="payroll-button ghost" onClick={handleExportClick}>
                        <Icon name="download" size={14} />
                        <span>Export Reports</span>
                      </button>
                    ) : null}
                    <button type="button" className="payroll-button secondary" onClick={() => setDepartmentFilter('All Departments')}>
                      Reset Filters
                    </button>
                  </div>
                </div>
              ) : null}

              {exportHint ? <div className="payroll-inline-note">{exportHint}</div> : null}

              {isLoading ? (
                <div className="payroll-grid-loading">
                  <PayrollSkeletonCard />
                  <PayrollSkeletonCard />
                  <PayrollSkeletonCard />
                </div>
              ) : (
                <div className="payroll-grid-shell ag-theme-quartz">
                  <AgGridReact
                    theme="legacy"
                    rowData={filteredRows}
                    columnDefs={gridColumnDefs}
                    defaultColDef={defaultGridColDef}
                    domLayout="autoHeight"
                    animateRows
                    getRowId={(params) => params.data.id}
                    pagination
                    paginationPageSize={6}
                    paginationPageSizeSelector={[6, 10, 15]}
                    rowHeight={64}
                    headerHeight={54}
                    suppressCellFocus
                    noRowsOverlayComponent={PayrollGridEmptyOverlay}
                    onRowClicked={(event) => {
                      if (event.data?.id) {
                        setSelectedRowId(event.data.id);
                      }
                    }}
                    rowClassRules={{
                      'payroll-grid-row-selected': (params) => params.data?.id === selectedRow?.id,
                    }}
                  />
                </div>
              )}
            </article>
            ) : null}
          </div>

          <aside className="payroll-side-column">
            <article className="payroll-panel payroll-payslip-panel" id="payslip">
              <div className="payroll-panel-head">
                <div>
                  <span className="payroll-panel-kicker">{isEmployee ? 'My Payslip' : isManager ? 'Team Payslip Preview' : 'Employee Payslip'}</span>
                  <h2>Selected payslip</h2>
                </div>
                {showPayslipToggle ? (
                  <button
                    type="button"
                    className="payroll-inline-toggle"
                    onClick={() => setDetailsOpen((current) => !current)}
                  >
                    {detailsOpen ? 'Collapse details' : 'Expand details'}
                  </button>
                ) : null}
              </div>

              {isLoading ? (
                <div className="payroll-payslip-skeleton">
                  <PayrollSkeletonCard />
                  <PayrollSkeletonCard />
                </div>
              ) : selectedPayslipRow ? (
                <div className="payroll-payslip-card">
                  <div className="payroll-payslip-top">
                    <div>
                      <span className="payroll-payslip-month">{selectedPayslipRow.monthLabel}</span>
                      <h3>{selectedPayslipRow.employee}</h3>
                      <p>
                        {selectedPayslipRow.role} | {selectedPayslipRow.department}
                      </p>
                    </div>
                    <PayrollStatusChip value={selectedPayslipRow.status} />
                  </div>

                  <div className="payroll-payslip-net">
                    <span>Net Salary</span>
                    <strong>{currency(selectedPayslipRow.salary.netSalary)}</strong>
                    <small>Calculated from attendance, timesheet, and deduction rules.</small>
                  </div>

                  <div className="payroll-payslip-breakdown">
                    <div className="payroll-breakdown-column">
                      <h4>Earnings</h4>
                      <div className="payroll-breakdown-row">
                        <span>Basic</span>
                        <strong>{currency(selectedPayslipRow.salary.basic)}</strong>
                      </div>
                      <div className="payroll-breakdown-row">
                        <span>HRA</span>
                        <strong>{currency(selectedPayslipRow.salary.hra)}</strong>
                      </div>
                      <div className="payroll-breakdown-row">
                        <span>Allowances</span>
                        <strong>{currency(selectedPayslipRow.salary.allowances)}</strong>
                      </div>
                    </div>
                    <div className="payroll-breakdown-column">
                      <h4>Deductions</h4>
                      <div className="payroll-breakdown-row">
                        <span>Tax</span>
                        <strong>{currency(selectedPayslipRow.salary.tax)}</strong>
                      </div>
                      <div className="payroll-breakdown-row">
                        <span>PF</span>
                        <strong>{currency(selectedPayslipRow.salary.pf)}</strong>
                      </div>
                      <div className="payroll-breakdown-row">
                        <span>LOP</span>
                        <strong>{currency(selectedPayslipRow.salary.lop)}</strong>
                      </div>
                    </div>
                  </div>

                  {detailsOpen ? (
                    <div className="payroll-details">
                      <div className="payroll-detail-grid">
                        <div>
                          <span>Attendance</span>
                          <strong>{selectedPayslipRow.attendance.presentDays} present / {selectedPayslipRow.attendance.lateDays} late</strong>
                        </div>
                        <div>
                          <span>Leave Impact</span>
                          <strong>{selectedPayslipRow.attendance.leaveDays} leave / {selectedPayslipRow.attendance.lopDays} LOP</strong>
                        </div>
                        <div>
                          <span>Timesheet</span>
                          <strong>{selectedPayslipRow.timesheet.approvedHours}</strong>
                        </div>
                        <div>
                          <span>Monthly Note</span>
                          <strong>{selectedPayslipRow.attendance.quality}</strong>
                        </div>
                      </div>
                      <p className="payroll-detail-note">
                        {selectedPayslipRow.note} Source status: {selectedPayslipRow.timesheet.sourceStatus}. Billable classification: {selectedPayslipRow.billable}.
                      </p>
                    </div>
                  ) : null}

                  {showEmployeeActions ? (
                    <div className="payroll-payslip-footer">
                      <button
                        type="button"
                        className="payroll-button secondary"
                        onClick={() => handleApproveRow(selectedPayslipRow)}
                        disabled={!permissions.canApprovePayroll || selectedPayslipRow.status !== 'Processing'}
                      >
                        Approve Payroll
                      </button>
                      <button type="button" className="payroll-button ghost" onClick={handleFinalizePayroll} disabled={!permissions.canFinalizePayroll}>
                        Finalize Payroll
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="payroll-empty-state">
                  <Icon name="wallet" size={20} />
                  <strong>No employee selected.</strong>
                  <span>{isEmployee ? 'Your payslip will appear here once payroll data loads.' : 'Pick a row from the payroll table to preview the payslip.'}</span>
                </div>
              )}
            </article>

            {showApprovalFlow ? (
            <article className="payroll-panel" id="approval-flow">
              <div className="payroll-panel-head">
                <div>
                  <span className="payroll-panel-kicker">Approval Flow</span>
                  <h2>HR review and finalization</h2>
                </div>
              </div>
              {payrollControlLocked ? (
                <div className="payroll-inline-note">
                  Company admin can monitor approval progress here. Final approval actions remain disabled for this role.
                </div>
              ) : null}
              <div className="payroll-approval-flow">
                <div className="payroll-approval-card">
                  <span className="payroll-approval-label">Selected month</span>
                  <strong>{selectedMonthMeta.label}</strong>
                  <small>{selectedWorkflow.lastRunAt ? 'Payroll already calculated for this cycle.' : 'Run payroll to unlock the approval path.'}</small>
                </div>
                <div className="payroll-approval-card">
                  <span className="payroll-approval-label">Processing rows</span>
                  <strong>{processingCandidates}</strong>
                  <small>Rows waiting for HR approval in the current filter set.</small>
                </div>
                <div className="payroll-approval-card">
                  <span className="payroll-approval-label">Finalized rows</span>
                  <strong>{finalizedCandidates}</strong>
                  <small>Rows already closed for the selected month.</small>
                </div>
                <div className="payroll-approval-actions">
                  <button type="button" className="payroll-button secondary" onClick={() => selectedPayslipRow && handleApproveRow(selectedPayslipRow)} disabled={!permissions.canApprovePayroll || !selectedPayslipRow || selectedPayslipRow.status !== 'Processing'}>
                    HR Approve
                  </button>
                  <button type="button" className="payroll-button primary" onClick={handleFinalizePayroll} disabled={!permissions.canFinalizePayroll || !approvalCandidates}>
                    Finalize Payroll
                  </button>
                </div>
              </div>
              </article>
            ) : null}
          </aside>
        </section>

        {finalizeOpen ? (
          <PayrollModal
            title="Finalize Payroll"
            subtitle={`Finalize all approved rows for ${selectedMonthMeta.label}?`}
            onClose={() => setFinalizeOpen(false)}
            footer={(
              <>
                <button type="button" className="payroll-button secondary" onClick={() => setFinalizeOpen(false)}>
                  Cancel
                </button>
                <button type="button" className="payroll-button primary" onClick={confirmFinalizePayroll}>
                  Confirm Finalization
                </button>
              </>
            )}
          >
            <p className="payroll-modal-copy">
              This confirmation mirrors the HR approval flow. After finalization, all approved payroll rows for the selected month will move to Finalized status in the frontend mock.
            </p>
            <div className="payroll-modal-summary">
              <div>
                <span>Approved rows</span>
                <strong>{approvalCandidates}</strong>
              </div>
              <div>
                <span>Selected month</span>
                <strong>{selectedMonthMeta.label}</strong>
              </div>
            </div>
          </PayrollModal>
        ) : null}
      </div>
    </MainLayout>
  );
}

