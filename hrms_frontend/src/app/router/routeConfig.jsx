import React from 'react';
import { Navigate } from 'react-router-dom';
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
import HrEmployeeManagement from '../../features/hr/pages/EmployeeManagement';
import HrMaster from '../../features/hr/pages/Master';
import HrLeaveManagement from '../../features/hr/pages/LeaveManagement';
import HrAttendance from '../../features/hr/pages/Attendance';
import HrHolidayList from '../../features/hr/pages/HolidayList';
import HrProjectManagement from '../../features/hr/pages/ProjectManagement';
import HrReports from '../../features/hr/pages/Reports';
import CompanyAdminMaster from '../../features/company-admin/pages/Master';
import CompanyAdminAttendance from '../../features/company-admin/pages/Attendance';
import CompanyAdminHolidayList from '../../features/company-admin/pages/HolidayList';
import CompanyAdminLeaveManagement from '../../features/company-admin/pages/LeaveManagement';
import CompanyAdminProjectManagement from '../../features/company-admin/pages/ProjectManagement';
import CompanyAdminTimesheet from '../../features/company-admin/pages/Timesheet';
import CompanyAdminReports from '../../features/company-admin/pages/Reports';
import CompanyAdminTeamSetup from '../../features/company-admin/pages/TeamSetup';
import SubAdminClients from '../../features/sub-admin/pages/Clients';
import SubAdminPermissions from '../../features/sub-admin/pages/Permissions';
import SubAdminReports from '../../features/sub-admin/pages/Reports';
import UserSetup from '../../features/user-setup/pages/UserSetup';
import { ROUTES } from '../../router/routePaths';

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

export const routeConfig = [
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
  { path: ROUTES.companyAdminMaster, element: <CompanyAdminMaster /> },
  { path: ROUTES.companyAdminAttendance, element: <CompanyAdminAttendance /> },
  { path: ROUTES.companyAdminHolidayList, element: <CompanyAdminHolidayList /> },
  { path: ROUTES.companyAdminLeaveManagement, element: <CompanyAdminLeaveManagement /> },
  { path: ROUTES.subAdminClients, element: <SubAdminClients /> },
  { path: ROUTES.subAdminPermissions, element: <SubAdminPermissions /> },
  { path: ROUTES.subAdminReports, element: <SubAdminReports /> },
  { path: ROUTES.companyAdminEmployeeManagement, element: <UserSetup /> },
  { path: ROUTES.companyAdminCreateTeam, element: <CompanyAdminTeamSetup /> },
  { path: ROUTES.companyAdminAssignTeam, element: <CompanyAdminTeamSetup /> },
  { path: ROUTES.projects, element: <CompanyAdminProjectManagement /> },
  { path: ROUTES.companyAdminProjectManagement, element: <CompanyAdminProjectManagement /> },
  { path: ROUTES.companyAdminTimesheet, element: <CompanyAdminTimesheet /> },
  { path: ROUTES.companyAdminReports, element: <CompanyAdminReports /> },
  { path: ROUTES.hrEmployeeManagement, element: <HrEmployeeManagement /> },
  { path: ROUTES.hrMaster, element: <HrMaster /> },
  { path: ROUTES.hrLeaveManagement, element: <HrLeaveManagement /> },
  { path: ROUTES.hrHolidayList, element: <HrHolidayList /> },
  { path: ROUTES.hrAttendance, element: <HrAttendance /> },
  { path: ROUTES.hrProjectManagement, element: <HrProjectManagement /> },
  { path: ROUTES.hrReports, element: <HrReports /> },
  { path: ROUTES.userSetup, element: <UserSetup /> },
  { path: ROUTES.superAdminPackages, element: <SuperAdminPackages /> },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
];
