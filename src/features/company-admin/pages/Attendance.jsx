import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import CompanyAdminGridHeader from '../components/CompanyAdminGridHeader';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ROLES } from '../../../app/config/roles';
import '../../super-admin/styles/packages.css';
import { loadUserSetupUsers } from '../../user-setup/services/userSetupService';
import {
  companyAdminAttendanceHighlights,
  companyAdminAttendanceList,
  companyAdminAttendanceMetrics,
  companyAdminAttendanceModes,
  companyAdminAttendanceQuickActions,
  companyAdminAttendanceStatuses,
  companyAdminAttendanceShifts,
} from '../data/attendanceData';

ModuleRegistry.registerModules([AllCommunityModule]);

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'attendance', label: 'Attendance List' },
  { key: 'mark', label: 'Mark Attendance' },
];

const tabToHash = {
  overview: '#overview',
  attendance: '#attendance',
  mark: '#mark',
};

const hashToTab = {
  '#overview': 'overview',
  '#attendance': 'attendance',
  '#mark': 'mark',
};

const sidebarActiveKeyMap = {
  overview: 'company-admin-attendance-overview',
  attendance: 'company-admin-attendance-list',
  mark: 'company-admin-attendance-mark',
};

const filters = ['All', ...companyAdminAttendanceStatuses.slice(1)];
const emptyForm = {
  employee: '',
  employeeId: '',
  date: '',
  mode: 'Present',
  shift: 'General',
  checkIn: '',
  checkOut: '',
  status: 'Present',
  note: '',
};
const storageKey = 'company_admin_attendance';
const companyAdminGridTextFilterParams = {
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

function AttendanceGridEmptyOverlay({ title, subtitle }) {
  return (
    <div className="superadmin-grid-empty">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function AttendanceNameCell({ data }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-name-cell">
      <strong>{data.employee}</strong>
      <div className="superadmin-grid-name-meta">
        <span>{data.employeeId}</span>
      </div>
    </div>
  );
}

function AttendanceStatusCell({ value }) {
  return <span className={`role-status-chip tone-${String(value).toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>;
}

function AttendanceActionsCell({ data, onEdit, onDelete }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-actions">
      <Link
        to={onEdit?.(data)}
        replace
        className="superadmin-grid-icon-button edit"
        aria-label="Edit attendance"
      >
        <Icon name="pen-to-square" size={14} />
      </Link>
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete?.(data)} aria-label="Delete attendance">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

function AttendanceForm({ formData, setFormData, onSubmit, submitLabel, errors = {}, employeeOptions = [], readOnly = false }) {
  return (
    <form
      className="superadmin-package-form-grid"
      onSubmit={onSubmit}
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
    >
      <label className="superadmin-package-form-field">
        <span>Employee</span>
        <select
          disabled={readOnly}
          value={formData.employee}
          onChange={(event) => {
            const selected = employeeOptions.find((item) => item.fullName === event.target.value);
            setFormData((current) => ({
              ...current,
              employee: selected?.fullName || '',
              employeeId: selected?.id || '',
            }));
          }}
        >
          <option value="">Select employee</option>
          {employeeOptions.map((item) => (
            <option key={item.id} value={item.fullName}>
              {item.fullName}{item.userName ? ` - ${item.userName}` : ''}
            </option>
          ))}
        </select>
        {errors.employee ? <small className="superadmin-package-error">{errors.employee}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Date</span>
        <input readOnly={readOnly} disabled={readOnly} type="date" value={formData.date} onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))} />
        {errors.date ? <small className="superadmin-package-error">{errors.date}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Mode</span>
        <select disabled={readOnly} value={formData.mode} onChange={(event) => setFormData((current) => ({ ...current, mode: event.target.value }))}>
          {companyAdminAttendanceModes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Shift</span>
        <select disabled={readOnly} value={formData.shift} onChange={(event) => setFormData((current) => ({ ...current, shift: event.target.value }))}>
          {companyAdminAttendanceShifts.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Check In</span>
        <input readOnly={readOnly} disabled={readOnly} type="time" value={formData.checkIn} onChange={(event) => setFormData((current) => ({ ...current, checkIn: event.target.value }))} />
        {errors.checkIn ? <small className="superadmin-package-error">{errors.checkIn}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Check Out</span>
        <input readOnly={readOnly} disabled={readOnly} type="time" value={formData.checkOut} onChange={(event) => setFormData((current) => ({ ...current, checkOut: event.target.value }))} />
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select disabled={readOnly} value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
          {companyAdminAttendanceStatuses.slice(1).map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field superadmin-project-wide-field">
        <span>Note</span>
        <textarea readOnly={readOnly} disabled={readOnly} value={formData.note} onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))} placeholder="Add a short note" />
      </label>
      <div className="superadmin-package-form-actions">
        {readOnly ? null : <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>}
      </div>
    </form>
  );
}

function loadAttendance() {
  if (typeof window === 'undefined') return companyAdminAttendanceList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return companyAdminAttendanceList;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : companyAdminAttendanceList;
  } catch {
    return companyAdminAttendanceList;
  }
}

function saveAttendance(records) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }
}

export default function CompanyAdminAttendance() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(companyAdminAttendanceQuickActions[0].label);
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState(() => loadAttendance());
  const [selectedId, setSelectedId] = useState(loadAttendance()[0]?.id ?? null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const routeMode = searchParams.get('mode');
  const routeId = searchParams.get('id');

  const employeeOptions = useMemo(() => {
    const roster = loadUserSetupUsers()
      .filter((item) => [ROLES.COMPANY_ADMIN, ROLES.HR, ROLES.EMPLOYEE].includes(item.role))
      .map((item) => ({
        id: item.id,
        fullName: item.fullName,
        userName: item.userName,
      }))
      .filter((item) => item.fullName);
    const fallback = companyAdminAttendanceList.map((item) => ({
      id: item.employeeId,
      fullName: item.employee,
      userName: '',
    }));
    const source = roster.length ? roster : fallback;
    return source.filter((item, index, list) => index === list.findIndex((entry) => entry.fullName.toLowerCase() === item.fullName.toLowerCase()));
  }, []);

  useEffect(() => saveAttendance(records), [records]);

  useEffect(() => {
    if (!records.some((item) => item.id === selectedId)) {
      setSelectedId(records[0]?.id ?? null);
    }
  }, [records, selectedId]);

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

  const selected = useMemo(() => records.find((item) => item.id === selectedId) ?? records[0] ?? null, [records, selectedId]);
  const routeRecord = useMemo(() => records.find((item) => item.id === routeId) ?? null, [records, routeId]);
  const viewRecord = routeMode === 'view' ? routeRecord : null;
  const editRecord = routeMode === 'edit' ? routeRecord : null;
  const deleteRecord = useMemo(() => records.find((item) => item.id === deleteId) ?? null, [records, deleteId]);
  const attendanceStatusCounts = useMemo(
    () =>
      records.reduce(
        (acc, item) => {
          const key = String(item.status || '').toLowerCase();
          if (key === 'present') acc.present += 1;
          if (key === 'late') acc.late += 1;
          if (key === 'absent') acc.absent += 1;
          if (key === 'wfh') acc.wfh += 1;
          if (key === 'regularized') acc.regularized += 1;
          return acc;
        },
        { present: 0, late: 0, absent: 0, wfh: 0, regularized: 0 },
      ),
    [records],
  );
  const latestRecord = useMemo(() => {
    if (!records.length) return null;
    return records
      .slice()
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.checkIn || '').localeCompare(String(a.checkIn || '')))[0];
  }, [records]);
  const defaultGridColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);
  const attendanceGridColumns = useMemo(() => [
    {
      field: 'employee',
      headerName: 'Employee',
      minWidth: 220,
      flex: 1.1,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'user' },
      cellRenderer: AttendanceNameCell,
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
    },
    {
      field: 'checkIn',
      headerName: 'Check In',
      width: 130,
      valueFormatter: (params) => params.value || '-',
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'clock' },
    },
    {
      field: 'checkOut',
      headerName: 'Check Out',
      width: 130,
      valueFormatter: (params) => params.value || '-',
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'clock' },
    },
    {
      field: 'shift',
      headerName: 'Shift',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'briefcase' },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: AttendanceStatusCell,
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 160,
      sortable: false,
      filter: false,
      resizable: false,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { showMenu: false, enableFilterButton: false, headerIcon: 'ellipsis-vertical' },
      cellRenderer: AttendanceActionsCell,
      cellRendererParams: {
        onEdit: (record) => ({ pathname: location.pathname, search: `?mode=edit&id=${encodeURIComponent(record.id)}`, hash: tabToHash.mark }),
        onDelete: (record) => setDeleteId(record.id),
      },
    },
  ], [location.pathname]);

  useEffect(() => {
    if (editRecord || viewRecord) {
      setFormData({
        employee: (editRecord || viewRecord).employee,
        employeeId: (editRecord || viewRecord).employeeId,
        date: (editRecord || viewRecord).date,
        mode: (editRecord || viewRecord).mode,
        shift: (editRecord || viewRecord).shift,
        checkIn: (editRecord || viewRecord).checkIn,
        checkOut: (editRecord || viewRecord).checkOut,
        status: (editRecord || viewRecord).status,
        note: (editRecord || viewRecord).note,
      });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editRecord]);

  useEffect(() => {
    if ((routeMode === 'view' || routeMode === 'edit') && routeRecord && tab !== 'mark') {
      setTab('mark');
      navigate({ pathname: location.pathname, search: location.search, hash: tabToHash.mark }, { replace: true });
    }
  }, [location.pathname, location.search, navigate, routeMode, routeRecord, tab]);

  useEffect(() => {
    if (routeMode === 'view' && routeRecord) {
      setSelectedId(routeRecord.id);
    }
  }, [routeMode, routeRecord]);

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const haystack = `${item.employee} ${item.employeeId} ${item.date} ${item.mode} ${item.shift} ${item.status} ${item.note}`.toLowerCase();
        return matchesStatus && haystack.includes(searchTerm.toLowerCase());
      }),
    [records, searchTerm, statusFilter],
  );

  const statusCounts = useMemo(
    () =>
      companyAdminAttendanceStatuses.slice(1).reduce((acc, status) => {
        acc[status] = records.filter((item) => item.status === status).length;
        return acc;
      }, {}),
    [records],
  );

  const startMark = () => {
    setFormErrors({});
    setFormData(emptyForm);
    setTab('mark');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.mark }, { replace: true });
  };

  const goToAttendanceList = () => {
    setTab('attendance');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.attendance }, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.employee.trim()) errors.employee = 'Employee is required.';
    if (!formData.date.trim()) errors.date = 'Date is required.';
    if (!formData.checkIn.trim()) errors.checkIn = 'Check in time is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const next = { id: `a-${String(Date.now()).slice(-5)}`, ...formData };
    setRecords((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    goToAttendanceList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!routeId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setRecords((current) => current.map((item) => (item.id === routeId ? { ...item, ...formData } : item)));
    setSelectedId(routeId);
    setFormErrors({});
    goToAttendanceList();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setRecords((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  const confirmBulkDelete = () => {
    if (!selectedIds.length) return;
    setRecords((current) => current.filter((item) => !selectedIds.includes(item.id)));
    if (selectedIds.includes(selectedId)) setSelectedId(null);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  const handleSelectionChanged = (event) => {
    setSelectedIds(event.api.getSelectedRows().map((item) => item.id));
  };

  return (
    <DashboardShell
      activeKey={sidebarActiveKeyMap[tab] || sidebarActiveKeyMap.overview}
      headerProps={{ companyText: 'Company Admin' }}
    >
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
          {tab === 'overview' ? 'Overview' : tab === 'attendance' ? 'Attendance Directory' : 'Mark Attendance'}
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <SmallCard title="Attendance Summary">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Present</span><strong>{attendanceStatusCounts.present}</strong></div>
                <div className="superadmin-list-item"><span>Late</span><strong>{attendanceStatusCounts.late}</strong></div>
                <div className="superadmin-list-item"><span>Absent</span><strong>{attendanceStatusCounts.absent}</strong></div>
                <div className="superadmin-list-item"><span>WFH</span><strong>{attendanceStatusCounts.wfh}</strong></div>
                <div className="superadmin-list-item"><span>Regularized</span><strong>{attendanceStatusCounts.regularized}</strong></div>
              </div>
            </SmallCard>
          </div>
          <div className="dashboard-right-col">
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-insight">
                <strong>Review records or mark today’s attendance.</strong>
                <span>Keep the overview tied to live attendance activity.</span>
                <div className="superadmin-package-overview-actions">
                  <button type="button" className="superadmin-package-action" onClick={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.attendance }, { replace: true })}>
                    <strong>Open List</strong>
                    <span>Review attendance records.</span>
                  </button>
                  <button type="button" className="superadmin-package-action" onClick={() => startMark()}>
                    <strong>Mark Attendance</strong>
                    <span>Open the entry form.</span>
                  </button>
                </div>
              </div>
            </SmallCard>

          </div>
        </div>
      ) : null}

      {tab === 'attendance' ? (
        <div className="superadmin-package-layout company-admin-list-page">
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-table-card superadmin-master-grid-card">
              <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
                <div className="superadmin-master-searchbar-left">
                  <div className="superadmin-package-search superadmin-master-search">
                    <Icon name="search" size={14} />
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search employee, date, mode, note" />
                  </div>
                </div>
                <div className="superadmin-master-searchbar-right">
                  <Link
                    to={{ pathname: location.pathname, search: '', hash: tabToHash.mark }}
                    replace
                    className="superadmin-master-action-button tone-primary"
                    onClick={startMark}
                  >
                    <Icon name="sparkles" size={14} />
                    <span>Mark Attendance</span>
                  </Link>
                  <button
                    type="button"
                    className="superadmin-master-action-button tone-danger icon-only"
                    onClick={() => setBulkDeleteOpen(true)}
                    disabled={!selectedIds.length}
                    aria-label="Delete selected attendance rows"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
              <div className="superadmin-master-grid">
                <AgGridReact
                  theme="legacy"
                  rowData={filteredRecords}
                  columnDefs={attendanceGridColumns}
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
                  noRowsOverlayComponent={AttendanceGridEmptyOverlay}
                  noRowsOverlayComponentParams={{
                    title: 'No attendance records found',
                    subtitle: 'Try a different search term or adjust the filters.',
                  }}
                  onSelectionChanged={handleSelectionChanged}
                  onRowClicked={(event) => {
                    if (event.data?.id) {
                      setSelectedId(event.data.id);
                    }
                  }}
                  rowClassRules={{
                    'superadmin-grid-row-selected': (params) => params.data?.id === selected?.id,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'mark' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-workspace superadmin-package-full">
            <div className="superadmin-package-form-card superadmin-package-full">
              {routeMode === 'view' ? (
                <>
                  <h4>View Attendance</h4>
                  <p className="superadmin-package-card-copy">Attendance record details shown in the same form layout, but locked for review only.</p>
                  {viewRecord ? (
                    <AttendanceForm
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={(event) => event.preventDefault()}
                      submitLabel="Back to List"
                      errors={formErrors}
                      employeeOptions={employeeOptions}
                      readOnly
                    />
                  ) : <div className="superadmin-empty-state">No attendance record selected.</div>}
                  <div className="superadmin-package-form-actions">
                    <Link to={{ pathname: location.pathname, search: '', hash: tabToHash.attendance }} replace className="superadmin-package-modal-button secondary">
                      Back to List
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h4>{routeMode === 'edit' ? 'Edit Attendance' : 'New Attendance Entry'}</h4>
                  <p className="superadmin-package-card-copy">Compact attendance form with validation and backend-ready record fields.</p>
                  <AttendanceForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={routeMode === 'edit' ? submitEdit : submitCreate}
                    submitLabel={routeMode === 'edit' ? 'Update Attendance' : 'Save Attendance'}
                    errors={formErrors}
                    employeeOptions={employeeOptions}
                  />
                  {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {false && tab === 'reports' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">
                {companyAdminAttendanceMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Report Snapshot">
              <div className="superadmin-list">
                {companyAdminAttendanceHighlights.map((item) => (
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
                {['Monthly', 'Quarterly', 'Yearly'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    className={`superadmin-package-report-pill ${activeAction === period ? 'active' : ''}`}
                    onClick={() => setActiveAction(period)}
                  >
                    <Icon name="chart-line" size={14} /> {period}
                  </button>
                ))}
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Present</strong><span>{statusCounts.Present || 0}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Late</strong><span>{statusCounts.Late || 0}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Regularized</strong><span>{statusCounts.Regularized || 0}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {bulkDeleteOpen ? (
        <Modal
          title="Delete Selected Attendance"
          onClose={() => setBulkDeleteOpen(false)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setBulkDeleteOpen(false)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmBulkDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">
            This will remove {selectedIds.length} selected attendance record{selectedIds.length === 1 ? '' : 's'} from the frontend list.
          </p>
        </Modal>
      ) : null}

      {deleteRecord ? (
        <Modal
          title="Delete Attendance"
          onClose={() => setDeleteId(null)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">This will remove the attendance entry from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}

