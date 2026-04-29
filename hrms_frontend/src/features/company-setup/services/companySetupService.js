import { ROLES } from '../../../app/config/roles';
import {
  authAPI,
  companyAPI,
  companyUserAPI,
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

function normalizeCompanyUser(record) {
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

function mapUsersFromCompanyUsers(companyUsers) {
  const seen = new Set();

  return companyUsers.reduce((acc, companyUser) => {
    const user = companyUser.user;
    if (!user) return acc;

    const key = String(user.id);
    if (seen.has(key)) return acc;
    seen.add(key);

    acc.push({
      id: user.id,
      displayName:
        user.displayName
        || user.fullName
        || formatDisplayName(user.email),
      fullName:
        user.fullName
        || user.displayName
        || formatDisplayName(user.email),
      userName: user.userName || String(user.email || '').split('@')[0] || '',
      email: user.email || '',
      phone: user.phone || '',
      companyId: companyUser.companyId,
      isActive: Boolean(user.isActive),
      emailVerified: Boolean(user.emailVerified),
      mfaEnabled: Boolean(user.mfaEnabled),
      lastLoginAt: user.lastLoginAt || null,
      createdAt: user.createdAt || null,
    });

    return acc;
  }, []);
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
  const response = await companyUserAPI.getAll();
  return (response.data || []).map(normalizeCompanyUser);
}

async function loadUsersForRole(role) {
  if (role === ROLES.SUPER_ADMIN) {
    const response = await userAPI.getAll();
    return (response.data || []).map(normalizeUser);
  }

  const companyUsers = await loadCompanyUsersForRole(role);
  return mapUsersFromCompanyUsers(companyUsers);
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
    return companySetupCompanyUserSeed.map(normalizeCompanyUser);
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
      fullName: user?.fullName || item.user?.fullName || item.user?.displayName || '',
      userName: user?.userName || item.user?.userName || '',
      email: user?.email || item.user?.email || '',
      phone: user?.phone || item.user?.phone || '',
      employeeCode: item.employeeCode,
      status: item.status,
      role: item.role || ROLES.EMPLOYEE,
      roleLabel: item.roleLabel || getRoleLabel(item.role),
      roleSource: item.roleSource || [],
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
  const response = await companyUserAPI.create(payload);
  return normalizeCompanyUser(response.data);
}

export async function updateCompanyUser(id, payload) {
  const response = await companyUserAPI.update(id, payload);
  return normalizeCompanyUser(response.data);
}

export async function deleteCompanyUser(id) {
  await companyUserAPI.delete(id);
}

export function getNextCompanyId(companies) {
  return companies.reduce((max, company) => Math.max(max, Number(company.id) || 0), 0) + 1;
}

export function getNextCompanyUserId(companyUsers) {
  return companyUsers.reduce((max, companyUser) => Math.max(max, Number(companyUser.id) || 0), 0) + 1;
}
