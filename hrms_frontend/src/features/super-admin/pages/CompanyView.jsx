import React from 'react';
import FeaturePreview from './FeaturePreview';
import { ROUTES } from '../../../router/routePaths';

const tabs = [
  { key: 'overview', label: 'Overview', hash: '#overview' },
  { key: 'company-setup', label: 'Company Setup', hash: '#company-setup' },
  { key: 'organization', label: 'Organization', hash: '#organization' },
  { key: 'employee-management', label: 'Employee Management', hash: '#employee-management' },
  { key: 'attendance', label: 'Attendance', hash: '#attendance' },
  { key: 'holiday', label: 'Holiday List', hash: '#holiday' },
  { key: 'leave', label: 'Leave Management', hash: '#leave' },
  { key: 'projects', label: 'Project Management', hash: '#projects' },
  { key: 'team-setup', label: 'Project Assign', hash: '#team-setup' },
  { key: 'timesheet', label: 'Timesheet', hash: '#timesheet' },
  { key: 'payroll', label: 'Payroll', hash: '#payroll' },
  { key: 'reports', label: 'Reports', hash: '#reports' },
];

const sections = [
  {
    key: 'overview',
    title: 'Company admin preview',
    summary: 'Full access map',
    description: 'This preview shows every company-admin feature block that a super-admin can inspect before assigning permissions.',
    routes: [
      { label: 'Dashboard', note: 'Open company admin dashboard', to: ROUTES.dashboard },
      { label: 'Company Setup', note: 'Review companies and users', to: ROUTES.companySetup },
      { label: 'Employee Management', note: 'Open employee records', to: ROUTES.companyAdminEmployeeManagement },
      { label: 'Organization', note: 'Open departments and designations', to: ROUTES.companyAdminMaster },
    ],
  },
  {
    key: 'company-setup',
    title: 'Company setup',
    summary: 'Tenant onboarding and controls',
    description: 'The super-admin can open company onboarding, company records, and create-company flows from this area.',
    routes: [
      { label: 'Company Setup', note: 'Overview and company list', to: ROUTES.companySetup },
      { label: 'Create Company', note: 'Add a new tenant', to: `${ROUTES.companySetup}/create` },
    ],
  },
  {
    key: 'organization',
    title: 'Organization master',
    summary: 'Departments and designations',
    description: 'This section keeps department and designation management visible for the super-admin preview.',
    routes: [
      { label: 'Organization', note: 'Open master data page', to: ROUTES.companyAdminMaster },
    ],
  },
  {
    key: 'employee-management',
    title: 'Employee management',
    summary: 'Users and company users',
    description: 'Super-admin preview for employee management keeps the full user lifecycle visible, including overview and create flows.',
    routes: [
      { label: 'Employee Management', note: 'Open user assignment page', to: ROUTES.companyAdminEmployeeManagement },
    ],
  },
  {
    key: 'attendance',
    title: 'Attendance',
    summary: 'Attendance review and marking',
    description: 'Attendance preview includes attendance list, overview, and mark attendance entry points.',
    routes: [
      { label: 'Attendance', note: 'Open company attendance page', to: ROUTES.companyAdminAttendance },
    ],
  },
  {
    key: 'holiday',
    title: 'Holiday list',
    summary: 'Calendar and holiday records',
    description: 'Holiday preview keeps the calendar and holiday list available for super-admin review.',
    routes: [
      { label: 'Holiday List', note: 'Open company holiday page', to: ROUTES.companyAdminHolidayList },
    ],
  },
  {
    key: 'leave',
    title: 'Leave management',
    summary: 'Requests and policies',
    description: 'Leave preview shows the leave request and policy management feature group.',
    routes: [
      { label: 'Leave Management', note: 'Open leave workflows', to: ROUTES.companyAdminLeaveManagement },
    ],
  },
  {
    key: 'projects',
    title: 'Project management',
    summary: 'Projects and delivery tracking',
    description: 'Project preview keeps project creation, list, and editing accessible from a dedicated route.',
    routes: [
      { label: 'Project Management', note: 'Open project workspace', to: ROUTES.companyAdminProjectManagement },
    ],
  },
  {
    key: 'team-setup',
    title: 'Project assign',
    summary: 'Assign people to projects',
    description: 'This preview page exposes the project assignment flow separately from project management.',
    routes: [
      { label: 'Project Assign', note: 'Open project team setup', to: ROUTES.companyAdminCreateTeam },
    ],
  },
  {
    key: 'timesheet',
    title: 'Timesheet',
    summary: 'All timesheet views',
    description: 'Timesheet preview keeps approvals, project time, and summary views visible.',
    routes: [
      { label: 'Timesheet', note: 'Open company timesheet page', to: ROUTES.companyAdminTimesheet },
    ],
  },
  {
    key: 'payroll',
    title: 'Payroll',
    summary: 'Process and approval',
    description: 'Payroll is available as a separate company-admin area when the company enables it.',
    routes: [
      { label: 'Payroll', note: 'Open payroll workspace', to: ROUTES.payroll },
    ],
  },
  {
    key: 'reports',
    title: 'Reports',
    summary: 'Reporting workspace',
    description: 'The reports module stays visible in the super-admin preview so its dashboard and summary views can be checked quickly.',
    routes: [
      { label: 'Reports', note: 'Open company reports', to: ROUTES.companyAdminReports },
    ],
  },
];

export default function CompanyView() {
  return (
    <FeaturePreview
      title="Company View"
      subtitle="Super-admin preview with the complete company-admin module map."
      companyText="Company View Preview"
      tabs={tabs}
      sections={sections}
      intro="Use this page to review the full company-admin feature surface before you decide which tabs a company should receive."
    />
  );
}
