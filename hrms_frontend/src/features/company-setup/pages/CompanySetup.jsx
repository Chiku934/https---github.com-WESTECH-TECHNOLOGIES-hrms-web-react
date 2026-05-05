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
  loadCompanySetupDesignations,
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

const employeeWizardSteps = [
  { key: 'personal', label: 'Personal Information', progress: '01 / 06' },
  { key: 'address', label: 'Address', progress: '02 / 06' },
  { key: 'education', label: 'Education', progress: '03 / 06' },
  { key: 'experience', label: 'Experience', progress: '04 / 06' },
  { key: 'bank', label: 'Bank Account', progress: '05 / 06' },
  { key: 'document', label: 'Document', progress: '06 / 06' },
];

const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const documentTypeOptions = ['Adhar', 'Aadhar Card', 'PAN', 'Passport', 'Driving License'];

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

const createEmptyEducationRecord = (id = 1) => ({
  id,
  degreeName: '',
  instituteName: '',
  result: '',
  passingYear: '',
  attachmentName: '',
});

const createEmptyExperienceRecord = (id = 1) => ({
  id,
  companyName: '',
  position: '',
  address: '',
  workingDuration: '',
  attachmentName: '',
});

const createEmptyDocumentRecord = (id = 1) => ({
  id,
  documentType: 'Adhar',
  aadhaarNumber: '',
  attachmentName: '',
});

const createEmptyCompanyUserForm = (companyId = '') => ({
  id: null,
  companyId,
  userId: '',
  employeeCode: '',
  role: ROLES.EMPLOYEE,
  status: 'active',
  userName: '',
  password: '',
  designation: '',
  originalDesignation: '',
  joinedAt: '',
  leftAt: '',
  fullName: '',
  email: '',
  contact: '',
  gender: 'Male',
  bloodGroup: 'B+',
  alternateContact: '',
  dob: '',
  bioDetails: '',
  permanentAddress1: '',
  permanentAddress2: '',
  permanentCity: '',
  permanentState: '',
  permanentPin: '',
  presentAddress1: '',
  presentAddress2: '',
  presentCity: '',
  presentState: '',
  presentPin: '',
  education: [createEmptyEducationRecord()],
  experience: [createEmptyExperienceRecord()],
  bankAccount: {
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    attachmentName: '',
  },
  documents: [createEmptyDocumentRecord()],
});

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

function splitEmployeeName(fullName, email = '') {
  const trimmedName = String(fullName || '').trim();
  if (trimmedName) {
    return trimmedName.split(/\s+/).filter(Boolean);
  }

  const fallback = String(email || '').split('@')[0] || '';
  return fallback
    .split(/[._-]+/)
    .filter(Boolean);
}

function buildEmployeeCode(form) {
  const existingCode = String(form.employeeCode || '').trim();
  if (existingCode) {
    return existingCode;
  }

  const source = String(form.userName || form.email || form.fullName || '').trim();
  const normalized = source.replace(/[^a-z0-9]+/gi, '').toUpperCase();
  return `EMP-${(normalized || 'NEW').slice(0, 10)}`;
}

function getCurrentDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function buildEmployeeProfilePayload(form) {
  const nameParts = splitEmployeeName(form.fullName, form.email);
  const firstName = nameParts[0] || 'New';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Employee';
  const extraData = {
    bioDetails: form.bioDetails || '',
    alternateContact: form.alternateContact || '',
    presentAddress1: form.presentAddress1 || '',
    presentAddress2: form.presentAddress2 || '',
    presentCity: form.presentCity || '',
    presentState: form.presentState || '',
    presentPin: form.presentPin || '',
    education: form.education || [],
    experience: form.experience || [],
    bankAccount: form.bankAccount || {},
    documents: form.documents || [],
  };

  return {
    first_name: firstName,
    middle_name: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
    last_name: lastName,
    dob: form.dob || null,
    gender: form.gender || null,
    blood_group: form.bloodGroup || null,
    personal_email: form.email || null,
    personal_phone: form.contact || null,
    emergency_contact_phone: form.alternateContact || null,
    address_line1: form.permanentAddress1 || null,
    address_line2: form.permanentAddress2 || null,
    city: form.permanentCity || null,
    state: form.permanentState || null,
    postal_code: form.permanentPin || null,
    country: 'India',
    extra_data: extraData,
  };
}

function buildEmployeeAssignmentPayload(form) {
  const designationId = Number(form.designation || 0) || null;
  return {
    designation_id: designationId,
    start_date: form.joinedAt || getCurrentDateValue(),
    employment_type: 'full-time',
    work_location: form.presentCity || form.permanentCity || '',
  };
}

function normalizeEmployeeToForm(employee) {
  const profile = employee.profile || {};
  const extraData = profile.extra_data || {};
  const assignment = employee.assignment || employee.assignments?.[0] || null;
  const designationId = employee.designationId || assignment?.designationId || assignment?.designation_id || '';
  const bankAccount = extraData.bankAccount || {};
  const education = Array.isArray(extraData.education) && extraData.education.length
    ? extraData.education
    : [createEmptyEducationRecord()];
  const experience = Array.isArray(extraData.experience) && extraData.experience.length
    ? extraData.experience
    : [createEmptyExperienceRecord()];
  const documents = Array.isArray(extraData.documents) && extraData.documents.length
    ? extraData.documents
    : [createEmptyDocumentRecord()];

  return {
    ...createEmptyCompanyUserForm(String(employee.companyId || '')),
    id: employee.id,
    companyId: String(employee.companyId || ''),
    userId: String(employee.userId || ''),
    employeeCode: employee.employeeCode || '',
    role: employee.role || ROLES.EMPLOYEE,
    status: employee.status || 'active',
    userName: employee.userName || '',
    password: '',
    designation: designationId ? String(designationId) : '',
    originalDesignation: designationId ? String(designationId) : '',
    joinedAt: employee.joinedAt || assignment?.startDate || assignment?.start_date || '',
    leftAt: employee.leftAt || '',
    fullName: employee.fullName || '',
    email: employee.email || profile.personal_email || '',
    contact: employee.phone || profile.personal_phone || '',
    gender: profile.gender || 'Male',
    bloodGroup: profile.blood_group || 'B+',
    alternateContact: extraData.alternateContact || profile.emergency_contact_phone || '',
    dob: profile.dob || '',
    bioDetails: extraData.bioDetails || '',
    permanentAddress1: profile.address_line1 || '',
    permanentAddress2: profile.address_line2 || '',
    permanentCity: profile.city || '',
    permanentState: profile.state || '',
    permanentPin: profile.postal_code || '',
    presentAddress1: extraData.presentAddress1 || '',
    presentAddress2: extraData.presentAddress2 || '',
    presentCity: extraData.presentCity || '',
    presentState: extraData.presentState || '',
    presentPin: extraData.presentPin || '',
    education,
    experience,
    bankAccount: {
      accountHolder: bankAccount.accountHolder || '',
      bankName: bankAccount.bankName || '',
      accountNumber: bankAccount.accountNumber || '',
      ifscCode: bankAccount.ifscCode || '',
      branch: bankAccount.branch || '',
      attachmentName: bankAccount.attachmentName || '',
    },
    documents,
  };
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
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  if (!form.contact.trim()) errors.contact = 'Contact is required.';
  if (!form.userName.trim()) errors.userName = 'Username is required.';
  if (!form.password.trim()) errors.password = 'Password is required.';
  if (!form.designation) errors.designation = 'Designation is required.';
  if (!form.status) errors.status = 'Status is required.';

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
      <strong>{data.fullName || 'Employee'}</strong>
      <span>{data.email || data.personalEmail || data.userName || '-'}</span>
    </div>
  );
}

function ProfileDetailCell({ title, subtitle }) {
  return (
    <div className="superadmin-client-cell">
      <strong>{title || '-'}</strong>
      <span>{subtitle || '-'}</span>
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
  const [createStep, setCreateStep] = useState(employeeWizardSteps[0].key);
  const [companies, setCompanies] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [userPool, setUserPool] = useState([]);
  const [designationPool, setDesignationPool] = useState([]);
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [companyErrors, setCompanyErrors] = useState({});
  const [companyUserForm, setCompanyUserForm] = useState(createEmptyCompanyUserForm());
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
        const [nextCompanies, nextCompanyUsers, nextUsers, nextRoles] = await Promise.all([
          loadCompanySetupCompanies(role),
          loadCompanySetupCompanyUsers(role),
          loadCompanySetupUsers(role),
          loadCompanySetupDesignations(role),
        ]);

        if (!isMounted) return;

        setCompanies(nextCompanies);
        setCompanyUsers(nextCompanyUsers);
        setUserPool(nextUsers);
        setDesignationPool(nextRoles);
        setCompanyFilter('all');
        setCompanyForm(emptyCompanyForm);
        setCompanyErrors({});
        setCompanyUserForm(createEmptyCompanyUserForm(nextCompanies[0]?.id ? String(nextCompanies[0].id) : ''));
        setCompanyUserErrors({});
        setCreateStep(employeeWizardSteps[0].key);
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
    const designation = designationPool.find((record) => String(record.id) === String(item.designationId));

    return {
      ...item,
      companyName: company?.name || item.companyName || '',
      fullName: user?.fullName || user?.displayName || item.fullName || '',
      userName: user?.userName || item.userName || '',
      email: user?.email || item.email || '',
      phone: user?.phone || item.phone || '',
      designationTitle: item.designationTitle || designation?.title || item.roleLabel || '',
    };
  }), [companies, companyUsers, designationPool, userPool]);

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
      const matchesSearch = !query || `${item.companyName} ${item.fullName} ${item.email} ${item.personalEmail} ${item.personalPhone} ${item.employeeCode} ${item.designationTitle} ${item.gender} ${item.bloodGroup} ${item.city} ${item.state} ${item.status}`
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
      { label: 'Employees', value: String(companyUsers.length), change: `${activeAssignments} active assignments` },
      { label: 'Users Pool', value: String(userPool.length), change: 'From users table' },
      { label: 'Designations', value: String(designationPool.length), change: 'From designation table' },
    ];
  }, [companyUsers.length, companies.length, designationPool.length, userPool.length]);

  const companyOptions = useMemo(() => companies.map((company) => ({ value: String(company.id), label: `${company.name} (${company.slug})` })), [companies]);
  const userOptions = useMemo(() => userPool.map((user) => ({ value: String(user.id), label: `${user.displayName} - ${user.email}` })), [userPool]);
  const designationOptions = useMemo(() => designationPool.map((item) => ({
    value: String(item.id),
    label: item.title,
  })), [designationPool]);

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
    setCompanyUserForm(createEmptyCompanyUserForm(companyOptions[0]?.value || ''));
    setCompanyUserErrors({});
    setCreateStep(employeeWizardSteps[0].key);
  };

  const updateCompanyUserField = (field, value) => {
    setCompanyUserForm((current) => ({ ...current, [field]: value }));
  };

  const updateCompanyUserRecord = (collection, index, field, value) => {
    setCompanyUserForm((current) => ({
      ...current,
      [collection]: current[collection].map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const addCompanyUserRecord = (collection) => {
    setCompanyUserForm((current) => {
      const nextId = current[collection].length + 1;
      const createRecord = collection === 'education'
        ? createEmptyEducationRecord
        : collection === 'experience'
          ? createEmptyExperienceRecord
          : createEmptyDocumentRecord;

      return {
        ...current,
        [collection]: [...current[collection], createRecord(nextId)],
      };
    });
  };

  const removeCompanyUserRecord = (collection, index) => {
    setCompanyUserForm((current) => {
      const records = current[collection];
      if (!Array.isArray(records) || records.length <= 1) {
        return current;
      }

      return {
        ...current,
        [collection]: records.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const updateCompanyUserBankField = (field, value) => {
    setCompanyUserForm((current) => ({
      ...current,
      bankAccount: {
        ...current.bankAccount,
        [field]: value,
      },
    }));
  };

  const goToCreateStep = (nextStep) => {
    if (employeeWizardSteps.some((step) => step.key === nextStep)) {
      setCreateStep(nextStep);
    }
  };

  const stepIndex = Math.max(
    0,
    employeeWizardSteps.findIndex((step) => step.key === createStep),
  );
  const currentStep = employeeWizardSteps[stepIndex] || employeeWizardSteps[0];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === employeeWizardSteps.length - 1;

  const goToPreviousStep = () => {
    goToCreateStep(employeeWizardSteps[Math.max(0, stepIndex - 1)]?.key || employeeWizardSteps[0].key);
  };

  const goToNextStep = () => {
    if (isLastStep) {
      return;
    }

    goToCreateStep(employeeWizardSteps[Math.min(employeeWizardSteps.length - 1, stepIndex + 1)]?.key || employeeWizardSteps[0].key);
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

    const joinedAt = companyUserForm.joinedAt || getCurrentDateValue();
    const payload = {
      email: companyUserForm.email.trim(),
      password: companyUserForm.password,
      phone: companyUserForm.contact.trim(),
      employee_code: buildEmployeeCode(companyUserForm),
      joined_at: joinedAt,
      status: companyUserForm.status,
      profile: buildEmployeeProfilePayload(companyUserForm),
    };

    const shouldUpdateAssignment = !companyUserForm.id
      || String(companyUserForm.designation || '') !== String(companyUserForm.originalDesignation || '');

    if (shouldUpdateAssignment) {
      payload.assignment = buildEmployeeAssignmentPayload({
        ...companyUserForm,
        joinedAt,
      });
    }

    try {
      const saveRequest = companyUserForm.id
        ? updateCompanyUser(companyUserForm.id, payload)
        : createCompanyUser(payload);
      await saveRequest;

      const refreshedCompanyUsers = await loadCompanySetupCompanyUsers(role);
      setCompanyUsers(refreshedCompanyUsers);
      setDesignationPool(await loadCompanySetupDesignations(role));
      resetCompanyUserForm();
    } catch (error) {
      setCompanyUserErrors((current) => ({
        ...current,
        form: getErrorMessage(error, 'Failed to save company user.'),
      }));
    }
  };

  const editCompanyUser = (companyUser) => {
    setCompanyUserForm(normalizeEmployeeToForm(companyUser));
    setCompanyUserErrors({});
    setTab('create');
    setCreateStep(employeeWizardSteps[0].key);
    navigate(tabToHash.create, { replace: true });
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
      headerName: 'Employee Profile',
      field: 'fullName',
      minWidth: 260,
      flex: 1.3,
      filter: 'agTextColumnFilter',
      cellRenderer: ({ data }) => (
        <ProfileDetailCell
          title={data?.fullName || 'Employee'}
          subtitle={`${data?.personalEmail || data?.email || '-'}${data?.personalPhone ? ` · ${data.personalPhone}` : ''}`}
        />
      ),
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'user', enableFilterButton: true },
    },
    {
      headerName: 'Designation',
      field: 'designationTitle',
      width: 140,
      filter: 'agTextColumnFilter',
      cellRenderer: ({ value }) => <StatusChip value={value || '-'} />,
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'shield', enableFilterButton: true },
    },
    {
      headerName: 'Gender',
      field: 'gender',
      width: 120,
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }) => value || '-',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'venus-mars', enableFilterButton: true },
    },
    {
      headerName: 'DOB',
      field: 'dob',
      width: 120,
      filter: 'agDateColumnFilter',
      valueFormatter: ({ value }) => value || '-',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'calendar', enableFilterButton: true },
    },
    {
      headerName: 'Blood Group',
      field: 'bloodGroup',
      width: 130,
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }) => value || '-',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'droplet', enableFilterButton: true },
    },
    {
      headerName: 'City',
      field: 'city',
      width: 140,
      filter: 'agTextColumnFilter',
      valueFormatter: ({ value }) => value || '-',
      headerComponent: CompanyGridHeader,
      headerComponentParams: { headerIcon: 'location-dot', enableFilterButton: true },
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
    <div className="dashboard-layout superadmin-package-layout company-admin-list-page company-admin-create-employee-page">
      <div className="superadmin-package-workspace company-admin-create-employee-workspace">
        <div className="company-admin-create-flow-card">
          <div className="company-admin-create-flow-copy">
            <div className="superadmin-package-kicker">Create Flow</div>
            <h1>Personal Information unlocks the rest of the tabs.</h1>
            <p>Keep the employee record clean and consistent so the wizard stays ready for access, tracking, and reporting.</p>
          </div>

          <div className="company-admin-create-flow-meta">
            <div className="company-admin-create-flow-pill">Unlocked</div>
            <div className="company-admin-create-flow-stat">
              <span>Current Step</span>
              <strong>{currentStep.label}</strong>
            </div>
            <div className="company-admin-create-flow-stat">
              <span>Progress</span>
              <strong>{currentStep.progress}</strong>
            </div>
          </div>
        </div>

        <div className="company-admin-create-tabs">
          {employeeWizardSteps.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`company-admin-create-tab ${createStep === item.key ? 'active' : ''}`}
              onClick={() => goToCreateStep(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form className="company-admin-create-form" onSubmit={submitCompanyUser}>
          {createStep === 'personal' ? (
            <section className="company-admin-create-section">
              <div className="company-admin-create-section-header">
                <div>
                  <h3>Personal Info</h3>
                  <p>Core identity and contact details.</p>
                </div>
                <div className="company-admin-create-avatar" aria-hidden="true">
                  <Icon name="gallery" size={38} />
                </div>
              </div>

              <div className="company-admin-create-grid company-admin-create-grid-four">
                <label className="superadmin-package-form-field">
                  <span>Full Name *</span>
                  <input
                    value={companyUserForm.fullName}
                    onChange={(event) => updateCompanyUserField('fullName', event.target.value)}
                    placeholder="Enter Full Name"
                  />
                </label>
                <label className="superadmin-package-form-field">
                  <span>Email *</span>
                  <input
                      type="email"
                      autoComplete="email"
                      value={companyUserForm.email}
                      onChange={(event) => updateCompanyUserField('email', event.target.value)}
                      placeholder="Enter Email"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Contact *</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="\d{10}"
                      maxLength={10}
                      value={companyUserForm.contact}
                      onChange={(event) => updateCompanyUserField('contact', event.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter Contact"
                    />
                  </label>
                </div>

              <div className="company-admin-create-grid company-admin-create-grid-three company-admin-create-grid-offset">
                <label className="superadmin-package-form-field">
                  <span>Blood Group *</span>
                  <select value={companyUserForm.bloodGroup} onChange={(event) => updateCompanyUserField('bloodGroup', event.target.value)}>
                    {bloodGroupOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="superadmin-package-form-field">
                  <span>Alternate Contact *</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="\d{10}"
                    maxLength={10}
                    value={companyUserForm.alternateContact}
                    onChange={(event) => updateCompanyUserField('alternateContact', event.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter Alt Contact"
                  />
                </label>
                <label className="superadmin-package-form-field">
                  <span>Date of Birth (DOB) *</span>
                  <input
                    type="date"
                    value={companyUserForm.dob}
                    onChange={(event) => updateCompanyUserField('dob', event.target.value)}
                  />
                </label>
              </div>

              <label className="superadmin-package-form-field company-admin-create-wide-field">
                <span>Bio Details *</span>
                <textarea
                  value={companyUserForm.bioDetails}
                  onChange={(event) => updateCompanyUserField('bioDetails', event.target.value)}
                  placeholder="Write a short bio"
                />
              </label>

              <div className="company-admin-create-section company-admin-create-login-section">
                <div className="company-admin-create-section-header company-admin-create-section-header-tight">
                  <div>
                    <h3>Login Info</h3>
                    <p>Workspace credentials and access status.</p>
                  </div>
                </div>

                <div className="company-admin-create-grid company-admin-create-grid-four">
                  <label className="superadmin-package-form-field">
                    <span>Username *</span>
                    <input
                      value={companyUserForm.userName}
                      onChange={(event) => updateCompanyUserField('userName', event.target.value)}
                      placeholder="Enter username"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Password *</span>
                    <input
                      type="password"
                      value={companyUserForm.password}
                      onChange={(event) => updateCompanyUserField('password', event.target.value)}
                      placeholder="Enter password"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Designation *</span>
                    <select
                      value={companyUserForm.designation}
                      onChange={(event) => updateCompanyUserField('designation', event.target.value)}
                    >
                      <option value="">Select designation</option>
                      {designationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Status *</span>
                    <select
                      value={companyUserForm.status}
                      onChange={(event) => updateCompanyUserField('status', event.target.value)}
                    >
                      {companySetupUserStatusOptions.map((option) => (
                        <option key={option} value={option}>
                          {capitalize(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </section>
          ) : null}

          {createStep === 'address' ? (
            <section className="company-admin-create-section">
              <div className="company-admin-create-section-header company-admin-create-section-header-tight">
                <div>
                  <h3>Address</h3>
                  <p>Capture both permanent and present addresses.</p>
                </div>
              </div>

              {[
                { key: 'permanent', title: 'Permanent Address', subtitle: 'Primary home address' },
                { key: 'present', title: 'Present Address', subtitle: 'Current stay address' },
              ].map((block) => (
                <div key={block.key} className="company-admin-create-nested-card">
                  <div className="company-admin-create-nested-title">
                    <strong>{block.title}</strong>
                    <span>{block.subtitle}</span>
                  </div>
                  <div className="company-admin-create-grid company-admin-create-grid-four">
                    <label className="superadmin-package-form-field">
                      <span>Address 1 *</span>
                      <input
                        value={block.key === 'permanent' ? companyUserForm.permanentAddress1 : companyUserForm.presentAddress1}
                        onChange={(event) => updateCompanyUserField(block.key === 'permanent' ? 'permanentAddress1' : 'presentAddress1', event.target.value)}
                        placeholder="Enter address 1"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>Address 2</span>
                      <input
                        value={block.key === 'permanent' ? companyUserForm.permanentAddress2 : companyUserForm.presentAddress2}
                        onChange={(event) => updateCompanyUserField(block.key === 'permanent' ? 'permanentAddress2' : 'presentAddress2', event.target.value)}
                        placeholder="Enter address 2"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>City *</span>
                      <input
                        value={block.key === 'permanent' ? companyUserForm.permanentCity : companyUserForm.presentCity}
                        onChange={(event) => updateCompanyUserField(block.key === 'permanent' ? 'permanentCity' : 'presentCity', event.target.value)}
                        placeholder="Enter city"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>State *</span>
                      <input
                        value={block.key === 'permanent' ? companyUserForm.permanentState : companyUserForm.presentState}
                        onChange={(event) => updateCompanyUserField(block.key === 'permanent' ? 'permanentState' : 'presentState', event.target.value)}
                        placeholder="Enter state"
                      />
                    </label>
                  </div>
                  <div className="company-admin-create-grid company-admin-create-grid-pin">
                    <label className="superadmin-package-form-field">
                      <span>PIN *</span>
                      <input
                        value={block.key === 'permanent' ? companyUserForm.permanentPin : companyUserForm.presentPin}
                        onChange={(event) => updateCompanyUserField(block.key === 'permanent' ? 'permanentPin' : 'presentPin', event.target.value)}
                        placeholder="Enter pin"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          {createStep === 'education' ? (
            <section className="company-admin-create-section">
              <div className="company-admin-create-section-header">
                <div>
                  <h3>Education</h3>
                  <p>Add one or more education records for the user.</p>
                </div>
                <button type="button" className="company-admin-create-add-btn" onClick={() => addCompanyUserRecord('education')}>
                  <span className="company-admin-create-add-icon">+</span>
                  Add
                </button>
              </div>

              {companyUserForm.education.map((record, index) => (
                <div key={record.id} className="company-admin-create-nested-card">
                  <div className="company-admin-create-nested-title">
                    <div>
                      <strong>Education {index + 1}</strong>
                    </div>
                    <button
                      type="button"
                      className="company-admin-create-remove-btn"
                      onClick={() => removeCompanyUserRecord('education', index)}
                      disabled={companyUserForm.education.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="company-admin-create-grid company-admin-create-grid-four">
                    <label className="superadmin-package-form-field">
                      <span>Degree Name *</span>
                      <input
                        value={record.degreeName}
                        onChange={(event) => updateCompanyUserRecord('education', index, 'degreeName', event.target.value)}
                        placeholder="Enter degree name"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>Institute Name *</span>
                      <input
                        value={record.instituteName}
                        onChange={(event) => updateCompanyUserRecord('education', index, 'instituteName', event.target.value)}
                        placeholder="Enter institute name"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>Result *</span>
                      <input
                        value={record.result}
                        onChange={(event) => updateCompanyUserRecord('education', index, 'result', event.target.value)}
                        placeholder="Enter result"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>Passing Year *</span>
                      <input
                        value={record.passingYear}
                        onChange={(event) => updateCompanyUserRecord('education', index, 'passingYear', event.target.value)}
                        placeholder="Enter passing year"
                      />
                    </label>
                  </div>
                  <label className="superadmin-package-form-field company-admin-create-wide-field">
                    <span>Attachment *</span>
                    <input
                      type="file"
                      className="company-admin-create-file-input"
                      onChange={(event) => updateCompanyUserRecord('education', index, 'attachmentName', event.target.files?.[0]?.name || '')}
                    />
                  </label>
                </div>
              ))}
            </section>
          ) : null}

          {createStep === 'experience' ? (
            <section className="company-admin-create-section">
              <div className="company-admin-create-section-header">
                <div>
                  <h3>Experience</h3>
                  <p>Add one or more work history entries for the user.</p>
                </div>
                <button type="button" className="company-admin-create-add-btn" onClick={() => addCompanyUserRecord('experience')}>
                  <span className="company-admin-create-add-icon">+</span>
                  Add
                </button>
              </div>

              {companyUserForm.experience.map((record, index) => (
                <div key={record.id} className="company-admin-create-nested-card">
                  <div className="company-admin-create-nested-title">
                    <div>
                      <strong>Experience {index + 1}</strong>
                    </div>
                    <button
                      type="button"
                      className="company-admin-create-remove-btn"
                      onClick={() => removeCompanyUserRecord('experience', index)}
                      disabled={companyUserForm.experience.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="company-admin-create-grid company-admin-create-grid-four">
                    <label className="superadmin-package-form-field">
                      <span>Company Name *</span>
                      <input
                        value={record.companyName}
                        onChange={(event) => updateCompanyUserRecord('experience', index, 'companyName', event.target.value)}
                        placeholder="Enter company name"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>Position *</span>
                      <input
                        value={record.position}
                        onChange={(event) => updateCompanyUserRecord('experience', index, 'position', event.target.value)}
                        placeholder="Enter position"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>Address *</span>
                      <input
                        value={record.address}
                        onChange={(event) => updateCompanyUserRecord('experience', index, 'address', event.target.value)}
                        placeholder="Enter address"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>Working Duration *</span>
                      <input
                        value={record.workingDuration}
                        onChange={(event) => updateCompanyUserRecord('experience', index, 'workingDuration', event.target.value)}
                        placeholder="Enter working duration"
                      />
                    </label>
                  </div>
                  <label className="superadmin-package-form-field company-admin-create-wide-field">
                    <span>Attachment *</span>
                    <input
                      type="file"
                      className="company-admin-create-file-input"
                      onChange={(event) => updateCompanyUserRecord('experience', index, 'attachmentName', event.target.files?.[0]?.name || '')}
                    />
                  </label>
                </div>
              ))}
            </section>
          ) : null}

          {createStep === 'bank' ? (
            <section className="company-admin-create-section">
              <div className="company-admin-create-section-header company-admin-create-section-header-tight">
                <div>
                  <h3>Bank Account</h3>
                  <p>Capture payroll and payout details.</p>
                </div>
              </div>

              <div className="company-admin-create-grid company-admin-create-grid-four">
                <label className="superadmin-package-form-field">
                  <span>Account Holder *</span>
                  <input
                    value={companyUserForm.bankAccount.accountHolder}
                    onChange={(event) => updateCompanyUserBankField('accountHolder', event.target.value)}
                    placeholder="Enter account holder"
                  />
                </label>
                <label className="superadmin-package-form-field">
                  <span>Bank Name *</span>
                  <input
                    value={companyUserForm.bankAccount.bankName}
                    onChange={(event) => updateCompanyUserBankField('bankName', event.target.value)}
                    placeholder="Enter bank name"
                  />
                </label>
                <label className="superadmin-package-form-field">
                  <span>Account Number *</span>
                  <input
                    value={companyUserForm.bankAccount.accountNumber}
                    onChange={(event) => updateCompanyUserBankField('accountNumber', event.target.value)}
                    placeholder="Enter account number"
                  />
                </label>
                <label className="superadmin-package-form-field">
                  <span>IFSC Code *</span>
                  <input
                    value={companyUserForm.bankAccount.ifscCode}
                    onChange={(event) => updateCompanyUserBankField('ifscCode', event.target.value)}
                    placeholder="Enter IFSC code"
                  />
                </label>
              </div>

              <label className="superadmin-package-form-field company-admin-create-wide-field">
                <span>Branch *</span>
                <input
                  value={companyUserForm.bankAccount.branch}
                  onChange={(event) => updateCompanyUserBankField('branch', event.target.value)}
                  placeholder="Enter branch name"
                />
              </label>

              <label className="superadmin-package-form-field company-admin-create-file-wrap">
                <span>Attachment *</span>
                <input
                  type="file"
                  className="company-admin-create-file-input"
                  onChange={(event) => updateCompanyUserBankField('attachmentName', event.target.files?.[0]?.name || '')}
                />
              </label>
            </section>
          ) : null}

          {createStep === 'document' ? (
            <section className="company-admin-create-section">
              <div className="company-admin-create-section-header">
                <div>
                  <h3>Document</h3>
                  <p>Add one or more documents and skip if you want to complete them later.</p>
                </div>
                <button type="button" className="company-admin-create-add-btn" onClick={() => addCompanyUserRecord('documents')}>
                  <span className="company-admin-create-add-icon">+</span>
                  Add
                </button>
              </div>

              {companyUserForm.documents.map((record, index) => (
                <div key={record.id} className="company-admin-create-nested-card">
                  <div className="company-admin-create-nested-title">
                    <div>
                      <strong>Document {index + 1}</strong>
                    </div>
                    <button
                      type="button"
                      className="company-admin-create-remove-btn"
                      onClick={() => removeCompanyUserRecord('documents', index)}
                      disabled={companyUserForm.documents.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="company-admin-create-grid company-admin-create-grid-document">
                    <label className="superadmin-package-form-field">
                      <span>Document Type *</span>
                      <select
                        value={record.documentType}
                        onChange={(event) => updateCompanyUserRecord('documents', index, 'documentType', event.target.value)}
                      >
                        {documentTypeOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>Aadhar Number *</span>
                      <input
                        value={record.aadhaarNumber}
                        onChange={(event) => updateCompanyUserRecord('documents', index, 'aadhaarNumber', event.target.value)}
                        placeholder="Enter Aadhar number"
                      />
                    </label>
                    <label className="superadmin-package-form-field">
                      <span>Attachment *</span>
                      <input
                        type="file"
                        className="company-admin-create-file-input"
                        onChange={(event) => updateCompanyUserRecord('documents', index, 'attachmentName', event.target.files?.[0]?.name || '')}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          <div className="company-admin-create-form-footer">
            {isFirstStep ? (
              <>
                <button
                  type="button"
                  className="company-admin-create-button secondary"
                  onClick={resetCompanyUserForm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="company-admin-create-button primary"
                  onClick={goToNextStep}
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="company-admin-create-button secondary"
                  onClick={goToPreviousStep}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="company-admin-create-button secondary"
                  onClick={goToNextStep}
                >
                  Skip for later
                </button>
                {isLastStep ? (
                  <button type="submit" className="company-admin-create-button primary">
                    Create User
                  </button>
                ) : (
                  <button type="button" className="company-admin-create-button primary" onClick={goToNextStep}>
                    Continue
                  </button>
                )}
              </>
            )}
          </div>
        </form>
        {companyUserErrors.form ? <small className="superadmin-package-error">{companyUserErrors.form}</small> : null}
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
                setCreateStep(employeeWizardSteps[0].key);
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
