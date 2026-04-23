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
  companyAdminProjectList,
  companyAdminProjectQuickActions,
  companyAdminProjectStatuses,
} from '../data/projectData';

ModuleRegistry.registerModules([AllCommunityModule]);

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'projects', label: 'Project List' },
  { key: 'create', label: 'Create Project' },
];

const tabToHash = {
  overview: '#overview',
  projects: '#projects',
  create: '#create',
};

const hashToTab = {
  '#overview': 'overview',
  '#projects': 'projects',
  '#create': 'create',
};

const sidebarActiveKeyMap = {
  overview: 'company-admin-project-overview',
  projects: 'company-admin-project-list',
  create: 'company-admin-project-create',
};

const filters = ['All', ...companyAdminProjectStatuses.slice(1)];
const emptyForm = {
  name: '',
  code: '',
  client: '',
  startDate: '',
  endDate: '',
  status: 'Draft',
  summary: '',
  details: '',
  budget: '',
  type: 'Client Project',
  owner: 'Company Admin',
  team: 'Core Delivery',
  priority: 'Medium',
  description: '',
};
const storageKey = 'company_admin_projects_v3';
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

function ProjectGridEmptyOverlay({ title, subtitle }) {
  return (
    <div className="superadmin-grid-empty">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function formatDateDisplay(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function ProjectTitleCell({ data }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-name-cell">
      <strong>{data.name}</strong>
    </div>
  );
}

function ProjectStatusCell({ value }) {
  return <span className={`role-status-chip tone-${String(value).toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>;
}

function ProjectActionsCell({ data, onView, onEdit, onDelete }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-actions">
      <Link
        to={onView?.(data)}
        replace
        className="superadmin-grid-icon-button view"
        aria-label="View project"
      >
        <Icon name="eye" size={14} />
      </Link>
      <Link
        to={onEdit?.(data)}
        replace
        className="superadmin-grid-icon-button edit"
        aria-label="Edit project"
      >
        <Icon name="pen-to-square" size={14} />
      </Link>
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete?.(data)} aria-label="Delete project">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

function ProjectForm({ formData, setFormData, onSubmit, submitLabel, errors = {}, readOnly = false, onBack }) {
  return (
    <form
      className="superadmin-package-form-grid"
      onSubmit={onSubmit}
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
    >
      <label className="superadmin-package-form-field">
        <span>Project Title</span>
        <input readOnly={readOnly} disabled={readOnly} value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} placeholder="Enter project title" />
        {errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Client Name</span>
        <input readOnly={readOnly} disabled={readOnly} value={formData.client} onChange={(event) => setFormData((current) => ({ ...current, client: event.target.value }))} placeholder="Enter client name" />
        {errors.client ? <small className="superadmin-package-error">{errors.client}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Client Number</span>
        <input readOnly={readOnly} disabled={readOnly} value={formData.code} onChange={(event) => setFormData((current) => ({ ...current, code: event.target.value }))} placeholder="Enter client number" />
        {errors.code ? <small className="superadmin-package-error">{errors.code}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Project Start Date</span>
        <input readOnly={readOnly} disabled={readOnly} type="date" value={formData.startDate} onChange={(event) => setFormData((current) => ({ ...current, startDate: event.target.value }))} />
        {errors.startDate ? <small className="superadmin-package-error">{errors.startDate}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Project End Date</span>
        <input readOnly={readOnly} disabled={readOnly} type="date" value={formData.endDate} onChange={(event) => setFormData((current) => ({ ...current, endDate: event.target.value }))} />
        {errors.endDate ? <small className="superadmin-package-error">{errors.endDate}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select disabled={readOnly} value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
          {companyAdminProjectStatuses.slice(1).map((item) => <option key={item}>{item}</option>)}
        </select>
        {errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Project Cost</span>
        <input readOnly={readOnly} disabled={readOnly} type="number" min="0" value={formData.budget} onChange={(event) => setFormData((current) => ({ ...current, budget: event.target.value }))} placeholder="Enter project cost" />
        {errors.budget ? <small className="superadmin-package-error">{errors.budget}</small> : null}
      </label>
      <label className="superadmin-package-form-field superadmin-project-wide-field">
        <span>Summery</span>
        <textarea readOnly={readOnly} disabled={readOnly} value={formData.summary} onChange={(event) => setFormData((current) => ({ ...current, summary: event.target.value }))} placeholder="Enter project summary" />
        {errors.summary ? <small className="superadmin-package-error">{errors.summary}</small> : null}
      </label>
      <label className="superadmin-package-form-field superadmin-project-wide-field">
        <span>Details</span>
        <textarea readOnly={readOnly} disabled={readOnly} value={formData.details} onChange={(event) => setFormData((current) => ({ ...current, details: event.target.value }))} placeholder="Enter project details" />
        {errors.details ? <small className="superadmin-package-error">{errors.details}</small> : null}
      </label>
      <div className="superadmin-package-form-actions">
        {readOnly ? (
          <button type="button" className="superadmin-package-modal-button secondary" onClick={onBack}>
            Back to List
          </button>
        ) : (
          <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
        )}
      </div>
    </form>
  );
}

function normalizeProjectRecord(record) {
  return {
    ...record,
    name: record.name ?? '',
    code: record.code ?? '',
    client: record.client ?? '',
    startDate: record.startDate ?? '',
    endDate: record.endDate ?? '',
    status: record.status ?? 'Draft',
    summary: record.summary ?? record.description ?? '',
    details: record.details ?? record.description ?? '',
    budget: record.budget ?? '',
    type: record.type ?? 'Client Project',
    owner: record.owner ?? 'Company Admin',
    team: record.team ?? 'Core Delivery',
    priority: record.priority ?? 'Medium',
    description: record.description ?? record.summary ?? record.details ?? '',
  };
}

const seededProjectTitles = companyAdminProjectList.map((item) => item.name.toLowerCase());

function loadProjects() {
  if (typeof window === 'undefined') return companyAdminProjectList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return companyAdminProjectList;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.length) return companyAdminProjectList.map(normalizeProjectRecord);
    const normalized = parsed.map(normalizeProjectRecord);
    const hasSeedProjects = seededProjectTitles.some((title) => normalized.some((item) => item.name.toLowerCase() === title));
    return hasSeedProjects ? normalized : companyAdminProjectList.map(normalizeProjectRecord);
  } catch {
    return companyAdminProjectList.map(normalizeProjectRecord);
  }
}

function saveProjects(records) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }
}

export default function CompanyAdminProjectManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(companyAdminProjectQuickActions[0].label);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState(() => loadProjects());
  const [selectedId, setSelectedId] = useState(loadProjects()[0]?.id ?? null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const routeMode = searchParams.get('mode');
  const routeId = searchParams.get('id');

  useEffect(() => saveProjects(projects), [projects]);

  useEffect(() => {
    if (!projects.some((item) => item.id === selectedId)) {
      setSelectedId(projects[0]?.id ?? null);
    }
  }, [projects, selectedId]);

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

  const selected = useMemo(() => projects.find((item) => item.id === selectedId) ?? projects[0] ?? null, [projects, selectedId]);
  const routeProject = useMemo(() => projects.find((item) => item.id === routeId) ?? null, [projects, routeId]);
  const viewProject = routeMode === 'view' ? routeProject : null;
  const editProject = routeMode === 'edit' ? routeProject : null;
  const deleteProject = useMemo(() => projects.find((item) => item.id === deleteId) ?? null, [projects, deleteId]);
  const defaultGridColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);
  const projectGridColumns = useMemo(() => [
    {
      headerName: 'Sl No',
      colId: 'slNo',
      width: 100,
      valueGetter: (params) => (params.node ? params.node.rowIndex + 1 : ''),
      filter: false,
      sortable: false,
      resizable: false,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'list' },
    },
    {
      field: 'name',
      headerName: 'Project Title',
      minWidth: 220,
      flex: 1.2,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'briefcase' },
      cellRenderer: ProjectTitleCell,
    },
    {
      field: 'client',
      headerName: 'Client Name',
      minWidth: 170,
      flex: 0.95,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'user' },
    },
    {
      field: 'code',
      headerName: 'Client Phone Number',
      width: 200,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'user' },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: ProjectStatusCell,
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 140,
      valueFormatter: (params) => formatDateDisplay(params.value),
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 140,
      valueFormatter: (params) => formatDateDisplay(params.value),
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'calendar' },
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
      cellRenderer: ProjectActionsCell,
      cellRendererParams: {
        onView: (project) => ({ pathname: location.pathname, search: `?mode=view&id=${encodeURIComponent(project.id)}`, hash: tabToHash.create }),
        onEdit: (project) => ({ pathname: location.pathname, search: `?mode=edit&id=${encodeURIComponent(project.id)}`, hash: tabToHash.create }),
        onDelete: (project) => setDeleteId(project.id),
      },
    },
  ], [location.pathname]);

  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name,
        code: editProject.code,
        client: editProject.client,
        startDate: editProject.startDate,
        endDate: editProject.endDate,
        status: editProject.status,
        summary: editProject.summary ?? editProject.description ?? '',
        details: editProject.details ?? editProject.description ?? '',
        budget: editProject.budget,
        type: editProject.type ?? 'Client Project',
        owner: editProject.owner ?? 'Company Admin',
        team: editProject.team ?? 'Core Delivery',
        priority: editProject.priority ?? 'Medium',
        description: editProject.description ?? editProject.summary ?? editProject.details ?? '',
      });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editProject]);

  useEffect(() => {
    if ((routeMode === 'view' || routeMode === 'edit') && routeProject && tab !== 'create') {
      setTab('create');
      navigate({ pathname: location.pathname, search: location.search, hash: tabToHash.create }, { replace: true });
    }
  }, [location.pathname, location.search, navigate, routeMode, routeProject, tab]);

  useEffect(() => {
    if (routeMode === 'view' && routeProject) {
      setSelectedId(routeProject.id);
    }
  }, [routeMode, routeProject]);

  const filteredProjects = useMemo(
    () =>
      projects.filter((item) => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
        const haystack = `${item.name} ${item.code} ${item.client} ${item.summary} ${item.details} ${item.type} ${item.owner} ${item.team} ${item.priority} ${item.status}`.toLowerCase();
        return matchesStatus && matchesPriority && haystack.includes(searchTerm.toLowerCase());
      }),
    [priorityFilter, projects, searchTerm, statusFilter],
  );

  const statusCounts = useMemo(
    () =>
      companyAdminProjectStatuses.slice(1).reduce((acc, status) => {
        acc[status] = projects.filter((item) => item.status === status).length;
        return acc;
      }, {}),
    [projects],
  );

  const projectOverviewCounts = useMemo(
    () => ({
      total: projects.length,
      active: statusCounts.Active || 0,
      onHold: statusCounts['On Hold'] || 0,
      completed: statusCounts.Completed || 0,
    }),
    [projects.length, statusCounts],
  );

  const startCreate = () => {
    setFormErrors({});
    setFormData(emptyForm);
    setTab('create');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.create }, { replace: true });
  };

  const goToProjectList = () => {
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.projects }, { replace: true });
    setTab('projects');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Project title is required.';
    if (!formData.client.trim()) errors.client = 'Client name is required.';
    if (!formData.code.trim()) errors.code = 'Client number is required.';
    if (!formData.startDate.trim()) errors.startDate = 'Start date is required.';
    if (!formData.endDate.trim()) errors.endDate = 'End date is required.';
    if (!formData.budget.trim()) errors.budget = 'Budget is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    if (!formData.summary.trim()) errors.summary = 'Summary is required.';
    if (!formData.details.trim()) errors.details = 'Details are required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const next = {
      id: `p-${String(Date.now()).slice(-5)}`,
      ...formData,
      type: formData.type || 'Client Project',
      owner: formData.owner || 'Company Admin',
      team: formData.team || 'Core Delivery',
      priority: formData.priority || 'Medium',
      description: formData.description || formData.summary || '',
    };
    setProjects((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    goToProjectList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!routeId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setProjects((current) =>
      current.map((item) =>
        item.id === routeId
          ? {
              ...item,
              ...formData,
              type: formData.type || item.type || 'Client Project',
              owner: formData.owner || item.owner || 'Company Admin',
              team: formData.team || item.team || 'Core Delivery',
              priority: formData.priority || item.priority || 'Medium',
              description: formData.description || formData.summary || item.description || '',
            }
          : item,
      ));
    setSelectedId(routeId);
    setFormErrors({});
    goToProjectList();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setProjects((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  const confirmBulkDelete = () => {
    if (!selectedIds.length) return;
    setProjects((current) => current.filter((item) => !selectedIds.includes(item.id)));
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
          {tab === 'overview' ? 'Overview' : tab === 'projects' ? 'Project Directory' : 'Create Project'}
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <SmallCard title="Project Summary">
              <div className="superadmin-list">
                <div className="superadmin-list-item">
                  <span>Total Projects</span>
                  <strong>{projectOverviewCounts.total}</strong>
                </div>
                <div className="superadmin-list-item">
                  <span>Active</span>
                  <strong>{projectOverviewCounts.active}</strong>
                </div>
                <div className="superadmin-list-item">
                  <span>On Hold</span>
                  <strong>{projectOverviewCounts.onHold}</strong>
                </div>
                <div className="superadmin-list-item">
                  <span>Completed</span>
                  <strong>{projectOverviewCounts.completed}</strong>
                </div>
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-insight">
                <strong>Keep the project pipeline focused on live counts and the next action.</strong>
                <span>This minimal layout shows only the data admins need at a glance.</span>
                <div className="superadmin-package-overview-actions">
                  <button
                    type="button"
                    className="superadmin-package-action"
                    onClick={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.projects }, { replace: true })}
                  >
                    <strong>Open List</strong>
                    <span>Review all projects.</span>
                  </button>
                  <button
                    type="button"
                    className="superadmin-package-action"
                    onClick={() => startCreate()}
                  >
                    <strong>Create Project</strong>
                    <span>Add a new project record.</span>
                  </button>
                </div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'projects' ? (
        <div className="superadmin-package-layout company-admin-list-page">
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-table-card superadmin-master-grid-card">
              <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
                <div className="superadmin-master-searchbar-left">
                  <div className="superadmin-package-search superadmin-master-search">
                    <Icon name="search" size={14} />
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search project, client, owner, team" />
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
                    <span>Add Project</span>
                  </Link>
                  <button
                    type="button"
                    className="superadmin-master-action-button tone-danger icon-only"
                    onClick={() => setBulkDeleteOpen(true)}
                    disabled={!selectedIds.length}
                    aria-label="Delete selected projects"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
              <div className="superadmin-master-grid">
                <AgGridReact
                  theme="legacy"
                  rowData={filteredProjects}
                  columnDefs={projectGridColumns}
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
                  noRowsOverlayComponent={ProjectGridEmptyOverlay}
                  noRowsOverlayComponentParams={{
                    title: 'No projects found',
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
                viewProject ? (
                  <>
                    <h4>View Project</h4>
                    <p className="superadmin-package-card-copy">Read-only project details with the same structure as the create form.</p>
                  <ProjectForm
                    formData={viewProject}
                    setFormData={() => {}}
                    onSubmit={(event) => event.preventDefault()}
                    submitLabel="Back to List"
                    readOnly
                    onBack={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.projects }, { replace: true })}
                  />
                  </>
                ) : (
                  <>
                    <h4>View Project</h4>
                    <p className="superadmin-package-card-copy">Read-only project details with the same structure as the create form.</p>
                    <div className="superadmin-empty-state">No project selected.</div>
                    <div className="superadmin-package-form-actions">
                      <Link to={{ pathname: location.pathname, search: '', hash: tabToHash.projects }} replace className="superadmin-package-modal-button secondary">
                        Back to List
                      </Link>
                    </div>
                  </>
                )
              ) : (
                <>
                  <h4>{routeMode === 'edit' ? 'Edit Project' : 'New Project Entry'}</h4>
                  <p className="superadmin-package-card-copy">Project entry with title, client, dates, status, summary, details, and cost.</p>
                  <ProjectForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={routeMode === 'edit' ? submitEdit : submitCreate}
                    submitLabel={routeMode === 'edit' ? 'Update Project' : 'Create Project'}
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
                {companyAdminProjectMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Report Snapshot">
              <div className="superadmin-list">
                {companyAdminProjectHighlights.map((item) => (
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
                  <button
                    key={period}
                    type="button"
                    className={`superadmin-package-report-pill ${activeAction === period ? 'active' : ''}`}
                    onClick={() => setActiveAction(period)}
                  >
                    <Icon name="chart-line" size={14} /> {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Active Projects</strong><span>{statusCounts.Active || 0}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>On Hold Projects</strong><span>{statusCounts['On Hold'] || 0}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Completed Projects</strong><span>{statusCounts.Completed || 0}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {bulkDeleteOpen ? (
        <Modal
          title="Delete Selected Projects"
          onClose={() => setBulkDeleteOpen(false)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setBulkDeleteOpen(false)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmBulkDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">
            This will remove {selectedIds.length} selected project{selectedIds.length === 1 ? '' : 's'} from the frontend list.
          </p>
        </Modal>
      ) : null}

      {deleteProject ? (
        <Modal
          title="Delete Project"
          onClose={() => setDeleteId(null)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">This will remove the project from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}

