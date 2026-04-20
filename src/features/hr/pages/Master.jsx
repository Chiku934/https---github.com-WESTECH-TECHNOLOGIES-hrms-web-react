import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import { hrMasterHighlights, hrMasterList, hrMasterMetrics, hrMasterQuickActions, hrMasterStatusOptions, hrMasterTypes } from '../data/masterData';

const tabs = [{ key: 'overview', label: 'Overview' }, { key: 'masters', label: 'Master List' }, { key: 'create', label: 'Create Master' }];
const filters = ['All', ...hrMasterTypes];
const statusFilters = ['All', ...hrMasterStatusOptions];
const emptyForm = { type: 'Department', name: '', code: '', note: '', status: 'Active' };
const storageKey = 'hr_master_settings';

function SmallCard({ title, children }) { return <section className="dashboard-card superadmin-package-mini-card"><div className="dashboard-card-title">{title}</div>{children}</section>; }
function StatBlock({ metric }) { return <div className="superadmin-package-stat"><div className="superadmin-package-stat-label">{metric.label}</div><div className="superadmin-package-stat-value">{metric.value}</div><div className="superadmin-package-stat-change">{metric.change}</div></div>; }
function Modal({ title, onClose, children, footer }) { return <div className="superadmin-package-modal-backdrop" onClick={onClose} role="presentation"><div className="superadmin-package-modal" onClick={(e) => e.stopPropagation()} role="presentation"><div className="superadmin-package-modal-header"><div><div className="superadmin-package-modal-kicker">HR</div><h3>{title}</h3></div><button type="button" className="superadmin-package-modal-close" onClick={onClose} aria-label="Close">&times;</button></div><div className="superadmin-package-modal-body">{children}</div>{footer ? <div className="superadmin-package-modal-footer">{footer}</div> : null}</div></div>; }
function Row({ item, onView, onEdit, onDelete, selected }) { return <tr className={selected ? 'superadmin-package-row active' : 'superadmin-package-row'}><td><div className="superadmin-package-cell"><strong>{item.name}</strong><span>{item.type}</span></div></td><td>{item.code}</td><td>{item.note}</td><td><span className={`role-status-chip tone-${item.status.toLowerCase()}`}>{item.status}</span></td><td><div className="superadmin-package-actions"><button type="button" className="superadmin-package-action" onClick={() => onView(item)}>View</button><button type="button" className="superadmin-package-action" onClick={() => onEdit(item)}>Edit</button><button type="button" className="superadmin-package-action danger" onClick={() => onDelete(item)}>Delete</button></div></td></tr>; }
function Form({ formData, setFormData, onSubmit, submitLabel, errors = {} }) { return <form className="superadmin-package-form-grid" onSubmit={onSubmit}><label className="superadmin-package-form-field"><span>Master Type</span><select value={formData.type} onChange={(e) => setFormData((c) => ({ ...c, type: e.target.value }))}>{hrMasterTypes.map((item) => <option key={item}>{item}</option>)}</select>{errors.type ? <small className="superadmin-package-error">{errors.type}</small> : null}</label><label className="superadmin-package-form-field"><span>Name</span><input value={formData.name} onChange={(e) => setFormData((c) => ({ ...c, name: e.target.value }))} placeholder="Enter master name" />{errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}</label><label className="superadmin-package-form-field"><span>Code</span><input value={formData.code} onChange={(e) => setFormData((c) => ({ ...c, code: e.target.value }))} placeholder="Enter code" />{errors.code ? <small className="superadmin-package-error">{errors.code}</small> : null}</label><label className="superadmin-package-form-field"><span>Note</span><input value={formData.note} onChange={(e) => setFormData((c) => ({ ...c, note: e.target.value }))} placeholder="Optional note" /></label><label className="superadmin-package-form-field"><span>Status</span><select value={formData.status} onChange={(e) => setFormData((c) => ({ ...c, status: e.target.value }))}>{hrMasterStatusOptions.map((item) => <option key={item}>{item}</option>)}</select>{errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}</label><div className="superadmin-package-form-actions"><button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button></div></form>; }
function normalizeMasters(records) {
  if (!Array.isArray(records)) return hrMasterList;

  const cleaned = records
    .filter((item) => item && typeof item === 'object')
    .map((item, index) => ({
      id: String(item.id || `m-${String(index + 1).padStart(3, '0')}`),
      type: item.type === 'Designation' ? 'Designation' : 'Department',
      name: String(item.name || '').trim(),
      code: String(item.code || '').trim(),
      note: String(item.note || '').trim(),
      status: ['Active', 'Draft', 'Inactive'].includes(item.status) ? item.status : 'Active',
    }))
    .filter((item) => item.name && item.code);

  const hasExpectedCoreRows = cleaned.some((item) => item.id === 'm-001' && item.name === 'React development')
    && cleaned.some((item) => item.id === 'm-005' && item.name === 'Sr PHP Developer');

  return cleaned.length && hasExpectedCoreRows ? cleaned : hrMasterList;
}

function loadMasters() {
  if (typeof window === 'undefined') return hrMasterList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return hrMasterList;
    const parsed = JSON.parse(stored);
    return normalizeMasters(parsed);
  } catch {
    return hrMasterList;
  }
}
function saveMasters(records) { if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(records)); }

export default function Master() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(hrMasterQuickActions[0].label);
  const [masters, setMasters] = useState(() => loadMasters());
  const [selectedId, setSelectedId] = useState(loadMasters()[0]?.id ?? null);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => saveMasters(masters), [masters]);
  useEffect(() => { if (!masters.some((item) => item.id === selectedId)) setSelectedId(masters[0]?.id ?? null); }, [masters, selectedId]);
  const selected = useMemo(() => masters.find((item) => item.id === selectedId) ?? masters[0] ?? null, [masters, selectedId]);
  const viewItem = useMemo(() => masters.find((item) => item.id === viewId) ?? null, [masters, viewId]);
  const editItem = useMemo(() => masters.find((item) => item.id === editId) ?? null, [masters, editId]);
  const deleteItem = useMemo(() => masters.find((item) => item.id === deleteId) ?? null, [masters, deleteId]);

  useEffect(() => {
    if (editItem) {
      setFormData({ type: editItem.type, name: editItem.name, code: editItem.code, note: editItem.note, status: editItem.status });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editItem]);

  const filteredMasters = useMemo(
    () => masters.filter((item) => {
      const matchesType = typeFilter === 'All' || item.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const haystack = `${item.type} ${item.name} ${item.code} ${item.note} ${item.status}`.toLowerCase();
      return matchesType && matchesStatus && haystack.includes(searchTerm.toLowerCase());
    }),
    [masters, searchTerm, statusFilter, typeFilter],
  );

  const typeCounts = useMemo(
    () => hrMasterTypes.reduce((acc, type) => {
      acc[type] = masters.filter((item) => item.type === type).length;
      return acc;
    }, {}),
    [masters],
  );

  const startCreate = (type = 'Department') => {
    setEditId(null);
    setFormErrors({});
    setFormData({ ...emptyForm, type });
    setTab('create');
  };

  const goToMasterList = () => {
    setTab('masters');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.masters }, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.type.trim()) errors.type = 'Master type is required.';
    if (!formData.name.trim()) errors.name = 'Master name is required.';
    if (!formData.code.trim()) errors.code = 'Code is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const next = { id: `m-${String(Date.now()).slice(-5)}`, ...formData };
    setMasters((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    goToMasterList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setMasters((current) => current.map((item) => (item.id === editId ? { ...item, ...formData } : item)));
    setSelectedId(editId);
    setEditId(null);
    setFormErrors({});
    goToMasterList();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setMasters((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <DashboardShell activeKey="hr-master" headerProps={{ companyText: 'HR' }}>
      <div className="superadmin-package-tabs">{tabs.map((item) => <Link key={item.key} to={{ pathname: location.pathname, search: '', hash: tabToHash[item.key] }} replace className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}>{item.label}</Link>)}</div>
      <div className="superadmin-section-header"><div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : tab === 'masters' ? 'Master Directory' : 'Create Master'}</div></div>
      {tab === 'overview' ? <div className="superadmin-package-layout"><div className="superadmin-package-sidebar"><div className="dashboard-card superadmin-package-stats-card"><div className="superadmin-package-stats-grid">{hrMasterMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div></div><SmallCard title="Master Snapshot"><div className="superadmin-list">{hrMasterHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard><SmallCard title="Selected Master">{selected ? <div className="superadmin-package-detail"><div><span>Name</span><strong>{selected.name}</strong></div><div><span>Type</span><strong>{selected.type}</strong></div><div><span>Code</span><strong>{selected.code}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div></div> : <div className="superadmin-empty-state">Select a master to preview the details.</div>}</SmallCard></div><div className="superadmin-package-workspace"><div className="superadmin-package-overview-row"><SmallCard title="Master Types"><div className="superadmin-package-cycle-grid">{hrMasterTypes.map((type) => <div key={type} className="superadmin-package-cycle-card"><strong>{typeCounts[type] || 0}</strong><span>{type}</span></div>)}</div></SmallCard><SmallCard title="Quick Actions"><div className="superadmin-package-action-grid">{hrMasterQuickActions.map((action) => <button key={action.label} type="button" className={`superadmin-package-action ${activeAction === action.label ? 'active' : ''}`} onClick={() => setActiveAction(action.label)}><strong>{action.label}</strong><span>{action.description}</span></button>)}</div></SmallCard></div><SmallCard title="Workspace Notes"><div className="superadmin-list"><div className="superadmin-list-item"><span>Scope</span><strong>Department and designation only</strong></div><div className="superadmin-list-item"><span>Total Records</span><strong>{masters.length}</strong></div><div className="superadmin-list-item"><span>Current Focus</span><strong>{selected?.type || 'Department'}</strong></div></div></SmallCard></div></div> : null}
      {tab === 'masters' ? <div className="superadmin-package-layout"><div className="superadmin-package-sidebar"><SmallCard title="Summary"><div className="superadmin-list">{hrMasterHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard><SmallCard title="Selected Master">{selected ? <div className="superadmin-package-detail"><div><span>Name</span><strong>{selected.name}</strong></div><div><span>Type</span><strong>{selected.type}</strong></div><div><span>Code</span><strong>{selected.code}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div></div> : <div className="superadmin-empty-state">Pick a row to preview the master details.</div>}</SmallCard></div><div className="superadmin-package-workspace"><div className="superadmin-package-filterbar"><div className="superadmin-package-search"><Icon name="search" size={14} /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search master, type, code, note" /></div><button type="button" className="superadmin-package-secondary" onClick={() => startCreate('Department')}>+ Add Master</button></div><div className="superadmin-package-filters">{filters.map((item) => <button key={item} type="button" className={`superadmin-package-filter ${typeFilter === item ? 'active' : ''}`} onClick={() => setTypeFilter(item)}>{item}</button>)}</div><div className="superadmin-package-filters">{statusFilters.map((item) => <button key={item} type="button" className={`superadmin-package-filter ${statusFilter === item ? 'active' : ''}`} onClick={() => setStatusFilter(item)}>{item}</button>)}</div><div className="superadmin-package-table-card"><table className="superadmin-package-table"><thead><tr><th>Master</th><th>Code</th><th>Note</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filteredMasters.length ? filteredMasters.map((item) => <Row key={item.id} item={item} selected={selected?.id === item.id} onView={(master) => setViewId(master.id)} onEdit={(master) => setEditId(master.id)} onDelete={(master) => setDeleteId(master.id)} />) : <tr><td colSpan={5}><div className="superadmin-empty-state">No masters found for this filter.</div></td></tr>}</tbody></table></div></div></div> : null}
      {tab === 'create' ? <div className="superadmin-package-layout"><div className="superadmin-package-sidebar"><SmallCard title="Create Notes"><div className="superadmin-list"><div className="superadmin-list-item"><span>Mode</span><strong>{editItem ? 'Editing master' : 'Creating master'}</strong></div><div className="superadmin-list-item"><span>Storage</span><strong>localStorage demo</strong></div><div className="superadmin-list-item"><span>Backend</span><strong>Payload ready</strong></div></div></SmallCard><SmallCard title="Quick Actions"><div className="superadmin-package-create-actions"><button type="button" className="superadmin-package-action" onClick={() => setTab('masters')}><strong>Master List</strong><span>Review current records.</span></button><button type="button" className="superadmin-package-action" onClick={() => startCreate('Department')}><strong>Department</strong><span>Create a department record.</span></button><button type="button" className="superadmin-package-action" onClick={() => startCreate('Designation')}><strong>Designation</strong><span>Create a designation record.</span></button></div></SmallCard></div><div className="superadmin-package-workspace"><div className="superadmin-package-form-card"><h4>{editItem ? 'Edit Master' : 'New Master Entry'}</h4><p className="superadmin-package-card-copy">Compact lookup form with validation and backend-ready master fields.</p><Form formData={formData} setFormData={setFormData} onSubmit={editItem ? submitEdit : submitCreate} submitLabel={editItem ? 'Update Master' : 'Create Master'} errors={formErrors} />{Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}</div></div></div> : null}
      {false && tab === 'reports' ? <div className="superadmin-package-layout"><div className="superadmin-package-sidebar"><div className="dashboard-card superadmin-package-stats-card"><div className="superadmin-package-stats-grid">{hrMasterMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div></div><SmallCard title="Report Snapshot"><div className="superadmin-list">{hrMasterHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard></div><div className="superadmin-package-workspace"><SmallCard title="Report Summary"><div className="superadmin-report-list"><div className="superadmin-report-row"><div><strong>Department Count</strong><span>{typeCounts.Department || 0}</span></div><Icon name="chevron-right" size={12} /></div><div className="superadmin-report-row"><div><strong>Designation Count</strong><span>{typeCounts.Designation || 0}</span></div><Icon name="chevron-right" size={12} /></div><div className="superadmin-report-row"><div><strong>Frontend Ready</strong><span>Yes</span></div><Icon name="chevron-right" size={12} /></div></div></SmallCard></div></div> : null}
      {viewItem ? <Modal title="View Master" onClose={() => setViewId(null)} footer={<button type="button" className="superadmin-package-modal-button secondary" onClick={() => setViewId(null)}>Close</button>}><div className="superadmin-package-detail view"><div><span>Type</span><strong>{viewItem.type}</strong></div><div><span>Name</span><strong>{viewItem.name}</strong></div><div><span>Code</span><strong>{viewItem.code}</strong></div><div><span>Note</span><strong>{viewItem.note}</strong></div><div><span>Status</span><strong>{viewItem.status}</strong></div></div></Modal> : null}
      {editItem ? <Modal title="Edit Master" onClose={() => setEditId(null)} footer={null}><Form formData={formData} setFormData={setFormData} onSubmit={submitEdit} submitLabel="Update Master" errors={formErrors} /></Modal> : null}
      {deleteItem ? <Modal title="Delete Master" onClose={() => setDeleteId(null)} footer={<><button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button><button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button></> }><p className="superadmin-package-delete-copy">This will remove the master from the frontend list. Backend wiring can come later.</p></Modal> : null}
    </DashboardShell>
  );
}
