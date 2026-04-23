import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '../../super-admin/styles/packages.css';
import {
  companyAdminLeaveMetrics,
  companyAdminLeavePolicies,
  companyAdminLeaveRequests,
  companyAdminLeaveStatuses,
  companyAdminLeaveTypes,
} from '../data/leaveData';

ModuleRegistry.registerModules([AllCommunityModule]);

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'requests', label: 'Requests' },
  { key: 'policies', label: 'Policies' },
  { key: 'create', label: 'Create Policy' },
];

const tabToHash = {
  overview: '#overview',
  requests: '#requests',
  policies: '#policies',
  create: '#create',
};

const hashToTab = {
  '#overview': 'overview',
  '#requests': 'requests',
  '#policies': 'policies',
  '#create': 'create',
};

const sidebarActiveKeyMap = {
  overview: 'company-admin-leave-overview',
  requests: 'company-admin-leave-requests',
  policies: 'company-admin-leave-policies',
  create: 'company-admin-leave-create',
};

const leaveTimeOptions = ['Full Day', 'Half Day', 'Multiple Days'];
const emptyForm = { leaveType: '', leaveTime: 'Full Day', totalDay: '1' };
const policyStorageKey = 'company_admin_leave_policies';
const companyAdminLeaveTextFilterParams = {
  defaultOption: 'contains',
  maxNumConditions: 1,
  suppressAndOrCondition: true,
};

function SmallCard({ title, children, className = '' }) {
  return (
    <section className={`dashboard-card superadmin-package-mini-card ${className}`.trim()}>
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

function StatBlock({ metric }) {
  return (
    <div className="superadmin-package-stat">
      <div className="superadmin-package-stat-label">{metric.label}</div>
      <div className="superadmin-package-stat-value">{metric.value}</div>
      <div className="superadmin-package-stat-change">{metric.change}</div>
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="superadmin-package-modal-backdrop" onClick={onClose} role="presentation">
      <div className="superadmin-package-modal" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="superadmin-package-modal-header">
          <div>
            <div className="superadmin-package-modal-kicker">Company Admin</div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="superadmin-package-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="superadmin-package-modal-body">{children}</div>
        {footer ? <div className="superadmin-package-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function LeaveGridEmptyOverlay({ title, subtitle }) {
  return (
    <div className="superadmin-grid-empty">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function LeaveGridHeader(props) {
  const {
    displayName,
    showFilter,
    enableFilterButton,
    headerIcon = 'list',
    column,
    showMenu = true,
    progressSort,
  } = props;
  const isFiltered = Boolean(column?.isFilterActive?.());
  const sortDirection = column?.getSort?.();
  const showFilterButton = enableFilterButton && showMenu;

  return (
    <div className="superadmin-grid-header">
      <button
        type="button"
        className="superadmin-grid-header-sort"
        onClick={() => progressSort?.(false)}
        aria-label={`Sort ${displayName}`}
      >
        <Icon name={headerIcon} size={11} />
        <span className="superadmin-grid-header-title">{displayName}</span>
        <span className={`superadmin-grid-sort-icons ${sortDirection ? 'is-sorted' : ''}`}>
          <Icon name="arrow-up" size={9} className={sortDirection === 'asc' ? 'is-active' : ''} />
          <Icon name="arrow-down" size={9} className={sortDirection === 'desc' ? 'is-active' : ''} />
        </span>
      </button>
      {showFilterButton ? (
        <button
          type="button"
          className={`superadmin-grid-header-filter ${isFiltered ? 'active' : ''}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            showFilter?.(event.currentTarget);
          }}
          aria-label={`Filter ${displayName}`}
        >
          <Icon name="filter" size={10} />
        </button>
      ) : null}
      {isFiltered ? <span className="superadmin-grid-header-badge" /> : null}
    </div>
  );
}

function LeaveGridNameCell({ data, primaryKey = 'employee', secondaryKey = 'leaveType' }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-name-cell">
      <strong>{data[primaryKey]}</strong>
      <div className="superadmin-grid-name-meta">
        <span>{data[secondaryKey]}</span>
      </div>
    </div>
  );
}

function LeaveGridStatusCell({ value }) {
  const tone = String(value).toLowerCase() === 'approved'
    ? 'tone-active'
    : String(value).toLowerCase() === 'pending'
      ? 'tone-pending'
      : 'tone-inactive';

  return <span className={`role-status-chip ${tone}`}>{value}</span>;
}

function PolicyGridStatusCell({ value }) {
  const tone = String(value).toLowerCase() === 'active'
    ? 'tone-active'
    : String(value).toLowerCase() === 'draft'
      ? 'tone-draft'
      : 'tone-inactive';

  return <span className={`role-status-chip ${tone}`}>{value}</span>;
}

function LeaveRequestViewPanel({ request, onBack }) {
  if (!request) return null;

  return (
    <div className="superadmin-package-form-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
      <label className="superadmin-package-form-field">
        <span>Employee</span>
        <input readOnly disabled value={request.employee} />
      </label>
      <label className="superadmin-package-form-field">
        <span>Leave Type</span>
        <input readOnly disabled value={request.leaveType} />
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <input readOnly disabled value={request.status} />
      </label>
      <label className="superadmin-package-form-field">
        <span>From Date</span>
        <input readOnly disabled value={request.fromDate} />
      </label>
      <label className="superadmin-package-form-field">
        <span>To Date</span>
        <input readOnly disabled value={request.toDate} />
      </label>
      <label className="superadmin-package-form-field">
        <span>Days</span>
        <input readOnly disabled value={request.days || '1'} />
      </label>
      <label className="superadmin-package-form-field" style={{ gridColumn: '1 / -1' }}>
        <span>Reason</span>
        <textarea readOnly disabled value={request.reason} />
      </label>
      <div className="superadmin-package-form-actions" style={{ gridColumn: '1 / -1' }}>
        <button type="button" className="superadmin-package-modal-button secondary" onClick={onBack}>
          Back to List
        </button>
      </div>
    </div>
  );
}

function LeaveActionsCell({ data, onView, onApprove, onReject, onEdit, onDelete, mode = 'request' }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-actions">
      {mode === 'request' ? (
        <>
          <Link to={{ hash: '#create', search: `?mode=view&type=request&id=${encodeURIComponent(data.id)}` }} className="superadmin-grid-icon-button view" aria-label="View request">
            <Icon name="eye" size={14} />
          </Link>
          <button type="button" className="superadmin-grid-icon-button edit" onClick={() => onApprove?.(data)} aria-label="Approve request">
            <Icon name="circle-check" size={14} />
          </button>
          <button type="button" className="superadmin-grid-icon-button edit" onClick={() => onReject?.(data)} aria-label="Reject request">
            <Icon name="clock-rotate-left" size={14} />
          </button>
        </>
      ) : (
        <>
          <Link to={{ hash: '#create', search: `?mode=view&id=${encodeURIComponent(data.id)}` }} className="superadmin-grid-icon-button view" aria-label="View policy">
            <Icon name="eye" size={14} />
          </Link>
          <Link to={{ hash: '#create', search: `?mode=edit&id=${encodeURIComponent(data.id)}` }} className="superadmin-grid-icon-button edit" aria-label="Edit policy">
            <Icon name="pen-to-square" size={14} />
          </Link>
        </>
      )}
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete?.(data)} aria-label={`Delete ${mode}`}>
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

function PolicyForm({ formData, setFormData, onSubmit, submitLabel, errors = {}, readOnly = false, onCancel }) {
  return (
    <form
      className="superadmin-package-form-grid"
      onSubmit={onSubmit}
      style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
    >
      <label className="superadmin-package-form-field">
        <span>Leave Type</span>
        <input
          readOnly={readOnly}
          disabled={readOnly}
          value={formData.leaveType}
          onChange={(event) => setFormData((current) => ({ ...current, leaveType: event.target.value }))}
          placeholder="Enter leave type"
        />
      </label>
      <label className="superadmin-package-form-field">
        <span>Leave Time</span>
        <select disabled={readOnly} value={formData.leaveTime} onChange={(event) => setFormData((current) => ({ ...current, leaveTime: event.target.value }))}>
          {leaveTimeOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Total day</span>
        <input
          readOnly={readOnly}
          disabled={readOnly}
          value={formData.totalDay}
          onChange={(event) => setFormData((current) => ({ ...current, totalDay: event.target.value.replace(/\D/g, '') }))}
          placeholder="Enter total day"
          inputMode="numeric"
        />
        {errors.totalDay ? <small className="superadmin-package-error">{errors.totalDay}</small> : null}
      </label>
      <div className="superadmin-package-form-actions">
        {readOnly ? (
          <button type="button" className="superadmin-package-modal-button secondary" onClick={onCancel}>Back to List</button>
        ) : (
          <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
        )}
      </div>
    </form>
  );
}

function loadPolicies() {
  if (typeof window === 'undefined') return companyAdminLeavePolicies;
  try {
    const stored = window.localStorage.getItem(policyStorageKey);
    if (!stored) return companyAdminLeavePolicies;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : companyAdminLeavePolicies;
  } catch {
    return companyAdminLeavePolicies;
  }
}

function savePolicies(records) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(policyStorageKey, JSON.stringify(records));
  }
}

function formatPolicyAllowance(totalDay) {
  const normalized = String(totalDay || '').trim() || '1';
  return `${normalized} day${normalized === '1' ? '' : 's'}`;
}

function buildPolicyRecord(formData, id = `lp-${String(Date.now()).slice(-5)}`) {
  return {
    id,
    leaveType: formData.leaveType,
    leaveTime: formData.leaveTime,
    totalDay: formData.totalDay,
    name: `${formData.leaveType} Policy`,
    allowance: formatPolicyAllowance(formData.totalDay),
    carryForward: formData.leaveTime === 'Full Day' ? 'No' : 'Yes',
    status: 'Active',
  };
}

export default function CompanyAdminLeaveManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [requestFilter, setRequestFilter] = useState('All');
  const [policyFilter, setPolicyFilter] = useState('All');
  const [requestSearch, setRequestSearch] = useState('');
  const [policySearch, setPolicySearch] = useState('');
  const [requests, setRequests] = useState(companyAdminLeaveRequests);
  const [policies, setPolicies] = useState(() => loadPolicies());
  const [selectedRequestId, setSelectedRequestId] = useState(companyAdminLeaveRequests[0]?.id ?? null);
  const [selectedPolicyId, setSelectedPolicyId] = useState(loadPolicies()[0]?.id ?? null);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [deletePolicyId, setDeletePolicyId] = useState(null);
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState([]);
  const [bulkDeleteRequestsOpen, setBulkDeleteRequestsOpen] = useState(false);
  const [bulkDeletePoliciesOpen, setBulkDeletePoliciesOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const routeMode = searchParams.get('mode');
  const routeType = searchParams.get('type');
  const routeId = searchParams.get('id');

  useEffect(() => savePolicies(policies), [policies]);

  useEffect(() => {
    if (!policies.some((item) => item.id === selectedPolicyId)) {
      setSelectedPolicyId(policies[0]?.id ?? null);
    }
  }, [policies, selectedPolicyId]);

  useEffect(() => {
    if (!requests.some((item) => item.id === selectedRequestId)) {
      setSelectedRequestId(requests[0]?.id ?? null);
    }
  }, [requests, selectedRequestId]);

  useEffect(() => {
    const nextTab = hashToTab[location.hash] || 'overview';
    if (tab !== nextTab) {
      setTab(nextTab);
    }
  }, [location.hash, tab]);

  useEffect(() => {
    if (!location.hash) {
      navigate(tabToHash[tab], { replace: true });
    }
  }, [location.hash, navigate, tab]);

  useEffect(() => {
    if ((routeMode === 'view' || routeMode === 'edit') && routeId && tab !== 'create') {
      setTab('create');
    }
  }, [routeId, routeMode, tab]);

  const selectedRequest = useMemo(() => requests.find((item) => item.id === selectedRequestId) ?? requests[0] ?? null, [requests, selectedRequestId]);
  const selectedPolicy = useMemo(() => policies.find((item) => item.id === selectedPolicyId) ?? policies[0] ?? null, [policies, selectedPolicyId]);
  const viewRequest = useMemo(
    () => (routeMode === 'view' && routeType === 'request' && routeId ? requests.find((item) => item.id === routeId) ?? null : null),
    [requests, routeId, routeMode, routeType],
  );
  const viewPolicy = useMemo(
    () => (routeMode === 'view' && routeType !== 'request' && routeId ? policies.find((item) => item.id === routeId) ?? null : null),
    [policies, routeId, routeMode, routeType],
  );
  const editPolicy = useMemo(
    () => (routeMode === 'edit' && routeType !== 'request' && routeId ? policies.find((item) => item.id === routeId) ?? null : null),
    [policies, routeId, routeMode, routeType],
  );
  const deleteRequest = useMemo(() => requests.find((item) => item.id === deleteRequestId) ?? null, [requests, deleteRequestId]);
  const deletePolicy = useMemo(() => policies.find((item) => item.id === deletePolicyId) ?? null, [policies, deletePolicyId]);
  const recentRequests = useMemo(() => requests.slice(0, 3), [requests]);
  const leaveStatusCounts = useMemo(
    () =>
      requests.reduce(
        (acc, item) => {
          const key = String(item.status || '').toLowerCase();
          if (key === 'approved') acc.approved += 1;
          if (key === 'pending') acc.pending += 1;
          if (key === 'rejected') acc.rejected += 1;
          return acc;
        },
        { approved: 0, pending: 0, rejected: 0 },
      ),
    [requests],
  );

  useEffect(() => {
    if (editPolicy) {
      setFormData({
        leaveType: editPolicy.leaveType,
        leaveTime: editPolicy.leaveTime ?? (editPolicy.carryForward === 'Yes' ? 'Half Day' : 'Full Day'),
        totalDay: String(editPolicy.totalDay ?? editPolicy.allowance?.match(/\d+/)?.[0] ?? '1'),
      });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editPolicy]);

  const filteredRequests = useMemo(
    () =>
      requests.filter((item) => {
        const matchesStatus = requestFilter === 'All' || item.status === requestFilter;
        const haystack = `${item.employee} ${item.leaveType} ${item.reason} ${item.status}`.toLowerCase();
        return matchesStatus && haystack.includes(requestSearch.toLowerCase());
      }),
    [requestFilter, requestSearch, requests],
  );

  const filteredPolicies = useMemo(
    () =>
      policies.filter((item) => {
        const matchesType = policyFilter === 'All' || item.leaveType === policyFilter;
        const haystack = `${item.name} ${item.leaveType} ${item.allowance} ${item.status}`.toLowerCase();
        return matchesType && haystack.includes(policySearch.toLowerCase());
      }),
    [policyFilter, policySearch, policies],
  );

  function approveRequest(request) {
    setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, status: 'Approved' } : item)));
    setSelectedRequestId(request.id);
  }

  function rejectRequest(request) {
    setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, status: 'Rejected' } : item)));
    setSelectedRequestId(request.id);
  }

  function confirmBulkDeleteRequests() {
    if (!selectedRequestIds.length) return;
    setRequests((current) => current.filter((item) => !selectedRequestIds.includes(item.id)));
    setSelectedRequestIds([]);
    setSelectedRequestId(null);
    setBulkDeleteRequestsOpen(false);
  }

  function confirmBulkDeletePolicies() {
    if (!selectedPolicyIds.length) return;
    setPolicies((current) => current.filter((item) => !selectedPolicyIds.includes(item.id)));
    setSelectedPolicyIds([]);
    setSelectedPolicyId(null);
    setBulkDeletePoliciesOpen(false);
  }

  function confirmDeleteRequest() {
    if (!deleteRequestId) return;
    setRequests((current) => current.filter((item) => item.id !== deleteRequestId));
    if (selectedRequestId === deleteRequestId) setSelectedRequestId(null);
    if (selectedRequestIds.includes(deleteRequestId)) {
      setSelectedRequestIds((current) => current.filter((id) => id !== deleteRequestId));
    }
    setDeleteRequestId(null);
  }

  function confirmDeletePolicy() {
    if (!deletePolicyId) return;
    setPolicies((current) => current.filter((item) => item.id !== deletePolicyId));
    if (selectedPolicyId === deletePolicyId) setSelectedPolicyId(null);
    if (selectedPolicyIds.includes(deletePolicyId)) {
      setSelectedPolicyIds((current) => current.filter((id) => id !== deletePolicyId));
    }
    setDeletePolicyId(null);
  }

  const defaultGridColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);

  const requestGridColumnDefs = useMemo(() => [
    {
      field: '_select',
      headerName: '',
      width: 56,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true,
      cellClass: 'superadmin-grid-select-cell',
    },
    {
      field: 'employee',
      headerName: 'Employee',
      minWidth: 220,
      flex: 1.05,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'user' },
      cellRenderer: (params) => <LeaveGridNameCell {...params} primaryKey="employee" secondaryKey="leaveType" />,
    },
    {
      field: 'fromDate',
      headerName: 'From',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
    },
    {
      field: 'toDate',
      headerName: 'To',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
    },
    {
      field: 'days',
      headerName: 'Days',
      width: 110,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'clock' },
      cellClass: 'superadmin-grid-code',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: LeaveGridStatusCell,
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 190,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'ellipsis-vertical', showMenu: false, enableFilterButton: false },
      cellRenderer: LeaveActionsCell,
      cellRendererParams: {
        mode: 'request',
        onView: (request) => ({ pathname: location.pathname, search: `?mode=view&type=request&id=${encodeURIComponent(request.id)}`, hash: tabToHash.create }),
        onApprove: approveRequest,
        onReject: rejectRequest,
        onDelete: (request) => setDeleteRequestId(request.id),
      },
    },
  ], [location.pathname]);

  const policyGridColumnDefs = useMemo(() => [
    {
      field: '_select',
      headerName: '',
      width: 56,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true,
      cellClass: 'superadmin-grid-select-cell',
    },
    {
      field: 'name',
      headerName: 'Policy',
      minWidth: 220,
      flex: 1.1,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'clipboard' },
      cellRenderer: (params) => <LeaveGridNameCell {...params} primaryKey="name" secondaryKey="leaveType" />,
    },
    {
      field: 'allowance',
      headerName: 'Allowance',
      width: 150,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'file-lines' },
      cellClass: 'superadmin-grid-code',
    },
    {
      field: 'carryForward',
      headerName: 'Carry Forward',
      width: 160,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'clock-rotate-left' },
      cellClass: 'superadmin-grid-code',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: PolicyGridStatusCell,
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 150,
      pinned: 'right',
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'ellipsis-vertical', showMenu: false, enableFilterButton: false },
      cellRenderer: LeaveActionsCell,
      cellRendererParams: {
        mode: 'policy',
        onView: (policy) => ({ pathname: location.pathname, search: `?mode=view&id=${encodeURIComponent(policy.id)}`, hash: tabToHash.create }),
        onEdit: (policy) => ({ pathname: location.pathname, search: `?mode=edit&id=${encodeURIComponent(policy.id)}`, hash: tabToHash.create }),
        onDelete: (policy) => setDeletePolicyId(policy.id),
      },
    },
  ], [location.pathname]);

  const handleRequestSelectionChange = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedRequestIds(selectedRows.map((item) => item.id));
    setSelectedRequestId(selectedRows[0]?.id ?? null);
  };

  const handlePolicySelectionChange = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedPolicyIds(selectedRows.map((item) => item.id));
    setSelectedPolicyId(selectedRows[0]?.id ?? null);
  };

  const startCreate = () => {
    setFormErrors({});
    setFormData(emptyForm);
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.create }, { replace: true });
    setTab('create');
  };

  const goToPolicyList = () => {
    setTab('policies');
    navigate(tabToHash.policies, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.leaveType.trim()) errors.leaveType = 'Leave type is required.';
    if (!formData.leaveTime.trim()) errors.leaveTime = 'Leave time is required.';
    if (!formData.totalDay.trim()) errors.totalDay = 'Total day is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const next = buildPolicyRecord(formData);
    setPolicies((current) => [next, ...current]);
    setSelectedPolicyId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    goToPolicyList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!routeId || !routePolicy) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setPolicies((current) => current.map((item) => (item.id === routeId ? { ...item, ...buildPolicyRecord(formData, routeId) } : item)));
    setSelectedPolicyId(routeId);
    setFormErrors({});
    goToPolicyList();
  };

  return (
    <DashboardShell
      activeKey={sidebarActiveKeyMap[tab] || sidebarActiveKeyMap.overview}
      headerProps={{ companyText: 'Company Admin' }}
    >
      <div className="company-admin-leave-management">
        <div className="superadmin-package-tabs">
          {tabs.map((item) => (
            <Link
              key={item.key}
              to={{ pathname: location.pathname, search: '', hash: tabToHash[item.key] }}
              replace
              className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
              aria-current={tab === item.key ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="superadmin-section-header">
          <div className="dashboard-section-heading">
            {tab === 'overview' ? 'Overview' : tab === 'requests' ? 'Leave Requests' : tab === 'policies' ? 'Leave Policies' : 'Create Policy'}
          </div>
        </div>

        {tab === 'overview' ? (
          <div className="dashboard-layout welcome-layout company-admin-overview-layout">
            <div className="welcome-main">
              <SmallCard title="Leave Status" className="company-admin-overview-card">
                <div className="superadmin-list">
                  <div className="superadmin-list-item">
                    <span>Pending Requests</span>
                    <strong>{leaveStatusCounts.pending}</strong>
                  </div>
                  <div className="superadmin-list-item">
                    <span>Approved Requests</span>
                    <strong>{leaveStatusCounts.approved}</strong>
                  </div>
                  <div className="superadmin-list-item">
                    <span>Rejected Requests</span>
                    <strong>{leaveStatusCounts.rejected}</strong>
                  </div>
                </div>
              </SmallCard>

            </div>

            <div className="dashboard-right-col">
              <SmallCard title="Quick Actions" className="company-admin-overview-card">
                <div className="superadmin-package-insight">
                  <strong>Review pending requests or maintain leave policies.</strong>
                  <span>Keep the company-admin leave overview short and operational.</span>
                  <div className="superadmin-package-overview-actions">
                    <Link to={{ pathname: location.pathname, search: '', hash: tabToHash.requests }} replace className="superadmin-package-action">
                      <strong>Open Requests</strong>
                      <span>Review the leave queue.</span>
                    </Link>
                    <Link to={{ pathname: location.pathname, search: '', hash: tabToHash.policies }} replace className="superadmin-package-action">
                      <strong>Open Policies</strong>
                      <span>See leave rules.</span>
                    </Link>
                  </div>
                </div>
              </SmallCard>
</div>
          </div>
        ) : null}

        {tab === 'requests' ? (
          <div className="superadmin-package-layout company-admin-list-page">
            <div className="dashboard-right-col superadmin-package-workspace superadmin-package-full">
              <div className="superadmin-package-table-card superadmin-master-grid-card">
                <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
                  <div className="superadmin-master-searchbar-left">
                    <div className="superadmin-package-search superadmin-master-search">
                      <Icon name="search" size={14} />
                      <input value={requestSearch} onChange={(event) => setRequestSearch(event.target.value)} placeholder="Search request, employee, leave type" />
                    </div>
                  </div>
                  <div className="superadmin-master-searchbar-right">
                    <Link
                      to={{ pathname: location.pathname, search: '', hash: tabToHash.create }}
                      replace
                      className="superadmin-master-action-button tone-primary"
                      onClick={startCreate}
                    >
                      <Icon name="sparkles" size={14} />
                      <span>Add Policy</span>
                    </Link>
                    <button
                      type="button"
                      className="superadmin-master-action-button tone-danger icon-only"
                      onClick={() => setBulkDeleteRequestsOpen(true)}
                      disabled={!selectedRequestIds.length}
                      aria-label="Delete selected requests"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                <div className="superadmin-master-grid">
                  <AgGridReact
                    theme="legacy"
                    rowData={filteredRequests}
                    columnDefs={requestGridColumnDefs}
                    defaultColDef={defaultGridColDef}
                    domLayout="autoHeight"
                    animateRows
                    getRowId={(params) => params.data.id}
                    rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true, enableClickSelection: true }}
                    suppressCellFocus
                    pagination
                    paginationPageSize={6}
                    paginationPageSizeSelector={[6, 10, 15]}
                    headerHeight={52}
                    rowHeight={56}
                    noRowsOverlayComponent={LeaveGridEmptyOverlay}
                    noRowsOverlayComponentParams={{
                      title: 'No leave requests found',
                      subtitle: 'Try a different search term or adjust the filters.',
                    }}
                    onSelectionChanged={handleRequestSelectionChange}
                    onRowClicked={(event) => {
                      if (event.data?.id) {
                        setSelectedRequestId(event.data.id);
                      }
                    }}
                    rowClassRules={{
                      'superadmin-grid-row-selected': (params) => params.data?.id === selectedRequest?.id,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'policies' ? (
          <div className="superadmin-package-layout company-admin-list-page">
            <div className="dashboard-right-col superadmin-package-workspace superadmin-package-full">
              <div className="superadmin-package-table-card superadmin-master-grid-card">
                <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
                  <div className="superadmin-master-searchbar-left">
                    <div className="superadmin-package-search superadmin-master-search">
                      <Icon name="search" size={14} />
                      <input value={policySearch} onChange={(event) => setPolicySearch(event.target.value)} placeholder="Search policy, type, allowance" />
                    </div>
                  </div>
                  <div className="superadmin-master-searchbar-right">
                    <Link
                      to={{ pathname: location.pathname, search: '', hash: tabToHash.create }}
                      replace
                      className="superadmin-master-action-button tone-primary"
                      onClick={startCreate}
                    >
                      <Icon name="sparkles" size={14} />
                      <span>Add Policy</span>
                    </Link>
                    <button
                      type="button"
                      className="superadmin-master-action-button tone-danger icon-only"
                      onClick={() => setBulkDeletePoliciesOpen(true)}
                      disabled={!selectedPolicyIds.length}
                      aria-label="Delete selected policies"
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </div>
                <div className="superadmin-master-grid">
                  <AgGridReact
                    theme="legacy"
                    rowData={filteredPolicies}
                    columnDefs={policyGridColumnDefs}
                    defaultColDef={defaultGridColDef}
                    domLayout="autoHeight"
                    animateRows
                    getRowId={(params) => params.data.id}
                    rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true, enableClickSelection: true }}
                    suppressCellFocus
                    pagination
                    paginationPageSize={6}
                    paginationPageSizeSelector={[6, 10, 15]}
                    headerHeight={52}
                    rowHeight={56}
                    noRowsOverlayComponent={LeaveGridEmptyOverlay}
                    noRowsOverlayComponentParams={{
                      title: 'No leave policies found',
                      subtitle: 'Try a different search term or adjust the filters.',
                    }}
                    onSelectionChanged={handlePolicySelectionChange}
                    onRowClicked={(event) => {
                      if (event.data?.id) {
                        setSelectedPolicyId(event.data.id);
                      }
                    }}
                    rowClassRules={{
                      'superadmin-grid-row-selected': (params) => params.data?.id === selectedPolicy?.id,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

      {tab === 'create' ? (
        <div className="superadmin-package-form-card superadmin-package-full superadmin-package-create-panel">
          {routeMode === 'view' && routeType === 'request' ? (
            <>
              <h4>View Leave Request</h4>
              <p className="superadmin-package-card-copy">Leave request details without a popup screen.</p>
              {viewRequest ? (
                <LeaveRequestViewPanel request={viewRequest} onBack={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.requests }, { replace: true })} />
              ) : <div className="superadmin-empty-state">No leave request selected.</div>}
            </>
          ) : routeMode === 'view' ? (
            <>
              <h4>View Policy</h4>
              <p className="superadmin-package-card-copy">Policy details without a popup screen.</p>
              {viewPolicy ? (
                <PolicyForm
                  formData={viewPolicy}
                  setFormData={() => {}}
                  onSubmit={(event) => event.preventDefault()}
                  submitLabel="Back to List"
                  readOnly
                  onCancel={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.policies }, { replace: true })}
                />
              ) : <div className="superadmin-empty-state">No leave policy selected.</div>}
            </>
          ) : editPolicy ? (
            <>
              <h4>Edit Policy</h4>
              <p className="superadmin-package-card-copy">Compact leave policy form with validation and backend-ready fields.</p>
              <PolicyForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={submitEdit}
                submitLabel="Update Policy"
                errors={formErrors}
              />
              {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
            </>
          ) : (
            <>
              <h4>New Leave Policy</h4>
              <p className="superadmin-package-card-copy">Compact leave policy form with validation and backend-ready fields.</p>
              <PolicyForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={submitCreate}
                submitLabel="Create Policy"
                errors={formErrors}
              />
              {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
            </>
          )}
        </div>
      ) : null}

      {false && tab === 'reports' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">
                {companyAdminLeaveMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Report Snapshot">
              <div className="superadmin-list">
                {companyAdminLeaveHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <SmallCard title="Report Summary">
              <div className="superadmin-package-report-tabs">
                {['monthly', 'quarterly', 'yearly'].map((period) => (
                  <button key={period} type="button" className="superadmin-package-report-pill active">
                    <Icon name="chart-line" size={14} /> {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Pending Requests</strong><span>{companyAdminLeaveMetrics[1].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Approved Requests</strong><span>{companyAdminLeaveMetrics[2].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Policies</strong><span>{companyAdminLeaveMetrics[3].value}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {bulkDeleteRequestsOpen ? (
        <Modal
          title="Delete Selected Requests"
          onClose={() => setBulkDeleteRequestsOpen(false)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setBulkDeleteRequestsOpen(false)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmBulkDeleteRequests}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">
            This will remove {selectedRequestIds.length} selected request{selectedRequestIds.length === 1 ? '' : 's'} from the frontend list.
          </p>
        </Modal>
      ) : null}

      {bulkDeletePoliciesOpen ? (
        <Modal
          title="Delete Selected Policies"
          onClose={() => setBulkDeletePoliciesOpen(false)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setBulkDeletePoliciesOpen(false)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmBulkDeletePolicies}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">
            This will remove {selectedPolicyIds.length} selected policy{selectedPolicyIds.length === 1 ? '' : 'ies'} from the frontend list.
          </p>
        </Modal>
      ) : null}

      {deleteRequest ? (
        <Modal
          title="Delete Request"
          onClose={() => setDeleteRequestId(null)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteRequestId(null)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmDeleteRequest}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">This will remove the request from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}

      {deletePolicy ? (
        <Modal
          title="Delete Policy"
          onClose={() => setDeletePolicyId(null)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeletePolicyId(null)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmDeletePolicy}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">This will remove the policy from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}

      </div>
    </DashboardShell>
  );
}

