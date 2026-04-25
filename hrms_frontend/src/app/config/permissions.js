import { ROLES } from './roles';

export const PERMISSIONS = {
  SUPER_ADMIN: [ROLES.SUPER_ADMIN],
  COMPANY_ADMIN: [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
  EMPLOYEE: [ROLES.EMPLOYEE, ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN],
};

export function canAccessRole(currentRole, allowedRoles = []) {
  return allowedRoles.includes(currentRole);
}
