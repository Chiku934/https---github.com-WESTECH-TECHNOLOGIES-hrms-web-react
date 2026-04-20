import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import {
  hrEmployeeHighlights,
  hrEmployeeList,
  hrEmployeeMetrics,
  hrEmployeeQuickActions,
  hrEmployeeRoles,
  hrEmployeeStatuses,
} from '../data/employeeData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'employees', label: 'Employee List' },
  { key: 'create', label: 'Create Employee' },
];

const filters = ['All', ...hrEmployeeStatuses.slice(1)];
const roleFilters = ['All', ...hrEmployeeRoles];
const storageKey = 'hr_employee_management';

const emptyForm = {
  fullName: '',
  userName: '',
  employeeCode: '',
  department: '',
  designation: '',
  role: 'Employee',
  email: '',
  contact: '',
  status: 'Active',
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

function EmployeeRow({ item, onView, onEdit, onDelete, selected }) {
  return (
    <tr className={selected ? 'superadmin-package-row active' : 'superadmin-package-row'}>
      <td>
        <div className="superadmin-package-cell">
          <strong>{item.fullName}</strong>
          <span>{item.userName}</span>
        </div>
      </td>
      <td>{item.employeeCode}</td>
      <td>{item.department}</td>
      <td>{item.designation}</td>
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

function EmployeeForm({ formData, setFormData, onSubmit, submitLabel, errors = {} }) {
  return (
    <form className="superadmin-package-form-grid" onSubmit={onSubmit}>
      <label className="superadmin-package-form-field">
        <span>Full Name</span>
        <input value={formData.fullName} onChange={(event) => setFormData((current) => ({ ...current, fullName: event.target.value }))} placeholder="Enter employee name" />
        {errors.fullName ? <small className="superadmin-package-error">{errors.fullName}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Username</span>
        <input value={formData.userName} onChange={(event) => setFormData((current) => ({ ...current, userName: event.target.value }))} placeholder="Enter username" />
        {errors.userName ? <small className="superadmin-package-error">{errors.userName}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Employee Code</span>
        <input value={formData.employeeCode} onChange={(event) => setFormData((current) => ({ ...current, employeeCode: event.target.value }))} placeholder="Enter code" />
        {errors.employeeCode ? <small className="superadmin-package-error">{errors.employeeCode}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Department</span>
        <input value={formData.department} onChange={(event) => setFormData((current) => ({ ...current, department: event.target.value }))} placeholder="Enter department" />
        {errors.department ? <small className="superadmin-package-error">{errors.department}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Designation</span>
        <input value={formData.designation} onChange={(event) => setFormData((current) => ({ ...current, designation: event.target.value }))} placeholder="Enter designation" />
        {errors.designation ? <small className="superadmin-package-error">{errors.designation}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Role</span>
        <select value={formData.role} onChange={(event) => setFormData((current) => ({ ...current, role: event.target.value }))}>
          {hrEmployeeRoles.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Email</span>
        <input type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} placeholder="Enter email" />
        {errors.email ? <small className="superadmin-package-error">{errors.email}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Contact</span>
        <input value={formData.contact} onChange={(event) => setFormData((current) => ({ ...current, contact: event.target.value }))} placeholder="Enter contact number" />
        {errors.contact ? <small className="superadmin-package-error">{errors.contact}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
          {hrEmployeeStatuses.slice(1).map((item) => <option key={item}>{item}</option>)}
        </select>
        {errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}
      </label>
      <div className="superadmin-package-form-actions">
        <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function loadEmployees() {
  if (typeof window === 'undefined') return hrEmployeeList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return hrEmployeeList;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : hrEmployeeList;
  } catch {
    return hrEmployeeList;
  }
}

function saveEmployees(records) {
  if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(records));
}

export default function EmployeeManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(hrEmployeeQuickActions[0].label);
  const [employees, setEmployees] = useState(() => loadEmployees());
  const [selectedId, setSelectedId] = useState(loadEmployees()[0]?.id ?? null);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => saveEmployees(employees), [employees]);

  useEffect(() => {
    if (!employees.some((item) => item.id === selectedId)) {
      setSelectedId(employees[0]?.id ?? null);
    }
  }, [employees, selectedId]);

  const selected = useMemo(() => employees.find((item) => item.id === selectedId) ?? employees[0] ?? null, [employees, selectedId]);
  const viewItem = useMemo(() => employees.find((item) => item.id === viewId) ?? null, [employees, viewId]);
  const editItem = useMemo(() => employees.find((item) => item.id === editId) ?? null, [employees, editId]);
  const deleteItem = useMemo(() => employees.find((item) => item.id === deleteId) ?? null, [employees, deleteId]);

  useEffect(() => {
    if (editItem) {
      setFormData({
        fullName: editItem.fullName,
        userName: editItem.userName,
        employeeCode: editItem.employeeCode,
        department: editItem.department,
        designation: editItem.designation,
        role: editItem.role,
        email: editItem.email,
        contact: editItem.contact,
        status: editItem.status,
      });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editItem]);

  const filteredEmployees = useMemo(
    () =>
      employees.filter((item) => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const matchesRole = roleFilter === 'All' || item.role === roleFilter;
        const haystack = `${item.fullName} ${item.userName} ${item.employeeCode} ${item.department} ${item.designation} ${item.role} ${item.status}`.toLowerCase();
        return matchesStatus && matchesRole && haystack.includes(searchTerm.toLowerCase());
      }),
    [employees, roleFilter, searchTerm, statusFilter],
  );

  const statusCounts = useMemo(
    () =>
      hrEmployeeStatuses.slice(1).reduce((acc, status) => {
        acc[status] = employees.filter((item) => item.status === status).length;
        return acc;
      }, {}),
    [employees],
  );

  const roleCounts = useMemo(
    () =>
      hrEmployeeRoles.reduce((acc, role) => {
        acc[role] = employees.filter((item) => item.role === role).length;
        return acc;
      }, {}),
    [employees],
  );

  const startCreate = () => {
    setEditId(null);
    setFormErrors({});
    setFormData(emptyForm);
    setTab('create');
  };

  const goToEmployeeList = () => {
    setTab('employees');
    navigate({ pathname: location.pathname, search: '', hash: '#users' }, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.userName.trim()) errors.userName = 'Username is required.';
    if (!formData.employeeCode.trim()) errors.employeeCode = 'Employee code is required.';
    if (!formData.department.trim()) errors.department = 'Department is required.';
    if (!formData.designation.trim()) errors.designation = 'Designation is required.';
    if (!formData.email.trim()) errors.email = 'Email is required.';
    if (!formData.contact.trim()) errors.contact = 'Contact is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const next = { id: `e-${String(Date.now()).slice(-5)}`, ...formData };
    setEmployees((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    goToEmployeeList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setEmployees((current) => current.map((item) => (item.id === editId ? { ...item, ...formData } : item)));
    setSelectedId(editId);
    setEditId(null);
    setFormErrors({});
    goToEmployeeList();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setEmployees((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <DashboardShell activeKey="hr-employee-management" headerProps={{ companyText: 'HR' }}>
      <div className="superadmin-package-tabs">
        {tabs.map((item) => (
          <Link key={item.key} to={item.key === 'overview' ? '#overview' : item.key === 'users' ? '#users' : '#create'} replace className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`} onClick={() => setTab(item.key)}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : tab === 'employees' ? 'Employee Directory' : 'Create Employee'}</div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <SmallCard title="Employee Snapshot">
              <div className="superadmin-list">
                {hrEmployeeHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>

            <SmallCard title="Selected Employee">
              {selected ? (
                <div className="superadmin-package-detail superadmin-package-detail-compact">
                  <div><span>Name</span><strong>{selected.fullName}</strong></div>
                  <div><span>Role</span><strong>{selected.role}</strong></div>
                  <div><span>Department</span><strong>{selected.department}</strong></div>
                  <div><span>Status</span><strong>{selected.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Select an employee to preview the details.</div>}
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-insight">
                <strong>Keep the employee overview short and actionable.</strong>
                <span>The layout stays compact with just the employee queue, the selected record, and quick jumps.</span>
                <div className="superadmin-package-overview-actions">
                  <button type="button" className="superadmin-package-action" onClick={() => setActiveTab('employees')}>
                    <strong>Open List</strong>
                    <span>Review all employee records.</span>
                  </button>
                  <button type="button" className="superadmin-package-action" onClick={startCreateUser}>
                    <strong>Create Employee</strong>
                    <span>Open the creation flow.</span>
                  </button>
                </div>
              </div>
            </SmallCard>

            <SmallCard title="Overview Stats">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Total Employees</span><strong>{employees.length}</strong></div>
                <div className="superadmin-list-item"><span>Active</span><strong>{employees.filter((item) => item.status === 'Active').length}</strong></div>
                <div className="superadmin-list-item"><span>Pending</span><strong>{employees.filter((item) => item.status === 'Pending').length}</strong></div>
              </div>
            </SmallCard>

            <SmallCard title="Recent Employees">
              <div className="superadmin-list">
                {employees.slice(0, 3).map((item) => (
                  <div key={item.id} className="superadmin-list-item">
                    <span>{item.fullName}</span>
                    <strong>{item.status} · {item.role}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'employees' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Summary">
              <div className="superadmin-list">
                {hrEmployeeHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Selected Employee">
              {selected ? (
                <div className="superadmin-package-detail">
                  <div><span>Name</span><strong>{selected.fullName}</strong></div>
                  <div><span>Username</span><strong>{selected.userName}</strong></div>
                  <div><span>Department</span><strong>{selected.department}</strong></div>
                  <div><span>Status</span><strong>{selected.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Pick a row to preview the employee details.</div>}
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-filterbar">
              <div className="superadmin-package-search">
                <Icon name="search" size={14} />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search employee, username, code, designation" />
              </div>
            </div>
            <div className="superadmin-package-filters">
              {filters.map((item) => (
                <button key={item} type="button" className={`superadmin-package-filter ${statusFilter === item ? 'active' : ''}`} onClick={() => setStatusFilter(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="superadmin-package-filters">
              {roleFilters.map((item) => (
                <button key={item} type="button" className={`superadmin-package-filter ${roleFilter === item ? 'active' : ''}`} onClick={() => setRoleFilter(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="superadmin-package-table-card">
              <table className="superadmin-package-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length ? filteredEmployees.map((item) => (
                    <EmployeeRow
                      key={item.id}
                      item={item}
                      selected={selected?.id === item.id}
                      onView={(employee) => setViewId(employee.id)}
                      onEdit={(employee) => { setEditId(employee.id); setTab('create'); }}
                      onDelete={(employee) => setDeleteId(employee.id)}
                    />
                  )) : (
                    <tr><td colSpan={6}><div className="superadmin-empty-state">No employees found for this filter.</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'create' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Create Notes">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Mode</span><strong>{editId ? 'Editing employee' : 'Creating employee'}</strong></div>
                <div className="superadmin-list-item"><span>Storage</span><strong>localStorage demo</strong></div>
                <div className="superadmin-list-item"><span>Backend</span><strong>Payload ready</strong></div>
              </div>
            </SmallCard>
            <SmallCard title="Quick Actions">
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-form-card">
              <div className="dashboard-card-title">{editId ? 'Edit Employee' : 'New Employee Entry'}</div>
              <p className="superadmin-package-card-copy">Compact HR employee form with validation and backend-ready fields.</p>
              <EmployeeForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={editId ? submitEdit : submitCreate}
                submitLabel={editId ? 'Update Employee' : 'Create Employee'}
                errors={formErrors}
              />
              {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {false && tab === 'reports' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">
                {hrEmployeeMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Report Snapshot">
              <div className="superadmin-list">
                {hrEmployeeHighlights.map((item) => (
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
                  <button key={period} type="button" className="superadmin-package-report-pill active">
                    <Icon name="chart-line" size={14} /> {period}
                  </button>
                ))}
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Active Employees</strong><span>{hrEmployeeMetrics[1].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Onboarding</strong><span>{hrEmployeeMetrics[2].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Inactive</strong><span>{hrEmployeeMetrics[3].value}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {viewItem ? (
        <Modal title="View Employee" onClose={() => setViewId(null)} footer={<button type="button" className="superadmin-package-modal-button secondary" onClick={() => setViewId(null)}>Close</button>}>
          <div className="superadmin-view-summary">
            <div className="superadmin-view-summary-main">
              <span>Employee Record</span>
              <strong>{viewItem.fullName}</strong>
              <p>{viewItem.department}</p>
            </div>
            <div className="superadmin-view-summary-meta">
              <div><span>Role</span><strong>{viewItem.role}</strong></div>
              <div><span>Contact</span><strong>{viewItem.contact}</strong></div>
              <div><span>Status</span><strong>{viewItem.status}</strong></div>
            </div>
          </div>
          <div className="superadmin-package-detail view">
            <div><span>Username</span><strong>{viewItem.userName}</strong></div>
            <div><span>Code</span><strong>{viewItem.employeeCode}</strong></div>
            <div><span>Designation</span><strong>{viewItem.designation}</strong></div>
            <div><span>Email</span><strong>{viewItem.email}</strong></div>
          </div>
        </Modal>
      ) : null}

      {editItem ? (
        <Modal title="Edit Employee" onClose={() => setEditId(null)} footer={null}>
          <div className="superadmin-package-detail superadmin-edit-summary">
            <div><span>Editing</span><strong>{editItem.fullName}</strong></div>
            <div><span>Department</span><strong>{editItem.department}</strong></div>
            <div><span>Role</span><strong>{editItem.role}</strong></div>
            <div><span>Status</span><strong>{editItem.status}</strong></div>
          </div>
          <EmployeeForm formData={formData} setFormData={setFormData} onSubmit={submitEdit} submitLabel="Update Employee" errors={formErrors} />
        </Modal>
      ) : null}

      {deleteItem ? (
        <Modal
          title="Delete Employee"
          onClose={() => setDeleteId(null)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">This will remove the employee from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}
