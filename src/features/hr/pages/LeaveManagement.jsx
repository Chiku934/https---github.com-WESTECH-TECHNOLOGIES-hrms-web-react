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
  hrLeaveHighlights,
  hrLeaveMetrics,
  hrLeavePolicies,
  hrLeaveQuickActions,
  hrLeaveRequests,
  hrLeaveStatuses,
  hrLeavePolicyStatuses,
  hrLeaveTypes,
} from '../data/leaveData';

ModuleRegistry.registerModules([AllCommunityModule]);

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'requests', label: 'Requests' },
  { key: 'policies', label: 'Policies' },
  { key: 'create', label: 'Create Policy' },
];

const requestFilters = hrLeaveStatuses;
const policyFilters = ['All', ...hrLeaveTypes];
const emptyForm = { name: '', leaveType: 'Casual Leave', allowance: '', carryForward: 'No', status: 'Active' };
const storageKey = 'hr_leave_policies';
const hrLeaveTextFilterParams = {
  defaultOption: 'contains',
  maxNumConditions: 1,
  suppressAndOrCondition: true,
};

function SmallCard({ title, children }) {
  return (
    <section className="dashboard-card superadmin-package-mini-card">
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
            <div className="superadmin-package-modal-kicker">HR</div>
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

function LeaveActionsCell({ data, onView, onApprove, onReject, onEdit, onDelete, mode = 'request' }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-actions">
      <button type="button" className="superadmin-grid-icon-button view" onClick={() => onView?.(data)} aria-label={`View ${mode}`}>
        <Icon name="eye" size={14} />
      </button>
      {mode === 'request' ? (
        <>
          <button type="button" className="superadmin-grid-icon-button edit" onClick={() => onApprove?.(data)} aria-label="Approve request">
            <Icon name="circle-check" size={14} />
          </button>
          <button type="button" className="superadmin-grid-icon-button edit" onClick={() => onReject?.(data)} aria-label="Reject request">
            <Icon name="clock-rotate-left" size={14} />
          </button>
        </>
      ) : (
        <button type="button" className="superadmin-grid-icon-button edit" onClick={() => onEdit?.(data)} aria-label="Edit policy">
          <Icon name="pen-to-square" size={14} />
        </button>
      )}
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete?.(data)} aria-label={`Delete ${mode}`}>
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

function RequestRow({ item, onView, onApprove, onReject, onDelete, selected }) {
  return (
    <tr className={selected ? 'superadmin-package-row active' : 'superadmin-package-row'}>
      <td>
        <div className="superadmin-package-cell">
          <strong>{item.employee}</strong>
          <span>{item.leaveType}</span>
        </div>
      </td>
      <td>{item.fromDate}</td>
      <td>{item.toDate}</td>
      <td>{item.days}</td>
      <td>
        <span className={`role-status-chip tone-${item.status.toLowerCase()}`}>{item.status}</span>
      </td>
      <td>
        <div className="superadmin-package-actions">
          <button type="button" className="superadmin-package-action" onClick={() => onView(item)}>View</button>
          <button type="button" className="superadmin-package-action" onClick={() => onApprove(item)}>Approve</button>
          <button type="button" className="superadmin-package-action" onClick={() => onReject(item)}>Reject</button>
          <button type="button" className="superadmin-package-action danger" onClick={() => onDelete(item)}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

function PolicyRow({ item, onView, onEdit, onDelete, selected }) {
  return (
    <tr className={selected ? 'superadmin-package-row active' : 'superadmin-package-row'}>
      <td>
        <div className="superadmin-package-cell">
          <strong>{item.name}</strong>
          <span>{item.leaveType}</span>
        </div>
      </td>
      <td>{item.allowance}</td>
      <td>{item.carryForward}</td>
      <td>
        <span className={`role-status-chip tone-${item.status.toLowerCase()}`}>{item.status}</span>
      </td>
      <td>
        <div className="superadmin-package-actions">
          <button type="button" className="superadmin-package-action" onClick={() => onView(item)}>View</button>
          <button type="button" className="superadmin-package-action" onClick={() => onEdit(item)}>Edit</button>
          <button type="button" className="superadmin-package-action danger" onClick={() => onDelete(item)}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

function PolicyForm({ formData, setFormData, onSubmit, submitLabel, errors = {} }) {
  return (
    <form className="superadmin-package-form-grid" onSubmit={onSubmit}>
      <label className="superadmin-package-form-field">
        <span>Policy Name</span>
        <input value={formData.name} onChange={(event) => setFormData((c) => ({ ...c, name: event.target.value }))} placeholder="Enter policy name" />
        {errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Leave Type</span>
        <select value={formData.leaveType} onChange={(event) => setFormData((c) => ({ ...c, leaveType: event.target.value }))}>
          {hrLeaveTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Allowance</span>
        <input value={formData.allowance} onChange={(event) => setFormData((c) => ({ ...c, allowance: event.target.value }))} placeholder="e.g. 12 days" />
        {errors.allowance ? <small className="superadmin-package-error">{errors.allowance}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Carry Forward</span>
        <select value={formData.carryForward} onChange={(event) => setFormData((c) => ({ ...c, carryForward: event.target.value }))}>
          <option>No</option>
          <option>Yes</option>
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select value={formData.status} onChange={(event) => setFormData((c) => ({ ...c, status: event.target.value }))}>
          {hrLeavePolicyStatuses.map((item) => <option key={item}>{item}</option>)}
        </select>
        {errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}
      </label>
      <div className="superadmin-package-form-actions">
        <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function loadPolicies() {
  if (typeof window === 'undefined') return hrLeavePolicies;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return hrLeavePolicies;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : hrLeavePolicies;
  } catch {
    return hrLeavePolicies;
  }
}

function savePolicies(records) {
  if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(records));
}

export default function LeaveManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [requestFilter, setRequestFilter] = useState('All');
  const [policyFilter, setPolicyFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(hrLeaveQuickActions[0].label);
  const [requestSearch, setRequestSearch] = useState('');
  const [policySearch, setPolicySearch] = useState('');
  const [requests, setRequests] = useState(hrLeaveRequests);
  const [policies, setPolicies] = useState(() => loadPolicies());
  const [selectedRequestId, setSelectedRequestId] = useState(hrLeaveRequests[0]?.id ?? null);
  const [selectedPolicyId, setSelectedPolicyId] = useState(loadPolicies()[0]?.id ?? null);
  const [viewRequestId, setViewRequestId] = useState(null);
  const [viewPolicyId, setViewPolicyId] = useState(null);
  const [editPolicyId, setEditPolicyId] = useState(null);
  const [deleteRequestId, setDeleteRequestId] = useState(null);
  const [deletePolicyId, setDeletePolicyId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => savePolicies(policies), [policies]);
  useEffect(() => { if (!policies.some((item) => item.id === selectedPolicyId)) setSelectedPolicyId(policies[0]?.id ?? null); }, [policies, selectedPolicyId]);
  useEffect(() => { if (!requests.some((item) => item.id === selectedRequestId)) setSelectedRequestId(requests[0]?.id ?? null); }, [requests, selectedRequestId]);

  const selectedRequest = useMemo(() => requests.find((item) => item.id === selectedRequestId) ?? requests[0] ?? null, [requests, selectedRequestId]);
  const selectedPolicy = useMemo(() => policies.find((item) => item.id === selectedPolicyId) ?? policies[0] ?? null, [policies, selectedPolicyId]);
  const viewRequest = useMemo(() => requests.find((item) => item.id === viewRequestId) ?? null, [requests, viewRequestId]);
  const viewPolicy = useMemo(() => policies.find((item) => item.id === viewPolicyId) ?? null, [policies, viewPolicyId]);
  const editPolicy = useMemo(() => policies.find((item) => item.id === editPolicyId) ?? null, [policies, editPolicyId]);
  const deleteRequest = useMemo(() => requests.find((item) => item.id === deleteRequestId) ?? null, [requests, deleteRequestId]);
  const deletePolicy = useMemo(() => policies.find((item) => item.id === deletePolicyId) ?? null, [policies, deletePolicyId]);

  useEffect(() => {
    if (editPolicy) {
      setFormData({
        name: editPolicy.name,
        leaveType: editPolicy.leaveType,
        allowance: editPolicy.allowance,
        carryForward: editPolicy.carryForward,
        status: editPolicy.status,
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

  const defaultGridColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);

  const requestGridColumnDefs = useMemo(() => [
    {
      headerName: '',
      colId: 'selection',
      width: 56,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true,
      checkboxSelection: true,
      cellClass: 'superadmin-grid-select-cell',
    },
    {
      field: 'employee',
      headerName: 'Employee',
      minWidth: 220,
      flex: 1.05,
      filter: 'agTextColumnFilter',
      filterParams: hrLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'user' },
      cellRenderer: (params) => <LeaveGridNameCell {...params} primaryKey="employee" secondaryKey="leaveType" />,
    },
    {
      field: 'fromDate',
      headerName: 'From',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: hrLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
    },
    {
      field: 'toDate',
      headerName: 'To',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: hrLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
    },
    {
      field: 'days',
      headerName: 'Days',
      width: 110,
      filter: 'agTextColumnFilter',
      filterParams: hrLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'clock' },
      cellClass: 'superadmin-grid-code',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: hrLeaveTextFilterParams,
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
        onView: (request) => setViewRequestId(request.id),
        onApprove: approveRequest,
        onReject: rejectRequest,
        onDelete: (request) => setDeleteRequestId(request.id),
      },
    },
  ], [approveRequest, rejectRequest]);

  const policyGridColumnDefs = useMemo(() => [
    {
      headerName: '',
      colId: 'selection',
      width: 56,
      pinned: 'left',
      sortable: false,
      filter: false,
      resizable: false,
      suppressHeaderMenuButton: true,
      checkboxSelection: true,
      cellClass: 'superadmin-grid-select-cell',
    },
    {
      field: 'name',
      headerName: 'Policy',
      minWidth: 220,
      flex: 1.1,
      filter: 'agTextColumnFilter',
      filterParams: hrLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'clipboard' },
      cellRenderer: (params) => <LeaveGridNameCell {...params} primaryKey="name" secondaryKey="leaveType" />,
    },
    {
      field: 'allowance',
      headerName: 'Allowance',
      width: 150,
      filter: 'agTextColumnFilter',
      filterParams: hrLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'file-lines' },
      cellClass: 'superadmin-grid-code',
    },
    {
      field: 'carryForward',
      headerName: 'Carry Forward',
      width: 160,
      filter: 'agTextColumnFilter',
      filterParams: hrLeaveTextFilterParams,
      headerComponent: LeaveGridHeader,
      headerComponentParams: { headerIcon: 'clock-rotate-left' },
      cellClass: 'superadmin-grid-code',
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: hrLeaveTextFilterParams,
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
        onView: (policy) => setViewPolicyId(policy.id),
        onEdit: (policy) => setEditPolicyId(policy.id),
        onDelete: (policy) => setDeletePolicyId(policy.id),
      },
    },
  ], []);

  const handleRequestSelectionChange = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedRequestId(selectedRows[0]?.id ?? null);
  };

  const handlePolicySelectionChange = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedPolicyId(selectedRows[0]?.id ?? null);
  };

  const startCreate = () => {
    setEditPolicyId(null);
    setFormErrors({});
    setFormData(emptyForm);
    setTab('create');
  };

  const goToPolicyList = () => {
    setTab('policies');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.policies }, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Policy name is required.';
    if (!formData.leaveType.trim()) errors.leaveType = 'Leave type is required.';
    if (!formData.allowance.trim()) errors.allowance = 'Allowance is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const next = { id: `lp-${String(Date.now()).slice(-5)}`, ...formData };
    setPolicies((current) => [next, ...current]);
    setSelectedPolicyId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    goToPolicyList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editPolicyId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setPolicies((current) => current.map((item) => (item.id === editPolicyId ? { ...item, ...formData } : item)));
    setSelectedPolicyId(editPolicyId);
    setEditPolicyId(null);
    setFormErrors({});
    goToPolicyList();
  };

  function approveRequest(request) {
    setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, status: 'Approved' } : item)));
    setSelectedRequestId(request.id);
  }

  function rejectRequest(request) {
    setRequests((current) => current.map((item) => (item.id === request.id ? { ...item, status: 'Rejected' } : item)));
    setSelectedRequestId(request.id);
  }

  const confirmDeleteRequest = () => {
    if (!deleteRequestId) return;
    setRequests((current) => current.filter((item) => item.id !== deleteRequestId));
    if (selectedRequestId === deleteRequestId) setSelectedRequestId(null);
    setDeleteRequestId(null);
  };

  const confirmDeletePolicy = () => {
    if (!deletePolicyId) return;
    setPolicies((current) => current.filter((item) => item.id !== deletePolicyId));
    if (selectedPolicyId === deletePolicyId) setSelectedPolicyId(null);
    setDeletePolicyId(null);
  };

  return (
    <DashboardShell activeKey="hr-leave-management" headerProps={{ companyText: 'HR' }}>
      <div className="superadmin-package-tabs">
        {tabs.map((item) => (
          <Link
            key={item.key}
            to={{ pathname: location.pathname, search: '', hash: `#${item.key}` }}
            replace
            className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
            aria-current={tab === item.key ? 'page' : undefined}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : tab === 'requests' ? 'Leave Requests' : tab === 'policies' ? 'Leave Policies' : 'Create Policy'}</div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <SmallCard title="Leave Snapshot">
              <div className="superadmin-list">
                {hrLeaveHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>

            <SmallCard title="Selected Request">
              {selectedRequest ? (
                <div className="superadmin-package-detail superadmin-package-detail-compact">
                  <div><span>Employee</span><strong>{selectedRequest.employee}</strong></div>
                  <div><span>Type</span><strong>{selectedRequest.leaveType}</strong></div>
                  <div><span>Days</span><strong>{selectedRequest.days}</strong></div>
                  <div><span>Status</span><strong>{selectedRequest.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Select a request to preview the details.</div>}
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-insight">
                <strong>Keep leave management focused on the next step and the active request queue.</strong>
                <span>The minimal overview keeps the data readable and matches the Super Admin structure.</span>
                <div className="superadmin-package-overview-actions">
                  <button type="button" className="superadmin-package-action" onClick={() => setTab('requests')}>
                    <strong>Open Requests</strong>
                    <span>Review the leave queue.</span>
                  </button>
                  <button type="button" className="superadmin-package-action" onClick={() => setTab('policies')}>
                    <strong>Open Policies</strong>
                    <span>See leave rules.</span>
                  </button>
                  <button type="button" className="superadmin-package-action" onClick={() => setTab('create')}>
                    <strong>Create Policy</strong>
                    <span>Open the form.</span>
                  </button>
                </div>
              </div>
            </SmallCard>

            <SmallCard title="Overview Stats">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Requests</span><strong>{hrLeaveMetrics[0].value}</strong></div>
                <div className="superadmin-list-item"><span>Pending</span><strong>{hrLeaveMetrics[1].value}</strong></div>
                <div className="superadmin-list-item"><span>Policies</span><strong>{hrLeaveMetrics[3].value}</strong></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'requests' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Request Snapshot">
              <div className="superadmin-list">
                {hrLeaveHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Selected Request">
              {selectedRequest ? (
                <div className="superadmin-package-detail">
                  <div><span>Employee</span><strong>{selectedRequest.employee}</strong></div>
                  <div><span>Leave Type</span><strong>{selectedRequest.leaveType}</strong></div>
                  <div><span>Reason</span><strong>{selectedRequest.reason}</strong></div>
                  <div><span>Status</span><strong>{selectedRequest.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Pick a request to preview the details.</div>}
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-filterbar">
              <div className="superadmin-package-search">
                <Icon name="search" size={14} />
                <input value={requestSearch} onChange={(event) => setRequestSearch(event.target.value)} placeholder="Search request, employee, leave type" />
              </div>
              <Link
                to={{ pathname: location.pathname, search: '', hash: '#create' }}
                replace
                className="superadmin-package-secondary"
                onClick={startCreate}
              >
                + Add Policy
              </Link>
            </div>
            <div className="superadmin-package-filters">
              {requestFilters.map((item) => (
                <button key={item} type="button" className={`superadmin-package-filter ${requestFilter === item ? 'active' : ''}`} onClick={() => setRequestFilter(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="superadmin-package-table-card">
              <div className="ag-theme-quartz superadmin-master-grid">
                <AgGridReact
                  rowData={filteredRequests}
                  columnDefs={requestGridColumnDefs}
                  defaultColDef={defaultGridColDef}
                  domLayout="autoHeight"
                  animateRows
                  getRowId={(params) => params.data.id}
                  rowSelection="single"
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
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Policy Snapshot">
              <div className="superadmin-list">
                {hrLeaveHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Selected Policy">
              {selectedPolicy ? (
                <div className="superadmin-package-detail">
                  <div><span>Name</span><strong>{selectedPolicy.name}</strong></div>
                  <div><span>Type</span><strong>{selectedPolicy.leaveType}</strong></div>
                  <div><span>Allowance</span><strong>{selectedPolicy.allowance}</strong></div>
                  <div><span>Status</span><strong>{selectedPolicy.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Select a policy to preview the details.</div>}
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-filterbar">
              <div className="superadmin-package-search">
                <Icon name="search" size={14} />
                <input value={policySearch} onChange={(event) => setPolicySearch(event.target.value)} placeholder="Search policy, type, allowance" />
              </div>
              <Link
                to={{ pathname: location.pathname, search: '', hash: '#create' }}
                replace
                className="superadmin-package-secondary"
                onClick={startCreate}
              >
                + Add Policy
              </Link>
            </div>
            <div className="superadmin-package-filters">
              {policyFilters.map((item) => (
                <button key={item} type="button" className={`superadmin-package-filter ${policyFilter === item ? 'active' : ''}`} onClick={() => setPolicyFilter(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="superadmin-package-table-card">
              <div className="ag-theme-quartz superadmin-master-grid">
                <AgGridReact
                  rowData={filteredPolicies}
                  columnDefs={policyGridColumnDefs}
                  defaultColDef={defaultGridColDef}
                  domLayout="autoHeight"
                  animateRows
                  getRowId={(params) => params.data.id}
                  rowSelection="single"
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
          <h4>{editPolicy ? 'Edit Policy' : 'New Leave Policy'}</h4>
          <PolicyForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={editPolicy ? submitEdit : submitCreate}
            submitLabel={editPolicy ? 'Update Policy' : 'Create Policy'}
            errors={formErrors}
          />
          {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
        </div>
      ) : null}

      {false && tab === 'reports' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">{hrLeaveMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div>
            </div>
            <SmallCard title="Report Snapshot">
              <div className="superadmin-list">
                {hrLeaveHighlights.map((item) => (
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
                <div className="superadmin-report-row"><div><strong>Pending Requests</strong><span>{hrLeaveMetrics[1].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Approved Requests</strong><span>{hrLeaveMetrics[2].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Policies</strong><span>{hrLeaveMetrics[3].value}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {viewRequest ? (
        <Modal title="View Leave Request" onClose={() => setViewRequestId(null)} footer={<button type="button" className="superadmin-package-modal-button secondary" onClick={() => setViewRequestId(null)}>Close</button>}>
          <div className="superadmin-package-detail view">
            <div><span>Employee</span><strong>{viewRequest.employee}</strong></div>
            <div><span>Leave Type</span><strong>{viewRequest.leaveType}</strong></div>
            <div><span>Reason</span><strong>{viewRequest.reason}</strong></div>
            <div><span>Status</span><strong>{viewRequest.status}</strong></div>
          </div>
        </Modal>
      ) : null}

      {viewPolicy ? (
        <Modal title="View Policy" onClose={() => setViewPolicyId(null)} footer={<button type="button" className="superadmin-package-modal-button secondary" onClick={() => setViewPolicyId(null)}>Close</button>}>
          <div className="superadmin-package-detail view">
            <div><span>Name</span><strong>{viewPolicy.name}</strong></div>
            <div><span>Type</span><strong>{viewPolicy.leaveType}</strong></div>
            <div><span>Allowance</span><strong>{viewPolicy.allowance}</strong></div>
            <div><span>Carry Forward</span><strong>{viewPolicy.carryForward}</strong></div>
            <div><span>Status</span><strong>{viewPolicy.status}</strong></div>
          </div>
        </Modal>
      ) : null}

      {editPolicy ? (
        <Modal title="Edit Policy" onClose={() => setEditPolicyId(null)} footer={null}>
          <PolicyForm formData={formData} setFormData={setFormData} onSubmit={submitEdit} submitLabel="Update Policy" errors={formErrors} />
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
    </DashboardShell>
  );
}
