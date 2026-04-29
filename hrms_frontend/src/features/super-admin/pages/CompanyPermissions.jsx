// src/features/super-admin/pages/CompanyPermissions.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import { ROLES } from '../../../app/config/roles';
import { resolveEffectiveRoleFromStorage } from '../../../data/navigation/index.js';
import {
  getCompanyPermissions,
  upsertCompanyPermissions,
  getDefaultPermissions,
} from '../../company-setup/services/companyPermissionsService';
import { loadCompanySetupCompanies } from '../../company-setup/services/companySetupService';
import '../../super-admin/styles/packages.css';
import '../../super-admin/styles/clients.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([AllCommunityModule]);

const permissionTypeOptions = [
  { value: 'tab', label: 'Tab' },
  { value: 'feature', label: 'Feature' },
  { value: 'section', label: 'Section' },
];

const booleanOptions = [
  { value: true, label: 'Enabled' },
  { value: false, label: 'Disabled' },
];

function CompanyGridEmptyOverlay() {
  return (
    <div className="superadmin-grid-empty">
      <strong>No companies found</strong>
      <span>Try a different search term or adjust the filters.</span>
    </div>
  );
}

function CompanyGridHeader(props) {
  const {
    displayName,
    showFilter,
    enableFilterButton,
    headerIcon = 'list',
    column,
    showMenu = true,
    progressSort,
  } = props;
  const isFiltered = Boolean(column?.isFilterActive?.());
  const sortDirection = column?.getSort?.();
  const showFilterButton = enableFilterButton && showMenu;

  return (
    <div className="superadmin-grid-header">
      <button
        type="button"
        className="superadmin-grid-header-sort"
        onClick={() => progressSort?.(false)}
        aria-label={`Sort ${displayName}`}
      >
        <Icon name={headerIcon} size={11} />
        <span className="superadmin-grid-header-title">{displayName}</span>
        <span className={`superadmin-grid-sort-icons ${sortDirection ? 'is-sorted' : ''}`}>
          <Icon name="arrow-up" size={9} className={sortDirection === 'asc' ? 'is-active' : ''} />
          <Icon name="arrow-down" size={9} className={sortDirection === 'desc' ? 'is-active' : ''} />
        </span>
      </button>
      {showFilterButton ? (
        <button
          type="button"
          className={`superadmin-grid-header-filter ${isFiltered ? 'active' : ''}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            showFilter?.(event.currentTarget);
          }}
          aria-label={`Filter ${displayName}`}
        >
          <Icon name="filter" size={10} />
        </button>
      ) : null}
      {isFiltered ? <span className="superadmin-grid-header-badge" /> : null}
    </div>
  );
}

function CompanyCell({ data }) {
  if (!data) return null;
  return (
    <div className="superadmin-client-cell">
      <strong>{data.name}</strong>
      <span>{data.legalName}</span>
    </div>
  );
}

function CompanyActionsCell({ data, onManagePermissions }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-actions">
      <button 
        type="button" 
        className="superadmin-grid-icon-button edit" 
        onClick={() => onManagePermissions(data)} 
        aria-label="Manage company permissions"
      >
        <Icon name="key" size={14} />
      </button>
    </div>
  );
}

function PermissionCheckbox({ value, onChange }) {
  return (
    <div className="permission-checkbox">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`checkbox-indicator ${value ? 'checked' : ''}`}></span>
    </div>
  );
}

export default function CompanyPermissions() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const role = resolveEffectiveRoleFromStorage();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const companiesData = await loadCompanySetupCompanies(role);
        setCompanies(companiesData);
        
        // If companyId is provided in URL, select that company
        if (companyId) {
          const company = companiesData.find(c => String(c.id) === companyId);
          if (company) {
            setSelectedCompany(company);
            loadCompanyPermissions(company.id);
          }
        }
      } catch (err) {
        setError('Failed to load companies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [role, companyId]);

  const loadCompanyPermissions = async (companyId) => {
    try {
      setLoading(true);
      const permissionsData = await getCompanyPermissions(companyId);
      setPermissions(permissionsData);
    } catch (err) {
      setError('Failed to load company permissions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManagePermissions = async (company) => {
    try {
      setSelectedCompany(company);
      await loadCompanyPermissions(company.id);
    } catch (err) {
      setError('Failed to load company permissions');
      console.error(err);
    }
  };

  const handlePermissionChange = (index, field, value) => {
    const updatedPermissions = [...permissions];
    updatedPermissions[index] = {
      ...updatedPermissions[index],
      [field]: value
    };
    setPermissions(updatedPermissions);
  };

  const handleSavePermissions = async () => {
    if (!selectedCompany) return;
    
    try {
      setSaveLoading(true);
      await upsertCompanyPermissions(selectedCompany.id, permissions);
      setError('');
      alert('Company permissions saved successfully!');
    } catch (err) {
      setError('Failed to save company permissions');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddPermission = () => {
    setPermissions([
      ...permissions,
      {
        permission_key: '',
        permission_type: 'tab',
        enabled: true
      }
    ]);
  };

  const handleRemovePermission = (index) => {
    if (permissions.length <= 1) return;
    
    const updatedPermissions = [...permissions];
    updatedPermissions.splice(index, 1);
    setPermissions(updatedPermissions);
  };

  const visibleCompanies = companies.filter(company => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    
    return (
      `${company.name} ${company.slug} ${company.legalName} ${company.plan} ${company.status}`
        .toLowerCase()
        .includes(query)
    );
  });

  const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  };

  const companyGridColumnDefs = [
    {
      headerName: 'Company',
      field: 'name',
      minWidth: 220,
      flex: 1.2,
      filter: 'agTextColumnFilter',
      cellRenderer: CompanyCell,
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'building', enableFilterButton: true },
    },
    {
      headerName: 'Slug',
      field: 'slug',
      width: 140,
      filter: 'agTextColumnFilter',
      cellClass: 'superadmin-grid-code',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'hashtag', enableFilterButton: true },
    },
    {
      headerName: 'Plan',
      field: 'plan',
      width: 120,
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'crown', enableFilterButton: true },
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 140,
      filter: 'agTextColumnFilter',
      cellRenderer: ({ value }) => (
        <span className={`role-status-chip tone-${value}`}>{value}</span>
      ),
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'circle-check', enableFilterButton: true },
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
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'ellipsis-vertical', showMenu: false, enableFilterButton: true },
      cellRenderer: CompanyActionsCell,
      cellRendererParams: {
        onManagePermissions: handleManagePermissions,
      },
    },
  ];

  return (
    <DashboardShell
      activeKey="company-permissions"
      headerProps={{ companyText: 'Super Admin' }}
    >
      <div className="dashboard-layout superadmin-package-layout company-admin-list-page">
        <div className="superadmin-package-workspace">
          <div className="superadmin-package-table-card superadmin-master-grid-card">
            <div className="superadmin-section-header company-list-table-header">
              <div className="dashboard-section-heading">Company Permissions Management</div>
            </div>

            <div className="superadmin-client-toolbar">
              <div className="superadmin-searchbox">
                <Icon name="search" size={12} />
                <input
                  type="text"
                  placeholder="Search company records"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>

            <div className="superadmin-master-grid superadmin-package-grid">
              <AgGridReact
                rowData={visibleCompanies}
                columnDefs={companyGridColumnDefs}
                defaultColDef={defaultColDef}
                domLayout="autoHeight"
                animateRows
                getRowId={(params) => params.data.id}
                suppressCellFocus
                pagination
                paginationPageSize={6}
                paginationPageSizeSelector={[6, 10, 15]}
                headerHeight={52}
                rowHeight={56}
                noRowsOverlayComponent={CompanyGridEmptyOverlay}
              />
            </div>
          </div>
        </div>

        {selectedCompany && (
          <div className="superadmin-package-workspace" style={{ marginTop: '24px' }}>
            <div className="superadmin-package-table-card superadmin-master-grid-card">
              <div className="superadmin-section-header company-list-table-header">
                <div className="dashboard-section-heading">
                  Permissions for: {selectedCompany.name} ({selectedCompany.slug})
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="superadmin-package-primary superadmin-action-small"
                    onClick={handleAddPermission}
                  >
                    Add Permission
                  </button>
                  <button
                    type="button"
                    className="superadmin-package-primary superadmin-action-small"
                    onClick={handleSavePermissions}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving...' : 'Save Permissions'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="superadmin-package-error" style={{ marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <div className="company-permissions-table">
                <table className="superadmin-list">
                  <thead>
                    <tr>
                      <th>Permission Key</th>
                      <th>Type</th>
                      <th>Enabled</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            value={permission.permission_key || ''}
                            onChange={(e) => handlePermissionChange(index, 'permission_key', e.target.value)}
                            placeholder="e.g., overview, users, etc."
                            className="permission-input"
                          />
                        </td>
                        <td>
                          <select
                            value={permission.permission_type || 'tab'}
                            onChange={(e) => handlePermissionChange(index, 'permission_type', e.target.value)}
                            className="permission-select"
                          >
                            {permissionTypeOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <PermissionCheckbox
                            value={permission.enabled !== false}
                            onChange={(checked) => handlePermissionChange(index, 'enabled', checked)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="superadmin-grid-icon-button danger"
                            onClick={() => handleRemovePermission(index)}
                            disabled={permissions.length <= 1}
                            aria-label="Remove permission"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}