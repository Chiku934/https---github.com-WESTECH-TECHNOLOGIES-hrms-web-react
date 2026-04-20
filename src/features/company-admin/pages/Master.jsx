import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import {
  companyAdminOrganizationQuickActions,
  companyAdminOrganizationSeed,
} from '../data/masterData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'department', label: 'Department' },
  { key: 'designation', label: 'Designation' },
];

const tabToHash = {
  overview: '#overview',
  department: '#department',
  designation: '#designation',
};

const hashToTab = {
  '#overview': 'overview',
  '#department': 'department',
  '#designation': 'designation',
};

const sidebarActiveKeyMap = {
  overview: 'company-admin-organization-overview',
  department: 'company-admin-organization-department',
  designation: 'company-admin-organization-designation',
};

const storageKey = 'company_admin_organization_settings';

function cloneEntries(entries) {
  return entries.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status || 'Active',
  }));
}

function createDefaultState() {
  return {
    departments: cloneEntries(companyAdminOrganizationSeed.departments),
    designations: cloneEntries(companyAdminOrganizationSeed.designations),
  };
}

function migrateLegacyRecords(records) {
  return {
    departments: records
      .filter((item) => item.type === 'Department')
      .map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status || 'Active',
      })),
    designations: records
      .filter((item) => item.type === 'Designation')
      .map((item) => ({
        id: item.id,
        name: item.name,
        status: item.status || 'Active',
      })),
  };
}

function loadOrganization() {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.departments) && Array.isArray(parsed.designations)) {
        return {
          departments: cloneEntries(parsed.departments),
          designations: cloneEntries(parsed.designations),
        };
      }

      if (Array.isArray(parsed)) {
        return migrateLegacyRecords(parsed);
      }
    }

    const legacy = window.localStorage.getItem('company_admin_master_settings');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        return migrateLegacyRecords(parsed);
      }
    }
  } catch {
    return createDefaultState();
  }

  return createDefaultState();
}

function saveOrganization(records) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }
}

function SmallCard({ title, children, className = '' }) {
  return (
    <section className={`dashboard-card superadmin-package-mini-card ${className}`.trim()}>
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

function initialsFromName(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function StatusChip({ status }) {
  return <span className={`role-status-chip tone-${String(status).toLowerCase()}`}>{status}</span>;
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="superadmin-grid-empty">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      className={`superadmin-package-tab ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </button>
  );
}

function OrganizationOverview({ organization, setTab, location, navigate }) {
  const totalDepartments = organization.departments.length;
  const totalDesignations = organization.designations.length;
  const totalRecords = totalDepartments + totalDesignations;
  const activeRecords = [...organization.departments, ...organization.designations].filter((item) => item.status === 'Active').length;
  const latestDepartment = organization.departments[0]?.name || 'No department yet';
  const latestDesignation = organization.designations[0]?.name || 'No designation yet';

  return (
    <div className="dashboard-layout welcome-layout">
      <div className="welcome-main">
        <SmallCard title="Live Count">
          <div className="superadmin-list">
            <div className="superadmin-list-item">
              <span>Total Departments</span>
              <strong>{totalDepartments}</strong>
            </div>
            <div className="superadmin-list-item">
              <span>Total Designations</span>
              <strong>{totalDesignations}</strong>
            </div>
            <div className="superadmin-list-item">
              <span>Total Records</span>
              <strong>{totalRecords}</strong>
            </div>
            <div className="superadmin-list-item">
              <span>Active Records</span>
              <strong>{activeRecords}</strong>
            </div>
          </div>
        </SmallCard>
      </div>

      <div className="dashboard-right-col">
        <SmallCard title="Quick Actions">
          <div className="superadmin-package-insight">
            <strong>Keep organization values separate so departments and designations stay easy to manage.</strong>
            <span>Each section keeps one compact form on the left and a live list on the right.</span>
            <div className="superadmin-package-overview-actions">
              {(companyAdminOrganizationQuickActions || []).map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="superadmin-package-action"
                  onClick={() => setTab(action.label.includes('Department') ? 'department' : 'designation')}
                >
                  <strong>{action.label}</strong>
                  <span>{action.description}</span>
                </button>
              ))}
            </div>
          </div>
        </SmallCard>
      </div>
    </div>
  );
}

function OrganizationForm({
  title,
  fieldLabel,
  placeholder,
  value,
  onChange,
  onSubmit,
  submitLabel,
  error,
}) {
  return (
    <SmallCard title={title}>
      <form className="superadmin-package-form-grid" onSubmit={onSubmit} style={{ gridTemplateColumns: '1fr' }}>
        <label className="superadmin-package-form-field">
          <span>{fieldLabel}</span>
          <input value={value} onChange={onChange} placeholder={placeholder} />
          {error ? <small className="superadmin-package-error">{error}</small> : null}
        </label>
        <div className="superadmin-package-form-actions" style={{ justifyContent: 'flex-start' }}>
          <button type="submit" className="superadmin-package-modal-button primary">
            {submitLabel}
          </button>
        </div>
      </form>
    </SmallCard>
  );
}

function OrganizationTable({
  title,
  items,
  emptyTitle,
  emptySubtitle,
  columns,
  itemLabel,
  onEdit,
  onDelete,
}) {
  return (
    <SmallCard title={title}>
      {items.length ? (
        <div className="superadmin-package-table-card" style={{ boxShadow: 'none', border: 'none', padding: 0 }}>
          <table className="superadmin-package-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key} style={column.style}>
                    {column.label}
                  </th>
                ))}
                <th style={{ width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="superadmin-package-row">
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? column.render(item, index) : item[column.key]}
                    </td>
                  ))}
                  <td>
                    <div className="superadmin-package-actions">
                      <button
                        type="button"
                        className="superadmin-grid-icon-button edit"
                        onClick={() => onEdit(item)}
                        aria-label={`Edit ${itemLabel}`}
                      >
                        <Icon name="pen-to-square" size={14} />
                      </button>
                      <button
                        type="button"
                        className="superadmin-grid-icon-button danger"
                        onClick={() => onDelete(item.id)}
                        aria-label={`Delete ${itemLabel}`}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title={emptyTitle} subtitle={emptySubtitle} />
      )}
    </SmallCard>
  );
}

export default function CompanyAdminMaster() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [organization, setOrganization] = useState(() => loadOrganization());
  const [departmentName, setDepartmentName] = useState('');
  const [designationName, setDesignationName] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [designationError, setDesignationError] = useState('');
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [editingDesignationId, setEditingDesignationId] = useState(null);

  useEffect(() => {
    saveOrganization(organization);
  }, [organization]);

  useEffect(() => {
    const nextTab = hashToTab[location.hash] || 'overview';
    if (tab !== nextTab) {
      setTab(nextTab);
    }
  }, [location.hash, tab]);

  useEffect(() => {
    if (!location.hash) {
      navigate({ pathname: location.pathname, search: '', hash: tabToHash[tab] }, { replace: true });
    }
  }, [location.hash, location.pathname, navigate, tab]);

  const totalRecords = useMemo(
    () => organization.departments.length + organization.designations.length,
    [organization.departments.length, organization.designations.length],
  );

  const setTabAndHash = (nextTab) => {
    setTab(nextTab);
    navigate({ pathname: location.pathname, search: '', hash: tabToHash[nextTab] }, { replace: true });
  };

  const addDepartment = (event) => {
    event.preventDefault();
    const value = departmentName.trim();
    if (!value) {
      setDepartmentError('Department is required.');
      return;
    }
    if (!editingDepartmentId && organization.departments.some((item) => item.name.toLowerCase() === value.toLowerCase())) {
      setDepartmentError('This department already exists.');
      return;
    }

    setOrganization((current) => ({
      ...current,
      departments: editingDepartmentId
        ? current.departments.map((item) => (item.id === editingDepartmentId ? { ...item, name: value } : item))
        : [
            { id: String(current.departments.length + 1), name: value, status: 'Active' },
            ...current.departments,
          ],
    }));
    setDepartmentName('');
    setDepartmentError('');
    setEditingDepartmentId(null);
  };

  const addDesignation = (event) => {
    event.preventDefault();
    const value = designationName.trim();
    if (!value) {
      setDesignationError('Designation is required.');
      return;
    }
    if (!editingDesignationId && organization.designations.some((item) => item.name.toLowerCase() === value.toLowerCase())) {
      setDesignationError('This designation already exists.');
      return;
    }

    setOrganization((current) => ({
      ...current,
      designations: editingDesignationId
        ? current.designations.map((item) => (item.id === editingDesignationId ? { ...item, name: value } : item))
        : [
            { id: String(current.designations.length + 1), name: value, status: 'Active' },
            ...current.designations,
          ],
    }));
    setDesignationName('');
    setDesignationError('');
    setEditingDesignationId(null);
  };

  const deleteDepartment = (id) => {
    setOrganization((current) => ({
      ...current,
      departments: current.departments.filter((item) => item.id !== id),
    }));
    if (editingDepartmentId === id) {
      setDepartmentName('');
      setEditingDepartmentId(null);
    }
  };

  const deleteDesignation = (id) => {
    setOrganization((current) => ({
      ...current,
      designations: current.designations.filter((item) => item.id !== id),
    }));
    if (editingDesignationId === id) {
      setDesignationName('');
      setEditingDesignationId(null);
    }
  };

  const sectionTitle = tab === 'overview' ? 'Organization' : tab === 'department' ? 'Department' : 'Designation';

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
            onClick={(event) => {
              event.preventDefault();
              setTabAndHash(item.key);
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{sectionTitle}</div>
      </div>

      {tab === 'overview' ? (
        <OrganizationOverview
          organization={organization}
          setTab={setTabAndHash}
          location={location}
          navigate={navigate}
        />
      ) : null}

      {tab === 'department' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <OrganizationForm
              title="Create Department"
              fieldLabel="Enter Department"
              placeholder="Enter Department"
              value={departmentName}
              onChange={(event) => {
                setDepartmentName(event.target.value);
                if (departmentError) setDepartmentError('');
              }}
              onSubmit={addDepartment}
              submitLabel={editingDepartmentId ? 'Update Department' : 'Add Department'}
              error={departmentError}
            />
          </div>
          <div className="superadmin-package-workspace">
            <OrganizationTable
              title="Department List"
              items={organization.departments}
              columns={[
                { key: 'name', label: 'Department Name', render: (item) => item.name },
              ]}
              itemLabel="department"
              emptyTitle="No departments yet"
              emptySubtitle="Add a department from the form on the left."
              onEdit={(item) => {
                setDepartmentName(item.name);
                setEditingDepartmentId(item.id);
                setDepartmentError('');
              }}
              onDelete={deleteDepartment}
            />
          </div>
        </div>
      ) : null}

      {tab === 'designation' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <OrganizationForm
              title="Create Designation"
              fieldLabel="Enter Designation"
              placeholder="Enter Designation"
              value={designationName}
              onChange={(event) => {
                setDesignationName(event.target.value);
                if (designationError) setDesignationError('');
              }}
              onSubmit={addDesignation}
              submitLabel={editingDesignationId ? 'Update Designation' : 'Add Designation'}
              error={designationError}
            />
          </div>
          <div className="superadmin-package-workspace">
            <OrganizationTable
              title="Designation List"
              items={organization.designations}
              columns={[
                { key: 'sl', label: 'SL.No', style: { width: '100px' }, render: (_item, index) => String(index + 1) },
                {
                  key: 'avatar',
                  label: 'Image',
                  style: { width: '120px' },
                  render: (item) => (
                    <div className="superadmin-organization-avatar-cell">
                      <span className="superadmin-organization-avatar">{initialsFromName(item.name)}</span>
                    </div>
                  ),
                },
                { key: 'name', label: 'Designation Name', render: (item) => item.name },
              ]}
              itemLabel="designation"
              emptyTitle="No designations yet"
              emptySubtitle="Add a designation from the form on the left."
              onEdit={(item) => {
                setDesignationName(item.name);
                setEditingDesignationId(item.id);
                setDesignationError('');
              }}
              onDelete={deleteDesignation}
            />
          </div>
        </div>
      ) : null}

    </DashboardShell>
  );
}
