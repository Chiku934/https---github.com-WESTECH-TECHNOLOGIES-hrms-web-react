import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import {
  hrHolidayHighlights,
  hrHolidayList,
  hrHolidayLocations,
  hrHolidayMetrics,
  hrHolidayQuickActions,
  hrHolidayStatuses,
  hrHolidayTypes,
} from '../data/holidayData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'calendar', label: 'Holiday Calendar' },
  { key: 'holidays', label: 'Holiday List' },
  { key: 'create', label: 'Create Holiday' },
];

const storageKey = 'hr_holiday_list';
const statusFilters = ['All', ...hrHolidayStatuses.slice(1)];
const typeFilters = ['All', ...hrHolidayTypes];
const locationFilters = ['All', ...hrHolidayLocations.slice(1)];

const emptyForm = {
  name: '',
  date: '',
  type: 'National',
  location: 'Pan India',
  status: 'Active',
  note: '',
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

function HolidayForm({ formData, setFormData, onSubmit, submitLabel, errors = {} }) {
  return (
    <form className="superadmin-package-form-grid" onSubmit={onSubmit}>
      <label className="superadmin-package-form-field">
        <span>Holiday Name</span>
        <input value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} placeholder="Enter holiday name" />
        {errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Date</span>
        <input type="date" value={formData.date} onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))} />
        {errors.date ? <small className="superadmin-package-error">{errors.date}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Type</span>
        <select value={formData.type} onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value }))}>
          {hrHolidayTypes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Location</span>
        <select value={formData.location} onChange={(event) => setFormData((current) => ({ ...current, location: event.target.value }))}>
          {hrHolidayLocations.slice(1).map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
          {hrHolidayStatuses.slice(1).map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field superadmin-project-wide-field">
        <span>Note</span>
        <textarea value={formData.note} onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))} placeholder="Add a short note" />
      </label>
      <div className="superadmin-package-form-actions">
        <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function loadHolidays() {
  if (typeof window === 'undefined') return hrHolidayList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return hrHolidayList;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : hrHolidayList;
  } catch {
    return hrHolidayList;
  }
}

function saveHolidays(records) {
  if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(records));
}

function HolidayRow({ item, selected, onView, onEdit, onDelete }) {
  return (
    <tr className={selected ? 'superadmin-package-row active' : 'superadmin-package-row'}>
      <td>
        <div className="superadmin-package-cell">
          <strong>{item.name}</strong>
          <span>{item.type}</span>
        </div>
      </td>
      <td>{item.date}</td>
      <td>{item.location}</td>
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

export default function HolidayList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAction, setActiveAction] = useState(hrHolidayQuickActions[0].label);
  const [month, setMonth] = useState('2026-04');
  const [records, setRecords] = useState(() => loadHolidays());
  const [selectedId, setSelectedId] = useState(loadHolidays()[0]?.id ?? null);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => saveHolidays(records), [records]);
  useEffect(() => {
    if (!records.some((item) => item.id === selectedId)) setSelectedId(records[0]?.id ?? null);
  }, [records, selectedId]);

  const selected = useMemo(() => records.find((item) => item.id === selectedId) ?? records[0] ?? null, [records, selectedId]);
  const viewItem = useMemo(() => records.find((item) => item.id === viewId) ?? null, [records, viewId]);
  const editItem = useMemo(() => records.find((item) => item.id === editId) ?? null, [records, editId]);
  const deleteItem = useMemo(() => records.find((item) => item.id === deleteId) ?? null, [records, deleteId]);
  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesType = typeFilter === 'All' || item.type === typeFilter;
        const matchesLocation = locationFilter === 'All' || item.location === locationFilter;
        const haystack = `${item.name} ${item.date} ${item.type} ${item.location} ${item.status} ${item.note}`.toLowerCase();
        return matchesStatus && matchesType && matchesLocation && haystack.includes(searchTerm.toLowerCase());
      }),
    [records, searchTerm, statusFilter, typeFilter, locationFilter],
  );
  const monthRecords = useMemo(() => records.filter((item) => item.date.startsWith(month)), [records, month]);
  const statusCounts = useMemo(
    () => hrHolidayStatuses.slice(1).reduce((acc, status) => {
      acc[status] = records.filter((item) => item.status === status).length;
      return acc;
    }, {}),
    [records],
  );
  const typeCounts = useMemo(
    () => hrHolidayTypes.reduce((acc, type) => {
      acc[type] = records.filter((item) => item.type === type).length;
      return acc;
    }, {}),
    [records],
  );

  useEffect(() => {
    if (editItem) {
      setFormData({ name: editItem.name, date: editItem.date, type: editItem.type, location: editItem.location, status: editItem.status, note: editItem.note });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editItem]);

  const startCreate = () => {
    setEditId(null);
    setFormErrors({});
    setFormData(emptyForm);
    setTab('create');
  };

  const goToHolidayList = () => {
    setTab('holidays');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.holidays }, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Holiday name is required.';
    if (!formData.date.trim()) errors.date = 'Holiday date is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) return;
    const next = { id: `h-${String(Date.now()).slice(-5)}`, ...formData };
    setRecords((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    goToHolidayList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editId) return;
    const errors = validateForm();
    if (Object.keys(errors).length) return;
    setRecords((current) => current.map((item) => (item.id === editId ? { ...item, ...formData } : item)));
    setSelectedId(editId);
    setEditId(null);
    goToHolidayList();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setRecords((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <DashboardShell activeKey="hr-holiday-list" headerProps={{ companyText: 'HR' }}>
      <div className="superadmin-package-tabs">{tabs.map((item) => <Link key={item.key} to={{ pathname: location.pathname, search: '', hash: tabToHash[item.key] }} replace className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}>{item.label}</Link>)}</div>
      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : tab === 'calendar' ? 'Holiday Calendar' : tab === 'holidays' ? 'Holiday Directory' : 'Create Holiday'}</div>
      </div>

      {tab === 'overview' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">{hrHolidayMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div>
            </div>
            <SmallCard title="Holiday Snapshot"><div className="superadmin-list">{hrHolidayHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard>
            <SmallCard title="Selected Holiday">{selected ? <div className="superadmin-package-detail"><div><span>Name</span><strong>{selected.name}</strong></div><div><span>Date</span><strong>{selected.date}</strong></div><div><span>Type</span><strong>{selected.type}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div></div> : <div className="superadmin-empty-state">Select a holiday to preview the details.</div>}</SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-overview-row">
              <SmallCard title="Calendar Month">
                <div className="superadmin-package-filterbar" style={{ marginBottom: 12 }}>
                  <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} style={{ width: '100%', border: '1px solid var(--hr-border)', borderRadius: 14, padding: '10px 12px', background: 'var(--hr-surface)' }} />
                </div>
                <div className="superadmin-package-cycle-grid">
                  <div className="superadmin-package-cycle-card"><strong>{monthRecords.length}</strong><span>Month entries</span></div>
                  <div className="superadmin-package-cycle-card"><strong>{statusCounts.Active || 0}</strong><span>Active</span></div>
                  <div className="superadmin-package-cycle-card"><strong>{statusCounts.Draft || 0}</strong><span>Draft</span></div>
                </div>
              </SmallCard>
              <SmallCard title="Quick Actions">
                <div className="superadmin-package-action-grid">
                  {hrHolidayQuickActions.map((action) => <button key={action.label} type="button" className={`superadmin-package-action ${activeAction === action.label ? 'active' : ''}`} onClick={() => setActiveAction(action.label)}><strong>{action.label}</strong><span>{action.description}</span></button>)}
                </div>
              </SmallCard>
            </div>
            <SmallCard title="Workspace Notes">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Scope</span><strong>HR holiday calendar and list</strong></div>
                <div className="superadmin-list-item"><span>Total Records</span><strong>{records.length}</strong></div>
                <div className="superadmin-list-item"><span>Current Focus</span><strong>{selected?.status || 'Active'}</strong></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'calendar' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Calendar Snapshot"><div className="superadmin-list">{hrHolidayHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard>
            <SmallCard title="Selected Holiday">{selected ? <div className="superadmin-package-detail"><div><span>Name</span><strong>{selected.name}</strong></div><div><span>Location</span><strong>{selected.location}</strong></div><div><span>Type</span><strong>{selected.type}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div></div> : <div className="superadmin-empty-state">Pick a holiday to preview the record.</div>}</SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-filterbar">
              <div className="superadmin-package-search"><Icon name="search" size={14} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search holiday, date, type, location" /></div>
              <button type="button" className="superadmin-package-secondary" onClick={startCreate}>+ Add Holiday</button>
            </div>
            <div className="superadmin-package-filters">{statusFilters.map((item) => <button key={item} type="button" className={`superadmin-package-filter ${statusFilter === item ? 'active' : ''}`} onClick={() => setStatusFilter(item)}>{item}</button>)}</div>
            <div className="superadmin-package-filters">{typeFilters.map((item) => <button key={item} type="button" className={`superadmin-package-filter ${typeFilter === item ? 'active' : ''}`} onClick={() => setTypeFilter(item)}>{item}</button>)}</div>
            <div className="superadmin-package-filters">{locationFilters.map((item) => <button key={item} type="button" className={`superadmin-package-filter ${locationFilter === item ? 'active' : ''}`} onClick={() => setLocationFilter(item)}>{item}</button>)}</div>
            <div className="superadmin-package-table-card">
              <table className="superadmin-package-table">
                <thead><tr><th>Holiday</th><th>Date</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{filteredRecords.length ? filteredRecords.map((item) => <HolidayRow key={item.id} item={item} selected={selected?.id === item.id} onView={(record) => setViewId(record.id)} onEdit={(record) => { setEditId(record.id); setTab('create'); }} onDelete={(record) => setDeleteId(record.id)} />) : <tr><td colSpan={5}><div className="superadmin-empty-state">No holidays found for this filter.</div></td></tr>}</tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'holidays' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Summary"><div className="superadmin-list">{hrHolidayHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard>
            <SmallCard title="Selected Holiday">{selected ? <div className="superadmin-package-detail"><div><span>Name</span><strong>{selected.name}</strong></div><div><span>Date</span><strong>{selected.date}</strong></div><div><span>Type</span><strong>{selected.type}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div></div> : <div className="superadmin-empty-state">Pick a row to preview the holiday details.</div>}</SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-filterbar">
              <div className="superadmin-package-search"><Icon name="search" size={14} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search holiday, type, location" /></div>
              <button type="button" className="superadmin-package-secondary" onClick={startCreate}>+ Add Holiday</button>
            </div>
            <div className="superadmin-package-table-card">
              <table className="superadmin-package-table">
                <thead><tr><th>Holiday</th><th>Date</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{filteredRecords.length ? filteredRecords.map((item) => <HolidayRow key={item.id} item={item} selected={selected?.id === item.id} onView={(record) => setViewId(record.id)} onEdit={(record) => { setEditId(record.id); setTab('create'); }} onDelete={(record) => setDeleteId(record.id)} />) : <tr><td colSpan={6}><div className="superadmin-empty-state">No holidays available right now.</div></td></tr>}</tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'create' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Create Notes"><div className="superadmin-list"><div className="superadmin-list-item"><span>Mode</span><strong>{editId ? 'Editing holiday' : 'Creating holiday'}</strong></div><div className="superadmin-list-item"><span>Storage</span><strong>localStorage demo</strong></div><div className="superadmin-list-item"><span>Backend</span><strong>Payload ready</strong></div></div></SmallCard>
            <SmallCard title="Quick Actions"><div className="superadmin-package-create-actions"><button type="button" className="superadmin-package-action" onClick={() => setTab('holidays')}><strong>Holiday List</strong><span>Review holiday rows.</span></button><button type="button" className="superadmin-package-action" onClick={() => setTab('calendar')}><strong>Open Calendar</strong><span>View the monthly grid.</span></button></div></SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-form-card">
              <div className="dashboard-card-title">{editId ? 'Edit Holiday' : 'New Holiday Entry'}</div>
              <p className="superadmin-package-card-copy">Compact HR holiday form with validation and backend-ready calendar fields.</p>
              <HolidayForm formData={formData} setFormData={setFormData} onSubmit={editId ? submitEdit : submitCreate} submitLabel={editId ? 'Update Holiday' : 'Create Holiday'} errors={formErrors} />
              {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {false && tab === 'reports' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card"><div className="superadmin-package-stats-grid">{hrHolidayMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div></div>
            <SmallCard title="Report Snapshot"><div className="superadmin-list">{hrHolidayHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <SmallCard title="Holiday Mix">
              <div className="superadmin-package-cycle-grid">{hrHolidayTypes.map((type) => <div key={type} className="superadmin-package-cycle-card"><strong>{typeCounts[type] || 0}</strong><span>{type}</span></div>)}</div>
            </SmallCard>
            <SmallCard title="Report Summary">
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Active Holidays</strong><span>{statusCounts.Active || 0}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Draft Holidays</strong><span>{statusCounts.Draft || 0}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Inactive Holidays</strong><span>{statusCounts.Inactive || 0}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {viewItem ? <Modal title="View Holiday" onClose={() => setViewId(null)} footer={<button type="button" className="superadmin-package-modal-button secondary" onClick={() => setViewId(null)}>Close</button>}><div className="superadmin-view-summary"><div className="superadmin-view-summary-main"><span>Holiday Record</span><strong>{viewItem.name}</strong><p>{viewItem.note}</p></div><div className="superadmin-view-summary-meta"><div><span>Date</span><strong>{viewItem.date}</strong></div><div><span>Type</span><strong>{viewItem.type}</strong></div><div><span>Status</span><strong>{viewItem.status}</strong></div></div></div><div className="superadmin-package-detail view"><div><span>Location</span><strong>{viewItem.location}</strong></div><div><span>Note</span><strong>{viewItem.note}</strong></div></div></Modal> : null}
      {editItem ? <Modal title="Edit Holiday" onClose={() => setEditId(null)} footer={null}><div className="superadmin-package-detail superadmin-edit-summary"><div><span>Editing</span><strong>{editItem.name}</strong></div><div><span>Date</span><strong>{editItem.date}</strong></div><div><span>Type</span><strong>{editItem.type}</strong></div><div><span>Status</span><strong>{editItem.status}</strong></div></div><HolidayForm formData={formData} setFormData={setFormData} onSubmit={submitEdit} submitLabel="Update Holiday" errors={formErrors} /></Modal> : null}
      {deleteItem ? <Modal title="Delete Holiday" onClose={() => setDeleteId(null)} footer={<><button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button><button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button></> }><p className="superadmin-package-delete-copy">This will remove the holiday from the frontend list. Backend wiring can come later.</p></Modal> : null}
    </DashboardShell>
  );
}
