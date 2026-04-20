import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ROUTES } from '../router/routePaths';

const moduleNavItems = [
  { label: 'Summary', path: '/dashboard', activeKey: 'dashboard' },
  { label: 'Leave', path: ROUTES.userLeave, activeKey: 'user-leave' },
  { label: 'Attendance', path: ROUTES.userAttendance, activeKey: 'user-attendance' },
  { label: 'Expenses & Travel', path: ROUTES.userExpenses, activeKey: 'user-expenses' },
  { label: 'Timesheet', path: ROUTES.timesheet, activeKey: 'timesheet' },
  { label: 'Profile Changes', path: null, activeKey: null },
  { label: 'Performance', path: ROUTES.userPerformance, activeKey: 'user-performance' },
];

const subNavItems = [
  { label: 'Leave Summary', path: ROUTES.userLeave, activeKey: 'user-leave' },
  { label: 'Apply Leave', path: ROUTES.userLeaveApply, activeKey: 'user-leave-apply' },
  { label: 'Leave Logs', path: ROUTES.userLeaveStatus, activeKey: 'user-leave-status' },
];

export default function LeaveStatus() {
  return (
    <MainLayout
      activeKey="user-leave"
      moduleActiveKey="user-leave"
      subNavActiveKey="user-leave-status"
      moduleNavItems={moduleNavItems}
      showSubNav
      subNavItems={subNavItems}
    >
      <main className="leave-content">
        <div className="leave-tabs">
          <Link className="leave-tab" to={ROUTES.userLeave} style={{ textDecoration: 'none', textAlign: 'center' }}>
            Summary
          </Link>
          <Link className="leave-tab" to={ROUTES.userLeaveApply} style={{ textDecoration: 'none', textAlign: 'center' }}>
            Apply Leave
          </Link>
          <div className="leave-tab active">Leave Logs</div>
        </div>

        <div className="history-card-container">
          <section className="history-card">
            <div className="history-title">Dipti Ranjan Sahoo</div>
            <div className="history-date">Sick Leave - 31 Mar 2026</div>
            <div className="leave-status-row">
              <div className="leave-status-label">Status</div>
              <div className="leave-pills-status leave-pill-pending">Pending</div>
            </div>
            <div className="history-status">Awaiting manager action.</div>
          </section>

          <section className="history-card">
            <div className="history-title">Ashutosh Nayak</div>
            <div className="history-date">Earned Leave - 05 Feb 2026</div>
            <div className="leave-status-row">
              <div className="leave-status-label">Status</div>
              <div className="leave-pills-status leave-pill-approved">Approved</div>
            </div>
            <div className="history-status">Approved by Debasish Nayak.</div>
          </section>

          <section className="history-card">
            <div className="history-title">Subash Behera</div>
            <div className="history-date">Casual Leave - 02 May 2025</div>
            <div className="leave-status-row">
              <div className="leave-status-label">Status</div>
              <div className="leave-pills-status leave-pill-rejected">Rejected</div>
            </div>
            <div className="history-status">Please re-submit with revised dates.</div>
          </section>
        </div>

        <section className="leave-card">
          <div className="leave-card-row">
            <div>
              <div className="leave-card-name">Leave Status Summary</div>
              <div className="leave-card-date" style={{ marginTop: 6, color: '#64748b' }}>
                Quick overview of current request states.
              </div>
            </div>
            <div className="leave-card-type">Last 90 Days</div>
          </div>

          <div className="leave-action-btns">
            <button className="btn-leave-approve" type="button">
              Approve Selected
            </button>
            <button className="btn-leave-reject" type="button">
              Reject Selected
            </button>
          </div>
        </section>
      </main>
    </MainLayout>
  );
}
