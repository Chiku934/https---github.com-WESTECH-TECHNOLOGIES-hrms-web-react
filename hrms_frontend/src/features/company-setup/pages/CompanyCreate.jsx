import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import { ROLES } from '../../../app/config/roles';
import { resolveRoleFromStorage } from '../../../data/navigation/index.js';
import {
  companySetupCompanyStatusOptions,
  companySetupCountryOptions,
  companySetupPlanOptions,
  companySetupTimezoneOptions,
} from '../data/companySetupData';
import { createCompany, updateCompany, loadCompanySetupCompanies } from '../services/companySetupService';
import '../../../features/super-admin/styles/packages.css';
import '../../../features/super-admin/styles/clients.css';

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

export default function CompanyCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = resolveRoleFromStorage();
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;

  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [companies, setCompanies] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if we are editing (passed via state or query param)
  const isEdit = location.state?.company ? true : false;

  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      try {
        const data = await loadCompanySetupCompanies(role);
        setCompanies(data);
      } catch (error) {
        setErrors({ form: getErrorMessage(error, 'Failed to load companies.') });
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, [role]);

  useEffect(() => {
    if (isEdit && location.state.company) {
      const company = location.state.company;
      setCompanyForm({
        id: company.id,
        name: company.name,
        slug: company.slug,
        legalName: company.legalName,
        countryCode: company.countryCode || 'IN',
        timezone: company.timezone || 'Asia/Kolkata',
        plan: company.plan || 'pro',
        status: company.status || 'active',
      });
    }
  }, [isEdit, location.state]);

  const handleChange = (field, value) => {
    setCompanyForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSlugChange = (value) => {
    const normalized = normalizeSlug(value);
    handleChange('slug', normalized);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateCompanyForm(companyForm, companies);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
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
      if (companyForm.id) {
        await updateCompany(companyForm.id, payload);
      } else {
        await createCompany(payload);
      }
      // Redirect back to company list
      navigate('/super-admin/company-setup#companies', { replace: true });
    } catch (error) {
      setErrors({ form: getErrorMessage(error, 'Failed to save company.') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/super-admin/company-setup#companies');
  };

  const sidebarActiveKey = isSuperAdmin ? 'company-setup-companies' : 'company-setup-overview';

  return (
    <DashboardShell
      activeKey={sidebarActiveKey}
      headerProps={{ companyText: isSuperAdmin ? 'Super Admin' : 'Company Admin' }}
    >
      <div className="superadmin-package-layout company-admin-list-page">
        <div className="superadmin-package-workspace">
          <section className="dashboard-card superadmin-package-mini-card">
            <div className="dashboard-card-title">{companyForm.id ? 'Edit Company' : 'Create New Company'}</div>
            <p className="superadmin-package-detail-note" style={{ marginBottom: 24 }}>
              {companyForm.id ? 'Update the company details below.' : 'Fill in the details to register a new company.'}
            </p>

            {errors.form && (
              <div className="superadmin-package-error" style={{ marginBottom: 16 }}>
                {errors.form}
              </div>
            )}

            <form className="superadmin-package-form-grid" onSubmit={handleSubmit} style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <label className="superadmin-package-form-field">
                <span>Company Name</span>
                <input
                  value={companyForm.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Suryodaya Technologies"
                  disabled={submitting}
                />
                {errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}
              </label>
              <label className="superadmin-package-form-field">
                <span>Slug</span>
                <input
                  value={companyForm.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="e.g., suryodaya"
                  disabled={submitting}
                />
                {errors.slug ? <small className="superadmin-package-error">{errors.slug}</small> : null}
              </label>
              <label className="superadmin-package-form-field">
                <span>Legal Name</span>
                <input
                  value={companyForm.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  placeholder="e.g., Suryodaya Technologies Pvt Ltd"
                  disabled={submitting}
                />
                {errors.legalName ? <small className="superadmin-package-error">{errors.legalName}</small> : null}
              </label>
              <label className="superadmin-package-form-field">
                <span>Country Code</span>
                <select
                  value={companyForm.countryCode}
                  onChange={(e) => handleChange('countryCode', e.target.value)}
                  disabled={submitting}
                >
                  {companySetupCountryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.countryCode ? <small className="superadmin-package-error">{errors.countryCode}</small> : null}
              </label>
              <label className="superadmin-package-form-field">
                <span>Timezone</span>
                <select
                  value={companyForm.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  disabled={submitting}
                >
                  {companySetupTimezoneOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                {errors.timezone ? <small className="superadmin-package-error">{errors.timezone}</small> : null}
              </label>
              <label className="superadmin-package-form-field">
                <span>Plan</span>
                <select
                  value={companyForm.plan}
                  onChange={(e) => handleChange('plan', e.target.value)}
                  disabled={submitting}
                >
                  {companySetupPlanOptions.map((item) => (
                    <option key={item} value={item}>
                      {capitalize(item)}
                    </option>
                  ))}
                </select>
                {errors.plan ? <small className="superadmin-package-error">{errors.plan}</small> : null}
              </label>
              <label className="superadmin-package-form-field">
                <span>Status</span>
                <select
                  value={companyForm.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={submitting}
                >
                  {companySetupCompanyStatusOptions.map((item) => (
                    <option key={item} value={item}>
                      {capitalize(item)}
                    </option>
                  ))}
                </select>
                {errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}
              </label>
              <div className="superadmin-package-form-actions" style={{ gridColumn: '1 / -1', marginTop: 16 }}>
                <button
                  type="button"
                  className="superadmin-package-modal-button secondary"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="superadmin-package-modal-button primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : companyForm.id ? 'Update Company' : 'Create Company'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}