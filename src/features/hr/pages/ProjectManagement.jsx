import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import {
  hrProjectHighlights,
  hrProjectList,
  hrProjectMetrics,
  hrProjectOwnerOptions,
  hrProjectPriorityOptions,
  hrProjectQuickActions,
  hrProjectStatuses,
  hrProjectTeamOptions,
  hrProjectTypes,
} from '../data/projectData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'projects', label: 'Project List' },
  { key: 'create', label: 'Create Project' },
];

const storageKey = 'hr_project_management';
const statusFilters = ['All', ...hrProjectStatuses.slice(1)];
const priorityFilters = ['All', ...hrProjectPriorityOptions];
const typeFilters = ['All', ...hrProjectTypes];

const emptyForm = {
  name: '',
  code: '',
  client: '',
  type: 'Internal Project',
  owner: 'HR Manager',
  team: 'HR Core',
  startDate: '',
  endDate: '',
  budget: '',
  priority: 'Medium',
  status: 'Draft',
  description: '',
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

function ProjectForm({ formData, setFormData, onSubmit, submitLabel, errors = {} }) {
  return (
    <form className="superadmin-package-form-grid" onSubmit={onSubmit}>
      <label className="superadmin-package-form-field">
        <span>Project Name</span>
        <input value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} placeholder="Enter project name" />
        {errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Code</span>
        <input value={formData.code} onChange={(event) => setFormData((current) => ({ ...current, code: event.target.value }))} placeholder="Enter project code" />
        {errors.code ? <small className="superadmin-package-error">{errors.code}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Client</span>
        <input value={formData.client} onChange={(event) => setFormData((current) => ({ ...current, client: event.target.value }))} placeholder="Enter client name" />
        {errors.client ? <small className="superadmin-package-error">{errors.client}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Type</span>
        <select value={formData.type} onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value }))}>
          {hrProjectTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Owner</span>
        <select value={formData.owner} onChange={(event) => setFormData((current) => ({ ...current, owner: event.target.value }))}>
          {hrProjectOwnerOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Team</span>
        <select value={formData.team} onChange={(event) => setFormData((current) => ({ ...current, team: event.target.value }))}>
          {hrProjectTeamOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Start Date</span>
        <input type="date" value={formData.startDate} onChange={(event) => setFormData((current) => ({ ...current, startDate: event.target.value }))} />
        {errors.startDate ? <small className="superadmin-package-error">{errors.startDate}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>End Date</span>
        <input type="date" value={formData.endDate} onChange={(event) => setFormData((current) => ({ ...current, endDate: event.target.value }))} />
      </label>
      <label className="superadmin-package-form-field">
        <span>Budget</span>
        <input value={formData.budget} onChange={(event) => setFormData((current) => ({ ...current, budget: event.target.value }))} placeholder="Enter budget" />
      </label>
      <label className="superadmin-package-form-field">
        <span>Priority</span>
        <select value={formData.priority} onChange={(event) => setFormData((current) => ({ ...current, priority: event.target.value }))}>
          {hrProjectPriorityOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
          {hrProjectStatuses.slice(1).map((item) => <option key={item}>{item}</option>)}
        </select>
        {errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}
      </label>
      <label className="superadmin-package-form-field superadmin-project-wide-field">
        <span>Description</span>
        <textarea value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} placeholder="Add a project description" />
      </label>
      <div className="superadmin-package-form-actions">
        <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function loadProjects() {
  if (typeof window === 'undefined') return hrProjectList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return hrProjectList;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : hrProjectList;
  } catch {
    return hrProjectList;
  }
}

function saveProjects(records) {
  if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(records));
}

function ProjectRow({ item, selected, onView, onEdit, onDelete }) {
  return (
    <tr className={selected ? 'superadmin-package-row active' : 'superadmin-package-row'}>
      <td><div className="superadmin-package-cell"><strong>{item.name}</strong><span>{item.code}</span></div></td>
      <td>{item.client}</td>
      <td>{item.owner}</td>
      <td>{item.team}</td>
      <td><span className={`role-status-chip tone-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span></td>
      <td><div className="superadmin-package-actions"><button type="button" className="superadmin-package-action" onClick={() => onView(item)}>View</button><button type="button" className="superadmin-package-action" onClick={() => onEdit(item)}>Edit</button><button type="button" className="superadmin-package-action danger" onClick={() => onDelete(item)}>Delete</button></div></td>
    </tr>
  );
}

export default function ProjectManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(hrProjectQuickActions[0].label);
  const [records, setRecords] = useState(() => loadProjects());
  const [selectedId, setSelectedId] = useState(loadProjects()[0]?.id ?? null);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => saveProjects(records), [records]);
  useEffect(() => {
    if (!records.some((item) => item.id === selectedId)) setSelectedId(records[0]?.id ?? null);
  }, [records, selectedId]);

  const selected = useMemo(() => records.find((item) => item.id === selectedId) ?? records[0] ?? null, [records, selectedId]);
  const viewItem = useMemo(() => records.find((item) => item.id === viewId) ?? null, [records, viewId]);
  const editItem = useMemo(() => records.find((item) => item.id === editId) ?? null, [records, editId]);
  const deleteItem = useMemo(() => records.find((item) => item.id === deleteId) ?? null, [records, deleteId]);

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        code: editItem.code,
        client: editItem.client,
        type: editItem.type,
        owner: editItem.owner,
        team: editItem.team,
        startDate: editItem.startDate,
        endDate: editItem.endDate,
        budget: editItem.budget,
        priority: editItem.priority,
        status: editItem.status,
        description: editItem.description,
      });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editItem]);

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
        const matchesType = typeFilter === 'All' || item.type === typeFilter;
        const haystack = `${item.name} ${item.code} ${item.client} ${item.type} ${item.owner} ${item.team} ${item.priority} ${item.status} ${item.description}`.toLowerCase();
        return matchesStatus && matchesPriority && matchesType && haystack.includes(searchTerm.toLowerCase());
      }),
    [records, searchTerm, statusFilter, priorityFilter, typeFilter],
  );

  const statusCounts = useMemo(
    () => hrProjectStatuses.slice(1).reduce((acc, status) => {
      acc[status] = records.filter((item) => item.status === status).length;
      return acc;
    }, {}),
    [records],
  );

  const startCreate = () => {
    setEditId(null);
    setFormErrors({});
    setFormData(emptyForm);
    setTab('create');
  };

  const goToProjectList = () => {
    setTab('projects');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.projects }, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Project name is required.';
    if (!formData.code.trim()) errors.code = 'Project code is required.';
    if (!formData.client.trim()) errors.client = 'Client is required.';
    if (!formData.startDate.trim()) errors.startDate = 'Start date is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) return;
    const next = { id: `p-${String(Date.now()).slice(-5)}`, ...formData };
    setRecords((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    goToProjectList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editId) return;
    const errors = validateForm();
    if (Object.keys(errors).length) return;
    setRecords((current) => current.map((item) => (item.id === editId ? { ...item, ...formData } : item)));
    setSelectedId(editId);
    setEditId(null);
    goToProjectList();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setRecords((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <DashboardShell activeKey="hr-project-management" headerProps={{ companyText: 'HR' }}>
      <div className="superadmin-package-tabs">{tabs.map((item) => <Link key={item.key} to={{ pathname: location.pathname, search: '', hash: tabToHash[item.key] }} replace className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}>{item.label}</Link>)}</div>
      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : tab === 'projects' ? 'Project Directory' : 'Create Project'}</div>
      </div>

      {tab === 'overview' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card"><div className="superadmin-package-stats-grid">{hrProjectMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div></div>
            <SmallCard title="Project Snapshot"><div className="superadmin-list">{hrProjectHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard>
            <SmallCard title="Selected Project">{selected ? <div className="superadmin-package-detail"><div><span>Name</span><strong>{selected.name}</strong></div><div><span>Owner</span><strong>{selected.owner}</strong></div><div><span>Priority</span><strong>{selected.priority}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div></div> : <div className="superadmin-empty-state">Select a project to preview the details.</div>}</SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-overview-row">
              <SmallCard title="Status Split"><div className="superadmin-package-cycle-grid">{hrProjectStatuses.slice(1).map((status) => <div key={status} className="superadmin-package-cycle-card"><strong>{statusCounts[status] || 0}</strong><span>{status}</span></div>)}</div></SmallCard>
              <SmallCard title="Quick Actions"><div className="superadmin-package-action-grid">{hrProjectQuickActions.map((action) => <button key={action.label} type="button" className={`superadmin-package-action ${activeAction === action.label ? 'active' : ''}`} onClick={() => setActiveAction(action.label)}><strong>{action.label}</strong><span>{action.description}</span></button>)}</div></SmallCard>
            </div>
            <SmallCard title="Workspace Notes"><div className="superadmin-list"><div className="superadmin-list-item"><span>Scope</span><strong>HR project tracking</strong></div><div className="superadmin-list-item"><span>Total Records</span><strong>{records.length}</strong></div><div className="superadmin-list-item"><span>Current Focus</span><strong>{selected?.status || 'Draft'}</strong></div></div></SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'projects' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Summary"><div className="superadmin-list">{hrProjectHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard>
            <SmallCard title="Selected Project">{selected ? <div className="superadmin-package-detail"><div><span>Name</span><strong>{selected.name}</strong></div><div><span>Client</span><strong>{selected.client}</strong></div><div><span>Type</span><strong>{selected.type}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div></div> : <div className="superadmin-empty-state">Pick a row to preview the project details.</div>}</SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-filterbar">
              <div className="superadmin-package-search"><Icon name="search" size={14} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search project, code, client, owner" /></div>
              <button type="button" className="superadmin-package-secondary" onClick={startCreate}>+ Add Project</button>
            </div>
            <div className="superadmin-package-filters">{statusFilters.map((item) => <button key={item} type="button" className={`superadmin-package-filter ${statusFilter === item ? 'active' : ''}`} onClick={() => setStatusFilter(item)}>{item}</button>)}</div>
            <div className="superadmin-package-filters">{priorityFilters.map((item) => <button key={item} type="button" className={`superadmin-package-filter ${priorityFilter === item ? 'active' : ''}`} onClick={() => setPriorityFilter(item)}>{item}</button>)}</div>
            <div className="superadmin-package-filters">{typeFilters.map((item) => <button key={item} type="button" className={`superadmin-package-filter ${typeFilter === item ? 'active' : ''}`} onClick={() => setTypeFilter(item)}>{item}</button>)}</div>
            <div className="superadmin-package-table-card">
              <table className="superadmin-package-table">
                <thead><tr><th>Project</th><th>Client</th><th>Owner</th><th>Team</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{filteredRecords.length ? filteredRecords.map((item) => <ProjectRow key={item.id} item={item} selected={selected?.id === item.id} onView={(record) => setViewId(record.id)} onEdit={(record) => { setEditId(record.id); setTab('create'); }} onDelete={(record) => setDeleteId(record.id)} />) : <tr><td colSpan={6}><div className="superadmin-empty-state">No projects found for this filter.</div></td></tr>}</tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'create' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Create Notes"><div className="superadmin-list"><div className="superadmin-list-item"><span>Mode</span><strong>{editItem ? 'Editing project' : 'Creating project'}</strong></div><div className="superadmin-list-item"><span>Storage</span><strong>localStorage demo</strong></div><div className="superadmin-list-item"><span>Backend</span><strong>Payload ready</strong></div></div></SmallCard>
            <SmallCard title="Quick Actions"><div className="superadmin-package-create-actions"><button type="button" className="superadmin-package-action" onClick={() => setTab('projects')}><strong>Project List</strong><span>Review current projects.</span></button></div></SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-form-card">
              <div className="dashboard-card-title">{editItem ? 'Edit Project' : 'New Project Entry'}</div>
              <p className="superadmin-package-card-copy">Compact HR project form with validation and backend-ready project fields.</p>
              <ProjectForm formData={formData} setFormData={setFormData} onSubmit={editItem ? submitEdit : submitCreate} submitLabel={editItem ? 'Update Project' : 'Create Project'} errors={formErrors} />
              {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {false && tab === 'reports' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card"><div className="superadmin-package-stats-grid">{hrProjectMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div></div>
            <SmallCard title="Report Snapshot"><div className="superadmin-list">{hrProjectHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <SmallCard title="Project Mix"><div className="superadmin-package-cycle-grid">{hrProjectStatuses.slice(1).map((status) => <div key={status} className="superadmin-package-cycle-card"><strong>{statusCounts[status] || 0}</strong><span>{status}</span></div>)}</div></SmallCard>
            <SmallCard title="Report Summary"><div className="superadmin-report-list"><div className="superadmin-report-row"><div><strong>Active Projects</strong><span>{statusCounts.Active || 0}</span></div><Icon name="chevron-right" size={12} /></div><div className="superadmin-report-row"><div><strong>On Hold</strong><span>{statusCounts['On Hold'] || 0}</span></div><Icon name="chevron-right" size={12} /></div><div className="superadmin-report-row"><div><strong>Completed</strong><span>{statusCounts.Completed || 0}</span></div><Icon name="chevron-right" size={12} /></div></div></SmallCard>
          </div>
        </div>
      ) : null}

      {viewItem ? <Modal title="View Project" onClose={() => setViewId(null)} footer={<button type="button" className="superadmin-package-modal-button secondary" onClick={() => setViewId(null)}>Close</button>}><div className="superadmin-view-summary"><div className="superadmin-view-summary-main"><span>Project Record</span><strong>{viewItem.name}</strong><p>{viewItem.description}</p></div><div className="superadmin-view-summary-meta"><div><span>Owner</span><strong>{viewItem.owner}</strong></div><div><span>Priority</span><strong>{viewItem.priority}</strong></div><div><span>Status</span><strong>{viewItem.status}</strong></div></div></div><div className="superadmin-package-detail view"><div><span>Client</span><strong>{viewItem.client}</strong></div><div><span>Team</span><strong>{viewItem.team}</strong></div><div><span>Start Date</span><strong>{viewItem.startDate}</strong></div><div><span>End Date</span><strong>{viewItem.endDate}</strong></div><div><span>Budget</span><strong>{viewItem.budget}</strong></div></div></Modal> : null}
      {editItem ? <Modal title="Edit Project" onClose={() => setEditId(null)} footer={null}><div className="superadmin-package-detail superadmin-edit-summary"><div><span>Editing</span><strong>{editItem.name}</strong></div><div><span>Client</span><strong>{editItem.client}</strong></div><div><span>Owner</span><strong>{editItem.owner}</strong></div><div><span>Status</span><strong>{editItem.status}</strong></div></div><ProjectForm formData={formData} setFormData={setFormData} onSubmit={submitEdit} submitLabel="Update Project" errors={formErrors} /></Modal> : null}
      {deleteItem ? <Modal title="Delete Project" onClose={() => setDeleteId(null)} footer={<><button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button><button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button></> }><p className="superadmin-package-delete-copy">This will remove the project from the frontend list. Backend wiring can come later.</p></Modal> : null}
    </DashboardShell>
  );
}
