import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import { ROLES } from '../../../app/config/roles';
import { resolveRoleFromStorage } from '../../../data/navigation/index.js';
import { ROUTES } from '../../../router/routePaths';
import '../styles/user-setup.css';
import '../../super-admin/styles/packages.css';
import {
  buildNextId,
  createEmptyAddress,
  createEmptyBankAccount,
  createEmptyDocument,
  createEmptyEducation,
  createEmptyExperience,
  createEmptyUser,
  getDocumentNumberLabel,
  getDocumentNumberPlaceholder,
  getUserSetupSectionTitle,
  validateUserForm,
} from '../utils/userSetupUtils';
import {
  UserSetupModal,
  UserSetupField,
  UserSetupSectionCard,
  UserSetupSelect,
  UserSetupTabs,
} from '../components/UserSetupComponents';
import { UserSetupFieldGroup } from '../components/UserSetupFormSections';
import {
  loadUserSetupAddresses,
  loadUserSetupDocuments,
  loadUserSetupUsers,
  saveUserSetupAddresses,
  saveUserSetupDocuments,
  saveUserSetupUsers,
} from '../services/userSetupService';
import {
  userSetupDocumentTypes,
  userSetupCompanyTypeOptions,
  userSetupBusinessTypeOptions,
  userSetupBloodGroupOptions,
  userSetupGenderOptions,
  userSetupPackageOptions,
  userSetupStatusOptions,
  userSetupUserTypeOptions,
} from '../data/userSetupData';

const roleConfig = {
  [ROLES.SUPER_ADMIN]: { badge: 'Super Admin', title: 'User Setup', description: 'Full access to users, documents, and address records.', tabs: ['overview', 'users', 'create'], visibility: { login: true, company: true, employment: true, roleAccess: true, masters: true } },
  [ROLES.SUB_ADMIN]: { badge: 'Sub Admin', title: 'User Setup', description: 'Manage approved users in a compact workspace.', tabs: ['overview', 'users', 'create'], visibility: { login: true, company: true, employment: true, roleAccess: true, masters: false } },
  [ROLES.COMPANY_ADMIN]: { badge: 'Company Admin', title: 'Employee Management', description: 'Manage employees and company-side operations from one workspace.', tabs: ['overview', 'users', 'create'], visibility: { login: true, company: false, employment: true, roleAccess: false, masters: true } },
  [ROLES.HR]: { badge: 'HR', title: 'Employee Management', description: 'Keep employee profiles, documents, attendance-linked details, and address records ready.', tabs: ['overview', 'users', 'create'], visibility: { login: true, company: false, employment: true, roleAccess: false, masters: true } },
  [ROLES.MANAGER]: { badge: 'Manager', title: 'Team Management', description: 'Handle team members, project assignments, and approval workflows.', tabs: ['overview', 'users', 'create'], visibility: { login: true, company: false, employment: true, roleAccess: false, masters: false } },
  [ROLES.EMPLOYEE]: { badge: 'Employee', title: 'My Profile', description: 'Edit your own profile, documents, and address details in self-service mode.', tabs: ['overview', 'users', 'create'], visibility: { login: false, company: false, employment: true, roleAccess: false, masters: false } },
};

function getUserTypeOptionsForRole(role) {
  if (role === ROLES.SUPER_ADMIN || role === ROLES.SUB_ADMIN) {
    return userSetupUserTypeOptions;
  }

  if (role === ROLES.HR || role === ROLES.MANAGER) {
    return [
      { value: '6', label: 'Manager' },
      { value: '4', label: 'Company HR' },
      { value: '5', label: 'Employee' },
    ];
  }

  return [
    { value: '3', label: 'Company Admin' },
    { value: '4', label: 'Company HR' },
    { value: '5', label: 'Employee' },
  ];
}

const createWizardSteps = [
  { key: 'personal', label: 'Personal Information', description: 'Identity and login details first.' },
  { key: 'address', label: 'Address', description: 'Current mailing and location details.' },
  { key: 'education', label: 'Education', description: 'Academic background and qualifications.' },
  { key: 'experience', label: 'Experience', description: 'Previous job history and role notes.' },
  { key: 'bank', label: 'Bank Account', description: 'Payroll account information.' },
  { key: 'document', label: 'Document', description: 'Upload multiple identity documents.' },
];

const legacyCreateRoles = [ROLES.SUPER_ADMIN, ROLES.SUB_ADMIN];
const tabToHash = {
  overview: '#overview',
  users: '#users',
  create: '#create',
};
const hashToTab = {
  '#overview': 'overview',
  '#users': 'users',
  '#create': 'create',
  '#documents': 'create',
  '#address': 'create',
  '#education': 'create',
  '#experience': 'create',
  '#bank': 'create',
};
const createStepToHash = {
  personal: '#create',
  address: '#address',
  education: '#education',
  experience: '#experience',
  bank: '#bank',
  document: '#documents',
};
const hashToCreateStep = {
  '#create': 'personal',
  '#documents': 'document',
  '#address': 'address',
  '#education': 'education',
  '#experience': 'experience',
  '#bank': 'bank',
};

const userTextFilterParams = {
  defaultOption: 'contains',
  maxNumConditions: 1,
  suppressAndOrCondition: true,
};

const userClientLimitGuides = [
  { range: '0-10', title: 'Served 50+ Client', note: 'Best for teams serving up to 5 clients.' },
  { range: '10-25', title: 'Served 20+ client', note: 'Works well when you expect 6 to 15 clients.' },
  { range: '25-50', title: 'Served 30+ client', note: 'Comfortable for 16 to 30 clients.' },
  { range: '50+', title: 'Served 15+ client', note: 'Use this for larger client portfolios.' },
];

ModuleRegistry.registerModules([AllCommunityModule]);

function UserGridEmptyOverlay() {
  return (
    <div className="superadmin-grid-empty">
      <strong>No users found</strong>
      <span>Try a different search term or adjust the filters.</span>
    </div>
  );
}

function UserGridHeader(props) {
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

function UserGridNameCell({ data }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-name-cell">
      <strong>{data.fullName}</strong>
      <div className="superadmin-grid-name-meta">
        <span>{data.userName}</span>
      </div>
    </div>
  );
}

function UserGridRoleCell({ value }) {
  return <span className="superadmin-grid-type-pill">{value}</span>;
}

function UserGridStatusCell({ value }) {
  const tone = String(value).toLowerCase() === 'active'
    ? 'tone-active'
    : String(value).toLowerCase() === 'pending'
      ? 'tone-pending'
      : 'tone-inactive';

  return <span className={`role-status-chip ${tone}`}>{value}</span>;
}

function UserGridActionsCell({ data, onDelete }) {
  if (!data) return null;

  return (
    <div className="superadmin-grid-actions">
      <Link
        to={{ hash: '#create', search: `?mode=view&id=${encodeURIComponent(data.id)}` }}
        className="superadmin-grid-icon-button view"
        aria-label="View user"
      >
        <Icon name="eye" size={14} />
      </Link>
      <Link
        to={{ hash: '#create', search: `?mode=edit&id=${encodeURIComponent(data.id)}` }}
        className="superadmin-grid-icon-button edit"
        aria-label="Edit user"
      >
        <Icon name="pen-to-square" size={14} />
      </Link>
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete(data)} aria-label="Delete user">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

export default function UserSetup() {
  const location = useLocation();
  const role = resolveRoleFromStorage();
  const config = roleConfig[role] ?? roleConfig[ROLES.EMPLOYEE];
  const visibility = config.visibility;
  const canOpenAllCreateSteps = role === ROLES.COMPANY_ADMIN || role === ROLES.HR;
  const navigate = useNavigate();
  const defaultTab = config.tabs.includes('overview') ? 'overview' : config.tabs[0];
  const initialHashTab = hashToTab[location.hash];
  const initialCreateStep = hashToCreateStep[location.hash] || createWizardSteps[0].key;

  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => (initialHashTab && config.tabs.includes(initialHashTab) ? initialHashTab : defaultTab));
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewUser, setViewUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState(createEmptyUser(role, ''));
  const [createWizardUnlocked, setCreateWizardUnlocked] = useState(canOpenAllCreateSteps);
  const [activeCreateStep, setActiveCreateStep] = useState(initialCreateStep);
  const [documentRows, setDocumentRows] = useState([createEmptyDocument('')]);
  const [addressForm, setAddressForm] = useState(createEmptyAddress(''));
  const [educationRows, setEducationRows] = useState([createEmptyEducation('')]);
  const [experienceRows, setExperienceRows] = useState([createEmptyExperience('')]);
  const [bankAccountForm, setBankAccountForm] = useState(createEmptyBankAccount(''));
  const [userErrors, setUserErrors] = useState({});
  const profileImageInputRef = useRef(null);
  const companyLogoInputRef = useRef(null);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const routeMode = searchParams.get('mode');
  const routeUserId = searchParams.get('id');
  const isProfileMode = routeMode === 'profile';
  const isViewMode = activeTab === 'create' && routeMode === 'view';
  const sidebarActiveKey = isProfileMode || activeTab === 'overview'
    ? 'user-setup-overview'
    : activeTab === 'users'
      ? 'user-setup-users'
      : 'user-setup-create';

  // Load data from API on component mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [loadedUsers, loadedDocuments, loadedAddresses] = await Promise.all([
          loadUserSetupUsers(),
          loadUserSetupDocuments(),
          loadUserSetupAddresses()
        ]);
        
        setUsers(loadedUsers);
        setDocuments(loadedDocuments);
        setAddresses(loadedAddresses);
        
        // Set initial selected ID if users exist
        if (loadedUsers.length > 0) {
          setSelectedId(loadedUsers[0]?.id || '');
          setUserForm(createEmptyUser(role, loadedUsers[0]?.id || ''));
        }
      } catch (error) {
        console.error('Error loading user setup data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [role]);

  // Save data when it changes
  useEffect(() => {
    if (users.length > 0) {
      saveUserSetupUsers(users).catch(error => {
        console.error('Error saving users:', error);
      });
    }
  }, [users]);

  useEffect(() => {
    if (documents.length > 0) {
      saveUserSetupDocuments(documents).catch(error => {
        console.error('Error saving documents:', error);
      });
    }
  }, [documents]);

  useEffect(() => {
    if (addresses.length > 0) {
      saveUserSetupAddresses(addresses).catch(error => {
        console.error('Error saving addresses:', error);
      });
    }
  }, [addresses]);

  const accessibleUsers = useMemo(() => {
    if (role === ROLES.COMPANY_ADMIN) {
      return users.filter((item) => [ROLES.COMPANY_ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE].includes(item.role));
    }

    if (role === ROLES.HR) {
      return users.filter((item) => [ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE].includes(item.role));
    }

    return users;
  }, [role, users]);

  const currentProfileUser = useMemo(() => {
    const roleMatch = users.find((item) => item.role === role) || accessibleUsers.find((item) => item.role === role);
    return roleMatch || accessibleUsers[0] || users[0] || null;
  }, [accessibleUsers, role, users]);

  useEffect(() => {
    if (!config.tabs.includes(activeTab)) {
      setActiveTab(config.tabs[0]);
    }
  }, [activeTab, config.tabs]);

  useEffect(() => {
    const nextTab = hashToTab[location.hash];
    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }

    if (nextTab === 'create') {
      const nextCreateStep = hashToCreateStep[location.hash] || 'personal';
      if (nextCreateStep !== activeCreateStep) {
        setActiveCreateStep(nextCreateStep);
      }

      if (location.hash === '#documents' || location.hash === '#address') {
        setCreateWizardUnlocked(true);
      }
    }
  }, [activeCreateStep, activeTab, location.hash]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('mode');
    const id = params.get('id');

    if (!mode || !id) {
      setViewUser(null);
      if (!editingUserId) {
        return;
      }
      setEditingUserId(null);
      return;
    }

    const targetUser = users.find((item) => item.id === id) || accessibleUsers.find((item) => item.id === id) || null;
    if (mode === 'view') {
      setEditingUserId(null);
      setViewUser(targetUser);
      if (activeTab !== 'create') {
        setActiveTab('create');
      }
      return;
    }

    if (mode === 'edit') {
      setViewUser(null);
      setEditingUserId(id);
      if (activeTab !== 'create') {
        setActiveTab('create');
      }
    }
  }, [accessibleUsers, activeTab, editingUserId, location.search, users]);

  useEffect(() => {
    if (!accessibleUsers.some((item) => item.id === selectedId)) {
      setSelectedId(accessibleUsers[0]?.id || '');
    }
  }, [accessibleUsers, selectedId]);

  useEffect(() => {
    const editUser = users.find((item) => item.id === editingUserId);
    const viewUserRecord = users.find((item) => item.id === routeUserId) || null;
    const activeUser = editUser || viewUserRecord;
    setUserForm(activeUser ? { ...activeUser } : createEmptyUser(role, accessibleUsers[0]?.id || ''));
    setCreateWizardUnlocked(Boolean(editUser) || canOpenAllCreateSteps || (routeMode === 'view' && Boolean(viewUserRecord)));
    setActiveCreateStep(createWizardSteps[0].key);
  }, [accessibleUsers, canOpenAllCreateSteps, editingUserId, role, routeMode, routeUserId, users]);

  const tabs = useMemo(
    () => config.tabs.map((tab) => ({
      key: tab,
      label: getUserSetupSectionTitle(tab, tab === 'create' && Boolean(editingUserId), role),
      to: { pathname: location.pathname, search: '', hash: tabToHash[tab] || '#overview' },
    })),
    [config.tabs, editingUserId, location.pathname, role],
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accessibleUsers.filter((item) => {
      const text = `${item.fullName} ${item.email} ${item.userName} ${item.empCode} ${item.role}`.toLowerCase();
      return !query || text.includes(query);
    });
  }, [accessibleUsers, search]);

  const hasSelectedRows = selectedIds.length > 0;

  const gridColumnDefs = useMemo(() => [
    {
      field: 'fullName',
      headerName: 'User',
      minWidth: 220,
      flex: 1.15,
      filter: 'agTextColumnFilter',
      filterParams: userTextFilterParams,
      cellRenderer: UserGridNameCell,
      headerComponent: UserGridHeader,
      headerComponentParams: { headerIcon: 'users', enableFilterButton: true },
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 240,
      flex: 1.1,
      filter: 'agTextColumnFilter',
      filterParams: userTextFilterParams,
      cellClass: 'superadmin-grid-email',
      headerComponent: UserGridHeader,
      headerComponentParams: { headerIcon: 'envelope', enableFilterButton: true },
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 160,
      filter: 'agTextColumnFilter',
      filterParams: userTextFilterParams,
      cellRenderer: UserGridRoleCell,
      headerComponent: UserGridHeader,
      headerComponentParams: { headerIcon: 'briefcase', enableFilterButton: true },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: userTextFilterParams,
      cellRenderer: UserGridStatusCell,
      headerComponent: UserGridHeader,
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
      headerComponent: UserGridHeader,
      headerComponentParams: { headerIcon: 'ellipsis-vertical', showMenu: false, enableFilterButton: true },
      cellRenderer: UserGridActionsCell,
      cellRendererParams: {
        onDelete: (user) => setDeleteUserId(user.id),
      },
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);

  const metrics = useMemo(() => {
    const activeCount = accessibleUsers.filter((item) => item.status === 'Active').length;
    const pendingCount = accessibleUsers.filter((item) => item.status === 'Pending').length;
    return [
      { label: role === ROLES.COMPANY_ADMIN ? 'Total Employees' : 'Total Users', value: String(accessibleUsers.length).padStart(2, '0'), change: 'Frontend demo' },
      { label: 'Active', value: String(activeCount).padStart(2, '0'), change: 'Live profiles' },
      { label: 'Pending', value: String(pendingCount).padStart(2, '0'), change: 'Needs review' },
    ];
  }, [accessibleUsers, role]);

  function goToTab(nextTab) {
    const nextHash = tabToHash[nextTab] || '#overview';
    setActiveTab(nextTab);
    navigate({ pathname: location.pathname, search: '', hash: nextHash }, { replace: true });
  }

  function goToCreateStep(stepKey) {
    if (!canOpenAllCreateSteps && !createWizardUnlocked && stepKey !== 'personal') {
      return;
    }

    setActiveTab('create');
    setActiveCreateStep(stepKey);
    if (stepKey === 'address' || stepKey === 'document') {
      setCreateWizardUnlocked(true);
    }

    const nextHash = createStepToHash[stepKey] || '#create';
    navigate({ pathname: location.pathname, search: location.search, hash: nextHash }, { replace: true });
  }

  function startCreateUser() {
    setEditingUserId(null);
    resetCreateWizardState();
    goToTab('create');
  }

  function resetUserForm() {
    setEditingUserId(null);
    resetCreateWizardState();
  }

  function addDocumentRow() {
    setDocumentRows((current) => [...current, createEmptyDocument('')]);
  }

  function removeDocumentRow(index) {
    setDocumentRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function removeUserRecord(targetId) {
    const nextUsers = users.filter((item) => item.id !== targetId);
    setUsers(nextUsers);
    setDocuments((current) => current.filter((item) => item.userId !== targetId));
    setAddresses((current) => current.filter((item) => item.userId !== targetId));
    setSelectedIds((current) => current.filter((item) => item !== targetId));
    setSelectedId((current) => (current === targetId ? nextUsers[0]?.id || '' : current));
  }

  function updateUserField(key, value) {
    if (value === null) {
      setUserForm((current) => ({ ...current, [key]: '' }));
      return;
    }

    if (value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        setUserForm((current) => ({ ...current, [key]: reader.result || '' }));
      };
      reader.readAsDataURL(value);
      return;
    }

    setUserForm((current) => ({ ...current, [key]: value }));
  }

  function updateDocumentRow(index, key, value) {
    if (value === null) {
      setDocumentRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: '' } : row)));
      return;
    }

    if (value instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        setDocumentRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: reader.result || '' } : row)));
      };
      reader.readAsDataURL(value);
      return;
    }

    setDocumentRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  }

  function updateAddressField(section, key, value) {
    setAddressForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  }

  function addEducationRow() {
    setEducationRows((current) => [...current, createEmptyEducation('')]);
  }

  function removeEducationRow(index) {
    setEducationRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function updateEducationField(index, key, value) {
    setEducationRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  }

  function addExperienceRow() {
    setExperienceRows((current) => [...current, createEmptyExperience('')]);
  }

  function removeExperienceRow(index) {
    setExperienceRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function updateExperienceField(index, key, value) {
    setExperienceRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  }

  function updateBankAccountField(key, value) {
    setBankAccountForm((current) => ({ ...current, [key]: value }));
  }

  function clearProfileImage() {
    setUserForm((current) => ({ ...current, profileImage: '' }));
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = '';
    }
  }

  function clearCompanyLogo() {
    setUserForm((current) => ({ ...current, companyLogo: '' }));
    if (companyLogoInputRef.current) {
      companyLogoInputRef.current.value = '';
    }
  }

  function resetCreateWizardState() {
    setUserErrors({});
    setUserForm(createEmptyUser(role, accessibleUsers[0]?.id || ''));
    setDocumentRows([createEmptyDocument('')]);
    setAddressForm(createEmptyAddress(''));
    setEducationRows([createEmptyEducation('')]);
    setExperienceRows([createEmptyExperience('')]);
    setBankAccountForm(createEmptyBankAccount(''));
    setCreateWizardUnlocked(canOpenAllCreateSteps);
    setActiveCreateStep(createWizardSteps[0].key);
    if (profileImageInputRef.current) {
      profileImageInputRef.current.value = '';
    }
    if (companyLogoInputRef.current) {
      companyLogoInputRef.current.value = '';
    }
  }

  function getCreateStepIndex(stepKey) {
    return createWizardSteps.findIndex((item) => item.key === stepKey);
  }

  function getNextCreateStep(stepKey) {
    const index = getCreateStepIndex(stepKey);
    return createWizardSteps[index + 1]?.key || stepKey;
  }

  function getPreviousCreateStep(stepKey) {
    const index = getCreateStepIndex(stepKey);
    return createWizardSteps[index - 1]?.key || stepKey;
  }

  function continueCreateWizard() {
    if (activeCreateStep === 'personal') {
      const nextErrors = validateUserForm(userForm, visibility);
      setUserErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }

      setCreateWizardUnlocked(true);
      setUserErrors({});
    }

    const nextStep = getNextCreateStep(activeCreateStep);
    goToCreateStep(nextStep);
  }

  function handleCreateSkip() {
    if (activeCreateStep === createWizardSteps[createWizardSteps.length - 1].key) {
      submitUser({ preventDefault: () => {} });
      return;
    }

    setCreateWizardUnlocked(true);
    const nextStep = getNextCreateStep(activeCreateStep);
    goToCreateStep(nextStep);
  }

  function openProfileImagePicker() {
    profileImageInputRef.current?.click();
  }

  function imageUploadHeader({ value, inputRef, onPick, onClear, emptyText, ariaLabel, cutLabel }) {
    const hasImage = Boolean(value);
    const avatarContent = hasImage ? (
      <img src={value} alt={ariaLabel} />
    ) : (
      <Icon name="gallery" size={18} className="user-setup-profile-gallery-icon" />
    );

    if (isViewMode) {
      return (
        <div className="user-setup-profile-upload is-readonly" aria-label={ariaLabel}>
          <div className={`user-setup-profile-avatar ${hasImage ? 'has-image' : 'is-empty'}`}>
            {avatarContent}
          </div>
        </div>
      );
    }

    return (
      <div className="user-setup-profile-upload">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => onPick(event.target.files?.[0] || null)}
        />
        <div
          className={`user-setup-profile-avatar ${hasImage ? 'has-image' : 'is-empty'}`}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          aria-label={ariaLabel}
        >
          {avatarContent}
          {hasImage ? (
            <button
              type="button"
              className="user-setup-profile-cut"
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              aria-label={cutLabel}
            >
              &times;
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  function profileImageHeader() {
    return imageUploadHeader({
      value: userForm.profileImage,
      inputRef: profileImageInputRef,
      onPick: (file) => updateUserField('profileImage', file),
      onClear: clearProfileImage,
      emptyText: 'Profile Img',
      ariaLabel: 'Profile Img preview',
      cutLabel: 'Cut profile image',
    });
  }

  function companyLogoHeader() {
    return imageUploadHeader({
      value: userForm.companyLogo,
      inputRef: companyLogoInputRef,
      onPick: (file) => updateUserField('companyLogo', file),
      onClear: clearCompanyLogo,
      emptyText: 'Company Logo',
      ariaLabel: 'Company Logo preview',
      cutLabel: 'Cut company logo',
    });
  }

  function renderProfilePage() {
    const profile = currentProfileUser || createEmptyUser(role, '');
    const profileItems = [
      { label: 'Name', value: profile.fullName || '—' },
      { label: 'Email', value: profile.email || '—' },
      { label: 'Contact No', value: profile.contact || '—' },
      { label: 'User Name', value: profile.userName || '—' },
    ];

    return (
      <UserSetupSectionCard title="My Profile" description="Login user details in a clean, read-only summary." className="user-setup-profile-single-card">
        <div className="user-setup-profile-hero">
          <div className="user-setup-profile-avatar-box">
            {profile.profileImage ? (
              <img src={profile.profileImage} alt={`${profile.fullName || 'User'} profile`} />
            ) : (
              <div className="user-setup-profile-avatar-fallback" aria-hidden="true">
                <Icon name="user" size={52} />
              </div>
            )}
          </div>

          <div className="user-setup-profile-copy">
            <span className="user-setup-profile-kicker">View Profile</span>
            <h2>{profile.fullName || 'My Profile'}</h2>
            <p>Personal login information for the currently signed-in user.</p>
            <div className="user-setup-profile-chip-row">
              <span className="user-setup-profile-chip">{config.badge}</span>
              <span className="user-setup-profile-chip">{profile.status || 'Active'}</span>
            </div>
          </div>
        </div>

        <div className="user-setup-profile-detail-grid">
          {profileItems.map((item) => (
            <div key={item.label} className="user-setup-profile-detail-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="user-setup-profile-actions">
          <Link to={ROUTES.dashboard} className="user-setup-primary user-setup-profile-back-btn">
            Back to Workspace
          </Link>
        </div>
      </UserSetupSectionCard>
    );
  }

  function buildLegacyCreateSections() {
    const sections = [
      {
        title: 'Personal Info',
        description: 'Core identity and contact details.',
        className: 'user-setup-personal-profile-card',
        items: [
          { key: 'fullName', label: 'Full Name', value: userForm.fullName },
          { key: 'email', label: 'Email', value: userForm.email, type: 'email' },
          { key: 'contact', label: 'Contact', value: userForm.contact, type: 'tel', numeric: true, maxLength: 10, inputMode: 'numeric', autoComplete: 'tel' },
          { key: 'altContact', label: 'Alt Contact', value: userForm.altContact, type: 'tel', numeric: true, maxLength: 10, inputMode: 'numeric', autoComplete: 'tel' },
          { key: 'gender', label: 'Gender', value: userForm.gender, options: userSetupGenderOptions },
          { key: 'bloodGroup', label: 'Blood Group', value: userForm.bloodGroup, options: userSetupBloodGroupOptions },
          { key: 'dobOrCompanyStartDate', label: 'Date of Birth (DOB)', value: userForm.dobOrCompanyStartDate, type: 'date' },
          { key: 'bioDetails', label: 'Bio Details', value: userForm.bioDetails, type: 'textarea', span: 'span-2' },
        ],
        headerRight: profileImageHeader(),
        columns: 4,
      },
      {
        title: 'Login Info',
        description: 'Credentials and login-side profile data.',
        className: 'user-setup-login-info-card',
        items: [
          { key: 'userName', label: 'Username', value: userForm.userName },
          { key: 'password', label: 'Password', value: userForm.password, type: 'password' },
          { key: 'userType', label: 'User Type', value: userForm.userType, options: getUserTypeOptionsForRole(role) },
          { key: 'status', label: 'Status', value: userForm.status, options: userSetupStatusOptions },
        ],
        columns: 4,
      },
    ];

    if (visibility.company) {
      sections.push({
        title: 'Company Info',
        description: 'Company and package mapping for the backend-ready setup.',
        items: [
          { key: 'companyName', label: 'Company Name', value: userForm.companyName },
          { key: 'packageId', label: 'Package', value: userForm.packageId, options: userSetupPackageOptions },
          { key: 'companyTypeId', label: 'Company Type', value: userForm.companyTypeId, options: userSetupCompanyTypeOptions },
          { key: 'businessTypeId', label: 'Business Type', value: userForm.businessTypeId, options: userSetupBusinessTypeOptions },
        ],
        headerRight: companyLogoHeader(),
        columns: 4,
      });
    }

    return sections;
  }

  function submitUser(event) {
    event.preventDefault();
    if (isViewMode) {
      return;
    }
    if (!legacyCreateRoles.includes(role) && activeCreateStep !== createWizardSteps[createWizardSteps.length - 1].key) {
      continueCreateWizard();
      return;
    }

    const nextErrors = validateUserForm(userForm, visibility);
    setUserErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setCreateWizardUnlocked(false);
      goToCreateStep('personal');
      return;
    }

    const { leavingDate, ...safeUserForm } = userForm;
    const payload = {
      ...safeUserForm,
      personalInfo: {
        fullName: userForm.fullName,
        email: userForm.email,
        contact: userForm.contact,
        altContact: userForm.altContact,
        userName: userForm.userName,
        gender: userForm.gender,
        dobOrCompanyStartDate: userForm.dobOrCompanyStartDate,
        bioDetails: userForm.bioDetails,
      },
      addressInfo: addressForm,
      educationInfo: educationRows,
      experienceInfo: experienceRows,
      bankAccountInfo: bankAccountForm,
      createdDate: userForm.createdDate || new Date().toISOString().slice(0, 10),
      updatedDate: new Date().toISOString().slice(0, 10),
    };
    if (editingUserId) {
      setUsers((current) => current.map((item) => (item.id === editingUserId ? { ...item, ...payload } : item)));
      setSelectedIds([editingUserId]);
    } else {
      const next = { id: buildNextId('u'), ...payload };
      const nextDocumentList = documentRows
        .filter((row) => row.documentType || row.docName.trim() || row.attachment)
        .map((row) => ({ id: buildNextId('doc'), userId: next.id, ...row }));
      setUsers((current) => [next, ...current]);
      setSelectedId(next.id);
      setSelectedIds([next.id]);
      if (nextDocumentList.length > 0) {
        setDocuments((current) => [...nextDocumentList, ...current]);
      }
      if (Object.values(addressForm.permanent).some((value) => String(value ?? '').trim()) || Object.values(addressForm.present).some((value) => String(value ?? '').trim())) {
        setAddresses((current) => [{ id: buildNextId('addr'), createdDate: new Date().toISOString().slice(0, 10), userId: next.id, ...addressForm }, ...current]);
      }
    }
    resetCreateWizardState();
    setEditingUserId(null);
    goToTab('users');
  }

  function removeUser() {
    if (!deleteUserId) return;
    removeUserRecord(deleteUserId);
    setDeleteUserId(null);
  }

  function handleSelectionChanged(event) {
    const nextSelectedRows = event.api.getSelectedRows();
    setSelectedIds(nextSelectedRows.map((item) => item.id));
    setSelectedId(nextSelectedRows[0]?.id || null);
  }

  function handleBulkDelete() {
    const targetId = selectedIds[0] || selectedId;
    if (!targetId) return;
    setDeleteUserId(targetId);
  }

  const userOptions = [
    { value: '', label: 'Select user' },
    ...accessibleUsers.map((item) => ({
      value: item.id,
      label: `${item.fullName}${item.userName ? ` · ${item.userName}` : ''}${item.id ? ` · ${item.id}` : ''}`,
    })),
  ];

  const isCreateWizardUnlocked = canOpenAllCreateSteps || createWizardUnlocked || Boolean(editingUserId);
  const createWizardTabs = createWizardSteps.map((step) => ({
    key: step.key,
    label: step.label,
    disabled: !isCreateWizardUnlocked && step.key !== createWizardSteps[0].key,
  }));
  const activeCreateStepConfig = createWizardSteps.find((item) => item.key === activeCreateStep) || createWizardSteps[0];
  const activeCreateStepIndex = createWizardSteps.findIndex((item) => item.key === activeCreateStep);

  function renderStepFooter({ includeSkip = false, isFinal = false } = {}) {
    if (isViewMode) {
      return (
        <div className="user-setup-form-actions wide user-setup-wizard-actions">
          <Link to={{ pathname: location.pathname, search: '', hash: '#users' }} className="user-setup-secondary">
            Back to List
          </Link>
        </div>
      );
    }

    return (
      <div className="user-setup-form-actions wide user-setup-wizard-actions">
        {activeCreateStep === createWizardSteps[0].key ? (
          <Link
            to={{ pathname: location.pathname, search: '', hash: '#users' }}
            className="user-setup-secondary"
            onClick={() => resetUserForm()}
          >
            Cancel
          </Link>
        ) : (
          <button
            type="button"
            className="user-setup-secondary"
            onClick={() => goToCreateStep(getPreviousCreateStep(activeCreateStep))}
          >
            Back
          </button>
        )}
        {includeSkip ? (
          <button type="button" className="user-setup-secondary" onClick={handleCreateSkip}>
            Skip for later
          </button>
        ) : null}
        <button type="submit" className="user-setup-primary">
          {isFinal ? (editingUserId ? 'Update User' : 'Create User') : 'Continue'}
        </button>
      </div>
    );
  }

  function renderPersonalStep() {
    return (
      <div className="user-setup-stack">
        <fieldset className="user-setup-readonly-fieldset" disabled={isViewMode}>
          <UserSetupFieldGroup
            title="Personal Info"
            description="Core identity and contact details."
            className="user-setup-personal-profile-card"
            items={[
              { key: 'fullName', label: 'Full Name', value: userForm.fullName, placeholder: 'Enter Full Name' },
              { key: 'email', label: 'Email', value: userForm.email, type: 'email', placeholder: 'Enter Email' },
              { key: 'contact', label: 'Contact', value: userForm.contact, type: 'tel', numeric: true, maxLength: 10, inputMode: 'numeric', autoComplete: 'tel', placeholder: 'Enter Contact' },
              { key: 'gender', label: 'Gender', value: userForm.gender, options: userSetupGenderOptions },
              { key: 'bloodGroup', label: 'Blood Group', value: userForm.bloodGroup, options: userSetupBloodGroupOptions },
              { key: 'altContact', label: 'Alternate Contact', value: userForm.altContact, type: 'tel', numeric: true, maxLength: 10, inputMode: 'numeric', autoComplete: 'tel', placeholder: 'Enter Alt Contact' },
              { key: 'dobOrCompanyStartDate', label: 'Date of Birth (DOB)', value: userForm.dobOrCompanyStartDate, type: 'date' },
              { key: 'bioDetails', label: 'Bio Details', value: userForm.bioDetails, type: 'textarea', span: 'span-2', placeholder: 'Enter Bio Details' },
            ]}
            errors={userErrors}
            onChange={updateUserField}
            typeMap={{ password: 'password', email: 'email' }}
            headerRight={profileImageHeader()}
            columns={4}
          />

          <UserSetupSectionCard title="Login Info" description="Credentials used to access the workspace." className="user-setup-create-step-card">
            <div className="user-setup-form-grid user-setup-step-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              <label className="user-setup-field">
                <span>Username</span>
                <input value={userForm.userName} onChange={(event) => updateUserField('userName', event.target.value)} placeholder="Enter Username" />
              </label>
              <label className="user-setup-field">
                <span>Password</span>
                <input value={userForm.password} onChange={(event) => updateUserField('password', event.target.value)} placeholder="Enter Password" type="password" />
              </label>
              <UserSetupSelect label="User Designation" value={userForm.userType} onChange={(event) => updateUserField('userType', event.target.value)} options={getUserTypeOptionsForRole(role)} />
              <UserSetupSelect label="Status" value={userForm.status} onChange={(event) => updateUserField('status', event.target.value)} options={userSetupStatusOptions} />
            </div>
          </UserSetupSectionCard>
        </fieldset>

        {renderStepFooter({
          steps: createWizardSteps,
          activeStep: activeCreateStep,
          onBack: () => goToCreateStep(getPreviousCreateStep(activeCreateStep)),
          onNext: continueCreateWizard,
          isFinal: activeCreateStep === createWizardSteps[createWizardSteps.length - 1].key,
        })}
      </div>
    );
  }

  function renderAddressStep() {
    return (
      <>
      <fieldset className="user-setup-readonly-fieldset" disabled={isViewMode}>
        <UserSetupSectionCard title="Address" description="Capture both permanent and present addresses." className="user-setup-create-step-card">
          <div className="user-setup-address-split">
          <div className="user-setup-address-card">
            <div className="user-setup-address-card-head">
              <strong>Permanent Address</strong>
              <span>Primary home address</span>
            </div>
            <div className="user-setup-form-grid user-setup-step-grid">
              <label className="user-setup-field">
                <span>Address 1</span>
                <input value={addressForm.permanent.address1} onChange={(event) => updateAddressField('permanent', 'address1', event.target.value)} placeholder="Enter address 1" />
              </label>
              <label className="user-setup-field is-optional">
                <span>Address 2</span>
                <input value={addressForm.permanent.address2} onChange={(event) => updateAddressField('permanent', 'address2', event.target.value)} placeholder="Enter address 2" />
              </label>
              <label className="user-setup-field">
                <span>City</span>
                <input value={addressForm.permanent.city} onChange={(event) => updateAddressField('permanent', 'city', event.target.value)} placeholder="Enter city" />
              </label>
              <label className="user-setup-field">
                <span>State</span>
                <input value={addressForm.permanent.state} onChange={(event) => updateAddressField('permanent', 'state', event.target.value)} placeholder="Enter state" />
              </label>
              <label className="user-setup-field">
                <span>PIN</span>
                <input value={addressForm.permanent.pin} onChange={(event) => updateAddressField('permanent', 'pin', event.target.value)} placeholder="Enter pin" />
              </label>
            </div>
          </div>

          <div className="user-setup-address-card">
            <div className="user-setup-address-card-head">
              <strong>Present Address</strong>
              <span>Current stay address</span>
            </div>
            <div className="user-setup-form-grid user-setup-step-grid">
              <label className="user-setup-field">
                <span>Address 1</span>
                <input value={addressForm.present.address1} onChange={(event) => updateAddressField('present', 'address1', event.target.value)} placeholder="Enter address 1" />
              </label>
              <label className="user-setup-field is-optional">
                <span>Address 2</span>
                <input value={addressForm.present.address2} onChange={(event) => updateAddressField('present', 'address2', event.target.value)} placeholder="Enter address 2" />
              </label>
              <label className="user-setup-field">
                <span>City</span>
                <input value={addressForm.present.city} onChange={(event) => updateAddressField('present', 'city', event.target.value)} placeholder="Enter city" />
              </label>
              <label className="user-setup-field">
                <span>State</span>
                <input value={addressForm.present.state} onChange={(event) => updateAddressField('present', 'state', event.target.value)} placeholder="Enter state" />
              </label>
              <label className="user-setup-field">
                <span>PIN</span>
                <input value={addressForm.present.pin} onChange={(event) => updateAddressField('present', 'pin', event.target.value)} placeholder="Enter pin" />
              </label>
            </div>
          </div>
          </div>
        </UserSetupSectionCard>
      </fieldset>
        {renderStepFooter({
          steps: createWizardSteps,
          activeStep: activeCreateStep,
          onBack: () => goToCreateStep(getPreviousCreateStep(activeCreateStep)),
          onNext: handleCreateSkip,
          isFinal: activeCreateStep === createWizardSteps[createWizardSteps.length - 1].key,
          includeSkip: true,
          submitLabel: 'Create User',
        })}
      </>
    );
  }

  function renderEducationStep() {
    return (
      <>
        <fieldset className="user-setup-readonly-fieldset" disabled={isViewMode}>
          <UserSetupSectionCard
            title="Education"
            description="Add one or more education records for the user."
            className="user-setup-create-step-card"
            actions={isViewMode ? null : (
              <button type="button" className="user-setup-secondary user-setup-mini-action" onClick={addEducationRow}>
                <Icon name="plus" size={12} />
                <span>Add</span>
              </button>
            )}
          >
            <div className="user-setup-document-list">
          {educationRows.map((row, index) => (
            <div key={`education-row-${index}`} className="user-setup-document-card">
              <div className="user-setup-document-card-head">
                <strong>Education {index + 1}</strong>
                {educationRows.length > 1 && !isViewMode ? (
                  <button type="button" className="user-setup-document-remove" onClick={() => removeEducationRow(index)} aria-label={`Remove education ${index + 1}`}>
                    &times;
                  </button>
                ) : null}
              </div>
              <div className="user-setup-form-grid user-setup-step-grid">
                <label className="user-setup-field">
                  <span>Degree Name</span>
                  <input value={row.degreeName} onChange={(event) => updateEducationField(index, 'degreeName', event.target.value)} placeholder="Enter degree name" />
                </label>
                <label className="user-setup-field">
                  <span>Institute Name</span>
                  <input value={row.instituteName} onChange={(event) => updateEducationField(index, 'instituteName', event.target.value)} placeholder="Enter institute name" />
                </label>
                <label className="user-setup-field">
                  <span>Result</span>
                  <input value={row.result} onChange={(event) => updateEducationField(index, 'result', event.target.value)} placeholder="Enter result" />
                </label>
                <label className="user-setup-field">
                  <span>Passing Year</span>
                  <input value={row.passingYear} onChange={(event) => updateEducationField(index, 'passingYear', event.target.value)} placeholder="Enter passing year" />
                </label>
                <label className="user-setup-field">
                  <span>Attachment</span>
                  <input type="file" accept="image/*,.pdf,.png,.jpg,.jpeg" onChange={(event) => updateEducationField(index, 'attachment', event.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          ))}
            </div>
          </UserSetupSectionCard>
        </fieldset>
        {renderStepFooter({
          steps: createWizardSteps,
          activeStep: activeCreateStep,
          onBack: () => goToCreateStep(getPreviousCreateStep(activeCreateStep)),
          onNext: handleCreateSkip,
          isFinal: activeCreateStep === createWizardSteps[createWizardSteps.length - 1].key,
          includeSkip: true,
          submitLabel: 'Create User',
        })}
      </>
    );
  }

  function renderExperienceStep() {
    return (
      <>
        <fieldset className="user-setup-readonly-fieldset" disabled={isViewMode}>
          <UserSetupSectionCard
            title="Experience"
            description="Add one or more work history entries for the user."
            className="user-setup-create-step-card"
            actions={isViewMode ? null : (
              <button type="button" className="user-setup-secondary user-setup-mini-action" onClick={addExperienceRow}>
                <Icon name="plus" size={12} />
                <span>Add</span>
              </button>
            )}
          >
            <div className="user-setup-document-list">
          {experienceRows.map((row, index) => (
            <div key={`experience-row-${index}`} className="user-setup-document-card">
              <div className="user-setup-document-card-head">
                <strong>Experience {index + 1}</strong>
                {experienceRows.length > 1 && !isViewMode ? (
                  <button type="button" className="user-setup-document-remove" onClick={() => removeExperienceRow(index)} aria-label={`Remove experience ${index + 1}`}>
                    &times;
                  </button>
                ) : null}
              </div>
              <div className="user-setup-form-grid user-setup-step-grid">
                <label className="user-setup-field">
                  <span>Company Name</span>
                  <input value={row.companyName} onChange={(event) => updateExperienceField(index, 'companyName', event.target.value)} placeholder="Enter company name" />
                </label>
                <label className="user-setup-field">
                  <span>Position</span>
                  <input value={row.position} onChange={(event) => updateExperienceField(index, 'position', event.target.value)} placeholder="Enter position" />
                </label>
                <label className="user-setup-field">
                  <span>Address</span>
                  <input value={row.address} onChange={(event) => updateExperienceField(index, 'address', event.target.value)} placeholder="Enter address" />
                </label>
                <label className="user-setup-field">
                  <span>Working Duration</span>
                  <input value={row.workingDuration} onChange={(event) => updateExperienceField(index, 'workingDuration', event.target.value)} placeholder="Enter working duration" />
                </label>
                <label className="user-setup-field">
                  <span>Attachment</span>
                  <input type="file" accept="image/*,.pdf,.png,.jpg,.jpeg" onChange={(event) => updateExperienceField(index, 'attachment', event.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          ))}
            </div>
          </UserSetupSectionCard>
        </fieldset>
        {renderStepFooter({
          steps: createWizardSteps,
          activeStep: activeCreateStep,
          onBack: () => goToCreateStep(getPreviousCreateStep(activeCreateStep)),
          onNext: handleCreateSkip,
          isFinal: activeCreateStep === createWizardSteps[createWizardSteps.length - 1].key,
          includeSkip: true,
          submitLabel: 'Create User',
        })}
      </>
    );
  }

  function renderBankStep() {
    return (
      <>
        <fieldset className="user-setup-readonly-fieldset" disabled={isViewMode}>
          <UserSetupSectionCard title="Bank Account" description="Capture payroll and payout details." className="user-setup-create-step-card">
            <div className="user-setup-form-grid user-setup-step-grid">
          <label className="user-setup-field">
            <span>Account Holder</span>
            <input value={bankAccountForm.accountHolder} onChange={(event) => updateBankAccountField('accountHolder', event.target.value)} placeholder="Enter account holder" />
          </label>
          <label className="user-setup-field">
            <span>Bank Name</span>
            <input value={bankAccountForm.bankName} onChange={(event) => updateBankAccountField('bankName', event.target.value)} placeholder="Enter bank name" />
          </label>
          <label className="user-setup-field">
            <span>Account Number</span>
            <input value={bankAccountForm.accountNumber} onChange={(event) => updateBankAccountField('accountNumber', event.target.value)} placeholder="Enter account number" />
          </label>
          <label className="user-setup-field">
            <span>IFSC Code</span>
            <input value={bankAccountForm.ifscCode} onChange={(event) => updateBankAccountField('ifscCode', event.target.value)} placeholder="Enter IFSC code" />
          </label>
          <label className="user-setup-field span-3">
            <span>Branch</span>
            <input value={bankAccountForm.branch} onChange={(event) => updateBankAccountField('branch', event.target.value)} placeholder="Enter branch name" />
          </label>
          <label className="user-setup-field">
            <span>Attachment</span>
            <input type="file" accept="image/*,.pdf,.png,.jpg,.jpeg" onChange={(event) => updateBankAccountField('attachment', event.target.files?.[0] || null)} />
          </label>
            </div>
          </UserSetupSectionCard>
        </fieldset>
        {renderStepFooter({
          steps: createWizardSteps,
          activeStep: activeCreateStep,
          onBack: () => goToCreateStep(getPreviousCreateStep(activeCreateStep)),
          onNext: handleCreateSkip,
          isFinal: activeCreateStep === createWizardSteps[createWizardSteps.length - 1].key,
          includeSkip: true,
          submitLabel: 'Create User',
        })}
      </>
    );
  }

  function renderDocumentStep() {
    return (
      <>
        <fieldset className="user-setup-readonly-fieldset" disabled={isViewMode}>
          <UserSetupSectionCard
            title="Document"
            description="Add one or more documents and skip if you want to complete them later."
            className="user-setup-create-step-card"
            actions={isViewMode ? null : (
              <button type="button" className="user-setup-secondary user-setup-mini-action" onClick={addDocumentRow}>
                <Icon name="plus" size={12} />
                <span>Add</span>
              </button>
            )}
          >
            <div className="user-setup-document-list">
          {documentRows.map((row, index) => (
            <div key={`document-row-${index}`} className="user-setup-document-card">
              <div className="user-setup-document-card-head">
                <strong>Document {index + 1}</strong>
                {documentRows.length > 1 && !isViewMode ? (
                  <button type="button" className="user-setup-document-remove" onClick={() => removeDocumentRow(index)} aria-label={`Remove document ${index + 1}`}>
                    &times;
                  </button>
                ) : null}
              </div>
              <div className="user-setup-form-grid user-setup-step-grid">
                <UserSetupSelect label="Document Type" value={row.documentType} onChange={(event) => updateDocumentRow(index, 'documentType', event.target.value)} options={userSetupDocumentTypes} />
                  <label className="user-setup-field">
                    <span>{getDocumentNumberLabel(row.documentType)}</span>
                    <input value={row.docName} onChange={(event) => updateDocumentRow(index, 'docName', event.target.value)} placeholder={getDocumentNumberPlaceholder(row.documentType)} />
                  </label>
                <label className="user-setup-field">
                  <span>Attachment</span>
                  <input type="file" accept="image/*,.pdf,.png,.jpg,.jpeg" onChange={(event) => updateDocumentRow(index, 'attachment', event.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          ))}
            </div>
          </UserSetupSectionCard>
        </fieldset>
        {renderStepFooter({
          steps: createWizardSteps,
          activeStep: activeCreateStep,
          onBack: () => goToCreateStep(getPreviousCreateStep(activeCreateStep)),
          onNext: handleCreateSkip,
          isFinal: activeCreateStep === createWizardSteps[createWizardSteps.length - 1].key,
          includeSkip: true,
          submitLabel: 'Create User',
        })}
      </>
    );
  }

  function renderCreateStepContent() {
    switch (activeCreateStep) {
      case 'address':
        return renderAddressStep();
      case 'education':
        return renderEducationStep();
      case 'experience':
        return renderExperienceStep();
      case 'bank':
        return renderBankStep();
      case 'document':
        return renderDocumentStep();
      default:
        return renderPersonalStep();
    }
  }

  function renderLegacyCreateForm() {
    const legacySections = buildLegacyCreateSections();

    return (
      <UserSetupSectionCard className="user-setup-create-form-panel">
        <div className="user-setup-create-body">
          <form className="user-setup-form-shell" onSubmit={submitUser}>
            <fieldset className="user-setup-readonly-fieldset" disabled={isViewMode}>
              {legacySections.map((section) => (
              <UserSetupFieldGroup
                  key={section.title}
                  title={section.title}
                  description={section.description}
                  items={section.items}
                  errors={userErrors}
                  onChange={updateUserField}
                  typeMap={{ password: 'password', email: 'email' }}
                  headerRight={section.headerRight}
                  columns={section.columns}
                  className={section.className || ''}
                />
              ))}

              <UserSetupSectionCard
                title="Document Info"
                description="Upload document records with the user."
                className="user-setup-create-step-card"
                actions={isViewMode ? null : (
                  <button type="button" className="user-setup-secondary user-setup-mini-action" onClick={addDocumentRow}>
                    <Icon name="plus" size={12} />
                    <span>Add</span>
                  </button>
                )}
              >
                <div className="user-setup-document-list">
                {documentRows.map((row, index) => (
                  <div key={`document-row-${index}`} className="user-setup-document-card">
                    <div className="user-setup-document-card-head">
                      <strong>Document {index + 1}</strong>
                      {documentRows.length > 1 && !isViewMode ? (
                        <button type="button" className="user-setup-document-remove" onClick={() => removeDocumentRow(index)} aria-label={`Remove document ${index + 1}`}>
                          &times;
                        </button>
                      ) : null}
                    </div>
                    <div className="user-setup-form-grid">
                      <UserSetupSelect label="Document Type" value={row.documentType} onChange={(event) => updateDocumentRow(index, 'documentType', event.target.value)} options={userSetupDocumentTypes} />
                      <label className="user-setup-field">
                        <span>{getDocumentNumberLabel(row.documentType)}</span>
                        <input value={row.docName} onChange={(event) => updateDocumentRow(index, 'docName', event.target.value)} placeholder={getDocumentNumberPlaceholder(row.documentType)} />
                      </label>
                      <label className="user-setup-field">
                        <span>Attachment</span>
                        <input type="file" accept="image/*,.pdf,.png,.jpg,.jpeg" onChange={(event) => updateDocumentRow(index, 'attachment', event.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                ))}
                </div>
              </UserSetupSectionCard>

              <UserSetupSectionCard title="Address Info" description="Capture a single address record with the user." className="user-setup-create-step-card">
                <div className="user-setup-form-grid user-setup-step-grid">
                <label className="user-setup-field">
                  <span>Address 1</span>
                  <input value={addressForm.permanent.address1} onChange={(event) => updateAddressField('permanent', 'address1', event.target.value)} placeholder="Enter address 1" />
                </label>
                <label className="user-setup-field is-optional">
                  <span>Address 2</span>
                  <input value={addressForm.permanent.address2} onChange={(event) => updateAddressField('permanent', 'address2', event.target.value)} placeholder="Enter address 2" />
                </label>
                <label className="user-setup-field">
                  <span>City</span>
                  <input value={addressForm.permanent.city} onChange={(event) => updateAddressField('permanent', 'city', event.target.value)} placeholder="Enter city" />
                </label>
                <label className="user-setup-field">
                  <span>State</span>
                  <input value={addressForm.permanent.state} onChange={(event) => updateAddressField('permanent', 'state', event.target.value)} placeholder="Enter state" />
                </label>
                <label className="user-setup-field">
                  <span>PIN</span>
                  <input value={addressForm.permanent.pin} onChange={(event) => updateAddressField('permanent', 'pin', event.target.value)} placeholder="Enter pin" />
                </label>
                </div>
              </UserSetupSectionCard>
            </fieldset>

            <div className="user-setup-form-actions wide">
              {isViewMode ? (
                <button type="button" className="user-setup-secondary" onClick={() => goToTab('users')}>
                  Back to List
                </button>
              ) : (
                <>
                  <button type="button" className="user-setup-secondary" onClick={() => { resetUserForm(); goToTab('users'); }}>
                    Cancel
                  </button>
                  <button type="submit" className="user-setup-primary">
                    {editingUserId ? 'Update User' : 'Create User'}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </UserSetupSectionCard>
    );
  }

  return (
    <DashboardShell activeKey={sidebarActiveKey} headerProps={{ companyText: config.badge }}>
      {isProfileMode ? (
        <div className="user-setup-profile-shell">
          {renderProfilePage()}
        </div>
      ) : (
        <>
      <UserSetupTabs tabs={tabs} activeTab={activeTab} onChange={goToTab} />

      <div className="user-setup-section-header">
        <div className="dashboard-section-heading">
          {activeTab === 'create' && isViewMode
            ? 'View User'
            : getUserSetupSectionTitle(activeTab, Boolean(editingUserId))}
        </div>
        <div className="user-setup-section-actions">
          {isViewMode ? (
            <Link to={{ pathname: location.pathname, search: '', hash: '#users' }} className="user-setup-section-button user-setup-action-small user-setup-secondary">
              Back to List
            </Link>
          ) : null}
        </div>
      </div>

      {activeTab === 'overview' ? (
        role === ROLES.COMPANY_ADMIN ? (
          <div className="dashboard-layout welcome-layout">
            <div className="welcome-main">
              <UserSetupSectionCard
                title="Employee Summary"
                className="superadmin-package-mini-card"
              >
                <div className="user-setup-list">
                  <div className="user-setup-list-item"><span>Total Employees</span><strong>{metrics[0].value}</strong></div>
                  <div className="user-setup-list-item"><span>Active</span><strong>{metrics[1].value}</strong></div>
                </div>
              </UserSetupSectionCard>
            </div>

            <div className="dashboard-right-col">
              <UserSetupSectionCard
                title="Quick Actions"
                description="Open the list or create an employee."
                className="superadmin-package-mini-card"
              >
                <div className="user-setup-action-grid">
                  <Link
                    to={{ pathname: location.pathname, search: '', hash: '#users' }}
                    className="user-setup-action-card"
                    onClick={() => goToTab('users')}
                  >
                    <strong>Employee List</strong>
                    <span>Search, view, edit, and delete records.</span>
                  </Link>
                  <Link
                    to={{ pathname: location.pathname, search: '', hash: '#create' }}
                    className="user-setup-action-card"
                    onClick={startCreateUser}
                  >
                    <strong>{editingUserId ? 'Edit Employee' : 'Create Employee'}</strong>
                    <span>Open the compact form flow.</span>
                  </Link>
                </div>
              </UserSetupSectionCard>
            </div>
          </div>
        ) : (
          <div className="dashboard-layout welcome-layout">
            <div className="welcome-main">
              <UserSetupSectionCard
                title="Client Limit Guide"
                description="Use the same package-fit guidance when checking user capacity."
                className="superadmin-package-mini-card"
              >
                <div className="superadmin-package-limit-guide">
                  {userClientLimitGuides.map((item) => (
                    <div key={item.range} className="superadmin-package-limit-item">
                      <div className="superadmin-package-limit-top">
                        <strong>{item.range}</strong>
                        <span>{item.title}</span>
                      </div>
                      <p>{item.note}</p>
                    </div>
                  ))}
                </div>
              </UserSetupSectionCard>

            </div>

            <div className="dashboard-right-col">
              <UserSetupSectionCard
                title="Quick Actions"
                description="Jump straight to the user list or create flow."
                className="superadmin-package-mini-card"
              >
                <div className="user-setup-action-grid">
                  <Link
                    to={{ pathname: location.pathname, search: '', hash: '#users' }}
                    className="user-setup-action-card"
                    onClick={() => goToTab('users')}
                  >
                    <strong>{role === ROLES.COMPANY_ADMIN || role === ROLES.HR ? 'Employee List' : 'User List'}</strong>
                    <span>Search, view, edit, and delete records.</span>
                  </Link>
                  <Link
                    to={{ pathname: location.pathname, search: '', hash: '#create' }}
                    className="user-setup-action-card"
                    onClick={startCreateUser}
                  >
                    <strong>{role === ROLES.COMPANY_ADMIN || role === ROLES.HR ? (editingUserId ? 'Edit Employee' : 'Create Employee') : (editingUserId ? 'Edit User' : 'Create User')}</strong>
                    <span>Open the compact form flow.</span>
                  </Link>
                </div>
              </UserSetupSectionCard>

              <UserSetupSectionCard
                title="Overview Stats"
                description="Only the essential counts."
                className="superadmin-package-mini-card"
              >
                <div className="user-setup-stats-grid">
                  {metrics.map((item) => (
                    <div key={item.label} className="user-setup-stat">
                      <div className="user-setup-stat-label">{item.label}</div>
                      <div className="user-setup-stat-value">{item.value}</div>
                      <div className="user-setup-stat-change">{item.change}</div>
                    </div>
                  ))}
                </div>
              </UserSetupSectionCard>
            </div>
          </div>
        )
      ) : null}

      {activeTab === 'users' ? (
        <div className="dashboard-layout superadmin-package-layout">
          <div className="dashboard-right-col superadmin-package-workspace superadmin-package-full">
            <div className="superadmin-package-table-card superadmin-master-grid-card">
              <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
                <div className="superadmin-master-searchbar-left">
                  <div className="superadmin-package-search superadmin-master-search">
                    <Icon name="search" size={14} />
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user, email, role, code" />
                  </div>
                </div>
                <div className="superadmin-master-searchbar-right">
                  <button type="button" className="superadmin-master-action-button tone-primary" onClick={startCreateUser}>
                    <Icon name="sparkles" size={14} />
                    <span>{role === ROLES.COMPANY_ADMIN || role === ROLES.HR ? 'Add Employee' : 'Add User'}</span>
                  </button>
                  <button
                    type="button"
                    className="superadmin-master-action-button tone-danger icon-only"
                    onClick={() => setDeleteUserId(selectedIds[0])}
                    disabled={!hasSelectedRows}
                    aria-label="Delete selected users"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
              <div className="superadmin-master-grid">
                <AgGridReact
                  rowData={filteredUsers}
                  columnDefs={gridColumnDefs}
                  defaultColDef={defaultColDef}
                  selectionColumnDef={{
                    width: 56,
                    pinned: 'left',
                    sortable: false,
                    filter: false,
                    resizable: false,
                    suppressHeaderMenuButton: true,
                    cellClass: 'superadmin-grid-select-cell',
                  }}
                  domLayout="autoHeight"
                  animateRows
                  getRowId={(params) => params.data.id}
                  theme="legacy"
                  rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true, enableClickSelection: true }}
                  suppressCellFocus
                  pagination
                  paginationPageSize={6}
                  paginationPageSizeSelector={[6, 10, 15]}
                  headerHeight={52}
                  rowHeight={56}
                  noRowsOverlayComponent={UserGridEmptyOverlay}
                  onSelectionChanged={handleSelectionChanged}
                  onRowClicked={(event) => {
                    if (event.data?.id) {
                      setSelectedId(event.data.id);
                    }
                  }}
                  rowClassRules={{
                    'superadmin-grid-row-selected': (params) => params.data?.id === selectedId,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'create' ? (
        <div className="user-setup-stack">
          {legacyCreateRoles.includes(role) ? (
            renderLegacyCreateForm()
          ) : (
            <UserSetupSectionCard className="user-setup-create-form-panel">
              <div className="user-setup-create-body">
                <form className="user-setup-form-shell" onSubmit={submitUser}>
                  <div className="user-setup-create-flow-context">
                    <div className="user-setup-flow-context-head">
                      <div>
                        <span className="user-setup-flow-context-label">Create Flow</span>
                        <strong>Personal Information unlocks the rest of the tabs.</strong>
                      </div>
                      <span className="user-setup-flow-context-chip">{isCreateWizardUnlocked ? 'Unlocked' : 'Locked'}</span>
                    </div>
                    <div className="user-setup-flow-context-grid">
                      <div>
                        <span>Current Step</span>
                        <strong>{activeCreateStepConfig.label}</strong>
                      </div>
                      <div>
                        <span>Progress</span>
                        <strong>{String(activeCreateStepIndex + 1).padStart(2, '0')} / {String(createWizardSteps.length).padStart(2, '0')}</strong>
                      </div>
                    </div>
                  </div>

                  <UserSetupTabs tabs={createWizardTabs} activeTab={activeCreateStep} onChange={goToCreateStep} />
                  {renderCreateStepContent()}
                </form>
              </div>
            </UserSetupSectionCard>
          )}
        </div>
      ) : null}

      {deleteUserId ? (
        <UserSetupModal title="Delete User" onClose={() => setDeleteUserId(null)} footer={<><button type="button" className="user-setup-secondary" onClick={() => setDeleteUserId(null)}>Cancel</button><button type="button" className="user-setup-primary danger" onClick={removeUser}>Delete</button></>}>
          <p className="user-setup-note">This will remove the user from the frontend demo state. Backend integration can replace this later.</p>
        </UserSetupModal>
      ) : null}
        </>
      )}
    </DashboardShell>
  );
}
