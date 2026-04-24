import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import {
  companyAdminOrganizationQuickActions,
} from '../data/masterData';
import {
  loadDepartments,
  loadDesignations,
  createDepartment,
  updateDepartment,
  deleteDepartment as deleteDepartmentAPI,
  createDesignation,
  updateDesignation,
  deleteDesignation as deleteDesignationAPI,
} from '../../../services/masterDataService';

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

function cloneEntries(entries) {
  return entries.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status || 'Active',
  }));
}

function createDefaultState() {
  return {
    departments: [],
    designations: [],
  };
}

async function loadOrganization() {
  try {
    const [departments, designations] = await Promise.all([
      loadDepartments(),
      loadDesignations(),
    ]);
    
    return {
      departments: cloneEntries(departments),
      designations: cloneEntries(designations),
    };
  } catch (error) {
    console.error('Error loading organization data:', error);
    return createDefaultState();
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
  const [organization, setOrganization] = useState(createDefaultState());
  const [departmentName, setDepartmentName] = useState('');
  const [designationName, setDesignationName] = useState('');
  const [departmentError, setDepartmentError] = useState('');
  const [designationError, setDesignationError] = useState('');
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [editingDesignationId, setEditingDesignationId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Validation helper functions
  const validateDepartmentName = (name, isEditing = false, editingId = null) => {
    const errors = [];
    const trimmed = name.trim();
    
    if (!trimmed) {
      errors.push('Department name is required.');
    } else if (trimmed.length < 2) {
      errors.push('Department name must be at least 2 characters.');
    } else if (trimmed.length > 100) {
      errors.push('Department name cannot exceed 100 characters.');
    } else if (!isEditing && organization.departments.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
      errors.push('This department already exists.');
    } else if (isEditing && organization.departments.some((item) =>
      item.id !== editingId && item.name.toLowerCase() === trimmed.toLowerCase()
    )) {
      errors.push('Another department with this name already exists.');
    }
    
    return errors;
  };
  
  const validateDesignationName = (name, isEditing = false, editingId = null) => {
    const errors = [];
    const trimmed = name.trim();
    
    if (!trimmed) {
      errors.push('Designation name is required.');
    } else if (trimmed.length < 2) {
      errors.push('Designation name must be at least 2 characters.');
    } else if (trimmed.length > 100) {
      errors.push('Designation name cannot exceed 100 characters.');
    } else if (!isEditing && organization.designations.some((item) => item.name.toLowerCase() === trimmed.toLowerCase())) {
      errors.push('This designation already exists.');
    } else if (isEditing && organization.designations.some((item) =>
      item.id !== editingId && item.name.toLowerCase() === trimmed.toLowerCase()
    )) {
      errors.push('Another designation with this name already exists.');
    }
    
    return errors;
  };

  // Load organization data on component mount
  useEffect(() => {
    async function fetchOrganization() {
      setLoading(true);
      try {
        const orgData = await loadOrganization();
        setOrganization(orgData);
      } catch (error) {
        console.error('Failed to load organization data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrganization();
  }, []);

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

  const addDepartment = async (event) => {
    event.preventDefault();
    const value = departmentName.trim();
    
    // Use the validation helper
    const validationErrors = validateDepartmentName(value, !!editingDepartmentId, editingDepartmentId);
    if (validationErrors.length > 0) {
      setDepartmentError(validationErrors.join(' '));
      return;
    }

    const departmentData = {
      name: value,
      status: 'Active',
      code: `DEP-${Date.now().toString().slice(-6)}`,
    };

    try {
      if (editingDepartmentId) {
        // Update existing department
        const result = await updateDepartment(editingDepartmentId, departmentData);
        if (result.success) {
          setOrganization((current) => ({
            ...current,
            departments: current.departments.map((item) =>
              item.id === editingDepartmentId ? result.data : item
            ),
          }));
        } else {
          setDepartmentError(result.message || 'Failed to update department');
          return;
        }
      } else {
        // Create new department
        const result = await createDepartment(departmentData);
        if (result.success) {
          setOrganization((current) => ({
            ...current,
            departments: [result.data, ...current.departments],
          }));
        } else {
          setDepartmentError(result.message || 'Failed to create department');
          return;
        }
      }
      
      setDepartmentName('');
      setDepartmentError('');
      setEditingDepartmentId(null);
    } catch (error) {
      console.error('Error saving department:', error);
      setDepartmentError('An error occurred while saving the department');
    }
  };

  const addDesignation = async (event) => {
    event.preventDefault();
    const value = designationName.trim();
    
    // Use the validation helper
    const validationErrors = validateDesignationName(value, !!editingDesignationId, editingDesignationId);
    if (validationErrors.length > 0) {
      setDesignationError(validationErrors.join(' '));
      return;
    }

    const designationData = {
      name: value,
      status: 'Active',
      note: 'Level 1', // Default level
    };

    try {
      if (editingDesignationId) {
        // Update existing designation
        const result = await updateDesignation(editingDesignationId, designationData);
        if (result.success) {
          setOrganization((current) => ({
            ...current,
            designations: current.designations.map((item) =>
              item.id === editingDesignationId ? result.data : item
            ),
          }));
        } else {
          setDesignationError(result.message || 'Failed to update designation');
          return;
        }
      } else {
        // Create new designation
        const result = await createDesignation(designationData);
        if (result.success) {
          setOrganization((current) => ({
            ...current,
            designations: [result.data, ...current.designations],
          }));
        } else {
          setDesignationError(result.message || 'Failed to create designation');
          return;
        }
      }
      
      setDesignationName('');
      setDesignationError('');
      setEditingDesignationId(null);
    } catch (error) {
      console.error('Error saving designation:', error);
      setDesignationError('An error occurred while saving the designation');
    }
  };

  const deleteDepartment = async (id) => {
    try {
      const result = await deleteDepartmentAPI(id);
      if (result.success) {
        setOrganization((current) => ({
          ...current,
          departments: current.departments.filter((item) => item.id !== id),
        }));
        if (editingDepartmentId === id) {
          setDepartmentName('');
          setEditingDepartmentId(null);
        }
      } else {
        console.error('Failed to delete department:', result.message);
        // Still remove from UI for better UX
        setOrganization((current) => ({
          ...current,
          departments: current.departments.filter((item) => item.id !== id),
        }));
        if (editingDepartmentId === id) {
          setDepartmentName('');
          setEditingDepartmentId(null);
        }
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      // Fallback: remove from UI
      setOrganization((current) => ({
        ...current,
        departments: current.departments.filter((item) => item.id !== id),
      }));
      if (editingDepartmentId === id) {
        setDepartmentName('');
        setEditingDepartmentId(null);
      }
    }
  };

  const deleteDesignation = async (id) => {
    try {
      const result = await deleteDesignationAPI(id);
      if (result.success) {
        setOrganization((current) => ({
          ...current,
          designations: current.designations.filter((item) => item.id !== id),
        }));
        if (editingDesignationId === id) {
          setDesignationName('');
          setEditingDesignationId(null);
        }
      } else {
        console.error('Failed to delete designation:', result.message);
        // Still remove from UI for better UX
        setOrganization((current) => ({
          ...current,
          designations: current.designations.filter((item) => item.id !== id),
        }));
        if (editingDesignationId === id) {
          setDesignationName('');
          setEditingDesignationId(null);
        }
      }
    } catch (error) {
      console.error('Error deleting designation:', error);
      // Fallback: remove from UI
      setOrganization((current) => ({
        ...current,
        designations: current.designations.filter((item) => item.id !== id),
      }));
      if (editingDesignationId === id) {
        setDesignationName('');
        setEditingDesignationId(null);
      }
    }
  };

  const sectionTitle = tab === 'overview' ? 'Organization' : tab === 'department' ? 'Department' : 'Designation';

  // Show loading state
  if (loading) {
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

        <div className="superadmin-package-layout" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div className="superadmin-package-loading">
            <div className="spinner"></div>
            <p>Loading organization data...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

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
