import { ROLES } from '../../../app/config/roles';
import {
  authAPI,
  companyAPI,
  designationAPI,
  employeeAPI,
  userAPI,
} from '../../../services/api';
import {
  companySetupCompanySeed,
  companySetupCompanyUserSeed,
  companySetupUserSeed,
} from '../data/companySetupData';

function normalizeText(value) {
  return String(value ?? '').trim();
}

function formatDisplayName(email = '') {
  const localPart = String(email).split('@')[0] || '';
  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getRoleLabel(role) {
  if (role === ROLES.SUPER_ADMIN) return 'Super Admin';
  if (role === ROLES.COMPANY_ADMIN) return 'Company Admin';
  return 'Employee';
}

function normalizeCompany(record) {
  if (!record) return null;

  return {
    id: Number(record.id),
    name: normalizeText(record.name),
    slug: normalizeText(record.slug),
    legalName: normalizeText(record.legalName || record.legal_name),
    countryCode: normalizeText(record.countryCode || record.country_code || 'IN'),
    timezone: normalizeText(record.timezone || 'Asia/Kolkata'),
    plan: normalizeText(record.plan || 'pro'),
    status: normalizeText(record.status || 'active'),
    createdAt: record.createdAt || record.created_at || new Date().toISOString(),
    updatedAt: record.updatedAt || record.updated_at || new Date().toISOString(),
    userCount: Number(record.userCount || record.user_count || 0),
    departmentCount: Number(record.departmentCount || record.department_count || 0),
    designationCount: Number(record.designationCount || record.designation_count || 0),
    roleCount: Number(record.roleCount || record.role_count || 0),
    permissions: Array.isArray(record.permissions)
      ? [...record.permissions]
      : Array.isArray(record.extra_data?.permissions)
        ? [...record.extra_data.permissions]
        : [],
  };
}

function normalizeUser(record) {
  return {
    id: Number(record.id),
    displayName:
      record.displayName
      || record.fullName
      || formatDisplayName(record.email),
    fullName:
      record.fullName
      || record.displayName
      || formatDisplayName(record.email),
    userName:
      record.userName
      || String(record.email || '').split('@')[0]
      || '',
    email: record.email || '',
    phone: record.phone || '',
    companyId: record.companyId ? Number(record.companyId) : null,
    isActive: Boolean(record.isActive),
    emailVerified: Boolean(record.emailVerified),
    mfaEnabled: Boolean(record.mfaEnabled),
    lastLoginAt: record.lastLoginAt || null,
    createdAt: record.createdAt || null,
  };
}

function normalizeDesignation(record) {
  return {
    id: Number(record.id),
    title: normalizeText(record.title),
    level: record.level === null || record.level === undefined ? null : Number(record.level),
    createdAt: record.createdAt || record.created_at || null,
  };
}

function splitFullName(fullName = '', email = '') {
  const explicitName = normalizeText(fullName);
  if (explicitName) {
    return explicitName.split(/\s+/).filter(Boolean);
  }

  const fallback = formatDisplayName(email);
  return fallback ? fallback.split(/\s+/).filter(Boolean) : [];
}

function buildEmployeeFullName(profile = {}, user = {}, fallbackEmail = '') {
  const parts = [
    normalizeText(profile.first_name),
    normalizeText(profile.middle_name),
    normalizeText(profile.last_name),
  ].filter(Boolean);

  if (parts.length) {
    return parts.join(' ');
  }

  const profileName = normalizeText(profile.full_name || profile.fullName);
  if (profileName) return profileName;

  return normalizeText(
    user.displayName
    || user.fullName
    || formatDisplayName(user.email || fallbackEmail),
  );
}

function normalizeLegacyCompanyUser(record) {
  const role = record.role || record.roles?.[0]?.name || ROLES.EMPLOYEE;

  return {
    id: Number(record.id),
    companyId: Number(record.companyId || record.company_id),
    userId: Number(record.userId || record.user_id),
    employeeCode: normalizeText(record.employeeCode || record.employee_code),
    role,
    roleLabel: normalizeText(record.roleLabel || getRoleLabel(role)),
    roleSource: Array.isArray(record.roleSource) ? record.roleSource : [],
    status: normalizeText(record.status || 'active'),
    joinedAt: normalizeText(record.joinedAt || record.joined_at),
    leftAt: record.leftAt || record.left_at || null,
    createdAt: record.createdAt || record.created_at || new Date().toISOString(),
    company: record.company ? {
      id: Number(record.company.id),
      name: record.company.name || '',
      slug: record.company.slug || '',
    } : null,
    user: record.user ? {
      id: Number(record.user.id),
      email: record.user.email || '',
      phone: record.user.phone || '',
      isActive: Boolean(record.user.isActive),
      emailVerified: Boolean(record.user.emailVerified),
      lastLoginAt: record.user.lastLoginAt || null,
    } : null,
    profile: record.profile || null,
    roles: Array.isArray(record.roles)
      ? record.roles.map((item) => ({
          id: Number(item.id),
          name: item.name,
          description: item.description,
          isSystem: Boolean(item.isSystem),
        }))
      : [],
  };
}

function normalizeEmployee(record) {
  const user = record.user || {};
  const profile = record.profile || {};
  const assignments = Array.isArray(record.assignments)
    ? record.assignments
    : record.assignments
      ? [record.assignments]
      : [];
  const currentAssignment = assignments[0] || null;
  const designation = currentAssignment?.designation || null;
  const roles = Array.isArray(record.roles)
    ? record.roles.map((item) => ({
        id: Number(item.id),
        name: item.name,
        description: item.description,
        isSystem: Boolean(item.isSystem),
      }))
    : [];
  const primaryRole = roles[0]?.name || record.role || ROLES.EMPLOYEE;
  const fullName = buildEmployeeFullName(profile, user, record.email);
  const nameParts = splitFullName(fullName, user.email || record.email);
  const firstName = nameParts[0] || 'New';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Employee';

  return {
    id: Number(record.id),
    companyId: Number(record.companyId || record.company_id || record.company?.id || 0),
    companyName: normalizeText(record.company?.name || record.companyName || ''),
    userId: Number(record.userId || record.user_id || user.id || 0),
    employeeCode: normalizeText(record.employeeCode || record.employee_code),
    status: normalizeText(record.status || 'active'),
    joinedAt: normalizeText(record.joinedAt || record.joined_at),
    leftAt: record.leftAt || record.left_at || null,
    createdAt: record.createdAt || record.created_at || null,
    fullName,
    displayName: fullName,
    userName: normalizeText(record.userName || user.userName || String(user.email || record.email || '').split('@')[0] || ''),
    email: normalizeText(record.email || user.email || profile.personal_email || ''),
    phone: normalizeText(record.phone || user.phone || profile.personal_phone || ''),
    personalEmail: normalizeText(profile.personal_email || record.personalEmail || ''),
    personalPhone: normalizeText(profile.personal_phone || record.personalPhone || ''),
    gender: normalizeText(profile.gender || record.gender || ''),
    bloodGroup: normalizeText(profile.blood_group || record.bloodGroup || ''),
    dob: normalizeText(profile.dob || record.dob || ''),
    city: normalizeText(profile.city || record.city || ''),
    state: normalizeText(profile.state || record.state || ''),
    addressLine1: normalizeText(profile.address_line1 || record.addressLine1 || ''),
    addressLine2: normalizeText(profile.address_line2 || record.addressLine2 || ''),
    postalCode: normalizeText(profile.postal_code || record.postalCode || ''),
    profile: {
      ...profile,
      first_name: normalizeText(profile.first_name || firstName),
      middle_name: normalizeText(profile.middle_name || ''),
      last_name: normalizeText(profile.last_name || lastName),
    },
    assignment: currentAssignment ? {
      ...currentAssignment,
      designationId: Number(currentAssignment.designation_id || currentAssignment.designationId || designation?.id || 0) || null,
      designationTitle: normalizeText(designation?.title || currentAssignment.designationTitle || ''),
      departmentId: Number(currentAssignment.department_id || currentAssignment.departmentId || 0) || null,
      managerId: Number(currentAssignment.manager_id || currentAssignment.managerId || 0) || null,
      startDate: normalizeText(currentAssignment.start_date || currentAssignment.startDate),
      endDate: normalizeText(currentAssignment.end_date || currentAssignment.endDate),
      employmentType: normalizeText(currentAssignment.employment_type || currentAssignment.employmentType),
      workLocation: normalizeText(currentAssignment.work_location || currentAssignment.workLocation),
      isCurrent: Boolean(currentAssignment.is_current ?? currentAssignment.isCurrent ?? true),
    } : null,
    designationId: currentAssignment ? Number(currentAssignment.designation_id || currentAssignment.designationId || designation?.id || 0) || null : null,
    designationTitle: normalizeText(designation?.title || currentAssignment?.designationTitle || ''),
    role: primaryRole,
    roleLabel: normalizeText(getRoleLabel(primaryRole)),
    roleSource: roles.map((item) => item.name).filter(Boolean),
    roles,
    documents: Array.isArray(record.documents) ? record.documents : [],
  };
}

function mapUsersFromEmployees(employees) {
  const seen = new Set();

  return employees.reduce((acc, employee) => {
    const key = String(employee.userId || employee.id);
    if (seen.has(key)) return acc;
    seen.add(key);

    acc.push({
      id: employee.userId || employee.id,
      displayName: employee.displayName || employee.fullName,
      fullName: employee.fullName || employee.displayName,
      userName: employee.userName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      companyId: employee.companyId,
      isActive: employee.status !== 'terminated',
      emailVerified: false,
      mfaEnabled: false,
      lastLoginAt: null,
      createdAt: employee.createdAt || null,
    });

    return acc;
  }, []);
}

async function loadAllEmployeesForRole(role) {
  const pageSize = 100;
  const records = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await employeeAPI.getAll({ page, limit: pageSize });
    const payload = response?.data || {};
    const items = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];
    records.push(...items.map(normalizeEmployee));

    const pagination = payload.pagination || {};
    totalPages = Number(pagination.pages || 1);
    page += 1;

    if (!items.length) break;
  } while (page <= totalPages);

  return records;
}

async function loadCompaniesForRole(role) {
  if (role === ROLES.SUPER_ADMIN) {
    const response = await companyAPI.getAll();
    return (response.data || []).map(normalizeCompany);
  }

  const me = await authAPI.getMe();
  return me.data?.company ? [normalizeCompany(me.data.company)] : [];
}

async function loadCompanyUsersForRole(role) {
  const employees = await loadAllEmployeesForRole(role);
  return employees.length
    ? employees
    : companySetupCompanyUserSeed.map((item) => ({
        ...normalizeLegacyCompanyUser(item),
        designationId: null,
        designationTitle: item.roleLabel || getRoleLabel(item.role),
      }));
}

async function loadUsersForRole(role) {
  if (role === ROLES.SUPER_ADMIN) {
    const response = await userAPI.getAll();
    return (response.data || []).map(normalizeUser);
  }

  const companyUsers = await loadCompanyUsersForRole(role);
  return mapUsersFromEmployees(companyUsers);
}

export async function loadCompanySetupCompanies(role = ROLES.SUPER_ADMIN) {
  try {
    return await loadCompaniesForRole(role);
  } catch {
    return companySetupCompanySeed.map(normalizeCompany);
  }
}

export async function loadCompanySetupCompanyUsers(role = ROLES.SUPER_ADMIN) {
  try {
    return await loadCompanyUsersForRole(role);
  } catch {
    return companySetupCompanyUserSeed.map((item) => ({
      ...normalizeLegacyCompanyUser(item),
      designationId: null,
      designationTitle: item.roleLabel || getRoleLabel(item.role),
    }));
  }
}

export async function loadCompanySetupDesignations(role = ROLES.SUPER_ADMIN) {
  try {
    const response = await designationAPI.getAll();
    return (response.data || []).map(normalizeDesignation);
  } catch {
    return [
      { id: 1, title: 'Employee', level: 1 },
      { id: 2, title: 'Team Lead', level: 2 },
      { id: 3, title: 'Manager', level: 3 },
    ];
  }
}

export async function loadCompanySetupUsers(role = ROLES.SUPER_ADMIN) {
  try {
    return await loadUsersForRole(role);
  } catch {
    return companySetupUserSeed.map(normalizeUser);
  }
}

export async function loadCompanyRoster(role = ROLES.SUPER_ADMIN) {
  const [companies, companyUsers, users] = await Promise.all([
    loadCompanySetupCompanies(role),
    loadCompanySetupCompanyUsers(role),
    loadCompanySetupUsers(role),
  ]);

  const companyMap = new Map(companies.map((company) => [String(company.id), company]));
  const userMap = new Map(users.map((user) => [String(user.id), user]));

  return companyUsers.map((item) => {
    const company = companyMap.get(String(item.companyId));
    const user = userMap.get(String(item.userId));

    return {
      id: item.id,
      companyId: item.companyId,
      companyName: company?.name || item.company?.name || '',
      userId: item.userId,
      fullName: item.fullName || user?.fullName || '',
      userName: item.userName || user?.userName || '',
      email: item.email || user?.email || '',
      phone: item.phone || user?.phone || '',
      employeeCode: item.employeeCode,
      status: item.status,
      role: item.role || ROLES.EMPLOYEE,
      roleLabel: item.roleLabel || getRoleLabel(item.role),
      roleSource: item.roleSource || [],
      designationId: item.designationId || null,
      designationTitle: item.designationTitle || '',
      joinedAt: item.joinedAt,
      leftAt: item.leftAt,
      createdAt: item.createdAt,
    };
  });
}

export async function createCompany(payload) {
  const response = await companyAPI.create(payload);
  return normalizeCompany(response.data);
}

export async function updateCompany(id, payload) {
  const response = await companyAPI.update(id, payload);
  return normalizeCompany(response.data);
}

export async function loadCompanySetupCompanyById(id) {
  const response = await companyAPI.getById(id);
  const data = response.data || {};
  return {
    company: normalizeCompany(data.company || data),
    admin: data.admin ? {
      ...data.admin,
      user: data.admin.user || null,
      profile: data.admin.profile || null,
    } : null,
  };
}

export async function deleteCompany(id) {
  await companyAPI.delete(id);
}

export async function createCompanyUser(payload) {
  const response = await employeeAPI.create(payload);
  const employeeId = response?.data?.id || response?.data?.data?.id || response?.id;

  if (employeeId && payload.status && payload.status !== 'active') {
    await employeeAPI.update(employeeId, { status: payload.status });
  }

  if (employeeId) {
    const created = await employeeAPI.getById(employeeId);
    return normalizeEmployee(created.data || created);
  }

  return normalizeEmployee(response.data || response);
}

export async function updateCompanyUser(id, payload) {
  const updatePayload = {
    employee_code: payload.employee_code,
    status: payload.status,
    profile: payload.profile,
  };

  if (Array.isArray(payload.role_ids) && payload.role_ids.length) {
    updatePayload.role_ids = payload.role_ids;
  }

  await employeeAPI.update(id, updatePayload);

  if (payload.assignment && Object.keys(payload.assignment).length) {
    await employeeAPI.transfer(id, payload.assignment);
  }

  const response = await employeeAPI.getById(id);
  return normalizeEmployee(response.data || response);
}

export async function deleteCompanyUser(id) {
  await employeeAPI.delete(id);
}

export function getNextCompanyId(companies) {
  return companies.reduce((max, company) => Math.max(max, Number(company.id) || 0), 0) + 1;
}

export function getNextCompanyUserId(companyUsers) {
  return companyUsers.reduce((max, companyUser) => Math.max(max, Number(companyUser.id) || 0), 0) + 1;
}
