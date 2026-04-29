import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import { ROLES } from '../../../app/config/roles';
import { resolveEffectiveRoleFromStorage } from '../../../data/navigation/index.js';
import { ROUTES } from '../../../router/routePaths';
import '../../super-admin/styles/packages.css';
import '../../super-admin/styles/clients.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  companySetupCompanyStatusOptions,
  companySetupCountryOptions,
  companySetupPlanOptions,
  companySetupRoleOptions,
  companySetupTimezoneOptions,
  companySetupUserStatusOptions,
} from '../data/companySetupData';
import {
  createCompany,
  createCompanyUser,
  loadCompanySetupCompanies,
  loadCompanySetupCompanyUsers,
  loadCompanySetupUsers,
  updateCompany,
  updateCompanyUser,
  deleteCompany,
  deleteCompanyUser,
} from '../services/companySetupService';

ModuleRegistry.registerModules([AllCommunityModule]);

const superAdminTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'companies', label: 'Companies' },
  { key: 'create', label: 'Create Company' },
];

const companyAdminTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Employee List' },
  { key: 'create', label: 'Create Employee' },
];

const tabToHash = {
  overview: '#overview',
  companies: '#companies',
  users: '#users',
  create: '#create',
};

const hashToTab = {
  '#overview': 'overview',
  '#companies': 'companies',
  '#users': 'users',
  '#create': 'create',
};

const emptyCompanyForm = {
  id: null,
  name: '',
  slug: '',
  legalName: '',
  countryCode: 'IN',
  timezone: 'Asia/Kolkata',
  plan: 'pro',
  status: 'active',
};

const emptyCompanyUserForm = {
  id: null,
  companyId: '',
  userId: '',
  employeeCode: '',
  role: ROLES.EMPLOYEE,
  status: 'active',
  joinedAt: '',
  leftAt: '',
};

function SmallCard({ title, children, className = '' }) {
  return (
    <section className={`dashboard-card superadmin-package-mini-card ${className}`.trim()}>
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

function toneForValue(value) {
  const normalized = String(value || '').toLowerCase().replace(/\s+/g, '-');
  return `tone-${normalized}`;
}

function normalizeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function capitalize(value) {
  return String(value || '')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getErrorMessage(error, fallback) {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    return error.message || error.error || fallback;
  }
  return fallback;
}

function validateCompanyForm(form, companies) {
  const errors = {};
  const name = form.name.trim();
  const slug = normalizeSlug(form.slug);

  if (!name) errors.name = 'Company name is required.';
  if (!slug) errors.slug = 'Slug is required.';
  if (slug && companies.some((company) => company.id !== form.id && company.slug.toLowerCase() === slug.toLowerCase())) {
    errors.slug = 'Slug must be unique.';
  }
  if (!form.legalName.trim()) errors.legalName = 'Legal name is required.';
  if (!form.countryCode) errors.countryCode = 'Country code is required.';
  if (!form.timezone) errors.timezone = 'Timezone is required.';
  if (!form.plan) errors.plan = 'Plan is required.';
  if (!form.status) errors.status = 'Status is required.';

  return errors;
}

function validateCompanyUserForm(form, companyUsers) {
  const errors = {};
  if (!form.companyId) errors.companyId = 'Select a company.';
  if (!form.userId) errors.userId = 'Select a user.';
  if (!form.employeeCode.trim()) errors.employeeCode = 'Employee code is required.';
  if (!form.role) errors.role = 'Role is required.';
  if (!form.status) errors.status = 'Status is required.';

  if (form.companyId && form.userId) {
    const duplicateUser = companyUsers.some(
      (companyUser) => companyUser.id !== form.id
        && String(companyUser.companyId) === String(form.companyId)
        && String(companyUser.userId) === String(form.userId)
    );
    if (duplicateUser) {
      errors.userId = 'That user is already linked to this company.';
    }
  }

  if (form.companyId && form.employeeCode.trim()) {
    const duplicateCode = companyUsers.some(
      (companyUser) => companyUser.id !== form.id
        && String(companyUser.companyId) === String(form.companyId)
        && companyUser.employeeCode.toLowerCase() === form.employeeCode.trim().toLowerCase()
    );
    if (duplicateCode) {
      errors.employeeCode = 'Employee code must be unique for the company.';
    }
  }

  return errors;
}

function TableCell({ title, subtitle }) {
  return (
    <div className="superadmin-client-cell">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function StatusChip({ value }) {
  return <span className={`role-status-chip ${toneForValue(value)}`}>{value}</span>;
}

function CompanyGridEmptyOverlay() {
  return (
    <div className="superadmin-grid-empty">
      <strong>No companies found</strong>
      <span>Try a different search term or adjust the filters.</span>
    </div>
  );
}

function CompanyUserGridEmptyOverlay() {
  return (
    <div className="superadmin-grid-empty">
      <strong>No company users found</strong>
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

function CompanyStatusCell({ value }) {
  return <span className={`role-status-chip ${toneForValue(value)}`}>{value}</span>;
}

function CompanyActionsCell({ data, onEdit, onDelete }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-actions">
      <button type="button" className="superadmin-grid-icon-button edit" onClick={() => onEdit(data)} aria-label="Edit company">
        <Icon name="pen-to-square" size={14} />
      </button>
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete(data)} aria-label="Delete company">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

function CompanyUserCell({ data }) {
  if (!data) return null;
  return (
    <div className="superadmin-client-cell">
      <strong>{data.fullName || 'User'}</strong>
      <span>{data.email || data.userName}</span>
    </div>
  );
}

function CompanyUserActionsCell({ data, onEdit, onDelete }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-actions">
      <button type="button" className="superadmin-grid-icon-button edit" onClick={() => onEdit(data)} aria-label="Edit company user">
        <Icon name="pen-to-square" size={14} />
      </button>
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete(data)} aria-label="Delete company user">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

export default function CompanySetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = resolveEffectiveRoleFromStorage();
  const persistentViewMode = window.localStorage.getItem('hrms_persistent_view_mode');
  const isSuperAdmin = role === ROLES.SUPER_ADMIN && persistentViewMode !== ROLES.COMPANY_ADMIN;
  const tabs = isSuperAdmin ? superAdminTabs : companyAdminTabs;
  const defaultTab = tabs[0].key;
  const [tab, setTab] = useState(defaultTab);
  const [companies, setCompanies] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [userPool, setUserPool] = useState([]);
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [companyErrors, setCompanyErrors] = useState({});
  const [companyUserForm, setCompanyUserForm] = useState(emptyCompanyUserForm);
  const [companyUserErrors, setCompanyUserErrors] = useState({});
  const [companyFilter, setCompanyFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (tab === 'create') return; // Don't override the create tab with hash changes
    
    const nextTab = hashToTab[location.hash] || defaultTab;
    if (tabs.some((item) => item.key === nextTab) && tab !== nextTab) {
      setTab(nextTab);
    }
  }, [defaultTab, location.hash, tab, tabs]);

  useEffect(() => {
    if (!location.hash && tab !== 'create') {
      navigate(tabToHash[tab] || '#overview', { replace: true });
    }
  }, [location.hash, navigate, tab]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const [nextCompanies, nextCompanyUsers, nextUsers] = await Promise.all([
          loadCompanySetupCompanies(role),
          loadCompanySetupCompanyUsers(role),
          loadCompanySetupUsers(role),
        ]);

        if (!isMounted) return;

        setCompanies(nextCompanies);
        setCompanyUsers(nextCompanyUsers);
        setUserPool(nextUsers);
        setCompanyFilter('all');
        setCompanyForm(emptyCompanyForm);
        setCompanyErrors({});
        setCompanyUserForm((current) => ({
          ...emptyCompanyUserForm,
          companyId: nextCompanies[0]?.id ? String(nextCompanies[0].id) : current.companyId || '',
        }));
        setCompanyUserErrors({});
      } catch (error) {
        if (isMounted) {
          setLoadError(getErrorMessage(error, 'Failed to load company setup data.'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [role]);

  const enrichedCompanyUsers = useMemo(() => companyUsers.map((item) => {
    const company = companies.find((record) => record.id === item.companyId) || item.company;
    const user = userPool.find((record) => record.id === item.userId) || item.user;

    return {
      ...item,
      companyName: company?.name || item.companyName || '',
      fullName: user?.fullName || user?.displayName || item.fullName || '',
      userName: user?.userName || item.userName || '',
      email: user?.email || item.email || '',
      phone: user?.phone || item.phone || '',
    };
  }), [companies, companyUsers, userPool]);

  const sidebarActiveKey = tab === 'companies'
    ? 'company-setup-companies'
    : tab === 'users'
      ? 'company-setup-users'
    : tab === 'create'
      ? 'company-setup-create'
      : 'company-setup-overview';
  const visibleCompanies = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((company) => (
      `${company.name} ${company.slug} ${company.legalName} ${company.plan} ${company.status}`
        .toLowerCase()
        .includes(query)
    ));
  }, [companies, searchTerm]);

  const companiesWithLinkedUsers = useMemo(() => visibleCompanies.map(company => ({
    ...company,
    linkedUsers: companyUsers.filter(item => item.companyId === company.id).length,
  })), [visibleCompanies, companyUsers]);

  const visibleCompanyUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return enrichedCompanyUsers.filter((item) => {
      const matchesCompany = companyFilter === 'all' || String(item.companyId) === String(companyFilter);
      const matchesSearch = !query || `${item.companyName} ${item.fullName} ${item.email} ${item.employeeCode} ${item.roleLabel} ${item.status}`
        .toLowerCase()
        .includes(query);
      return matchesCompany && matchesSearch;
    });
  }, [companyFilter, enrichedCompanyUsers, searchTerm]);


  const companyStats = useMemo(() => {
    const activeCompanies = companies.filter((company) => company.status === 'active').length;
    const activeAssignments = companyUsers.filter((item) => item.status === 'active').length;
    return [
      { label: 'Companies', value: String(companies.length), change: `${activeCompanies} active` },
      { label: 'Company Users', value: String(companyUsers.length), change: `${activeAssignments} active assignments` },
      { label: 'Users Pool', value: String(userPool.length), change: 'From users table' },
      { label: 'Roles', value: String(companySetupRoleOptions.length), change: 'Supported frontend roles' },
    ];
  }, [companyUsers.length, companies.length, userPool.length]);

  const companyOptions = useMemo(() => companies.map((company) => ({ value: String(company.id), label: `${company.name} (${company.slug})` })), [companies]);
  const userOptions = useMemo(() => userPool.map((user) => ({ value: String(user.id), label: `${user.displayName} - ${user.email}` })), [userPool]);

  useEffect(() => {
    if (!companyUserForm.companyId && companyOptions.length) {
      setCompanyUserForm((current) => ({ ...current, companyId: companyOptions[0].value }));
    }
  }, [companyOptions, companyUserForm.companyId]);

  useEffect(() => {
    if (!companyFilter || companyFilter === 'all') return;
    if (!companies.some((company) => String(company.id) === String(companyFilter))) {
      setCompanyFilter('all');
    }
  }, [companyFilter, companies]);

  const resetCompanyForm = () => {
    setCompanyForm(emptyCompanyForm);
    setCompanyErrors({});
  };

  const resetCompanyUserForm = () => {
    setCompanyUserForm({
      ...emptyCompanyUserForm,
      companyId: companyOptions[0]?.value || '',
    });
    setCompanyUserErrors({});
  };

  const submitCompany = async (event) => {
    event.preventDefault();
    const nextErrors = validateCompanyForm(companyForm, companies);
    setCompanyErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = {
      ...companyForm,
      name: companyForm.name.trim(),
      slug: normalizeSlug(companyForm.slug),
      legalName: companyForm.legalName.trim(),
      countryCode: companyForm.countryCode,
      timezone: companyForm.timezone,
      plan: companyForm.plan,
      status: companyForm.status,
    };

    try {
      const savedCompany = companyForm.id
        ? await updateCompany(companyForm.id, payload)
        : await createCompany(payload);

      setCompanies((current) => (
        companyForm.id
          ? current.map((company) => (company.id === companyForm.id ? savedCompany : company))
          : [...current, savedCompany]
      ));
      resetCompanyForm();
    } catch (error) {
      setCompanyErrors((current) => ({
        ...current,
        form: getErrorMessage(error, 'Failed to save company.'),
      }));
    }
  };

  const editCompany = (company) => {
    navigate('/super-admin/company-setup/create', {
      state: { company }
    });
  };

  const removeCompany = async (company) => {
    if (!window.confirm(`Delete ${company.name}? This will also remove related company-user links.`)) return;

    try {
      await deleteCompany(company.id);
      setCompanies((current) => current.filter((item) => item.id !== company.id));
      setCompanyUsers((current) => current.filter((item) => item.companyId !== company.id));
      if (String(companyFilter) === String(company.id)) {
        setCompanyFilter('all');
      }
      if (String(companyUserForm.companyId) === String(company.id)) {
        resetCompanyUserForm();
      }
    } catch (error) {
      setCompanyErrors({ form: getErrorMessage(error, 'Failed to delete company.') });
    }
  };

  const submitCompanyUser = async (event) => {
    event.preventDefault();
    const nextErrors = validateCompanyUserForm(companyUserForm, companyUsers);
    setCompanyUserErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const selectedCompanyRecord = companies.find((item) => String(item.id) === String(companyUserForm.companyId));
    const selectedUser = userPool.find((item) => String(item.id) === String(companyUserForm.userId));

    const payload = {
      companyId: Number(companyUserForm.companyId),
      userId: Number(companyUserForm.userId),
      employeeCode: companyUserForm.employeeCode.trim(),
      role: companyUserForm.role,
      status: companyUserForm.status,
      joinedAt: companyUserForm.joinedAt || null,
      leftAt: companyUserForm.leftAt || null,
    };

    try {
      const savedCompanyUser = companyUserForm.id
        ? await updateCompanyUser(companyUserForm.id, payload)
        : await createCompanyUser(payload);

      const nextCompanyUser = {
        ...savedCompanyUser,
        companyName: savedCompanyUser.company?.name || selectedCompanyRecord?.name || '',
        fullName: selectedUser?.displayName || selectedUser?.fullName || '',
        userName: selectedUser?.userName || '',
        email: selectedUser?.email || '',
      };

      setCompanyUsers((current) => (
        companyUserForm.id
          ? current.map((item) => (item.id === companyUserForm.id ? nextCompanyUser : item))
          : [...current, nextCompanyUser]
      ));
      resetCompanyUserForm();
    } catch (error) {
      setCompanyUserErrors((current) => ({
        ...current,
        form: getErrorMessage(error, 'Failed to save company user.'),
      }));
    }
  };

  const editCompanyUser = (companyUser) => {
    setCompanyUserForm({
      id: companyUser.id,
      companyId: String(companyUser.companyId),
      userId: String(companyUser.userId),
      employeeCode: companyUser.employeeCode,
      role: companyUser.role || ROLES.EMPLOYEE,
      status: companyUser.status || 'active',
      joinedAt: companyUser.joinedAt || '',
      leftAt: companyUser.leftAt || '',
      createdAt: companyUser.createdAt,
    });
    setCompanyUserErrors({});
    setTab('users');
    navigate(tabToHash.users, { replace: true });
  };

  const removeCompanyUser = async (companyUser) => {
    if (!window.confirm(`Delete ${companyUser.employeeCode} from ${companyUser.companyName || 'this company'}?`)) return;

    try {
      await deleteCompanyUser(companyUser.id);
      setCompanyUsers((current) => current.filter((item) => item.id !== companyUser.id));
    } catch (error) {
      setCompanyUserErrors({ form: getErrorMessage(error, 'Failed to delete company user.') });
    }
  };

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);

  const companyGridColumnDefs = useMemo(() => [
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
      valueFormatter: ({ value }) => capitalize(value),
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'crown', enableFilterButton: true },
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 140,
      filter: 'agTextColumnFilter',
      cellRenderer: CompanyStatusCell,
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'circle-check', enableFilterButton: true },
    },
    {
      headerName: 'Users',
      field: 'linkedUsers',
      width: 100,
      filter: 'agNumberColumnFilter',
      cellClass: 'superadmin-grid-number',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'users', enableFilterButton: true },
    },
    {
      headerName: 'Updated',
      field: 'updatedAt',
      width: 140,
      filter: 'agDateColumnFilter',
      valueFormatter: ({ value }) => value ? new Date(value).toLocaleDateString() : '-',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'calendar', enableFilterButton: true },
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
        onEdit: editCompany,
        onDelete: removeCompany,
      },
    },
  ], [editCompany, removeCompany]);

  const companyUserGridColumnDefs = useMemo(() => [
    {
      headerName: 'Company',
      field: 'companyName',
      minWidth: 200,
      flex: 1,
      filter: 'agTextColumnFilter',
      cellRenderer: ({ data }) => (
        <div className="superadmin-client-cell">
          <strong>{data.companyName || 'Company'}</strong>
          <span>#{data.companyId}</span>
        </div>
      ),
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'building', enableFilterButton: true },
    },
    {
      headerName: 'User',
      field: 'fullName',
      minWidth: 220,
      flex: 1.2,
      filter: 'agTextColumnFilter',
      cellRenderer: CompanyUserCell,
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'user', enableFilterButton: true },
    },
    {
      headerName: 'Role',
      field: 'role',
      width: 140,
      filter: 'agTextColumnFilter',
      cellRenderer: ({ value }) => <StatusChip value={value} />,
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'shield', enableFilterButton: true },
    },
    {
      headerName: 'Employee Code',
      field: 'employeeCode',
      width: 160,
      filter: 'agTextColumnFilter',
      cellClass: 'superadmin-grid-code',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'id-card', enableFilterButton: true },
    },
    {
      headerName: 'Status',
      field: 'status',
      width: 140,
      filter: 'agTextColumnFilter',
      cellRenderer: CompanyStatusCell,
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'circle-check', enableFilterButton: true },
    },
    {
      headerName: 'Joined',
      field: 'joinedAt',
      width: 140,
      filter: 'agDateColumnFilter',
      valueFormatter: ({ value }) => value || '-',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'calendar', enableFilterButton: true },
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
      cellRenderer: CompanyUserActionsCell,
      cellRendererParams: {
        onEdit: editCompanyUser,
        onDelete: removeCompanyUser,
      },
    },
  ], [editCompanyUser, removeCompanyUser]);

  const overview = (
    <div className="dashboard-layout welcome-layout">
      <div className="welcome-main">
        <div className="welcome-banner company-admin-welcome-banner">
          <div className="welcome-profile">
            <div className="welcome-banner-badge">CS</div>
            <div className="welcome-profile-copy">
              <h1>Company Setup</h1>
              <p>Use the same clean card structure as the package pages to register companies and keep the workflow easy to scan.</p>
            </div>
          </div>
        </div>

        <SmallCard title="Schema Focus" className="superadmin-package-form-card">
          <div className="superadmin-package-limit-guide">
            <div className="superadmin-package-limit-item">
              <div className="superadmin-package-limit-top">
                <strong>companies</strong>
                <span>Name, slug, legal name, plan, status</span>
              </div>
              <p>Use this section to create or update each company record.</p>
            </div>
            <div className="superadmin-package-limit-item">
              <div className="superadmin-package-limit-top">
                <strong>company_users</strong>
                <span>Company, user, employee code, status</span>
              </div>
              <p>Keep this area reserved for related user-linking workflows.</p>
            </div>
          </div>
        </SmallCard>

        <SmallCard title="Supported Roles" className="superadmin-package-form-card">
          <div className="superadmin-list">
            {companySetupRoleOptions.map((item) => (
              <div key={item.value} className="superadmin-list-item">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </SmallCard>
      </div>

      <div className="dashboard-right-col">
        <SmallCard title="Setup Metrics" className="superadmin-package-form-card">
          <div className="superadmin-package-detail superadmin-package-detail-compact">
            {companyStats.map((metric) => (
              <div key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small className="superadmin-package-detail-note">{metric.change}</small>
              </div>
            ))}
          </div>
        </SmallCard>

        <SmallCard title="Seed Companies" className="superadmin-package-form-card">
          <div className="superadmin-list">
            {companies.slice(0, 4).map((company) => (
              <div key={company.id} className="superadmin-list-item">
                <span>{company.name}</span>
                <strong>{company.plan}</strong>
              </div>
            ))}
          </div>
        </SmallCard>
      </div>
    </div>
  );

  const companiesTab = (
    <div className="dashboard-layout superadmin-package-layout company-admin-list-page">
      <div className="superadmin-package-workspace">
        <div className="superadmin-package-table-card superadmin-master-grid-card">
          <div className="superadmin-section-header company-list-table-header">
            <div className="dashboard-section-heading">Company Directory</div>
            <button
              type="button"
              className="superadmin-package-primary superadmin-action-small"
              onClick={() => navigate('/super-admin/company-setup/create')}
            >
              New Company
            </button>
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
              rowData={companiesWithLinkedUsers}
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
    </div>
  );

  const employeeListTab = (
    <div className="dashboard-layout superadmin-package-layout company-admin-list-page">
      <div className="superadmin-package-workspace">
        <div className="superadmin-package-table-card superadmin-master-grid-card">
          <div className="superadmin-section-header company-list-table-header">
            <div className="dashboard-section-heading">Employee List</div>
          </div>

          <div className="superadmin-client-toolbar" style={{ gap: 12, flexWrap: 'wrap' }}>
            <div className="superadmin-searchbox">
              <Icon name="search" size={12} />
              <input
                type="text"
                placeholder="Search employee assignments"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className="superadmin-searchbox" style={{ minWidth: 240 }}>
              <Icon name="building" size={12} />
              <select value={companyFilter} onChange={(event) => setCompanyFilter(event.target.value)}>
                <option value="all">All companies</option>
                {companyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="superadmin-master-grid superadmin-package-grid">
            <AgGridReact
              rowData={visibleCompanyUsers}
              columnDefs={companyUserGridColumnDefs}
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
              noRowsOverlayComponent={CompanyUserGridEmptyOverlay}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const createEmployeeTab = (
    <div className="dashboard-layout superadmin-package-layout company-admin-list-page">
      <div className="superadmin-package-workspace">
        <div className="superadmin-package-table-card superadmin-master-grid-card">
          <div className="superadmin-section-header company-list-table-header">
            <div className="dashboard-section-heading">Create Employee</div>
          </div>

          <SmallCard
            title={companyUserForm.id ? 'Edit Company User' : 'Assign Company User'}
            className="superadmin-package-form-card"
          >
            <form className="superadmin-package-form-grid" onSubmit={submitCompanyUser}>
              <label className="superadmin-package-form-field">
                <span>Company</span>
                <select
                  value={companyUserForm.companyId}
                  onChange={(event) => setCompanyUserForm((current) => ({ ...current, companyId: event.target.value }))}
                >
                  <option value="">Select company</option>
                  {companyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {companyUserErrors.companyId ? <small className="superadmin-package-error">{companyUserErrors.companyId}</small> : null}
              </label>

              <label className="superadmin-package-form-field">
                <span>User</span>
                <select
                  value={companyUserForm.userId}
                  onChange={(event) => setCompanyUserForm((current) => ({ ...current, userId: event.target.value }))}
                >
                  <option value="">Select user</option>
                  {userOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {companyUserErrors.userId ? <small className="superadmin-package-error">{companyUserErrors.userId}</small> : null}
              </label>

              <label className="superadmin-package-form-field">
                <span>Employee Code</span>
                <input
                  value={companyUserForm.employeeCode}
                  onChange={(event) => setCompanyUserForm((current) => ({ ...current, employeeCode: event.target.value }))}
                  placeholder="EMP001"
                />
                {companyUserErrors.employeeCode ? <small className="superadmin-package-error">{companyUserErrors.employeeCode}</small> : null}
              </label>

              <div className="superadmin-package-form-row superadmin-package-form-row-four">
                <label className="superadmin-package-form-field">
                  <span>Role</span>
                  <select
                    value={companyUserForm.role}
                    onChange={(event) => setCompanyUserForm((current) => ({ ...current, role: event.target.value }))}
                  >
                    {companySetupRoleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {companyUserErrors.role ? <small className="superadmin-package-error">{companyUserErrors.role}</small> : null}
                </label>

                <label className="superadmin-package-form-field">
                  <span>Status</span>
                  <select
                    value={companyUserForm.status}
                    onChange={(event) => setCompanyUserForm((current) => ({ ...current, status: event.target.value }))}
                  >
                    {companySetupUserStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {capitalize(option)}
                      </option>
                    ))}
                  </select>
                  {companyUserErrors.status ? <small className="superadmin-package-error">{companyUserErrors.status}</small> : null}
                </label>

                <label className="superadmin-package-form-field">
                  <span>Joined At</span>
                  <input
                    type="date"
                    value={companyUserForm.joinedAt}
                    onChange={(event) => setCompanyUserForm((current) => ({ ...current, joinedAt: event.target.value }))}
                  />
                </label>

                <label className="superadmin-package-form-field">
                  <span>Left At</span>
                  <input
                    type="date"
                    value={companyUserForm.leftAt}
                    onChange={(event) => setCompanyUserForm((current) => ({ ...current, leftAt: event.target.value }))}
                  />
                </label>
              </div>

              {companyUserErrors.form ? <small className="superadmin-package-error">{companyUserErrors.form}</small> : null}

              <div className="superadmin-package-form-actions">
                <button
                  type="button"
                  className="superadmin-package-modal-button secondary"
                  onClick={resetCompanyUserForm}
                >
                  Reset
                </button>
                <button type="submit" className="superadmin-package-modal-button primary">
                  {companyUserForm.id ? 'Update Assignment' : 'Assign User'}
                </button>
              </div>
            </form>
          </SmallCard>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardShell
      activeKey={sidebarActiveKey}
      headerProps={{ companyText: role === ROLES.SUPER_ADMIN ? 'Super Admin' : 'Company Admin' }}
      >
      {loadError ? (
        <div className="superadmin-package-error" style={{ marginBottom: 16 }}>
          {loadError}
        </div>
      ) : null}
      {loading ? (
        <div className="superadmin-package-detail-note" style={{ marginBottom: 16 }}>
          Loading company setup from the database...
        </div>
      ) : null}

      <div className="superadmin-package-tabs">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
            onClick={() => {
              if (isSuperAdmin && item.key === 'create') {
                navigate(`${ROUTES.companySetup}/create`, { replace: true });
                return;
              }

              setTab(item.key);
              if (item.key === 'create') {
                resetCompanyUserForm();
              } else {
                navigate(tabToHash[item.key] || '#overview', { replace: true });
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'overview' ? overview : null}
      {tab === 'companies' && isSuperAdmin ? companiesTab : null}
      {tab === 'users' ? employeeListTab : null}
      {tab === 'create' ? createEmployeeTab : null}
    </DashboardShell>
  );
}
