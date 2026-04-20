import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../../components/Icon';
import DashboardShell from '../../shared/components/DashboardShell';
import '../../super-admin/styles/clients.css';
import {
  subAdminClientHighlights,
  subAdminClientList,
  subAdminClientMetrics,
  subAdminClientQuickActions,
} from '../data/clientsData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'clients', label: 'Client Directory' },
  { key: 'create', label: 'Create Client' },
  { key: 'reports', label: 'Reports' },
];

const filters = ['All', 'Active', 'Onboarding', 'Pending'];
const emptyForm = { name: '', company: '', package: '', location: '', status: 'Active' };

function SmallCard({ title, children }) {
  return (
    <section className="dashboard-card superadmin-mini-card">
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

function StatBlock({ metric }) {
  return (
    <div className="superadmin-stat">
      <div className="superadmin-stat-label">{metric.label}</div>
      <div className="superadmin-stat-value">{metric.value}</div>
      <div className="superadmin-stat-change">{metric.change}</div>
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="superadmin-modal-backdrop" onClick={onClose} role="presentation">
      <div className="superadmin-modal" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="superadmin-modal-header">
          <div>
            <div className="superadmin-modal-kicker">Sub Admin</div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="superadmin-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="superadmin-modal-body">{children}</div>
        {footer ? <div className="superadmin-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function ClientRow({ item, onView, onEdit, onDelete, selected }) {
  return (
    <tr className={selected ? 'superadmin-table-row active' : 'superadmin-table-row'}>
      <td>
        <div className="superadmin-client-cell">
          <strong>{item.name}</strong>
          <span>{item.company}</span>
        </div>
      </td>
      <td>{item.package}</td>
      <td>{item.location}</td>
      <td>
        <span className={`role-status-chip tone-${item.status.toLowerCase()}`}>{item.status}</span>
      </td>
      <td>
        <div className="superadmin-table-actions">
          <button type="button" className="superadmin-table-action" onClick={() => onView(item)}>View</button>
          <button type="button" className="superadmin-table-action" onClick={() => onEdit(item)}>Edit</button>
          <button type="button" className="superadmin-table-action danger" onClick={() => onDelete(item)}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

function ClientForm({ formData, setFormData, onSubmit, submitLabel }) {
  return (
    <form className="superadmin-form-grid" onSubmit={onSubmit}>
      {['name', 'company', 'package', 'location'].map((field) => (
        <label key={field} className="superadmin-form-field">
          <span>{field === 'name' ? 'Client Name' : field.charAt(0).toUpperCase() + field.slice(1)}</span>
          <input
            value={formData[field]}
            onChange={(event) => setFormData((current) => ({ ...current, [field]: event.target.value }))}
            placeholder={`Enter ${field}`}
          />
        </label>
      ))}
      <label className="superadmin-form-field">
        <span>Status</span>
        <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
          <option>Active</option>
          <option>Onboarding</option>
          <option>Pending</option>
        </select>
      </label>
      <div className="superadmin-form-actions">
        <button type="submit" className="superadmin-modal-button primary">{submitLabel}</button>
      </div>
    </form>
  );
}

export default function SubAdminClients() {
  const [tab, setTab] = useState('overview');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(subAdminClientQuickActions[0].label);
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState(subAdminClientList);
  const [selectedId, setSelectedId] = useState(subAdminClientList[0]?.id ?? null);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const selected = useMemo(() => clients.find((item) => item.id === selectedId) ?? clients[0] ?? null, [clients, selectedId]);
  const viewClient = useMemo(() => clients.find((item) => item.id === viewId) ?? null, [clients, viewId]);
  const editClient = useMemo(() => clients.find((item) => item.id === editId) ?? null, [clients, editId]);
  const deleteClient = useMemo(() => clients.find((item) => item.id === deleteId) ?? null, [clients, deleteId]);

  useEffect(() => {
    if (editClient) {
      setFormData({
        name: editClient.name,
        company: editClient.company,
        package: editClient.package,
        location: editClient.location,
        status: editClient.status,
      });
    } else {
      setFormData(emptyForm);
    }
  }, [editClient]);

  const filtered = useMemo(() => clients.filter((client) => {
    const matchesFilter = activeFilter === 'All' || client.status === activeFilter;
    const haystack = `${client.name} ${client.company} ${client.package} ${client.location}`.toLowerCase();
    return matchesFilter && haystack.includes(searchTerm.toLowerCase());
  }), [activeFilter, clients, searchTerm]);

  const startCreate = () => {
    setEditId(null);
    setFormData(emptyForm);
    setTab('create');
  };

  const submitCreate = (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.company.trim()) return;
    const next = { id: `c-${String(Date.now()).slice(-5)}`, ...formData };
    setClients((current) => [next, ...current]);
    setSelectedId(next.id);
    setTab('clients');
    setFormData(emptyForm);
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editId) return;
    setClients((current) => current.map((item) => (item.id === editId ? { ...item, ...formData } : item)));
    setSelectedId(editId);
    setEditId(null);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setClients((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <DashboardShell activeKey="sub-admin-clients" headerProps={{ companyText: 'Sub Admin' }}>
      <div className="superadmin-module-tabs">
        {tabs.map((item) => (
          <button key={item.key} type="button" className={`superadmin-module-tab ${tab === item.key ? 'active' : ''}`} onClick={() => setTab(item.key)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : tab === 'clients' ? 'Client Directory' : tab === 'create' ? 'Create Client' : 'Reports'}</div>
        <div className="superadmin-section-actions">
          <button type="button" className="superadmin-module-primary superadmin-action-small" onClick={startCreate}>+ Add Client</button>
          <button type="button" className="superadmin-module-secondary superadmin-action-small" onClick={() => setTab('reports')}>View Reports</button>
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {subAdminClientMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Client Snapshot">
              <div className="superadmin-list">
                {subAdminClientHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>
                ))}
              </div>
            </SmallCard>
          </div>
          <div className="dashboard-right-col">
            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active"><Icon name="users" size={14} /> Accounts</button>
                <button type="button" className="feed-tab"><Icon name="briefcase" size={14} /> Packages</button>
                <button type="button" className="feed-tab"><Icon name="clipboard" size={14} /> Onboarding</button>
              </div>
              <div className="superadmin-action-grid">
                {subAdminClientQuickActions.map((action) => (
                  <button key={action.label} type="button" className={`superadmin-action-item ${activeAction === action.label ? 'active' : ''}`} onClick={() => setActiveAction(action.label)}>
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <SmallCard title="Quick Preview">
              <div className="superadmin-list">
                {clients.slice(0, 3).map((client) => (
                  <div key={client.id} className="superadmin-list-item"><span>{client.name}</span><strong>{client.status}</strong></div>
                ))}
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'clients' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {subAdminClientMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Summary">
              <div className="superadmin-list">
                {subAdminClientHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>
                ))}
              </div>
            </SmallCard>
          </div>
          <div className="dashboard-right-col">
            <div className="birthday-card superadmin-table-card">
              <div className="birthday-tabs">
                {filters.map((item) => (
                  <button key={item} type="button" className={`birthday-tab ${activeFilter === item ? 'active' : ''}`} onClick={() => setActiveFilter(item)}>
                    <Icon name="calendar" size={14} /> {item}
                  </button>
                ))}
              </div>
              <div className="birthday-section-title">Client Table</div>
              <div className="superadmin-client-toolbar">
                <div className="superadmin-searchbox">
                  <Icon name="users" size={14} />
                  <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search client, company, package, location" />
                </div>
                <button type="button" className="superadmin-filter-button" onClick={startCreate}>+ Add Client</button>
              </div>
              <div className="superadmin-table-wrap">
                <table className="superadmin-table">
                  <thead>
                    <tr><th>Client</th><th>Package</th><th>Location</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.length ? filtered.map((item) => (
                      <ClientRow key={item.id} item={item} selected={selected?.id === item.id} onView={(client) => setViewId(client.id)} onEdit={(client) => setEditId(client.id)} onDelete={(client) => setDeleteId(client.id)} />
                    )) : (
                      <tr><td colSpan={5}><div className="superadmin-empty-state">No clients found for this filter.</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="superadmin-detail-card">
                <div className="superadmin-detail-head">
                  <div>
                    <div className="dashboard-card-title">Selected Client</div>
                    <span>{selected ? selected.company : 'No client selected'}</span>
                  </div>
                  {selected ? <span className={`role-status-chip tone-${selected.status.toLowerCase()}`}>{selected.status}</span> : null}
                </div>
                {selected ? (
                  <div className="superadmin-detail-grid">
                    <div><span>Client Name</span><strong>{selected.name}</strong></div>
                    <div><span>Package</span><strong>{selected.package}</strong></div>
                    <div><span>Location</span><strong>{selected.location}</strong></div>
                    <div><span>Status</span><strong>{selected.status}</strong></div>
                  </div>
                ) : <div className="superadmin-empty-state">Select a client to preview the details.</div>}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'create' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <SmallCard title="Create Notes">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Frontend only</span><strong>Save, edit, delete, preview</strong></div>
                <div className="superadmin-list-item"><span>Backend later</span><strong>API and DB will replace mock data</strong></div>
              </div>
            </SmallCard>
          </div>
          <div className="dashboard-right-col">
            <div className="birthday-card superadmin-form-card">
              <div className="birthday-section-title">New Client Entry</div>
              <ClientForm formData={formData} setFormData={setFormData} onSubmit={editId ? submitEdit : submitCreate} submitLabel={editId ? 'Update Client' : 'Create Client'} />
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'reports' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {subAdminClientMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
          </div>
          <div className="dashboard-right-col">
            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active"><Icon name="chart-line" size={14} /> Monthly</button>
                <button type="button" className="feed-tab"><Icon name="users" size={14} /> Clients</button>
                <button type="button" className="feed-tab"><Icon name="briefcase" size={14} /> Packages</button>
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Total Clients</strong><span>{subAdminClientMetrics[0].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Active</strong><span>{subAdminClientMetrics[1].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Pending</strong><span>{subAdminClientMetrics[3].value}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {viewClient ? (
        <Modal title="View Client" onClose={() => setViewId(null)} footer={<button type="button" className="superadmin-modal-button secondary" onClick={() => setViewId(null)}>Close</button>}>
          <div className="superadmin-detail-grid view">
            <div><span>Client Name</span><strong>{viewClient.name}</strong></div>
            <div><span>Company</span><strong>{viewClient.company}</strong></div>
            <div><span>Package</span><strong>{viewClient.package}</strong></div>
            <div><span>Location</span><strong>{viewClient.location}</strong></div>
            <div><span>Status</span><strong>{viewClient.status}</strong></div>
          </div>
        </Modal>
      ) : null}

      {editClient ? (
        <Modal title="Edit Client" onClose={() => setEditId(null)} footer={null}>
          <ClientForm formData={formData} setFormData={setFormData} onSubmit={submitEdit} submitLabel="Update Client" />
        </Modal>
      ) : null}

      {deleteClient ? (
        <Modal title="Delete Client" onClose={() => setDeleteId(null)} footer={<><button type="button" className="superadmin-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button><button type="button" className="superadmin-modal-button danger" onClick={confirmDelete}>Delete</button></>}>
          <p className="superadmin-delete-copy">This will remove the client from the frontend list. You can connect this action to the backend later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}
