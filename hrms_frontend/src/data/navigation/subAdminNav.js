import { ROUTES } from '../../router/routePaths';

export const subAdminNav = [
  { label: 'Dashboard', path: ROUTES.dashboard, activeKey: 'dashboard' },
  { label: 'User Setup', path: ROUTES.userSetup, activeKey: 'user-setup' },
  { label: 'Permissions', path: ROUTES.subAdminPermissions, activeKey: 'sub-admin-permissions' },
  { label: 'Reports', path: ROUTES.subAdminReports, activeKey: 'sub-admin-reports' },
];
