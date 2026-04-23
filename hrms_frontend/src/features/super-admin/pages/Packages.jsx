import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import Icon from '../../../components/Icon';
import DashboardShell from '../../shared/components/DashboardShell';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '../styles/packages.css';
import {
  superAdminPackageList,
} from '../data/packagesData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'packages', label: 'Package List' },
  { key: 'create', label: 'Create Package' },
];

const tabToHash = {
  overview: '#overview',
  packages: '#list',
  create: '#create',
};
const hashToTab = {
  '#overview': 'overview',
  '#list': 'packages',
  '#create': 'create',
};

ModuleRegistry.registerModules([AllCommunityModule]);

const packageTextFilterParams = {
  defaultOption: 'contains',
  maxNumConditions: 1,
  suppressAndOrCondition: true,
};
const clientLimitOptions = ['0-10', '10-25', '25-50', '50+'];
const clientLimitGuides = [
  { range: '0-10', title: 'Served 50+ Client', note: 'Best for teams serving up to 5 clients.' },
  { range: '10-25', title: 'Served 20+ client', note: 'Works well when you expect 6 to 15 clients.' },
  { range: '25-50', title: 'Served 30+ client', note: 'Comfortable for 16 to 30 clients.' },
  { range: '50+', title: 'Served 15+ client', note: 'Use this for larger client portfolios.' },
];

function SmallCard({ title, children, className = '' }) {
  return (
    <section className={`dashboard-card mini-list-card superadmin-package-mini-card ${className}`.trim()}>
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

function PackageGridEmptyOverlay() {
  return (
    <div className="superadmin-grid-empty">
      <strong>No packages found</strong>
      <span>Try a different search term or adjust the filters.</span>
    </div>
  );
}

function PackageGridHeader(props) {
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

function PackageNameCell({ data }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-name-cell">
      <strong>{data.name}</strong>
      <div className="superadmin-grid-name-meta">
        <span>{data.billing}</span>
      </div>
    </div>
  );
}

function PackageStatusCell({ value }) {
  const tone = String(value).toLowerCase() === 'active'
    ? 'tone-active'
    : String(value).toLowerCase() === 'trial'
      ? 'tone-draft'
      : 'tone-custom';

  return <span className={`role-status-chip ${tone}`}>{value}</span>;
}

function PackageActionsCell({ data, onDelete }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-actions">
      <Link to={{ hash: '#create', search: `?mode=view&id=${encodeURIComponent(data.id)}` }} className="superadmin-grid-icon-button view" aria-label="View package">
        <Icon name="eye" size={14} />
      </Link>
      <Link to={{ hash: '#create', search: `?mode=edit&id=${encodeURIComponent(data.id)}` }} className="superadmin-grid-icon-button edit" aria-label="Edit package">
        <Icon name="pen-to-square" size={14} />
      </Link>
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete(data)} aria-label="Delete package">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="superadmin-package-modal-backdrop" onClick={onClose} role="presentation">
      <div className="superadmin-package-modal" onClick={(e) => e.stopPropagation()} role="presentation">
        <div className="superadmin-package-modal-header">
          <div>
            <div className="superadmin-package-modal-kicker">Super Admin</div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="superadmin-package-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="superadmin-package-modal-body">{children}</div>
        {footer ? <div className="superadmin-package-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function PackageForm({ formData, setFormData, onSubmit, submitLabel, errors = {}, readOnly = false, onCancel }) {
  return (
    <form className="superadmin-package-form-grid" onSubmit={onSubmit}>
      <div className="superadmin-package-form-row superadmin-package-form-row-four">
        <label className="superadmin-package-form-field">
          <span>Package Name</span>
          <input readOnly={readOnly} disabled={readOnly} value={formData.name} onChange={(e) => setFormData((c) => ({ ...c, name: e.target.value }))} />
          {errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}
        </label>
        <label className="superadmin-package-form-field">
          <span>Billing Type</span>
          <select disabled={readOnly} value={formData.billing} onChange={(e) => setFormData((c) => ({ ...c, billing: e.target.value }))}>
            {['Monthly', 'Quarterly', 'Yearly'].map((item) => <option key={item}>{item}</option>)}
          </select>
          {errors.billing ? <small className="superadmin-package-error">{errors.billing}</small> : null}
        </label>
        <label className="superadmin-package-form-field">
          <span>Price</span>
          <input readOnly={readOnly} disabled={readOnly} value={formData.price} onChange={(e) => setFormData((c) => ({ ...c, price: e.target.value }))} />
          {errors.price ? <small className="superadmin-package-error">{errors.price}</small> : null}
        </label>
        <label className="superadmin-package-form-field">
          <span>Client Limit</span>
          <select disabled={readOnly} value={formData.clients} onChange={(e) => setFormData((c) => ({ ...c, clients: e.target.value }))}>
            <option value="">Select limit</option>
            {clientLimitOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          {errors.clients ? <small className="superadmin-package-error">{errors.clients}</small> : null}
        </label>
      </div>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select disabled={readOnly} value={formData.status} onChange={(e) => setFormData((c) => ({ ...c, status: e.target.value }))}>
          {['Active', 'Trial', 'Custom'].map((item) => <option key={item}>{item}</option>)}
        </select>
        {errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}
      </label>
      <div className="superadmin-package-form-actions">
        {readOnly ? (
          <Link to={tabToHash.packages} className="superadmin-package-modal-button secondary">Back to List</Link>
        ) : (
          <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
        )}
      </div>
    </form>
  );
}

export default function SuperAdminPackages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [packages, setPackages] = useState(superAdminPackageList);
  const [selectedId, setSelectedId] = useState(superAdminPackageList[0]?.id ?? null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ name: '', billing: 'Monthly', price: '', clients: '0-10', status: 'Active' });
  const [formErrors, setFormErrors] = useState({});

  const selected = useMemo(() => packages.find((item) => item.id === selectedId) ?? packages[0] ?? null, [packages, selectedId]);
  const hasSelectedRows = selectedIds.length > 0;
  const recentPackages = useMemo(() => packages.slice(0, 4), [packages]);
  const viewItem = useMemo(() => packages.find((item) => item.id === viewId) ?? null, [packages, viewId]);
  const editItem = useMemo(() => packages.find((item) => item.id === editId) ?? null, [packages, editId]);
  const deleteItem = useMemo(() => packages.find((item) => item.id === deleteId) ?? null, [packages, deleteId]);
  const sidebarActiveKey = tab === 'overview' ? 'super-admin-packages-overview' : tab === 'packages' ? 'super-admin-packages-list' : 'super-admin-packages-create';

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
        billing: viewItem.billing,
        price: viewItem.price,
        clients: viewItem.clients || '0-10',
        status: viewItem.status,
      });
      setFormErrors({});
    } else if (editItem) {
      setFormData({
        name: editItem.name,
        billing: editItem.billing,
        price: editItem.price,
        clients: editItem.clients || '0-10',
        status: editItem.status,
      });
      setFormErrors({});
    } else {
      setFormData({ name: '', billing: 'Monthly', price: '', clients: '0-10', status: 'Active' });
    }
  }, [editItem, viewItem]);

  const filtered = useMemo(() => packages.filter((item) => {
    const haystack = `${item.name} ${item.billing} ${item.price} ${item.clients} ${item.status}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  }), [packages, searchTerm]);

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
      field: 'name',
      headerName: 'Package',
      minWidth: 220,
      flex: 1.1,
      filter: 'agTextColumnFilter',
      filterParams: packageTextFilterParams,
      cellRenderer: PackageNameCell,
      headerComponent: PackageGridHeader,
      headerComponentParams: { headerIcon: 'clipboard', enableFilterButton: true },
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 160,
      filter: 'agTextColumnFilter',
      filterParams: packageTextFilterParams,
      cellClass: 'superadmin-grid-code',
      headerComponent: PackageGridHeader,
      headerComponentParams: { headerIcon: 'file-lines', enableFilterButton: true },
    },
    {
      field: 'clients',
      headerName: 'Clients',
      width: 120,
      filter: 'agTextColumnFilter',
      filterParams: packageTextFilterParams,
      cellClass: 'superadmin-grid-code',
      headerComponent: PackageGridHeader,
      headerComponentParams: { headerIcon: 'users', enableFilterButton: true },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: packageTextFilterParams,
      cellRenderer: PackageStatusCell,
      headerComponent: PackageGridHeader,
      headerComponentParams: { headerIcon: 'circle-check', enableFilterButton: true },
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
      headerComponent: PackageGridHeader,
      headerComponentParams: { headerIcon: 'ellipsis-vertical', showMenu: false, enableFilterButton: true },
      cellRenderer: PackageActionsCell,
      cellRendererParams: {
        onDelete: (item) => setDeleteId(item.id),
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

  const startCreate = () => {
    setEditId(null);
    setViewId(null);
    setFormData({ name: '', billing: 'Monthly', price: '', clients: '0-10', status: 'Active' });
    setFormErrors({});
    switchTab('create');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Package name is required.';
    if (!formData.billing.trim()) errors.billing = 'Billing type is required.';
    if (!formData.price.trim()) errors.price = 'Price is required.';
    if (!formData.clients.trim()) errors.clients = 'Client limit is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const newItem = { id: `p-${String(Date.now()).slice(-5)}`, ...formData };
    setPackages((current) => [newItem, ...current]);
    setSelectedId(newItem.id);
    setTab('packages');
    setFormData({ name: '', billing: 'Monthly', price: '', clients: '0-10', status: 'Active' });
    setFormErrors({});
    setViewId(null);
    navigate('#list', { replace: true });
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setPackages((current) => current.map((item) => (item.id === editId ? { ...item, ...formData } : item)));
    setSelectedId(editId);
    setEditId(null);
    setFormErrors({});
    setTab('packages');
    setViewId(null);
    navigate('#list', { replace: true });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setPackages((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setSelectedIds((current) => current.filter((id) => id !== deleteId));
    setDeleteId(null);
  };

  const handleSelectionChanged = (event) => {
    const nextSelectedRows = event.api.getSelectedRows();
    setSelectedIds(nextSelectedRows.map((item) => item.id));
    setSelectedId(nextSelectedRows[0]?.id || null);
  };

  const handleBulkDelete = () => {
    const targetId = selectedIds[0] || selectedId;
    if (!targetId) return;
    setDeleteId(targetId);
  };

  return (
    <DashboardShell activeKey={sidebarActiveKey} headerProps={{ companyText: 'Super Admin' }}>
      <div className="superadmin-package-tabs">
        {tabs.map((item) => (
          <Link
            key={item.key}
            to={tabToHash[item.key] || '#overview'}
            replace
            className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">
          {tab === 'overview' ? 'Overview' : tab === 'packages' ? 'Package Directory' : 'Create Package'}
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <SmallCard title="Client Limit Guide">
              <div className="superadmin-package-limit-guide">
                {clientLimitGuides.map((item) => (
                  <div key={item.range} className="superadmin-package-limit-item">
                    <div className="superadmin-package-limit-top">
                      <strong>{item.range}</strong>
                      <span>{item.title}</span>
                    </div>
                    <p>{item.note}</p>
                  </div>
                ))}
              </div>
            </SmallCard>

            <SmallCard title="Selected Package">
              {selected ? (
                <div className="superadmin-package-detail superadmin-package-detail-compact">
                  <div><span>Plan</span><strong>{selected.name}</strong></div>
                  <div><span>Billing</span><strong>{selected.billing}</strong></div>
                  <div><span>Client Limit</span><strong>{selected.clients}</strong></div>
                  <div><span>Status</span><strong>{selected.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Select a package to see a compact summary.</div>}
            </SmallCard>

          </div>

          <div className="dashboard-right-col">
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-insight">
                <strong>
                  {selected?.clients
                    ? `${selected.clients} package is ideal ${selected.clients === '0-10' ? 'for up to 5 clients.' : selected.clients === '10-25' ? 'for 6 to 15 clients.' : selected.clients === '25-50' ? 'for 16 to 30 clients.' : 'for larger client portfolios.'}`
                    : 'Pick a package to see a short usage note.'}
                </strong>
                <span>A minimal overview works best when it highlights only the plan, billing, and client capacity.</span>
                <div className="superadmin-package-overview-actions">
                  <button type="button" className="superadmin-package-action" onClick={() => switchTab('packages')}>
                    <strong>Open List</strong>
                    <span>Review all pricing plans.</span>
                  </button>
                  <button type="button" className="superadmin-package-action" onClick={startCreate}>
                    <strong>Create Plan</strong>
                    <span>Add a new package entry.</span>
                  </button>
                </div>
              </div>
            </SmallCard>

            <SmallCard title="Overview Stats">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Total Packages</span><strong>{packages.length}</strong></div>
                <div className="superadmin-list-item"><span>Active Plans</span><strong>{packages.filter((item) => item.status === 'Active').length}</strong></div>
                <div className="superadmin-list-item"><span>Client Tiers</span><strong>{clientLimitGuides.length}</strong></div>
              </div>
            </SmallCard>

            <SmallCard title="Recent Packages">
              <div className="superadmin-list">
                {recentPackages.map((item) => (
                  <div key={item.id} className="superadmin-list-item">
                    <span>{item.name}</span>
                    <strong>{item.status} · {item.clients}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'packages' ? (
        <div className="dashboard-layout superadmin-package-layout">
          <div className="dashboard-right-col superadmin-package-workspace superadmin-package-full">
            <div className="superadmin-package-table-card superadmin-master-grid-card">
              <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
                <div className="superadmin-master-searchbar-left">
                  <div className="superadmin-package-search superadmin-master-search">
                    <Icon name="search" size={14} />
                    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search package, billing, price" />
                  </div>
                </div>
                <div className="superadmin-master-searchbar-right">
                  <button type="button" className="superadmin-master-action-button tone-primary" onClick={startCreate}>
                    <Icon name="sparkles" size={14} />
                    <span>Add Package</span>
                  </button>
                  <button
                    type="button"
                    className="superadmin-master-action-button tone-danger icon-only"
                    onClick={handleBulkDelete}
                    disabled={!hasSelectedRows}
                    aria-label="Delete selected packages"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
              <div className="superadmin-master-grid superadmin-package-grid">
                <AgGridReact
                  rowData={filtered}
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
                  rowHeight={56}
                  noRowsOverlayComponent={PackageGridEmptyOverlay}
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
        <div className="dashboard-layout superadmin-package-layout">
          <div className="dashboard-right-col superadmin-package-workspace superadmin-package-full">
            <div className="superadmin-package-form-card">
              <h4>{viewId ? 'View Package' : editId ? 'Edit Package' : 'New Package Entry'}</h4>
              <p className="superadmin-package-card-copy">Compact pricing plan form with local validation and backend-ready fields.</p>
              <PackageForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={viewId ? (event) => event.preventDefault() : editId ? submitEdit : submitCreate}
                submitLabel={editId ? 'Update Package' : 'Create Package'}
                errors={formErrors}
                readOnly={Boolean(viewId)}
                onCancel={() => {
                  switchTab('packages');
                }}
              />
              {!viewId && Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {deleteItem ? (
        <Modal title="Delete Package" onClose={() => setDeleteId(null)} footer={<><button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button><button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button></>}>
          <p className="superadmin-package-delete-copy">This will remove the package from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}
