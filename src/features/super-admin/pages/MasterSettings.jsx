import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '../styles/packages.css';
import {
  superAdminMasterHighlights,
  superAdminMasterList,
  superAdminMasterMetrics,
  superAdminMasterQuickActions,
  superAdminMasterStatusOptions,
  superAdminMasterTypes,
} from '../data/masterSettingsData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'masters', label: 'Master List' },
  { key: 'create', label: 'Create Master' },
];

const filters = ['All', ...superAdminMasterTypes];
const statusFilters = ['All', ...superAdminMasterStatusOptions];
const emptyForm = { name: '', parentId: '', note: '', status: 'Active' };
const storageKey = 'superadmin_master_settings';
const masterTextFilterParams = {
  defaultOption: 'equals',
  maxNumConditions: 1,
  suppressAndOrCondition: true,
};
const tabToHash = {
  overview: '#overview',
  masters: '#list',
  create: '#create',
};
const hashToTab = {
  '#overview': 'overview',
  '#list': 'masters',
  '#create': 'create',
};

ModuleRegistry.registerModules([AllCommunityModule]);

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
            <div className="superadmin-package-modal-kicker">Super Admin</div>
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

function MasterGridEmptyOverlay() {
  return (
    <div className="superadmin-grid-empty">
      <strong>No masters found</strong>
      <span>Try a different search term or reset the filters.</span>
    </div>
  );
}

function MasterGridHeader(props) {
  const { displayName, showFilter, enableFilterButton, headerIcon = 'list', column, showMenu = true, progressSort } = props;
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

function MasterNameCell({ data }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-name-cell">
      <strong>{data.name}</strong>
    </div>
  );
}

function MasterTypeCell({ value }) {
  return <span className="superadmin-grid-type-pill">{value}</span>;
}

function MasterStatusCell({ value }) {
  const tone = String(value).toLowerCase() === 'active'
    ? 'tone-active'
    : String(value).toLowerCase() === 'inactive'
      ? 'tone-inactive'
      : 'tone-draft';

  return <span className={`role-status-chip ${tone}`}>{value}</span>;
}

function MasterActionsCell({ data, onDelete }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-actions">
      <Link to={{ hash: '#create', search: `?mode=view&id=${encodeURIComponent(data.id)}` }} className="superadmin-grid-icon-button view" aria-label="View master">
        <Icon name="eye" size={14} />
      </Link>
      <Link to={{ hash: '#create', search: `?mode=edit&id=${encodeURIComponent(data.id)}` }} className="superadmin-grid-icon-button edit" aria-label="Edit master">
        <Icon name="pen-to-square" size={14} />
      </Link>
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete(data)} aria-label="Delete master">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

function MasterForm({
  formData,
  setFormData,
  onSubmit,
  submitLabel,
  errors = {},
  parentOptions = [],
  readOnly = false,
  onCancel,
  showProfileUpload = true,
}) {
  return (
    <form className="superadmin-package-form-grid" onSubmit={onSubmit}>
      {showProfileUpload ? (
        <div className="superadmin-package-profile-section">
          <div className="superadmin-package-profile-box">
            <div className="superadmin-package-profile-image">
              <img src="/api/placeholder/120/120" alt="Profile" />
            </div>
            <div className="superadmin-package-profile-actions">
              <button type="button" className="superadmin-package-profile-btn">
                <span>Upload Image</span>
              </button>
              <button type="button" className="superadmin-package-profile-btn secondary">
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="superadmin-package-form-row">
        <label className="superadmin-package-form-field">
          <span>Name</span>
          <input readOnly={readOnly} disabled={readOnly} value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} placeholder="Enter master name" />
          {errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}
        </label>
        <label className="superadmin-package-form-field">
          <span>Parent Id</span>
          <select disabled={readOnly} value={formData.parentId} onChange={(event) => setFormData((current) => ({ ...current, parentId: event.target.value }))}>
            <option value="">No Parent</option>
            {parentOptions.map((item) => (
              <option key={item.id} value={item.id}>{item.id} - {item.name}</option>
            ))}
          </select>
          {errors.parentId ? <small className="superadmin-package-error">{errors.parentId}</small> : null}
        </label>
        <label className="superadmin-package-form-field">
          <span>Note</span>
          <input readOnly={readOnly} disabled={readOnly} value={formData.note} onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))} placeholder="Optional note" />
        </label>
        <label className="superadmin-package-form-field">
          <span>Status</span>
          <select disabled={readOnly} value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
            {superAdminMasterStatusOptions.map((item) => <option key={item}>{item}</option>)}
          </select>
          {errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}
        </label>
      </div>
      <div className="superadmin-package-form-actions">
        {readOnly ? (
          <Link to={tabToHash.masters} className="superadmin-package-modal-button secondary">Back to List</Link>
        ) : (
          <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
        )}
      </div>
    </form>
  );
}

function saveMasters(records) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }
}

function loadMasters() {
  if (typeof window === 'undefined') return superAdminMasterList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return superAdminMasterList;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : superAdminMasterList;
  } catch {
    return superAdminMasterList;
  }
}

export default function SuperAdminMasterSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('masters');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewTemplate, setViewTemplate] = useState('default');
  const [masters, setMasters] = useState(() => loadMasters());
  const [selectedId, setSelectedId] = useState(() => loadMasters()[0]?.id ?? null);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => saveMasters(masters), [masters]);

  useEffect(() => {
    if (!masters.some((item) => item.id === selectedId)) {
      setSelectedId(masters[0]?.id ?? null);
    }
  }, [masters, selectedId]);

  const selected = useMemo(() => masters.find((item) => item.id === selectedId) ?? masters[0] ?? null, [masters, selectedId]);
  const viewItem = useMemo(() => masters.find((item) => item.id === viewId) ?? null, [masters, viewId]);
  const editItem = useMemo(() => masters.find((item) => item.id === editId) ?? null, [masters, editId]);
  const deleteItem = useMemo(() => masters.find((item) => item.id === deleteId) ?? null, [masters, deleteId]);
  const sidebarActiveKey = tab === 'overview' ? 'super-admin-master-overview' : tab === 'masters' ? 'super-admin-master-list' : 'super-admin-master-create';

  const switchTab = (nextTab) => {
    if (nextTab !== 'create') {
      setViewId(null);
      setEditId(null);
      setFormErrors({});
    }
    setTab(nextTab);
    navigate(tabToHash[nextTab] || '#overview', { replace: true });
  };

  useEffect(() => {
    const nextTab = hashToTab[location.hash] || 'masters';
    if (tab !== nextTab) {
      setTab(nextTab === 'overview' ? 'masters' : nextTab);
    }
  }, [location.hash, tab]);

  useEffect(() => {
    if (!location.hash) {
      navigate(tabToHash[tab], { replace: true });
    }
  }, [location.hash, navigate, tab]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const id = params.get('id');

    if (tab !== 'create' || !mode || !id) {
      if (!location.search) {
        setViewId(null);
        setEditId(null);
      }
      return;
    }

    if (mode === 'view') {
      setEditId(null);
      setViewId(id);
    } else if (mode === 'edit') {
      setViewId(null);
      setEditId(id);
    }
  }, [location.search, tab]);

  useEffect(() => {
    if (viewItem) {
      setFormData({
        name: viewItem.name,
        parentId: viewItem.parentId || '',
        note: viewItem.note,
        status: viewItem.status,
      });
      setFormErrors({});
    } else if (editItem) {
      setFormData({
        name: editItem.name,
        parentId: editItem.parentId || '',
        note: editItem.note,
        status: editItem.status,
      });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editItem, viewItem]);

  const filteredMasters = useMemo(() => masters.filter((item) => {
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const haystack = `${item.type} ${item.name} ${item.code} ${item.note} ${item.status}`.toLowerCase();
    return matchesType && matchesStatus && haystack.includes(searchTerm.toLowerCase());
  }), [masters, searchTerm, statusFilter, typeFilter]);

  const rowHeight = viewTemplate === 'compact' ? 50 : viewTemplate === 'spacious' ? 64 : 56;

  const clearTableFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setStatusFilter('All');
  };

  const resetTableView = () => {
    clearTableFilters();
    setViewTemplate('default');
    setSelectedIds([]);
  };

  const handleSelectionChange = (event) => {
    const nextSelectedRows = event.api.getSelectedRows();
    const nextSelectedIds = nextSelectedRows.map((item) => item.id);
    setSelectedIds(nextSelectedIds);
    setSelectedId(nextSelectedIds[0] || null);
  };

  const gridColumnDefs = useMemo(() => [
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
      headerCheckboxSelection: true,
      cellClass: 'superadmin-grid-select-cell',
    },
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
      filter: 'agTextColumnFilter',
      filterParams: masterTextFilterParams,
      headerComponent: MasterGridHeader,
      headerComponentParams: { headerIcon: 'list' },
      cellClass: 'superadmin-grid-id',
    },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 180,
      flex: 1.05,
      filter: 'agTextColumnFilter',
      filterParams: masterTextFilterParams,
      headerComponent: MasterGridHeader,
      headerComponentParams: { headerIcon: 'clipboard' },
      cellRenderer: MasterNameCell,
    },
    {
      field: 'code',
      headerName: 'Code',
      width: 160,
      filter: 'agTextColumnFilter',
      filterParams: masterTextFilterParams,
      headerComponent: MasterGridHeader,
      headerComponentParams: { headerIcon: 'file-lines' },
      cellClass: 'superadmin-grid-code',
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      filter: 'agTextColumnFilter',
      filterParams: masterTextFilterParams,
      headerComponent: MasterGridHeader,
      headerComponentParams: { headerIcon: 'users' },
      cellRenderer: MasterTypeCell,
    },
    {
      field: 'note',
      headerName: 'Description',
      minWidth: 220,
      flex: 1.2,
      filter: 'agTextColumnFilter',
      filterParams: masterTextFilterParams,
      headerComponent: MasterGridHeader,
      headerComponentParams: { headerIcon: 'file-lines' },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: masterTextFilterParams,
      headerComponent: MasterGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: MasterStatusCell,
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
      headerComponent: MasterGridHeader,
      headerComponentParams: { headerIcon: 'ellipsis-vertical', showMenu: false },
      cellRenderer: MasterActionsCell,
      cellRendererParams: {
        onDelete: (master) => setDeleteId(master.id),
      },
    },
  ], [navigate]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);

  const typeCounts = useMemo(() => superAdminMasterTypes.reduce((acc, type) => {
    acc[type] = masters.filter((item) => item.type === type).length;
    return acc;
  }, {}), [masters]);

  const startCreate = () => {
    setEditId(null);
    setViewId(null);
    setFormErrors({});
    setFormData(emptyForm);
    switchTab('create');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Master name is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const parent = masters.find((item) => item.id === formData.parentId);
    const next = {
      id: `m-${String(Date.now()).slice(-5)}`,
      type: parent?.type || 'Location',
      code: `M-${String(Date.now()).slice(-5)}`,
      ...formData,
      parentId: formData.parentId || '',
    };
    setMasters((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    setTab('masters');
    navigate('#list', { replace: true });
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const parent = masters.find((item) => item.id === formData.parentId);
    setMasters((current) => current.map((item) => (
      item.id === editId
        ? { ...item, ...formData, type: parent?.type || item.type, code: item.code, parentId: formData.parentId || '' }
        : item
    )));
    setSelectedId(editId);
    setEditId(null);
    setFormErrors({});
    setTab('masters');
    navigate('#list', { replace: true });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setMasters((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <DashboardShell
      activeKey={sidebarActiveKey}
      headerProps={{ companyText: 'Super Admin' }}
      hiddenSidebarSubmenuKeys={['super-admin-master-overview']}
    >
      <div className="superadmin-package-tabs">
        {tabs.filter((item) => item.key !== 'overview').map((item) => (
          <Link
            key={item.key}
            to={tabToHash[item.key] || '#list'}
            replace
            className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'masters' ? 'Master Directory' : 'Create Master'}</div>
      </div>

      {/*
      {tab === 'overview' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">
                {superAdminMasterMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Master Snapshot">
              <div className="superadmin-list">
                {superAdminMasterHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Selected Master">
              {selected ? (
                <div className="superadmin-package-detail">
                  <div><span>Name</span><strong>{selected.name}</strong></div>
                  <div><span>Type</span><strong>{selected.type}</strong></div>
                  <div><span>Code</span><strong>{selected.code}</strong></div>
                  <div><span>Status</span><strong>{selected.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Select a master to preview the details.</div>}
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-overview-row">
              <SmallCard title="Master Types">
                <div className="superadmin-package-cycle-grid">
                  {superAdminMasterTypes.map((type) => (
                    <div key={type} className="superadmin-package-cycle-card">
                      <strong>{typeCounts[type] || 0}</strong>
                      <span>{type}</span>
                    </div>
                  ))}
                </div>
              </SmallCard>
              <SmallCard title="Quick Actions">
                <div className="superadmin-package-action-grid">
                  {superAdminMasterQuickActions.map((action) => (
                    <button key={action.label} type="button" className="superadmin-package-action" onClick={startCreate}>
                      <strong>{action.label}</strong>
                      <span>{action.description}</span>
                    </button>
                  ))}
                </div>
              </SmallCard>
            </div>
            <SmallCard title="Workspace Notes">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Route</span><strong>Master Settings</strong></div>
                <div className="superadmin-list-item"><span>Total Records</span><strong>{masters.length}</strong></div>
                <div className="superadmin-list-item"><span>Current Focus</span><strong>{selected?.type || 'Location'}</strong></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}
      */}

      {tab === 'masters' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-workspace superadmin-package-full">
            <div className="superadmin-package-table-card superadmin-master-grid-card">
              <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
                <div className="superadmin-master-searchbar-left">
                  <div className="superadmin-package-search superadmin-master-search">
                    <Icon name="search" size={14} />
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search..." />
                  </div>
                </div>
              <div className="superadmin-master-searchbar-right">
                  <button type="button" className="superadmin-master-action-button tone-primary" onClick={startCreate}>
                    <Icon name="sparkles" size={14} />
                    <span>Add Master</span>
                  </button>
                  <button
                    type="button"
                    className="superadmin-master-action-button tone-danger icon-only"
                    onClick={() => {
                      const targetId = selectedIds[0] || selectedId;
                      if (!targetId) return;
                      setDeleteId(targetId);
                    }}
                    disabled={selectedIds.length === 0}
                    aria-label="Delete selected masters"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
              <div className="superadmin-master-grid">
                <AgGridReact
                  rowData={filteredMasters}
                  columnDefs={gridColumnDefs}
                  defaultColDef={defaultColDef}
                  domLayout="autoHeight"
                  animateRows
                  getRowId={(params) => params.data.id}
                  rowSelection="multiple"
                  rowMultiSelectWithClick
                  suppressCellFocus
                  pagination
                  paginationPageSize={6}
                  paginationPageSizeSelector={[6, 10, 15]}
                  headerHeight={52}
                  rowHeight={rowHeight}
                  noRowsOverlayComponent={MasterGridEmptyOverlay}
                  onSelectionChanged={handleSelectionChange}
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
            <div className="superadmin-package-form-card">
              <h4>{viewId ? 'View Master' : editId ? 'Edit Master' : 'New Master Entry'}</h4>
              <p className="superadmin-package-card-copy">Compact lookup form with validation and backend-ready master fields.</p>
              <MasterForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={viewId ? (event) => event.preventDefault() : editId ? submitEdit : submitCreate}
                submitLabel={editId ? 'Update Master' : 'Create Master'}
                errors={formErrors}
                parentOptions={masters}
                readOnly={Boolean(viewId)}
                showProfileUpload={Boolean(viewId || editId)}
                onCancel={() => {
                  switchTab('masters');
                }}
              />
              {!viewId && Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {deleteItem ? (
        <Modal title="Delete Master" onClose={() => setDeleteId(null)} footer={<><button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button><button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button></>}>
          <p className="superadmin-package-delete-copy">This will remove the master from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}
