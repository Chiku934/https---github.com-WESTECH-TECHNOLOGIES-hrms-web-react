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

export default function LeaveApply() {
  return (
    <MainLayout
      activeKey="user-leave"
      moduleActiveKey="user-leave"
      subNavActiveKey="user-leave-apply"
      moduleNavItems={moduleNavItems}
      showSubNav
      subNavItems={subNavItems}
    >
      <main className="leave-content">
        <div className="leave-tabs">
          <Link className="leave-tab" to={ROUTES.userLeave} style={{ textDecoration: 'none', textAlign: 'center' }}>
            Summary
          </Link>
          <div className="leave-tab active">Apply Leave</div>
          <Link className="leave-tab" to={ROUTES.userLeaveStatus} style={{ textDecoration: 'none', textAlign: 'center' }}>
            Leave Logs
          </Link>
        </div>

        <section className="leave-card">
          <div className="leave-card-row">
            <div>
              <div className="leave-card-name">Apply for Leave</div>
              <div className="leave-card-date" style={{ marginTop: 6, color: '#64748b' }}>
                Choose a leave type and fill in the request details.
              </div>
            </div>
            <div className="leave-card-type">New Request</div>
          </div>

          <div className="leave-type-pills">
            <div className="leave-pill active">Sick Leave</div>
            <div className="leave-pill">Earned Leave</div>
            <div className="leave-pill">Casual Leave</div>
            <div className="leave-pill">Optional Leave</div>
          </div>

          <form className="apply-leave-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="leaveType">Leave Type</label>
                <select id="leaveType">
                  <option>Sick Leave</option>
                  <option>Earned Leave</option>
                  <option>Casual Leave</option>
                  <option>Optional Leave</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="duration">Duration</label>
                <select id="duration">
                  <option>1 Day</option>
                  <option>Half Day</option>
                  <option>Multiple Days</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fromDate">From Date</label>
                <input id="fromDate" type="date" />
              </div>
              <div className="form-group">
                <label htmlFor="toDate">To Date</label>
                <input id="toDate" type="date" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason</label>
              <textarea id="reason" rows={5} placeholder="Add a clear reason for your leave request" />
            </div>

            <div className="form-group">
              <label>Attachment</label>
              <button type="button" className="upload-btn">
                Upload supporting file
              </button>
            </div>

            <button type="submit" className="submit-btn">
              Submit Leave Request
            </button>
          </form>
        </section>
      </main>
    </MainLayout>
  );
}
