import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import CompanyAdminGridHeader from '../components/CompanyAdminGridHeader';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '../../super-admin/styles/packages.css';
import {
  companyAdminHolidayHighlights,
  companyAdminHolidayList,
  companyAdminHolidayLocations,
  companyAdminHolidayMetrics,
  companyAdminHolidayQuickActions,
  companyAdminHolidayStatuses,
  companyAdminHolidayTypes,
} from '../data/holidayData';

ModuleRegistry.registerModules([AllCommunityModule]);

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'holidays', label: 'Holiday List' },
  { key: 'create', label: 'Create Holiday' },
];

const tabToHash = {
  overview: '#overview',
  calendar: '#calendar',
  holidays: '#holidays',
  create: '#create',
};

const hashToTab = {
  '#overview': 'overview',
  '#calendar': 'calendar',
  '#holidays': 'holidays',
  '#create': 'create',
};

const sidebarActiveKeyMap = {
  overview: 'company-admin-holiday-overview',
  calendar: 'company-admin-holiday-calendar',
  holidays: 'company-admin-holiday-list',
  create: 'company-admin-holiday-create',
};

const filters = ['All', ...companyAdminHolidayStatuses.slice(1)];
const emptyForm = {
  name: '',
  date: '',
  type: 'Company',
  location: 'Pan India',
  status: 'Draft',
  note: '',
};
const storageKey = 'company_admin_holidays';
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

function HolidayGridEmptyOverlay({ title, subtitle }) {
  return (
    <div className="superadmin-grid-empty">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function HolidayNameCell({ data }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-name-cell">
      <strong>{data.name}</strong>
      <div className="superadmin-grid-name-meta">
        <span>{data.date}</span>
      </div>
    </div>
  );
}

function HolidayStatusCell({ value }) {
  return <span className={`role-status-chip tone-${String(value).toLowerCase()}`}>{value}</span>;
}

function HolidayActionsCell({ data, onView, onEdit, onDelete }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-actions">
      <Link
        to={onView?.(data)}
        replace
        className="superadmin-grid-icon-button view"
        aria-label="View holiday"
      >
        <Icon name="eye" size={14} />
      </Link>
      <Link
        to={onEdit?.(data)}
        replace
        className="superadmin-grid-icon-button edit"
        aria-label="Edit holiday"
      >
        <Icon name="pen-to-square" size={14} />
      </Link>
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete?.(data)} aria-label="Delete holiday">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

function HolidayForm({ formData, setFormData, onSubmit, submitLabel, errors = {}, readOnly = false }) {
  return (
    <form
      className="superadmin-package-form-grid"
      onSubmit={onSubmit}
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
    >
      <label className="superadmin-package-form-field">
        <span>Holiday Name</span>
        <input readOnly={readOnly} disabled={readOnly} value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} placeholder="Enter holiday name" />
        {errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Date</span>
        <input readOnly={readOnly} disabled={readOnly} type="date" value={formData.date} onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))} />
        {errors.date ? <small className="superadmin-package-error">{errors.date}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Type</span>
        <select disabled={readOnly} value={formData.type} onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value }))}>
          {companyAdminHolidayTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Location</span>
        <select disabled={readOnly} value={formData.location} onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}>
          {companyAdminHolidayLocations.slice(1).map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select disabled={readOnly} value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
          {companyAdminHolidayStatuses.slice(1).map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field superadmin-project-wide-field">
        <span>Note</span>
        <textarea readOnly={readOnly} disabled={readOnly} value={formData.note} onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))} placeholder="Add a short note" />
        {errors.note ? <small className="superadmin-package-error">{errors.note}</small> : null}
      </label>
      <div className="superadmin-package-form-actions">
        {readOnly ? (
          <Link to={{ pathname: location.pathname, search: '', hash: tabToHash.holidays }} replace className="superadmin-package-modal-button secondary">
            Back to List
          </Link>
        ) : (
          <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
        )}
      </div>
    </form>
  );
}

function saveHolidays(records) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }
}

function loadHolidays() {
  if (typeof window === 'undefined') return companyAdminHolidayList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return companyAdminHolidayList;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : companyAdminHolidayList;
  } catch {
    return companyAdminHolidayList;
  }
}

function buildCalendar(days, records) {
  const dayMap = new Map();
  records.forEach((item) => {
    const date = new Date(item.date);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key).push(item);
  });

  return days.map((day) => {
    if (!day) return null;
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    return { day, items: dayMap.get(key) || [] };
  });
}

function getCurrentMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startIndex = firstDay.getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startIndex; i += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CompanyAdminHolidayList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAction, setActiveAction] = useState(companyAdminHolidayQuickActions[0].label);
  const [holidays, setHolidays] = useState(() => loadHolidays());
  const [selectedId, setSelectedId] = useState(loadHolidays()[0]?.id ?? null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [monthOffset, setMonthOffset] = useState(0);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const routeMode = searchParams.get('mode');
  const routeId = searchParams.get('id');

  useEffect(() => saveHolidays(holidays), [holidays]);

  useEffect(() => {
    if (!holidays.some((item) => item.id === selectedId)) {
      setSelectedId(holidays[0]?.id ?? null);
    }
  }, [holidays, selectedId]);

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

  const selected = useMemo(() => holidays.find((item) => item.id === selectedId) ?? holidays[0] ?? null, [holidays, selectedId]);
  const routeHoliday = useMemo(() => holidays.find((item) => item.id === routeId) ?? null, [holidays, routeId]);
  const viewHoliday = routeMode === 'view' ? routeHoliday : null;
  const editHoliday = routeMode === 'edit' ? routeHoliday : null;
  const deleteHoliday = useMemo(() => holidays.find((item) => item.id === deleteId) ?? null, [holidays, deleteId]);
  const today = useMemo(() => new Date(), []);
  const defaultGridColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);
  const holidayGridColumns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Holiday',
      minWidth: 220,
      flex: 1.1,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
      cellRenderer: HolidayNameCell,
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'clipboard' },
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'briefcase' },
    },
    {
      field: 'note',
      headerName: 'Note',
      minWidth: 220,
      flex: 1,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'file-lines' },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: HolidayStatusCell,
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
      cellRenderer: HolidayActionsCell,
      cellRendererParams: {
        onView: (holiday) => ({ pathname: location.pathname, search: `?mode=view&id=${encodeURIComponent(holiday.id)}`, hash: tabToHash.create }),
        onEdit: (holiday) => ({ pathname: location.pathname, search: `?mode=edit&id=${encodeURIComponent(holiday.id)}`, hash: tabToHash.create }),
        onDelete: (holiday) => setDeleteId(holiday.id),
      },
    },
  ], [location.pathname]);

  useEffect(() => {
    if (editHoliday) {
      setFormData({
        name: editHoliday.name,
        date: editHoliday.date,
        type: editHoliday.type,
        location: editHoliday.location,
        status: editHoliday.status,
        note: editHoliday.note,
      });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editHoliday]);

  useEffect(() => {
    if ((routeMode === 'view' || routeMode === 'edit') && routeHoliday && tab !== 'create') {
      setTab('create');
      navigate({ pathname: location.pathname, search: location.search, hash: tabToHash.create }, { replace: true });
    }
  }, [location.pathname, location.search, navigate, routeHoliday, routeMode, tab]);

  useEffect(() => {
    if (routeMode === 'view' && routeHoliday) {
      setSelectedId(routeHoliday.id);
    }
  }, [routeHoliday, routeMode]);

  const filteredHolidays = useMemo(
    () =>
      holidays.filter((item) => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const haystack = `${item.name} ${item.date} ${item.type} ${item.location} ${item.status} ${item.note}`.toLowerCase();
        return matchesStatus && haystack.includes(searchTerm.toLowerCase());
      }),
    [holidays, searchTerm, statusFilter],
  );

  const monthDate = useMemo(() => {
    const base = new Date();
    base.setMonth(base.getMonth() + monthOffset);
    return base;
  }, [monthOffset]);

  const calendarDays = useMemo(() => {
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    return buildCalendar(getCurrentMonthDays(monthDate), holidays).map((cell) => {
      if (!cell) return null;
      const key = `${cell.day.getFullYear()}-${cell.day.getMonth()}-${cell.day.getDate()}`;
      return { ...cell, isToday: key === todayKey };
    });
  }, [holidays, monthDate, today]);

  const monthLabel = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const startCreate = () => {
    setFormErrors({});
    setFormData(emptyForm);
    setTab('create');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.create }, { replace: true });
  };

  const goToHolidayList = () => {
    setTab('holidays');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.holidays }, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Holiday name is required.';
    if (!formData.date.trim()) errors.date = 'Date is required.';
    if (!formData.note.trim()) errors.note = 'Note is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const next = { id: `h-${String(Date.now()).slice(-5)}`, ...formData };
    setHolidays((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    goToHolidayList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!routeId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setHolidays((current) => current.map((item) => (item.id === routeId ? { ...item, ...formData } : item)));
    setSelectedId(routeId);
    setFormErrors({});
    goToHolidayList();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setHolidays((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  const confirmBulkDelete = () => {
    if (!selectedIds.length) return;
    setHolidays((current) => current.filter((item) => !selectedIds.includes(item.id)));
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
          {tab === 'overview' ? 'Overview' : tab === 'calendar' ? 'Holiday Calendar' : tab === 'holidays' ? 'Holiday Directory' : 'Create Holiday'}
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">            <SmallCard title="Holiday Summary">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Total Holidays</span><strong>{holidays.length}</strong></div>
                <div className="superadmin-list-item"><span>Active</span><strong>{holidays.filter((item) => item.status === 'Active').length}</strong></div>
                <div className="superadmin-list-item"><span>Next Holiday</span><strong>{companyAdminHolidayHighlights[0].value}</strong></div>
              </div>
            </SmallCard></div>

          <div className="dashboard-right-col">
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-insight">
                <strong>Manage upcoming holidays and the calendar.</strong>
                <span>Keep the overview focused on published dates and the next update.</span>
                <div className="superadmin-package-overview-actions">
                  <button type="button" className="superadmin-package-action" onClick={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.holidays }, { replace: true })}>
                    <strong>Open List</strong>
                    <span>Review all holidays.</span>
                  </button>
                  <button type="button" className="superadmin-package-action" onClick={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.calendar }, { replace: true })}>
                    <strong>Open Calendar</strong>
                    <span>View the month grid.</span>
                  </button>
                </div>
              </div>
            </SmallCard>
</div>
        </div>
      ) : null}

      {tab === 'calendar' ? (
        <div className="superadmin-package-layout company-admin-calendar-layout">
          <div className="superadmin-package-workspace superadmin-package-full">
            <SmallCard title="Calendar">
              <div className="superadmin-calendar-toolbar">
                <button type="button" className="superadmin-package-secondary" onClick={() => setMonthOffset((current) => current - 1)}>Prev</button>
                <strong>{monthLabel}</strong>
                <button type="button" className="superadmin-package-secondary" onClick={() => setMonthOffset((current) => current + 1)}>Next</button>
              </div>
              <div className="superadmin-calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="superadmin-calendar-head">{day}</div>)}
                {calendarDays.map((cell, index) => (
                  <div key={index} className={`superadmin-calendar-cell ${cell ? 'filled' : 'empty'} ${cell?.isToday ? 'today' : ''}`}>
                    {cell ? (
                      <>
                        <div className="superadmin-calendar-date">{cell.day.getDate()}</div>
                        <div className="superadmin-calendar-items">
                          {cell.items.slice(0, 2).map((item) => (
                            <button key={item.id} type="button" className="superadmin-calendar-item" onClick={() => setSelectedId(item.id)}>
                              {item.name}
                            </button>
                          ))}
                          {cell.items.length > 2 ? <span className="superadmin-calendar-more">+{cell.items.length - 2} more</span> : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'holidays' ? (
        <div className="superadmin-package-layout company-admin-list-page">
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-table-card superadmin-master-grid-card">
              <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
                <div className="superadmin-master-searchbar-left">
                  <div className="superadmin-package-search superadmin-master-search">
                    <Icon name="search" size={14} />
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search holiday, type, note, location" />
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
                    <span>Add Holiday</span>
                  </Link>
                  <button
                    type="button"
                    className="superadmin-master-action-button tone-danger icon-only"
                    onClick={() => setBulkDeleteOpen(true)}
                    disabled={!selectedIds.length}
                    aria-label="Delete selected holidays"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
              <div className="superadmin-master-grid">
                <AgGridReact
                  theme="legacy"
                  rowData={filteredHolidays}
                  columnDefs={holidayGridColumns}
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
                  noRowsOverlayComponent={HolidayGridEmptyOverlay}
                  noRowsOverlayComponentParams={{
                    title: 'No holidays found',
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

      {tab === 'create' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-workspace superadmin-package-full">
            <div className="superadmin-package-form-card superadmin-package-full">
              {routeMode === 'view' ? (
                viewHoliday ? (
                  <>
                    <h4>View Holiday</h4>
                    <p className="superadmin-package-card-copy">Holiday details without a popup screen.</p>
                    <HolidayForm
                      formData={viewHoliday}
                      setFormData={() => {}}
                      onSubmit={(event) => event.preventDefault()}
                      submitLabel="Back to List"
                      readOnly
                    />
                  </>
                ) : (
                  <>
                    <h4>View Holiday</h4>
                    <p className="superadmin-package-card-copy">Holiday details without a popup screen.</p>
                    <div className="superadmin-empty-state">No holiday selected.</div>
                    <div className="superadmin-package-form-actions">
                      <Link to={{ pathname: location.pathname, search: '', hash: tabToHash.holidays }} replace className="superadmin-package-modal-button secondary">
                        Back to List
                      </Link>
                    </div>
                  </>
                )
              ) : (
                <>
                  <h4>{routeMode === 'edit' ? 'Edit Holiday' : 'New Holiday Entry'}</h4>
                  <p className="superadmin-package-card-copy">Compact holiday form with validation and calendar-ready date fields.</p>
                  <HolidayForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={routeMode === 'edit' ? submitEdit : submitCreate}
                    submitLabel={routeMode === 'edit' ? 'Update Holiday' : 'Create Holiday'}
                    errors={formErrors}
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
                {companyAdminHolidayMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Report Snapshot">
              <div className="superadmin-list">
                {companyAdminHolidayHighlights.map((item) => (
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
                  <button key={period} type="button" className={`superadmin-package-report-pill ${activeAction === period ? 'active' : ''}`} onClick={() => setActiveAction(period)}>
                    <Icon name="chart-line" size={14} /> {period}
                  </button>
                ))}
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Active Holidays</strong><span>{holidays.filter((item) => item.status === 'Active').length}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Draft Holidays</strong><span>{holidays.filter((item) => item.status === 'Draft').length}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Locations</strong><span>{new Set(holidays.map((item) => item.location)).size}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {bulkDeleteOpen ? (
        <Modal
          title="Delete Selected Holidays"
          onClose={() => setBulkDeleteOpen(false)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setBulkDeleteOpen(false)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmBulkDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">
            This will remove {selectedIds.length} selected holiday{selectedIds.length === 1 ? '' : 's'} from the frontend list.
          </p>
        </Modal>
      ) : null}

      {deleteHoliday ? (
        <Modal
          title="Delete Holiday"
          onClose={() => setDeleteId(null)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">This will remove the holiday from the frontend calendar and list. Backend wiring can come later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}
