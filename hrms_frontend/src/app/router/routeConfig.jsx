import React from 'react';
import { Navigate } from 'react-router-dom';
import { ROLES } from '../../app/config/roles';
import Login from '../../pages/Login';
import Dashboard from '../../pages/Dashboard';
import Helpdesk from '../../pages/Helpdesk';
import SupportTickets from '../../pages/SupportTickets';
import SupportKnowledgeBase from '../../pages/SupportKnowledgeBase';
import SupportRequests from '../../pages/SupportRequests';
import SupportFaq from '../../pages/SupportFaq';
import Leave from '../../pages/Leave';
import LeaveApply from '../../pages/LeaveApply';
import LeaveStatus from '../../pages/LeaveStatus';
import Timesheet from '../../pages/Timesheet';
import Attendance from '../../pages/Attendance';
import AttendanceRegularization from '../../pages/AttendanceRegularization';
import Performance from '../../pages/Performance';
import Expenses from '../../pages/Expenses';
import MyTeamSummary from '../../pages/MyTeamSummary';
import MyTeamLeave from '../../pages/MyTeamLeave';
import MyTeamAttendance from '../../pages/MyTeamAttendance';
import MyTeamExpenses from '../../pages/MyTeamExpenses';
import MyTeamProfileChanges from '../../pages/MyTeamProfileChanges';
import MyTeamPerformance from '../../pages/MyTeamPerformance';
import MyTeamHiring from '../../pages/MyTeamHiring';
import MyTeamTimesheet from '../../pages/MyTeamTimesheet';
import Requests from '../../pages/Requests';
import Payroll from '../../pages/Payroll';
import FeaturePlaceholderPage from '../../features/shared/components/FeaturePlaceholderPage';
import SuperAdminMasterSettings from '../../features/super-admin/pages/MasterSettings';
import SuperAdminPackages from '../../features/super-admin/pages/Packages';
import SuperAdminReports from '../../features/super-admin/pages/Reports';
import CompanyAdminMaster from '../../features/company-admin/pages/Master';
import CompanyAdminAttendance from '../../features/company-admin/pages/Attendance';
import CompanyAdminHolidayList from '../../features/company-admin/pages/HolidayList';
import CompanyAdminLeaveManagement from '../../features/company-admin/pages/LeaveManagement';
import CompanyAdminProjectManagement from '../../features/company-admin/pages/ProjectManagement';
import CompanyAdminTimesheet from '../../features/company-admin/pages/Timesheet';
import CompanyAdminReports from '../../features/company-admin/pages/Reports';
import CompanyAdminTeamSetup from '../../features/company-admin/pages/TeamSetup';
import CompanySetup from '../../features/company-setup/pages/CompanySetup';
import { ROUTES } from '../../router/routePaths';
import { resolveRoleFromStorage } from '../../data/navigation/index.js';

function placeholder(path, title, description, activeKey, extra = {}) {
  return {
    path,
    element: (
      <FeaturePlaceholderPage
        title={title}
        description={description}
        activeKey={activeKey}
        {...extra}
      />
    ),
  };
}

const publicRoles = [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.EMPLOYEE];
const adminRoles = [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN];
const superAdminOnlyRoles = [ROLES.SUPER_ADMIN];
const blockedRoles = [];

const routeAccess = new Map([
  [ROUTES.companySetup, adminRoles],
  [ROUTES.userSetup, adminRoles],
  [ROUTES.superAdminPackages, superAdminOnlyRoles],
  [ROUTES.superAdminMaster, superAdminOnlyRoles],
  [ROUTES.superAdminLocationMaster, superAdminOnlyRoles],
  [ROUTES.superAdminReports, superAdminOnlyRoles],
  [ROUTES.companyAdminEmployeeManagement, adminRoles],
  [ROUTES.companyAdminMaster, adminRoles],
  [ROUTES.companyAdminLeaveManagement, adminRoles],
  [ROUTES.companyAdminAttendance, adminRoles],
  [ROUTES.companyAdminHolidayList, adminRoles],
  [ROUTES.companyAdminCreateTeam, adminRoles],
  [ROUTES.companyAdminAssignTeam, adminRoles],
  [ROUTES.companyAdminProjectManagement, adminRoles],
  [ROUTES.companyAdminTimesheet, adminRoles],
  [ROUTES.companyAdminReports, adminRoles],
  [ROUTES.projects, adminRoles],
  [ROUTES.payroll, adminRoles],
  [ROUTES.requests, adminRoles],
  [ROUTES.requestsTakeAction, adminRoles],
  [ROUTES.requestsNotifications, adminRoles],
  [ROUTES.requestsArchive, adminRoles],
  [ROUTES.myTeamSummary, adminRoles],
  [ROUTES.myTeamSummaryDigitalServices, adminRoles],
  [ROUTES.myTeamSummaryDirect, adminRoles],
  [ROUTES.myTeamSummaryIndirect, adminRoles],
  [ROUTES.myTeamSummaryPeers, adminRoles],
  [ROUTES.myTeamAttendance, adminRoles],
  [ROUTES.myTeamExpenses, adminRoles],
  [ROUTES.myTeamProfileChanges, adminRoles],
  [ROUTES.myTeamPerformance, adminRoles],
  [ROUTES.myTeamHiring, adminRoles],
  [ROUTES.myTeamTimesheet, adminRoles],
  [ROUTES.myTeamLeave, adminRoles],
  [ROUTES.myTeamLeaveOverview, adminRoles],
  [ROUTES.myTeamLeaveApprovals, adminRoles],
]);

function RoleGate({ allowedRoles, children }) {
  const role = resolveRoleFromStorage();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function withRoleGuard(route) {
  if (route.path === '/' || route.path === '/login' || route.path === '*') {
    return route;
  }

  const allowedRoles = routeAccess.get(route.path) ?? publicRoles;
  return {
    ...route,
    element: <RoleGate allowedRoles={allowedRoles}>{route.element}</RoleGate>,
  };
}

const rawRouteConfig = [
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <Login /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/user-dashboard', element: <Dashboard /> },
  { path: '/user-support', element: <Helpdesk /> },
  { path: '/user-support-tickets', element: <SupportTickets /> },
  { path: '/user-support-knowledge-base', element: <SupportKnowledgeBase /> },
  { path: '/user-support-requests', element: <SupportRequests /> },
  { path: '/user-support-faq', element: <SupportFaq /> },
  { path: '/user-leave', element: <Leave /> },
  { path: '/user-leave-apply', element: <LeaveApply /> },
  { path: '/user-leave-status', element: <LeaveStatus /> },
  { path: ROUTES.timesheet, element: <Timesheet /> },
  { path: '/user-attendance', element: <Attendance /> },
  { path: '/user-attendance-regularization', element: <AttendanceRegularization /> },
  { path: '/user-performance', element: <Performance /> },
  { path: '/user-performance-meetings', element: <Performance /> },
  { path: '/user-performance-feedback', element: <Performance /> },
  { path: '/user-performance-pip', element: <Performance /> },
  { path: '/user-performance-reviews', element: <Performance /> },
  { path: '/user-performance-skills', element: <Performance /> },
  { path: '/user-performance-competencies', element: <Performance /> },
  { path: '/user-expenses', element: <Expenses /> },
  { path: '/user-expenses-past-claims', element: <Expenses /> },
  { path: '/user-expenses-advance-requests', element: <Expenses /> },
  { path: '/requests', element: <Requests /> },
  { path: '/requests/take-action', element: <Requests /> },
  { path: '/requests/notifications', element: <Requests /> },
  { path: '/requests/archive', element: <Requests /> },
  { path: '/payroll', element: <Payroll /> },
  { path: '/myteam_summary', element: <MyTeamSummary /> },
  { path: '/myteam_summary_digital_services', element: <MyTeamSummary /> },
  { path: '/myteam_summary_direct', element: <MyTeamSummary /> },
  { path: '/myteam_summary_indirect', element: <MyTeamSummary /> },
  { path: '/myteam_summary_peers', element: <MyTeamSummary /> },
  { path: '/myteam_attendance', element: <MyTeamAttendance /> },
  { path: '/myteam_expenses', element: <MyTeamExpenses /> },
  { path: '/myteam_profile_changes', element: <MyTeamProfileChanges /> },
  { path: '/myteam_performance', element: <MyTeamPerformance /> },
  { path: '/myteam_hiring', element: <MyTeamHiring /> },
  { path: ROUTES.myTeamTimesheet, element: <MyTeamTimesheet /> },
  { path: '/myteam_leave', element: <MyTeamLeave /> },
  { path: '/myteam_leave_overview', element: <MyTeamLeave /> },
  { path: '/myteam_leave_approvals', element: <MyTeamLeave /> },
  { path: '/myteam_leave_direct', element: <MyTeamSummary /> },
  { path: '/myteam_leave_indirect', element: <MyTeamSummary /> },
  { path: '/myteam_leave_digital_services', element: <MyTeamSummary /> },
  { path: ROUTES.superAdminMaster, element: <SuperAdminMasterSettings /> },
  { path: ROUTES.superAdminLocationMaster, element: <SuperAdminMasterSettings /> },
  { path: ROUTES.superAdminReports, element: <SuperAdminReports /> },
  { path: ROUTES.companySetup, element: <CompanySetup /> },
  { path: ROUTES.userSetup, element: <Navigate to={ROUTES.companySetup} replace /> },
  { path: ROUTES.companyAdminMaster, element: <CompanyAdminMaster /> },
  { path: ROUTES.companyAdminAttendance, element: <CompanyAdminAttendance /> },
  { path: ROUTES.companyAdminHolidayList, element: <CompanyAdminHolidayList /> },
  { path: ROUTES.companyAdminLeaveManagement, element: <CompanyAdminLeaveManagement /> },
  { path: ROUTES.companyAdminEmployeeManagement, element: <CompanySetup /> },
  { path: ROUTES.companyAdminCreateTeam, element: <CompanyAdminTeamSetup /> },
  { path: ROUTES.companyAdminAssignTeam, element: <CompanyAdminTeamSetup /> },
  { path: ROUTES.projects, element: <CompanyAdminProjectManagement /> },
  { path: ROUTES.companyAdminProjectManagement, element: <CompanyAdminProjectManagement /> },
  { path: ROUTES.companyAdminTimesheet, element: <CompanyAdminTimesheet /> },
  { path: ROUTES.companyAdminReports, element: <CompanyAdminReports /> },
  { path: ROUTES.superAdminPackages, element: <SuperAdminPackages /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];

export const routeConfig = rawRouteConfig.map(withRoleGuard);
