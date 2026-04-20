import { ROUTES } from '../../router/routePaths';

export const superAdminNav = [
  { label: 'Dashboard', path: ROUTES.dashboard, activeKey: 'dashboard' },
  { label: 'User Setup', path: ROUTES.userSetup, activeKey: 'user-setup' },
  { label: 'Packages', path: ROUTES.superAdminPackages, activeKey: 'super-admin-packages' },
  { label: 'Master', path: ROUTES.superAdminMaster, activeKey: 'super-admin-master' },
  { label: 'Location Master', path: ROUTES.superAdminLocationMaster, activeKey: 'super-admin-location-master' },
  { label: 'Reports', path: ROUTES.superAdminReports, activeKey: 'super-admin-reports' },
];
