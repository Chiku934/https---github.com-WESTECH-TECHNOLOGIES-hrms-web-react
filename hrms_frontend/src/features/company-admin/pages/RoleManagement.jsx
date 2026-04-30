import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Input, message, Modal } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import CompanyAdminGridHeader from '../components/CompanyAdminGridHeader';
import roleService from '../../../services/roleService';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import '../../super-admin/styles/packages.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'list', label: 'Roles' },
  { key: 'create', label: 'Create Role' },
];

const tabToHash = {
  overview: '#overview',
  list: '#list',
  create: '#create',
};

const hashToTab = {
  '#overview': 'overview',
  '#list': 'list',
  '#create': 'create',
};

const sidebarActiveKeyMap = {
  overview: 'company-admin-role-overview',
  list: 'company-admin-role-list',
  create: 'company-admin-role-create',
};

const permissionOptions = [
  { label: 'Manage Users', value: 'manage_users' },
  { label: 'Manage Roles', value: 'manage_roles' },
  { label: 'Manage Permissions', value: 'manage_permissions' },
  { label: 'Manage Departments', value: 'manage_departments' },
];

const emptyForm = {
  id: null,
  name: '',
  description: '',
  permissions: [],
  isActive: true,
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

function RoleGridEmptyOverlay({ title, subtitle }) {
  return (
    <div className="superadmin-grid-empty">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function RoleNameCell({ data }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-name-cell">
      <strong>{data.name}</strong>
      <div className="superadmin-grid-name-meta">
        <span>{data.description || 'No description provided'}</span>
      </div>
    </div>
  );
}

function RolePermissionsCell({ value }) {
  const count = Array.isArray(value) ? value.length : 0;

  return (
    <div className="superadmin-grid-name-meta">
      <strong>{count}</strong>
      <span>permission{count === 1 ? '' : 's'}</span>
    </div>
  );
}

function RoleStatusCell({ value }) {
  const tone = value ? 'green' : 'slate';
  return <span className={`role-status-chip tone-${tone}`}>{value ? 'Active' : 'Inactive'}</span>;
}

function RoleActionsCell({ data, onEdit, onDelete }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-actions">
      <button
        type="button"
        className="superadmin-grid-icon-button edit"
        onClick={() => onEdit?.(data)}
        aria-label="Edit role"
      >
        <Icon name="pen-to-square" size={14} />
      </button>
      <button
        type="button"
        className="superadmin-grid-icon-button danger"
        onClick={() => onDelete?.(data)}
        aria-label="Delete role"
      >
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

export default function RoleManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tabs[0].key);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await roleService.listRoles();
      setRoles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load roles:', error);
      message.error('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const nextTab = hash && hashToTab[hash] ? hashToTab[hash] : tabs[0].key;

      if (activeTab !== nextTab) {
        setActiveTab(nextTab);
      }

      if (!hash) {
        navigate({ pathname: location.pathname, search: '', hash: tabToHash[nextTab] }, { replace: true });
      }

      if (nextTab === 'list' || nextTab === 'create') {
        fetchRoles();
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [activeTab, location.pathname, navigate]);

  const switchTab = (nextTab) => {
    setActiveTab(nextTab);
    navigate({ pathname: location.pathname, search: '', hash: tabToHash[nextTab] }, { replace: true });

    if (nextTab === 'list' || nextTab === 'create') {
      fetchRoles();
    }
  };

  const openCreateForm = () => {
    setFormData(emptyForm);
    setFormErrors({});
    switchTab('create');
  };

  const openEditForm = (role) => {
    const nextRole = {
      id: role.id ?? null,
      name: role.name ?? '',
      description: role.description ?? '',
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
      isActive: role.isActive ?? true,
    };

    setFormData(nextRole);
    setFormErrors({});
    switchTab('create');
  };

  const updateFormField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((current) => ({ ...current, [field]: '' }));
    }
  };

  const filteredRoles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return roles;

    return roles.filter((role) => {
      const haystack = [
        role.name,
        role.description,
        role.permissions?.join(' '),
        role.isActive ? 'active' : 'inactive',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [roles, searchTerm]);

  const roleMetrics = useMemo(() => {
    const activeRoles = roles.filter((role) => role.isActive).length;
    const inactiveRoles = roles.length - activeRoles;
    const permissionsAssigned = roles.reduce((total, role) => total + (Array.isArray(role.permissions) ? role.permissions.length : 0), 0);
    const latestRole = roles[roles.length - 1]?.name || 'No roles';

    return [
      { label: 'Total Roles', value: String(roles.length), change: `${activeRoles} active` },
      { label: 'Active Roles', value: String(activeRoles), change: `${inactiveRoles} inactive` },
      { label: 'Permission Links', value: String(permissionsAssigned), change: 'Across role records' },
      { label: 'Latest Role', value: latestRole, change: 'Most recently loaded' },
    ];
  }, [roles]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);

  const roleGridColumns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Role',
      minWidth: 240,
      flex: 1.1,
      filter: 'agTextColumnFilter',
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'shield' },
      cellRenderer: RoleNameCell,
    },
    {
      field: 'description',
      headerName: 'Description',
      minWidth: 280,
      flex: 1.2,
      filter: 'agTextColumnFilter',
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'comment-dots' },
      valueFormatter: ({ value }) => value || '-',
    },
    {
      field: 'permissions',
      headerName: 'Permissions',
      width: 150,
      filter: 'agNumberColumnFilter',
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'key' },
      cellRenderer: RolePermissionsCell,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: RoleStatusCell,
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
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'ellipsis-vertical', showMenu: false, enableFilterButton: false },
      cellRenderer: RoleActionsCell,
      cellRendererParams: {
        onEdit: openEditForm,
        onDelete: (role) => {
          Modal.confirm({
            title: 'Are you sure you want to delete this role?',
            content: 'This action cannot be undone.',
            okText: 'Delete',
            okButtonProps: { danger: true },
            onOk: async () => {
              try {
                await roleService.deleteRole(role.id);
                message.success('Role deleted successfully');
                fetchRoles();
              } catch (error) {
                console.error('Failed to delete role:', error);
                message.error('Failed to delete role');
              }
            },
          });
        },
      },
    },
  ], []);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
      permissions: Array.isArray(values.permissions) ? values.permissions : [],
      isActive: values.isActive ?? true,
    };

    if (!payload.name) {
      setFormErrors((current) => ({ ...current, name: 'Please input the role name!' }));
      return;
    }

    if (!payload.description) {
      setFormErrors((current) => ({ ...current, description: 'Please input the role description!' }));
      return;
    }

    if (!payload.permissions.length) {
      setFormErrors((current) => ({ ...current, permissions: 'At least one permission is required' }));
      return;
    }

    try {
      setIsLoading(true);
      setFormErrors({});

      if (formData.id) {
        await roleService.updateRole(formData.id, payload);
        message.success('Role updated successfully');
      } else {
        await roleService.createRole(payload);
        message.success('Role created successfully');
      }

      setFormData(emptyForm);
      switchTab('list');
    } catch (error) {
      console.error('Role operation failed:', error);
      message.error(error.message || 'Failed to save role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setFormErrors({});
    switchTab('list');
  };

  const overview = (
    <div className="dashboard-layout welcome-layout">
      <div className="welcome-main">
        <SmallCard title="Role Summary">
          <div className="superadmin-list">
            {roleMetrics.slice(0, 2).map((metric) => (
              <div key={metric.label} className="superadmin-list-item">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </SmallCard>

        <SmallCard title="Permission Snapshot">
          <div className="superadmin-list">
            {permissionOptions.map((item) => (
              <div key={item.value} className="superadmin-list-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </SmallCard>
      </div>

      <div className="dashboard-right-col">
        <SmallCard title="Quick Actions">
          <div className="superadmin-package-insight">
            <strong>Keep role setup in the same card-and-grid pattern as company admin attendance.</strong>
            <span>Create, review, and remove roles from the same dashboard shell without changing the workflow.</span>
            <div className="superadmin-package-overview-actions">
              <button type="button" className="superadmin-package-action" onClick={() => switchTab('list')}>
                <strong>Open Role List</strong>
                <span>Review all configured roles.</span>
              </button>
              <button type="button" className="superadmin-package-action" onClick={openCreateForm}>
                <strong>Create Role</strong>
                <span>Add a new role entry.</span>
              </button>
            </div>
          </div>
        </SmallCard>

        <SmallCard title="Metrics">
          <div className="superadmin-package-detail superadmin-package-detail-compact">
            {roleMetrics.map((metric) => (
              <StatBlock key={metric.label} metric={metric} />
            ))}
          </div>
        </SmallCard>
      </div>
    </div>
  );

  const listView = (
    <div className="superadmin-package-layout company-admin-list-page">
      <div className="superadmin-package-workspace">
        <div className="superadmin-package-table-card superadmin-master-grid-card">
          <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
            <div className="superadmin-master-searchbar-left">
              <div className="superadmin-package-search superadmin-master-search">
                <Icon name="search" size={14} />
                <input
                  type="text"
                  placeholder="Search role name, description, permissions"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>
            <div className="superadmin-master-searchbar-right">
              <button type="button" className="superadmin-master-action-button tone-primary" onClick={openCreateForm}>
                <Icon name="plus" size={14} />
                <span>Create Role</span>
              </button>
            </div>
          </div>

          <div className="superadmin-master-grid superadmin-package-grid">
            <AgGridReact
              theme="legacy"
              rowData={filteredRoles}
              columnDefs={roleGridColumns}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              animateRows
              getRowId={(params) => String(params.data.id ?? params.data.name)}
              suppressCellFocus
              pagination
              paginationPageSize={6}
              paginationPageSizeSelector={[6, 10, 15]}
              headerHeight={52}
              rowHeight={56}
              noRowsOverlayComponent={RoleGridEmptyOverlay}
              noRowsOverlayComponentParams={{
                title: 'No roles found',
                subtitle: 'Try a different search term or create a new role.',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const createView = (
    <div className="superadmin-package-layout">
      <div className="superadmin-package-workspace superadmin-package-full">
        <div className="superadmin-package-form-card superadmin-package-full">
          <h4>{formData.id ? 'Edit Role' : 'Create New Role'}</h4>
          <p className="superadmin-package-card-copy">
            Keep the same form structure and save flow, while matching the company-admin page styling.
          </p>

          <form
            className="superadmin-package-form-grid"
            style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit(formData);
            }}
          >
            <label className="superadmin-package-form-field">
              <span>Role Name</span>
              <Input
                value={formData.name}
                onChange={(event) => updateFormField('name', event.target.value)}
                placeholder="Enter role name"
              />
              {formErrors.name ? <small className="superadmin-package-error">{formErrors.name}</small> : null}
            </label>

            <label className="superadmin-package-form-field">
              <span>Status</span>
              <Checkbox
                checked={formData.isActive}
                onChange={(event) => updateFormField('isActive', event.target.checked)}
              >
                Active role
              </Checkbox>
            </label>

            <label className="superadmin-package-form-field superadmin-project-wide-field">
              <span>Description</span>
              <Input.TextArea
                rows={4}
                value={formData.description}
                onChange={(event) => updateFormField('description', event.target.value)}
                placeholder="Enter role description"
              />
              {formErrors.description ? <small className="superadmin-package-error">{formErrors.description}</small> : null}
            </label>

            <div className="superadmin-package-form-field superadmin-project-wide-field">
              <span>Permissions</span>
              <Checkbox.Group
                options={permissionOptions}
                value={formData.permissions}
                onChange={(nextPermissions) => {
                  updateFormField('permissions', nextPermissions);
                }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}
              />
              {formErrors.permissions ? <small className="superadmin-package-error">{formErrors.permissions}</small> : null}
            </div>

            <div className="superadmin-package-form-actions">
              <button type="button" className="superadmin-package-modal-button secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="superadmin-package-modal-button primary" disabled={isLoading}>
                {formData.id ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardShell
      activeKey={sidebarActiveKeyMap[activeTab] || sidebarActiveKeyMap.overview}
      headerProps={{ companyText: 'Company Admin' }}
    >
      <div className="superadmin-package-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`superadmin-package-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => switchTab(tab.key)}
            aria-current={activeTab === tab.key ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">
          {activeTab === 'overview' ? 'Overview' : activeTab === 'list' ? 'Role Directory' : 'Role Editor'}
        </div>
      </div>

      {activeTab === 'overview' ? overview : null}
      {activeTab === 'list' ? listView : null}
      {activeTab === 'create' ? createView : null}
    </DashboardShell>
  );
}
