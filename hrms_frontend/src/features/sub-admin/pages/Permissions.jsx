import React, { useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/clients.css';
import {
  subAdminPermissionHighlights,
  subAdminPermissionList,
  subAdminPermissionMetrics,
  subAdminPermissionQuickActions,
} from '../data/permissionsData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'create', label: 'Create Rule' },
  { key: 'reports', label: 'Reports' },
];

const filters = ['All', 'Approved', 'Pending', 'Rejected'];
const emptyForm = { module: '', access: 'Read', scope: '', status: 'Approved' };

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

function PermissionRow({ item, onView, onEdit, onDelete, selected }) {
  return (
    <tr className={selected ? 'superadmin-table-row active' : 'superadmin-table-row'}>
      <td>
        <div className="superadmin-client-cell">
          <strong>{item.module}</strong>
          <span>{item.scope}</span>
        </div>
      </td>
      <td>{item.access}</td>
      <td>{item.scope}</td>
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

function PermissionForm({ formData, setFormData, onSubmit, submitLabel, errors = {} }) {
  return (
    <form className="superadmin-form-grid" onSubmit={onSubmit}>
      <label className="superadmin-form-field">
        <span>Module</span>
        <input
          value={formData.module}
          onChange={(event) => setFormData((current) => ({ ...current, module: event.target.value }))}
          placeholder="Enter module name"
        />
        {errors.module ? <small className="superadmin-package-error">{errors.module}</small> : null}
      </label>
      <label className="superadmin-form-field">
        <span>Access</span>
        <select
          value={formData.access}
          onChange={(event) => setFormData((current) => ({ ...current, access: event.target.value }))}
        >
          <option>Read</option>
          <option>Read / Update</option>
          <option>Limited</option>
          <option>Full</option>
        </select>
      </label>
      <label className="superadmin-form-field">
        <span>Scope</span>
        <input
          value={formData.scope}
          onChange={(event) => setFormData((current) => ({ ...current, scope: event.target.value }))}
          placeholder="Enter permission scope"
        />
        {errors.scope ? <small className="superadmin-package-error">{errors.scope}</small> : null}
      </label>
      <label className="superadmin-form-field">
        <span>Status</span>
        <select
          value={formData.status}
          onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
        >
          <option>Approved</option>
          <option>Pending</option>
          <option>Rejected</option>
        </select>
        {errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}
      </label>
      <div className="superadmin-form-actions">
        <button type="submit" className="superadmin-modal-button primary">{submitLabel}</button>
      </div>
    </form>
  );
}

export default function SubAdminPermissions() {
  const [tab, setTab] = useState('overview');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(subAdminPermissionQuickActions[0].label);
  const [searchTerm, setSearchTerm] = useState('');
  const [rules, setRules] = useState(subAdminPermissionList);
  const [selectedId, setSelectedId] = useState(subAdminPermissionList[0]?.id ?? null);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const selected = useMemo(() => rules.find((item) => item.id === selectedId) ?? rules[0] ?? null, [rules, selectedId]);
  const viewRule = useMemo(() => rules.find((item) => item.id === viewId) ?? null, [rules, viewId]);
  const editRule = useMemo(() => rules.find((item) => item.id === editId) ?? null, [rules, editId]);
  const deleteRule = useMemo(() => rules.find((item) => item.id === deleteId) ?? null, [rules, deleteId]);

  useEffect(() => {
    if (editRule) {
      setFormData({
        module: editRule.module,
        access: editRule.access,
        scope: editRule.scope,
        status: editRule.status,
      });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editRule]);

  const filtered = useMemo(
    () =>
      rules.filter((item) => {
        const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
        const haystack = `${item.module} ${item.access} ${item.scope} ${item.status}`.toLowerCase();
        return matchesFilter && haystack.includes(searchTerm.toLowerCase());
      }),
    [activeFilter, rules, searchTerm],
  );

  const startCreate = () => {
    setEditId(null);
    setFormErrors({});
    setFormData(emptyForm);
    setTab('create');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.module.trim()) errors.module = 'Module name is required.';
    if (!formData.access.trim()) errors.access = 'Access type is required.';
    if (!formData.scope.trim()) errors.scope = 'Scope is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const next = { id: `p-${String(Date.now()).slice(-5)}`, ...formData };
    setRules((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    setTab('permissions');
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setRules((current) => current.map((item) => (item.id === editId ? { ...item, ...formData } : item)));
    setSelectedId(editId);
    setEditId(null);
    setFormErrors({});
    setTab('permissions');
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setRules((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <DashboardShell activeKey="sub-admin-permissions" headerProps={{ companyText: 'Sub Admin' }}>
      <div className="superadmin-module-tabs">
        {tabs.map((item) => (
          <button key={item.key} type="button" className={`superadmin-module-tab ${tab === item.key ? 'active' : ''}`} onClick={() => setTab(item.key)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : tab === 'permissions' ? 'Permission Directory' : tab === 'create' ? 'Create Rule' : 'Reports'}</div>
        <div className="superadmin-section-actions">
          <button type="button" className="superadmin-module-primary superadmin-action-small" onClick={startCreate}>+ Add Rule</button>
          <button type="button" className="superadmin-module-secondary superadmin-action-small" onClick={() => setTab('reports')}>View Reports</button>
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {subAdminPermissionMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Permission Snapshot">
              <div className="superadmin-list">
                {subAdminPermissionHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Selected Rule">
              {selected ? (
                <div className="superadmin-package-detail">
                  <div><span>Module</span><strong>{selected.module}</strong></div>
                  <div><span>Access</span><strong>{selected.access}</strong></div>
                  <div><span>Scope</span><strong>{selected.scope}</strong></div>
                  <div><span>Status</span><strong>{selected.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Select a rule to preview the details.</div>}
            </SmallCard>
          </div>
          <div className="dashboard-right-col">
            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active"><Icon name="lock" size={14} /> Access</button>
                <button type="button" className="feed-tab"><Icon name="users" size={14} /> Rules</button>
                <button type="button" className="feed-tab"><Icon name="chart-line" size={14} /> Reports</button>
              </div>
              <div className="superadmin-action-grid">
                {subAdminPermissionQuickActions.map((action) => (
                  <button key={action.label} type="button" className={`superadmin-action-item ${activeAction === action.label ? 'active' : ''}`} onClick={() => setActiveAction(action.label)}>
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <SmallCard title="Quick Preview">
              <div className="superadmin-list">
                {rules.slice(0, 3).map((item) => (
                  <div key={item.id} className="superadmin-list-item">
                    <span>{item.module}</span>
                    <strong>{item.status}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'permissions' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {subAdminPermissionMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Summary">
              <div className="superadmin-list">
                {subAdminPermissionHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
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
              <div className="birthday-section-title">Permission Table</div>
              <div className="superadmin-client-toolbar">
                <div className="superadmin-searchbox">
                  <Icon name="lock" size={14} />
                  <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search module, access, scope" />
                </div>
                <button type="button" className="superadmin-filter-button" onClick={startCreate}>+ Add Rule</button>
              </div>
              <div className="superadmin-table-wrap">
                <table className="superadmin-table">
                  <thead>
                    <tr><th>Module</th><th>Access</th><th>Scope</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.length ? filtered.map((item) => (
                      <PermissionRow
                        key={item.id}
                        item={item}
                        selected={selected?.id === item.id}
                        onView={(rule) => setViewId(rule.id)}
                        onEdit={(rule) => setEditId(rule.id)}
                        onDelete={(rule) => setDeleteId(rule.id)}
                      />
                    )) : (
                      <tr><td colSpan={5}><div className="superadmin-empty-state">No permission rules found for this filter.</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="superadmin-detail-card">
                <div className="superadmin-detail-head">
                  <div>
                    <div className="dashboard-card-title">Selected Rule</div>
                    <span>{selected ? selected.scope : 'No rule selected'}</span>
                  </div>
                  {selected ? <span className={`role-status-chip tone-${selected.status.toLowerCase()}`}>{selected.status}</span> : null}
                </div>
                {selected ? (
                  <div className="superadmin-detail-grid">
                    <div><span>Module</span><strong>{selected.module}</strong></div>
                    <div><span>Access</span><strong>{selected.access}</strong></div>
                    <div><span>Scope</span><strong>{selected.scope}</strong></div>
                    <div><span>Status</span><strong>{selected.status}</strong></div>
                  </div>
                ) : (
                  <div className="superadmin-empty-state">Select a rule to preview the details.</div>
                )}
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
              <div className="birthday-section-title">New Permission Rule</div>
              <PermissionForm formData={formData} setFormData={setFormData} onSubmit={editId ? submitEdit : submitCreate} submitLabel={editId ? 'Update Rule' : 'Create Rule'} errors={formErrors} />
              {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'reports' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {subAdminPermissionMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
          </div>
          <div className="dashboard-right-col">
            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active"><Icon name="chart-line" size={14} /> Monthly</button>
                <button type="button" className="feed-tab"><Icon name="lock" size={14} /> Rules</button>
                <button type="button" className="feed-tab"><Icon name="users" size={14} /> Access</button>
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Approved Rules</strong><span>{subAdminPermissionMetrics[1].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Pending Rules</strong><span>{subAdminPermissionMetrics[2].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Rejected Rules</strong><span>{subAdminPermissionMetrics[3].value}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {viewRule ? (
        <Modal title="View Rule" onClose={() => setViewId(null)} footer={<button type="button" className="superadmin-modal-button secondary" onClick={() => setViewId(null)}>Close</button>}>
          <div className="superadmin-detail-grid view">
            <div><span>Module</span><strong>{viewRule.module}</strong></div>
            <div><span>Access</span><strong>{viewRule.access}</strong></div>
            <div><span>Scope</span><strong>{viewRule.scope}</strong></div>
            <div><span>Status</span><strong>{viewRule.status}</strong></div>
          </div>
        </Modal>
      ) : null}

      {editRule ? (
        <Modal title="Edit Rule" onClose={() => setEditId(null)} footer={null}>
          <PermissionForm formData={formData} setFormData={setFormData} onSubmit={submitEdit} submitLabel="Update Rule" errors={formErrors} />
        </Modal>
      ) : null}

      {deleteRule ? (
        <Modal
          title="Delete Rule"
          onClose={() => setDeleteId(null)}
          footer={(
            <>
              <button type="button" className="superadmin-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="superadmin-modal-button danger" onClick={confirmDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-delete-copy">This will remove the permission rule from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}
