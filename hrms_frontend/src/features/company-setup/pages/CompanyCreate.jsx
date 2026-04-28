import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import { ROLES } from '../../../app/config/roles';
import { resolveRoleFromStorage } from '../../../data/navigation/index.js';
import authService from '../../../services/authService';
import {
  companySetupCompanyStatusOptions,
  companySetupCountryOptions,
  companySetupPlanOptions,
  companySetupTimezoneOptions,
} from '../data/companySetupData';
import { createCompany, updateCompany, loadCompanySetupCompanies } from '../services/companySetupService';
import '../../../features/super-admin/styles/packages.css';
import '../../../features/super-admin/styles/clients.css';

const wizardSteps = [
  { key: 'details', label: 'Company Details'},
  { key: 'address', label: 'Address'},
  { key: 'documents', label: 'Documents'},
  { key: 'admin', label: 'Admin Setup'},
  { key: 'permissions', label: 'Permissions'},
];

const permissionOptions = [
  { key: 'employee-management', label: 'Employee Management', description: 'Manage users, company users, and basic organization records.' },
  { key: 'attendance', label: 'Attendance', description: 'Enable attendance tracking and regularization.' },
  { key: 'leave', label: 'Leave Management', description: 'Allow leave requests, approvals, and policy setup.' },
  { key: 'timesheet', label: 'Timesheet', description: 'Allow weekly entries, approvals, and reporting.' },
  { key: 'projects', label: 'Projects', description: 'Allow project creation, assignments, and tracking.' },
  { key: 'payroll', label: 'Payroll', description: 'Enable payroll visibility and processing access.' },
  { key: 'reports', label: 'Reports', description: 'Provide dashboards and export access for reporting.' },
  { key: 'performance', label: 'Performance', description: 'Enable reviews, feedback, and performance workflows.' },
  { key: 'expenses', label: 'Expenses', description: 'Enable expense claims and approvals.' },
  { key: 'helpdesk', label: 'Helpdesk', description: 'Enable support tickets and knowledge base access.' },
];

const recommendedPermissionsByPlan = {
  starter: ['employee-management', 'attendance', 'leave'],
  pro: ['employee-management', 'attendance', 'leave', 'timesheet', 'projects', 'reports'],
  enterprise: ['employee-management', 'attendance', 'leave', 'timesheet', 'projects', 'payroll', 'reports', 'performance', 'expenses', 'helpdesk'],
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

const emptyWizardData = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  addressCountryCode: 'IN',
  phone: '',
  website: '',
  registrationNumber: '',
  taxId: '',
  panNumber: '',
  incorporationDate: '',
  logoUrl: '',
  documentNotes: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  adminPhone: '',
  adminRole: ROLES.COMPANY_ADMIN,
  adminMode: 'invite',
  adminNotes: '',
  permissions: [],
};

const emptyStepProgress = {
  details: 'pending',
  address: 'pending',
  documents: 'pending',
  admin: 'pending',
  permissions: 'pending',
};

const tabToHash = {
  details: '#details',
  address: '#address',
  documents: '#documents',
  admin: '#admin',
  permissions: '#permissions',
};

const hashToTab = Object.fromEntries(Object.entries(tabToHash).map(([key, value]) => [value, key]));

const setupTopTabs = [
  { key: 'overview', label: 'Overview', to: '/super-admin/company-setup' },
  { key: 'companies', label: 'Companies', to: '/super-admin/company-setup#companies' },
  { key: 'create', label: 'Create Company', to: '/super-admin/company-setup/create' },
];

const storagePrefix = 'company-setup-wizard';

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

function validateAddressForm(form) {
  const errors = {};
  if (!form.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required.';
  if (!form.city.trim()) errors.city = 'City is required.';
  if (!form.state.trim()) errors.state = 'State is required.';
  if (!form.postalCode.trim()) errors.postalCode = 'Postal code is required.';
  if (!form.addressCountryCode) errors.addressCountryCode = 'Country is required.';
  return errors;
}

function normalizeCompanyForm(company = null) {
  if (!company) return emptyCompanyForm;

  return {
    id: company.id ?? null,
    name: company.name || '',
    slug: company.slug || '',
    legalName: company.legalName || '',
    countryCode: company.countryCode || 'IN',
    timezone: company.timezone || 'Asia/Kolkata',
    plan: company.plan || 'pro',
    status: company.status || 'active',
  };
}

function buildDraftKey(companyId) {
  return `${storagePrefix}:${companyId ? String(companyId) : 'new'}`;
}

function readDraft(companyId) {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(buildDraftKey(companyId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeDraft(companyId, data) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(buildDraftKey(companyId), JSON.stringify(data));
  } catch {
    // Ignore storage failures so the form still works without persistence.
  }
}

function removeDraft(companyId) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(buildDraftKey(companyId));
  } catch {
    // Ignore storage failures.
  }
}

function getRecommendedPermissions(plan) {
  return recommendedPermissionsByPlan[plan] || recommendedPermissionsByPlan.pro;
}

function buildWizardPayload({ companyForm, wizardData, stepProgress, activeStep }) {
  return {
    companyForm,
    wizardData,
    stepProgress,
    activeStep,
  };
}

function SmallCard({ title, children, className = '' }) {
  return (
    <section className={`dashboard-card superadmin-package-mini-card ${className}`.trim()}>
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

function StepStateChip({ value }) {
  const tone = value === 'saved'
    ? 'tone-active'
    : value === 'skipped'
      ? 'tone-draft'
      : 'tone-inactive';

  return <span className={`role-status-chip ${tone}`}>{capitalize(value)}</span>;
}

export default function CompanyCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = resolveRoleFromStorage();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const existingCompany = location.state?.company || null;

  const [companyForm, setCompanyForm] = useState(() => normalizeCompanyForm(existingCompany));
  const [wizardData, setWizardData] = useState(emptyWizardData);
  const [stepProgress, setStepProgress] = useState(() => ({
    ...emptyStepProgress,
    details: existingCompany?.id ? 'saved' : 'pending',
  }));
  const [activeStep, setActiveStep] = useState(hashToTab[location.hash] || 'details');
  const [companies, setCompanies] = useState([]);
  const [companyErrors, setCompanyErrors] = useState({});
  const [stepErrors, setStepErrors] = useState({
    address: {},
  });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const isEdit = Boolean(companyForm.id || existingCompany?.id);
  const wizardKey = companyForm.id || existingCompany?.id || null;
  const isAdvancedUnlocked = stepProgress.details === 'saved';

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await loadCompanySetupCompanies(role);
        setCompanies(data);
      } catch (error) {
        setLoadError(getErrorMessage(error, 'Failed to load companies.'));
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [role]);

  useEffect(() => {
    const draft = readDraft(wizardKey);
    if (!draft) return;

    if (draft.companyForm) {
      setCompanyForm((current) => ({ ...current, ...draft.companyForm }));
    }

    if (draft.wizardData) {
      setWizardData((current) => ({ ...current, ...draft.wizardData }));
    }

    if (draft.stepProgress) {
      setStepProgress((current) => ({ ...current, ...draft.stepProgress }));
    }

    if (draft.activeStep && wizardSteps.some((item) => item.key === draft.activeStep)) {
      setActiveStep(draft.activeStep);
    }
  }, [wizardKey]);

  useEffect(() => {
    if (location.hash && hashToTab[location.hash] && activeStep !== hashToTab[location.hash]) {
      setActiveStep(hashToTab[location.hash]);
      return;
    }

    if (!location.hash) {
      navigate(tabToHash[activeStep] || '#details', { replace: true });
    }
  }, [activeStep, location.hash, navigate]);

  useEffect(() => {
    if (!isAdvancedUnlocked) return;
    const recommended = getRecommendedPermissions(companyForm.plan);
    setWizardData((current) => {
      if (current.permissions.length) return current;
      return { ...current, permissions: recommended };
    });
  }, [companyForm.plan, isAdvancedUnlocked]);

  useEffect(() => {
    writeDraft(wizardKey, buildWizardPayload({
      companyForm,
      wizardData,
      stepProgress,
      activeStep,
    }));
  }, [activeStep, companyForm, stepProgress, wizardData, wizardKey]);

  const currentStepIndex = wizardSteps.findIndex((item) => item.key === activeStep);
  const currentStep = wizardSteps[currentStepIndex] || wizardSteps[0];

  const canOpenStep = (stepKey) => stepKey === 'details' || isAdvancedUnlocked;

  const goToStep = (stepKey) => {
    if (!wizardSteps.some((item) => item.key === stepKey)) return;
    if (!canOpenStep(stepKey)) return;
    setActiveStep(stepKey);
    navigate(tabToHash[stepKey] || '#details', { replace: true });
  };

  const goToNextStep = () => {
    const nextStep = wizardSteps[currentStepIndex + 1];
    if (nextStep) {
      goToStep(nextStep.key);
    } else {
      navigate('/super-admin/company-setup#companies', { replace: true });
    }
  };

  const goToPreviousStep = () => {
    const previousStep = wizardSteps[currentStepIndex - 1];
    if (previousStep) {
      goToStep(previousStep.key);
    }
  };

  const updateCompanyField = (field, value) => {
    setCompanyForm((current) => ({ ...current, [field]: value }));
    if (companyErrors[field]) {
      setCompanyErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const updateWizardField = (field, value) => {
    setWizardData((current) => ({ ...current, [field]: value }));
    setStatusMessage('');
  };

  const updatePermission = (permissionKey) => {
    setWizardData((current) => {
      const next = current.permissions.includes(permissionKey)
        ? current.permissions.filter((item) => item !== permissionKey)
        : [...current.permissions, permissionKey];

      return { ...current, permissions: next };
    });
  };

  const handleCompanyDetailsSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateCompanyForm(companyForm, companies);
    setCompanyErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    setStatusMessage('');

    try {
      const payload = {
        name: companyForm.name.trim(),
        slug: normalizeSlug(companyForm.slug),
        legalName: companyForm.legalName.trim(),
        countryCode: companyForm.countryCode,
        timezone: companyForm.timezone,
        plan: companyForm.plan,
        status: companyForm.status,
      };

      if (companyForm.id) {
        const savedCompany = await updateCompany(companyForm.id, payload);
        const nextCompanyForm = normalizeCompanyForm(savedCompany);
        setCompanyForm((current) => ({ ...current, ...nextCompanyForm }));
        setStepProgress((current) => ({ ...current, details: 'saved' }));
        setStatusMessage('Company details saved. The remaining tabs are now available.');

        const nextDraft = buildWizardPayload({
          companyForm: nextCompanyForm,
          wizardData,
          stepProgress: { ...stepProgress, details: 'saved' },
          activeStep: 'address',
        });

        writeDraft(savedCompany.id, nextDraft);
        removeDraft('new');
      } else {
        setCompanyForm((current) => ({ ...current, ...payload }));
        setStepProgress((current) => ({ ...current, details: 'saved' }));
        setStatusMessage('Company details saved locally. Finish the remaining steps to create the company.');
        writeDraft('new', buildWizardPayload({
          companyForm: { ...companyForm, ...payload },
          wizardData,
          stepProgress: { ...stepProgress, details: 'saved' },
          activeStep: 'address',
        }));
      }

      setActiveStep('address');
      navigate(tabToHash.address, { replace: true });
    } catch (error) {
      setCompanyErrors((current) => ({
        ...current,
        form: getErrorMessage(error, 'Failed to save company details.'),
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddressSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateAddressForm(wizardData);
    setStepErrors((current) => ({ ...current, address: validationErrors }));
    if (Object.keys(validationErrors).length > 0) return;

    const nextProgress = { ...stepProgress, address: 'saved' };
    setStepProgress(nextProgress);
    setStatusMessage('Company address saved as a draft.');
    writeDraft(wizardKey, buildWizardPayload({
      companyForm,
      wizardData,
      stepProgress: nextProgress,
      activeStep: 'documents',
    }));
    setActiveStep('documents');
    navigate(tabToHash.documents, { replace: true });
  };

  const handleDocumentsSubmit = (event) => {
    event.preventDefault();

    const nextProgress = { ...stepProgress, documents: 'saved' };
    setStepProgress(nextProgress);
    setStatusMessage('Document details saved as a draft.');
    writeDraft(wizardKey, buildWizardPayload({
      companyForm,
      wizardData,
      stepProgress: nextProgress,
      activeStep: 'admin',
    }));
    setActiveStep('admin');
    navigate(tabToHash.admin, { replace: true });
  };

  const handleAdminSubmit = (event) => {
    event.preventDefault();

    if (!wizardData.adminPassword.trim()) {
      setCompanyErrors((current) => ({
        ...current,
        form: 'Admin password is required.',
      }));
      return;
    }

    const nextProgress = { ...stepProgress, admin: 'saved' };
    setStepProgress(nextProgress);
    setStatusMessage('Admin setup saved as a draft.');
    writeDraft(wizardKey, buildWizardPayload({
      companyForm,
      wizardData,
      stepProgress: nextProgress,
      activeStep: 'permissions',
    }));
    setActiveStep('permissions');
    navigate(tabToHash.permissions, { replace: true });
  };

  const handlePermissionsSubmit = (event) => {
    event.preventDefault();

    const nextProgress = { ...stepProgress, permissions: 'saved' };
    setStepProgress(nextProgress);
    setSubmitting(true);
    setStatusMessage('');

    const payload = {
      company: {
        name: companyForm.name.trim(),
        slug: normalizeSlug(companyForm.slug),
        legalName: companyForm.legalName.trim(),
        countryCode: companyForm.countryCode,
        timezone: companyForm.timezone,
        plan: companyForm.plan,
        status: companyForm.status,
        addressLine1: wizardData.addressLine1.trim(),
        addressLine2: wizardData.addressLine2.trim(),
        city: wizardData.city.trim(),
        state: wizardData.state.trim(),
        postalCode: wizardData.postalCode.trim(),
        addressCountryCode: wizardData.addressCountryCode,
        phone: wizardData.phone.trim(),
        website: wizardData.website.trim(),
        registrationNumber: wizardData.registrationNumber.trim(),
        taxId: wizardData.taxId.trim(),
        panNumber: wizardData.panNumber.trim(),
        incorporationDate: wizardData.incorporationDate || null,
        logoUrl: wizardData.logoUrl.trim(),
        documentNotes: wizardData.documentNotes.trim(),
        permissions: wizardData.permissions,
      },
      admin: {
        name: wizardData.adminName.trim(),
        email: wizardData.adminEmail.trim(),
        password: wizardData.adminPassword.trim(),
        phone: wizardData.adminPhone.trim(),
        role: wizardData.adminRole,
        mode: wizardData.adminMode,
        notes: wizardData.adminNotes.trim(),
      },
    };

    authService.registerTenant(payload.company, payload.admin)
      .then((response) => {
        const createdCompany = response?.data?.company || response?.company || null;
        if (createdCompany?.id) {
          const normalizedCompany = normalizeCompanyForm(createdCompany);
          setCompanyForm((current) => ({ ...current, ...normalizedCompany }));
          writeDraft(createdCompany.id, buildWizardPayload({
            companyForm: normalizedCompany,
            wizardData,
            stepProgress: nextProgress,
            activeStep: 'details',
          }));
          removeDraft('new');
        } else {
          writeDraft(wizardKey || 'new', buildWizardPayload({
            companyForm,
            wizardData,
            stepProgress: nextProgress,
            activeStep: 'details',
          }));
        }

        setStatusMessage('Company setup saved successfully.');
        navigate('/super-admin/company-setup#companies', { replace: true });
      })
      .catch((error) => {
        setCompanyErrors((current) => ({
          ...current,
          form: getErrorMessage(error, 'Failed to complete company setup.'),
        }));
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleSkipStep = (stepKey) => {
    if (stepKey === 'details') return;

    const nextProgress = { ...stepProgress, [stepKey]: 'skipped' };
    setStepProgress(nextProgress);
    writeDraft(wizardKey, buildWizardPayload({
      companyForm,
      wizardData,
      stepProgress: nextProgress,
      activeStep: wizardSteps[currentStepIndex + 1]?.key || stepKey,
    }));
    goToNextStep();
  };

  const handleResetDraft = () => {
    setWizardData(emptyWizardData);
    setStepProgress({
      ...emptyStepProgress,
      details: companyForm.id ? 'saved' : 'pending',
    });
    setCompanyErrors({});
    setStepErrors({ address: {} });
    setStatusMessage('');
    if (!companyForm.id) {
      removeDraft('new');
    } else {
      removeDraft(companyForm.id);
    }
  };

  const handleCancel = () => {
    navigate('/super-admin/company-setup#companies');
  };

  const sidebarActiveKey = isSuperAdmin ? 'company-setup-create' : 'company-setup-overview';
  const permissionRecommendation = getRecommendedPermissions(companyForm.plan);

  const progressSummary = wizardSteps.map((step) => ({
    ...step,
    state: stepProgress[step.key] || 'pending',
  }));

  return (
    <DashboardShell
      activeKey={sidebarActiveKey}
      headerProps={{ companyText: isSuperAdmin ? 'Super Admin' : 'Company Admin' }}
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

      <div className="superadmin-package-tabs company-create-top-tabs" role="tablist" aria-label="Company setup sections">
        {setupTopTabs.map((item) => {
          const isActive = item.key === 'create';

          return (
            <button
              key={item.key}
              type="button"
              className={`superadmin-package-tab ${isActive ? 'active' : ''}`.trim()}
              onClick={() => navigate(item.to, { replace: true })}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="superadmin-package-layout company-admin-company-create-page">
        <div className="superadmin-package-workspace">
          <SmallCard title="Setup Progress">
            <div className="company-create-step-tabs" role="tablist" aria-label="Company setup steps">
              {wizardSteps.map((item) => {
                const isActive = activeStep === item.key;
                const isLocked = !canOpenStep(item.key);
                const state = stepProgress[item.key] || 'pending';

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`superadmin-package-tab company-create-step-tab ${isActive ? 'active' : ''} ${state !== 'pending' ? state : ''} ${isLocked ? 'locked' : ''}`.trim()}
                    onClick={() => goToStep(item.key)}
                    disabled={isLocked || loading}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span className="company-create-step-tab-title">{item.label}</span>
                    <span className="company-create-step-tab-helper">{item.helper}</span>
                    <span className="company-create-step-tab-badge">
                      <StepStateChip value={state} />
                    </span>
                  </button>
                );
              })}
            </div>
          </SmallCard>

          <SmallCard>
            <div className="company-create-form-subheader">
              <div className="company-create-form-subheader-copy">
                <strong>{currentStep?.label || 'Company Details'}</strong>
                <p>{currentStep?.helper || 'Complete this step and continue with the remaining setup stages.'}</p>
              </div>
            </div>

            {statusMessage ? (
              <div className="superadmin-empty-state company-create-inline-note" style={{ marginBottom: 14 }}>
                {statusMessage}
              </div>
            ) : null}

            {activeStep === 'details' ? (
              <form className="superadmin-package-form-grid" onSubmit={handleCompanyDetailsSubmit}>
                <div className="superadmin-package-form-row superadmin-package-form-row-four">
                  <label className="superadmin-package-form-field">
                    <span>Company Name</span>
                    <input
                      value={companyForm.name}
                      onChange={(e) => updateCompanyField('name', e.target.value)}
                      placeholder="e.g., Suryodaya Technologies"
                      disabled={submitting}
                    />
                    {companyErrors.name ? <small className="superadmin-package-error">{companyErrors.name}</small> : null}
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Slug</span>
                    <input
                      value={companyForm.slug}
                      onChange={(e) => updateCompanyField('slug', normalizeSlug(e.target.value))}
                      placeholder="e.g., suryodaya"
                      disabled={submitting}
                    />
                    {companyErrors.slug ? <small className="superadmin-package-error">{companyErrors.slug}</small> : null}
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Legal Name</span>
                    <input
                      value={companyForm.legalName}
                      onChange={(e) => updateCompanyField('legalName', e.target.value)}
                      placeholder="e.g., Suryodaya Technologies Pvt Ltd"
                      disabled={submitting}
                    />
                    {companyErrors.legalName ? <small className="superadmin-package-error">{companyErrors.legalName}</small> : null}
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Country Code</span>
                    <select
                      value={companyForm.countryCode}
                      onChange={(e) => updateCompanyField('countryCode', e.target.value)}
                      disabled={submitting}
                    >
                      {companySetupCountryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {companyErrors.countryCode ? <small className="superadmin-package-error">{companyErrors.countryCode}</small> : null}
                  </label>
                </div>

                <div className="superadmin-package-form-row superadmin-package-form-row-four">
                  <label className="superadmin-package-form-field">
                    <span>Timezone</span>
                    <select
                      value={companyForm.timezone}
                      onChange={(e) => updateCompanyField('timezone', e.target.value)}
                      disabled={submitting}
                    >
                      {companySetupTimezoneOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {companyErrors.timezone ? <small className="superadmin-package-error">{companyErrors.timezone}</small> : null}
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Plan</span>
                    <select
                      value={companyForm.plan}
                      onChange={(e) => updateCompanyField('plan', e.target.value)}
                      disabled={submitting}
                    >
                      {companySetupPlanOptions.map((item) => (
                        <option key={item} value={item}>
                          {capitalize(item)}
                        </option>
                      ))}
                    </select>
                    {companyErrors.plan ? <small className="superadmin-package-error">{companyErrors.plan}</small> : null}
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Status</span>
                    <select
                      value={companyForm.status}
                      onChange={(e) => updateCompanyField('status', e.target.value)}
                      disabled={submitting}
                    >
                      {companySetupCompanyStatusOptions.map((item) => (
                        <option key={item} value={item}>
                          {capitalize(item)}
                        </option>
                      ))}
                    </select>
                    {companyErrors.status ? <small className="superadmin-package-error">{companyErrors.status}</small> : null}
                  </label>
                  <div className="superadmin-package-form-field">
                    <span>Plan Recommendation</span>
                    <div className="company-create-chip-list">
                      {permissionRecommendation.slice(0, 4).map((item) => {
                        const option = permissionOptions.find((permission) => permission.key === item);
                        return (
                          <span key={item} className="company-create-chip">
                            {option?.label || capitalize(item)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {companyErrors.form ? <small className="superadmin-package-error">{companyErrors.form}</small> : null}

                <div className="superadmin-package-form-actions company-create-actions">
                  <button type="button" className="superadmin-package-modal-button secondary" onClick={handleCancel} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="superadmin-package-modal-button primary" disabled={submitting}>
                    {submitting ? 'Saving...' : isEdit ? 'Update Company' : 'Save and Continue'}
                  </button>
                </div>
              </form>
            ) : null}

            {activeStep === 'address' ? (
              <form className="superadmin-package-form-grid" onSubmit={handleAddressSubmit}>
                <div className="superadmin-package-form-row superadmin-package-form-row-four">
                  <label className="superadmin-package-form-field superadmin-project-wide-field">
                    <span>Address Line 1</span>
                    <input
                      value={wizardData.addressLine1}
                      onChange={(e) => updateWizardField('addressLine1', e.target.value)}
                      placeholder="Building, street, or office name"
                    />
                    {stepErrors.address.addressLine1 ? <small className="superadmin-package-error">{stepErrors.address.addressLine1}</small> : null}
                  </label>
                  <label className="superadmin-package-form-field superadmin-project-wide-field">
                    <span>Address Line 2</span>
                    <input
                      value={wizardData.addressLine2}
                      onChange={(e) => updateWizardField('addressLine2', e.target.value)}
                      placeholder="Landmark, floor, or locality"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>City</span>
                    <input
                      value={wizardData.city}
                      onChange={(e) => updateWizardField('city', e.target.value)}
                      placeholder="City"
                    />
                    {stepErrors.address.city ? <small className="superadmin-package-error">{stepErrors.address.city}</small> : null}
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>State</span>
                    <input
                      value={wizardData.state}
                      onChange={(e) => updateWizardField('state', e.target.value)}
                      placeholder="State"
                    />
                    {stepErrors.address.state ? <small className="superadmin-package-error">{stepErrors.address.state}</small> : null}
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Postal Code</span>
                    <input
                      value={wizardData.postalCode}
                      onChange={(e) => updateWizardField('postalCode', e.target.value)}
                      placeholder="Postal code"
                    />
                    {stepErrors.address.postalCode ? <small className="superadmin-package-error">{stepErrors.address.postalCode}</small> : null}
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Country</span>
                    <select
                      value={wizardData.addressCountryCode}
                      onChange={(e) => updateWizardField('addressCountryCode', e.target.value)}
                    >
                      {companySetupCountryOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    {stepErrors.address.addressCountryCode ? <small className="superadmin-package-error">{stepErrors.address.addressCountryCode}</small> : null}
                  </label>
                </div>

                <div className="superadmin-package-form-row superadmin-package-form-row-four">
                  <label className="superadmin-package-form-field">
                    <span>Phone</span>
                    <input
                      value={wizardData.phone}
                      onChange={(e) => updateWizardField('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </label>
                  <label className="superadmin-package-form-field superadmin-project-wide-field">
                    <span>Website</span>
                    <input
                      value={wizardData.website}
                      onChange={(e) => updateWizardField('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </label>
                </div>

                <div className="superadmin-package-form-actions company-create-actions">
                  <button type="button" className="superadmin-package-modal-button secondary" onClick={goToPreviousStep}>
                    Back
                  </button>
                  <button type="button" className="superadmin-package-modal-button secondary" onClick={() => handleSkipStep('address')}>
                    Skip for now
                  </button>
                  <button type="submit" className="superadmin-package-modal-button primary">
                    Save and Continue
                  </button>
                </div>
              </form>
            ) : null}

            {activeStep === 'documents' ? (
              <form className="superadmin-package-form-grid" onSubmit={handleDocumentsSubmit}>
                <div className="superadmin-package-form-row superadmin-package-form-row-four">
                  <label className="superadmin-package-form-field">
                    <span>Registration Number</span>
                    <input
                      value={wizardData.registrationNumber}
                      onChange={(e) => updateWizardField('registrationNumber', e.target.value)}
                      placeholder="Company registration number"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Tax ID / GST</span>
                    <input
                      value={wizardData.taxId}
                      onChange={(e) => updateWizardField('taxId', e.target.value)}
                      placeholder="Tax identification number"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>PAN / EIN</span>
                    <input
                      value={wizardData.panNumber}
                      onChange={(e) => updateWizardField('panNumber', e.target.value)}
                      placeholder="PAN, EIN, or similar ID"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Incorporation Date</span>
                    <input
                      type="date"
                      value={wizardData.incorporationDate}
                      onChange={(e) => updateWizardField('incorporationDate', e.target.value)}
                    />
                  </label>
                </div>

                <div className="superadmin-package-form-row superadmin-package-form-row-four">
                  <label className="superadmin-package-form-field superadmin-project-wide-field">
                    <span>Logo URL</span>
                    <input
                      value={wizardData.logoUrl}
                      onChange={(e) => updateWizardField('logoUrl', e.target.value)}
                      placeholder="Public logo or brand image URL"
                    />
                  </label>
                  <label className="superadmin-package-form-field superadmin-project-wide-field">
                    <span>Document Notes</span>
                    <textarea
                      value={wizardData.documentNotes}
                      onChange={(e) => updateWizardField('documentNotes', e.target.value)}
                      placeholder="Add compliance or document notes here"
                    />
                  </label>
                </div>

                <div className="superadmin-package-form-actions company-create-actions">
                  <button type="button" className="superadmin-package-modal-button secondary" onClick={goToPreviousStep}>
                    Back
                  </button>
                  <button type="button" className="superadmin-package-modal-button secondary" onClick={() => handleSkipStep('documents')}>
                    Skip for now
                  </button>
                  <button type="submit" className="superadmin-package-modal-button primary">
                    Save and Continue
                  </button>
                </div>
              </form>
            ) : null}

            {activeStep === 'admin' ? (
              <form className="superadmin-package-form-grid" onSubmit={handleAdminSubmit}>
                <div className="superadmin-package-form-row superadmin-package-form-row-four">
                  <label className="superadmin-package-form-field">
                    <span>Primary Admin Name</span>
                    <input
                      value={wizardData.adminName}
                      onChange={(e) => updateWizardField('adminName', e.target.value)}
                      placeholder="Primary admin full name"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Primary Admin Email</span>
                    <input
                      value={wizardData.adminEmail}
                      onChange={(e) => updateWizardField('adminEmail', e.target.value)}
                      placeholder="admin@company.com"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Admin Password</span>
                    <input
                      type="password"
                      value={wizardData.adminPassword}
                      onChange={(e) => updateWizardField('adminPassword', e.target.value)}
                      placeholder="Create a secure password"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Primary Admin Phone</span>
                    <input
                      value={wizardData.adminPhone}
                      onChange={(e) => updateWizardField('adminPhone', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </label>
                  <label className="superadmin-package-form-field">
                    <span>Admin Mode</span>
                    <select
                      value={wizardData.adminMode}
                      onChange={(e) => updateWizardField('adminMode', e.target.value)}
                    >
                      <option value="invite">Invite Existing User</option>
                      <option value="create">Create New Admin</option>
                      <option value="manual">Manual Setup Later</option>
                    </select>
                  </label>
                </div>

                <div className="superadmin-package-form-row superadmin-package-form-row-four">
                  <label className="superadmin-package-form-field">
                    <span>Admin Role</span>
                    <select
                      value={wizardData.adminRole}
                      onChange={(e) => updateWizardField('adminRole', e.target.value)}
                    >
                      <option value={ROLES.COMPANY_ADMIN}>Company Admin</option>
                      <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                      <option value={ROLES.EMPLOYEE}>Employee</option>
                    </select>
                  </label>
                  <label className="superadmin-package-form-field superadmin-project-wide-field">
                    <span>Admin Notes</span>
                    <textarea
                      value={wizardData.adminNotes}
                      onChange={(e) => updateWizardField('adminNotes', e.target.value)}
                      placeholder="Optional note for the admin handover"
                    />
                  </label>
                </div>

                <div className="superadmin-package-form-actions company-create-actions">
                  <button type="button" className="superadmin-package-modal-button secondary" onClick={goToPreviousStep}>
                    Back
                  </button>
                  <button type="button" className="superadmin-package-modal-button secondary" onClick={() => handleSkipStep('admin')}>
                    Skip for now
                  </button>
                  <button type="submit" className="superadmin-package-modal-button primary">
                    Save and Continue
                  </button>
                </div>
              </form>
            ) : null}

            {activeStep === 'permissions' ? (
              <form className="superadmin-package-form-grid" onSubmit={handlePermissionsSubmit}>
                <div className="superadmin-empty-state" style={{ marginBottom: 8 }}>
                  Recommended modules for the <strong>{capitalize(companyForm.plan)}</strong> plan are highlighted below.
                </div>

                <div className="company-create-permission-toolbar">
                  <button
                    type="button"
                    className="superadmin-package-modal-button secondary"
                    onClick={() => updateWizardField('permissions', permissionRecommendation)}
                  >
                    Apply recommended permissions
                  </button>
                  <span className="superadmin-package-detail-note">
                    You can manually skip or adjust these modules now and finish setup later.
                  </span>
                </div>

                <div className="company-create-permission-grid">
                  {permissionOptions.map((item) => {
                    const checked = wizardData.permissions.includes(item.key);
                    const recommended = permissionRecommendation.includes(item.key);

                    return (
                      <label key={item.key} className={`company-create-permission-option ${checked ? 'checked' : ''} ${recommended ? 'recommended' : ''}`.trim()}>
                        <div className="company-create-permission-copy">
                          <strong>{item.label}</strong>
                          <span>{item.description}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => updatePermission(item.key)}
                        />
                      </label>
                    );
                  })}
                </div>

                <div className="superadmin-package-form-actions company-create-actions">
                  <button type="button" className="superadmin-package-modal-button secondary" onClick={goToPreviousStep}>
                    Back
                  </button>
                  <button type="button" className="superadmin-package-modal-button secondary" onClick={() => handleSkipStep('permissions')}>
                    Skip for now
                  </button>
                  <button type="submit" className="superadmin-package-modal-button primary">
                    Finish Setup
                  </button>
                </div>
              </form>
            ) : null}

            {companyErrors.form ? <small className="superadmin-package-error" style={{ display: 'block', marginTop: 12 }}>{companyErrors.form}</small> : null}
          </SmallCard>
        </div>
      </div>
    </DashboardShell>
  );
}
