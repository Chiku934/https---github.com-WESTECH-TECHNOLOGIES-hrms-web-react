import React from 'react';
import FeaturePreview from './FeaturePreview';
import { ROUTES } from '../../../router/routePaths';

const tabs = [
  { key: 'overview', label: 'Overview', hash: '#overview' },
  { key: 'attendance', label: 'Attendance', hash: '#attendance' },
  { key: 'leave', label: 'Leave', hash: '#leave' },
  { key: 'timesheet', label: 'Timesheet', hash: '#timesheet' },
  { key: 'performance', label: 'Performance', hash: '#performance' },
  { key: 'expenses', label: 'Expenses', hash: '#expenses' },
  { key: 'helpdesk', label: 'Helpdesk', hash: '#helpdesk' },
];

const sections = [
  {
    key: 'overview',
    title: 'Employee preview',
    summary: 'All employee-facing modules',
    description: 'This preview keeps the employee experience visible for the super-admin, independent of company-admin access rules.',
    routes: [
      { label: 'Dashboard', note: 'Open employee dashboard', to: ROUTES.dashboard },
      { label: 'Attendance', note: 'Open attendance self-service', to: ROUTES.userAttendance },
      { label: 'Leave', note: 'Open leave self-service', to: ROUTES.userLeave },
      { label: 'Timesheet', note: 'Open time entry workspace', to: ROUTES.timesheet },
    ],
  },
  {
    key: 'attendance',
    title: 'Attendance',
    summary: 'Self-service attendance',
    description: 'Attendance stays visible for employee review, regularization, and reporting flows.',
    routes: [
      { label: 'Attendance', note: 'Open attendance module', to: ROUTES.userAttendance },
    ],
  },
  {
    key: 'leave',
    title: 'Leave',
    summary: 'Apply, track, and review',
    description: 'Leave preview keeps the employee leave journey together on a dedicated page.',
    routes: [
      { label: 'Leave', note: 'Open leave module', to: ROUTES.userLeave },
    ],
  },
  {
    key: 'timesheet',
    title: 'Timesheet',
    summary: 'Weekly entries and approvals',
    description: 'Timesheet preview shows the employee time-entry workspace and the related team views.',
    routes: [
      { label: 'Timesheet', note: 'Open time entry page', to: ROUTES.timesheet },
      { label: 'My Team Timesheet', note: 'Open manager view', to: ROUTES.myTeamTimesheet },
    ],
  },
  {
    key: 'performance',
    title: 'Performance',
    summary: 'Reviews and feedback',
    description: 'Performance preview exposes the employee review, feedback, and growth workflow.',
    routes: [
      { label: 'Performance', note: 'Open performance module', to: ROUTES.userPerformance },
    ],
  },
  {
    key: 'expenses',
    title: 'Expenses',
    summary: 'Claims and advances',
    description: 'Expenses preview keeps the employee claim flow available for review.',
    routes: [
      { label: 'Expenses', note: 'Open expense module', to: ROUTES.userExpenses },
    ],
  },
  {
    key: 'helpdesk',
    title: 'Helpdesk',
    summary: 'Tickets and knowledge base',
    description: 'Helpdesk preview keeps support access visible for employee users.',
    routes: [
      { label: 'Helpdesk', note: 'Open support module', to: ROUTES.userSupport },
    ],
  },
];

export default function EmployeeView() {
  return (
    <FeaturePreview
      title="Employee View"
      subtitle="Super-admin preview with the complete employee module map."
      companyText="Employee View Preview"
      tabs={tabs}
      sections={sections}
      intro="Use this page to review every employee-facing surface separately from the company-admin permissions assigned to tenants."
    />
  );
}
