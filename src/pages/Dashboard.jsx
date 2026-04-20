import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import DashboardShell from '../features/shared/components/DashboardShell';
import { resolveRoleFromStorage } from '../data/navigation/index.js';
import { ROLES } from '../app/config/roles.js';
import { ROUTES } from '../router/routePaths.js';
import SuperAdminDashboard from '../features/super-admin/pages/Dashboard';
import SubAdminDashboard from '../features/sub-admin/pages/Dashboard';
import CompanyAdminDashboard from '../features/company-admin/pages/Dashboard';
import HrDashboard from '../features/hr/pages/Dashboard';

const employeeMetrics = [
  { label: 'Attendance', value: '96%', change: '+2% this week' },
  { label: 'Leave Balance', value: '08', change: '3 planned' },
  { label: 'Tasks', value: '12', change: '4 due today' },
  { label: 'Timesheet', value: '42h', change: 'Weekly total' },
];

const employeeHighlights = [
  { label: 'Today Shift', value: '09:30 AM - 06:30 PM', note: 'On time' },
  { label: 'Pending Leave', value: '1 request', note: 'Awaiting approval' },
  { label: 'Project Load', value: '3 active tasks', note: 'Sprint 12' },
  { label: 'Next Review', value: 'Friday', note: 'Manager meeting' },
];

const employeeQuickActions = [
  { label: 'Mark Attendance', description: 'Check in or check out for the day.', icon: 'clock' },
  { label: 'Apply Leave', description: 'Submit a leave request quickly.', icon: 'calendar' },
  { label: 'Open Timesheet', description: 'Review and update your hours.', icon: 'clipboard' },
  { label: 'View Performance', description: 'Track goals, reviews, and feedback.', icon: 'chart-line' },
];

const employeeActivity = [
  { action: 'Attendance marked', details: 'Checked in at 09:28 AM', time: 'Today' },
  { action: 'Leave request', details: 'Casual leave submitted for Friday', time: '1 day ago' },
  { action: 'Timesheet updated', details: 'Logged 8 hours for project sprint', time: '2 days ago' },
  { action: 'Performance note', details: 'Manager shared feedback summary', time: '3 days ago' },
];

const employeeFilters = ['All', 'Attendance', 'Leave', 'Tasks'];

const managerMetrics = [
  { label: 'Team Members', value: '18', change: '2 added this month' },
  { label: 'Active Projects', value: '6', change: '3 in delivery' },
  { label: 'Pending Approvals', value: '9', change: 'Attendance and leave' },
  { label: 'Timesheet Exceptions', value: '4', change: 'Needs follow-up' },
];

const managerHighlights = [
  { label: 'Today Snapshot', value: '14 present', note: '4 on leave / out' },
  { label: 'Project Load', value: '2 critical', note: '1 at risk' },
  { label: 'Leave Queue', value: '5 requests', note: 'Waiting for review' },
  { label: 'Timesheet Queue', value: '7 approvals', note: 'Pending manager action' },
];

const managerQuickActions = [
  { label: 'My Team', description: 'Review team members, structure, and reports.', icon: 'people-group', to: ROUTES.myTeamSummary },
  { label: 'My Team Timesheet', description: 'Scan timesheet approvals and exceptions.', icon: 'clipboard', to: ROUTES.myTeamTimesheet },
  { label: 'Attendance (Team View)', description: 'Track team attendance and regularization.', icon: 'clock', to: ROUTES.myTeamAttendance },
  { label: 'Leave (Team View)', description: 'Handle team leave requests and balance checks.', icon: 'calendar', to: ROUTES.myTeamLeave },
  { label: 'Project Management', description: 'Open project records and status updates.', icon: 'briefcase', to: ROUTES.projects },
];

const managerActivity = [
  { action: 'Timesheet review', details: '3 approvals waiting in the current sprint', time: 'Today' },
  { action: 'Attendance check', details: '2 regularization requests need review', time: '1 hour ago' },
  { action: 'Leave queue', details: 'Weekly leave requests moved to manager review', time: '2 hours ago' },
  { action: 'Project update', details: 'Alpha delivery status changed to on track', time: 'Yesterday' },
];

function SmallCard({ title, children, className = '' }) {
  return (
    <section className={`dashboard-card superadmin-mini-card ${className}`}>
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

function StatBlock({ metric }) {
  return (
    <div className="superadmin-stat">
      <div className="superadmin-stat-label">{metric.label}</div>
      <div className="superadmin-stat-value">{metric.value}</div>
      <div className="superadmin-stat-change">{metric.change}</div>
    </div>
  );
}

function ActivityRow({ item }) {
  return (
    <div className="role-activity-item">
      <div className="role-activity-icon">
        <Icon name="clock-rotate-left" size={14} />
      </div>
      <div className="role-activity-copy">
        <strong>{item.action}</strong>
        <span>{item.details}</span>
      </div>
      <div className="role-activity-time">{item.time}</div>
    </div>
  );
}

function EmployeeDashboard() {
  const [topTab, setTopTab] = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(employeeQuickActions[0].label);

  const filteredActivity = useMemo(() => {
    if (activeFilter === 'All') {
      return employeeActivity;
    }

    if (activeFilter === 'Attendance') {
      return employeeActivity.slice(0, 2);
    }

    if (activeFilter === 'Leave') {
      return employeeActivity.slice(1, 3);
    }

    return employeeActivity.slice(2);
  }, [activeFilter]);

  const activeActionDetails = employeeQuickActions.find((item) => item.label === activeAction) ?? employeeQuickActions[0];

  return (
    <DashboardShell activeKey="dashboard" headerProps={{ companyText: 'Employee' }}>
      <div className="user-setup-tabs dashboard-tabs">
        <button type="button" className={`user-setup-tab ${topTab === 'dashboard' ? 'active' : ''}`} onClick={() => setTopTab('dashboard')}>
          Dashboard
        </button>
        <button type="button" className={`user-setup-tab ${topTab === 'reports' ? 'active' : ''}`} onClick={() => setTopTab('reports')}>
          Reports
        </button>
      </div>

      {topTab === 'dashboard' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {employeeMetrics.map((metric) => (
                  <StatBlock key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            <div className="holiday-card superadmin-highlight-card">
              <div className="holiday-card-header">
                <span>Today Snapshot</span>
                <a href="#" class="time-action time-action--primary" onClick={(event) => event.preventDefault()}>
                  View All
                </a>
              </div>
              <div className="holiday-hero superadmin-highlight-hero">
                <div className="holiday-hero-copy">
                  <div className="holiday-name">{employeeHighlights[0].label}</div>
                  <div className="holiday-date">{employeeHighlights[0].value}</div>
                  <span className="holiday-pill">{employeeHighlights[0].note}</span>
                </div>
                <div className="holiday-skyline superadmin-highlight-icon">
                  <Icon name="sparkles" size={28} />
                </div>
              </div>
            </div>

            <SmallCard title="Work Summary">
              <div className="superadmin-list">
                {employeeHighlights.slice(1).map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>

            <SmallCard title="Quick Status">
              <div className="superadmin-list">
                {employeeMetrics.slice(1, 3).map((metric) => (
                  <div key={metric.label} className="superadmin-list-item">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <div className="organization-tabs">
              <button type="button" className="organization-tab active">
                Employee
              </button>
              <button type="button" className="organization-tab">
                Reports
              </button>
            </div>

            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active">
                  <Icon name="clock" size={14} /> Attendance
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="calendar" size={14} /> Leave
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="clipboard" size={14} /> Timesheet
                </button>
              </div>
              <div className="superadmin-action-grid">
                {employeeQuickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={`superadmin-action-item ${activeAction === action.label ? 'active' : ''}`}
                    onClick={() => setActiveAction(action.label)}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="announcement-card">
              <span>{activeActionDetails.label}</span>
              <button type="button" className="announcement-add">
                +
              </button>
            </div>

            <div className="birthday-card">
              <div className="birthday-tabs">
                {employeeFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`birthday-tab ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    <Icon name="calendar" size={14} /> {filter}
                  </button>
                ))}
                <button type="button" className="birthday-collapse">
                  <Icon name="chevron-down" size={12} />
                </button>
              </div>

              <div className="birthday-section-title">Recent Activity</div>
              <div className="superadmin-client-list">
                {filteredActivity.map((item) => (
                  <ActivityRow key={`${item.action}-${item.details}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {employeeMetrics.map((metric) => (
                  <StatBlock key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            <SmallCard title="Reports Summary">
              <div className="superadmin-list">
                {employeeHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <div className="organization-tabs">
              <button type="button" className="organization-tab active">
                Employee
              </button>
              <button type="button" className="organization-tab">
                Reports
              </button>
            </div>

            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active">
                  <Icon name="clock" size={14} /> Attendance
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="calendar" size={14} /> Leave
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="clipboard" size={14} /> Timesheet
                </button>
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row">
                  <div>
                    <strong>Attendance</strong>
                    <span>{employeeMetrics[0].value}</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
                <div className="superadmin-report-row">
                  <div>
                    <strong>Leave Balance</strong>
                    <span>{employeeMetrics[1].value}</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
                <div className="superadmin-report-row">
                  <div>
                    <strong>Timesheet Hours</strong>
                    <span>{employeeMetrics[3].value}</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
              </div>
            </div>

            <div className="announcement-card">
              <span>{activeActionDetails.label}</span>
              <button type="button" className="announcement-add">
                +
              </button>
            </div>

            <div className="birthday-card">
              <div className="birthday-tabs">
                {employeeFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={`birthday-tab ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    <Icon name="calendar" size={14} /> {filter}
                  </button>
                ))}
                <button type="button" className="birthday-collapse">
                  <Icon name="chevron-down" size={12} />
                </button>
              </div>

              <div className="birthday-section-title">Recent Activity</div>
              <div className="superadmin-client-list">
                {filteredActivity.map((item) => (
                  <ActivityRow key={`${item.action}-${item.details}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function ManagerDashboard() {
  const [topTab, setTopTab] = useState('dashboard');
  const [activeAction, setActiveAction] = useState(managerQuickActions[0].label);

  const activeActionDetails = managerQuickActions.find((item) => item.label === activeAction) ?? managerQuickActions[0];

  return (
    <DashboardShell activeKey="dashboard" headerProps={{ companyText: 'Manager' }}>
      <div className="user-setup-tabs dashboard-tabs">
        <button type="button" className={`user-setup-tab ${topTab === 'dashboard' ? 'active' : ''}`} onClick={() => setTopTab('dashboard')}>
          Dashboard
        </button>
        <button type="button" className={`user-setup-tab ${topTab === 'reports' ? 'active' : ''}`} onClick={() => setTopTab('reports')}>
          Reports
        </button>
      </div>

      {topTab === 'dashboard' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {managerMetrics.map((metric) => (
                  <StatBlock key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            <div className="holiday-card superadmin-highlight-card">
              <div className="holiday-card-header">
                <span>Team Snapshot</span>
                <Link to={ROUTES.myTeamSummary} className="time-action time-action--primary">
                  View Team
                </Link>
              </div>
              <div className="holiday-hero superadmin-highlight-hero">
                <div className="holiday-hero-copy">
                  <div className="holiday-name">{managerHighlights[0].label}</div>
                  <div className="holiday-date">{managerHighlights[0].value}</div>
                  <span className="holiday-pill">{managerHighlights[0].note}</span>
                </div>
                <div className="holiday-skyline superadmin-highlight-icon">
                  <Icon name="users" size={28} />
                </div>
              </div>
            </div>

            <SmallCard title="Team Overview">
              <div className="superadmin-list">
                {managerHighlights.slice(1).map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <div className="organization-tabs">
              <button type="button" className="organization-tab active">
                Team
              </button>
              <button type="button" className="organization-tab">
                Reports
              </button>
            </div>

            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active">
                  <Icon name="users" size={14} /> Team
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="clock" size={14} /> Attendance
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="clipboard" size={14} /> Timesheet
                </button>
              </div>
              <div className="superadmin-action-grid">
                {managerQuickActions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className={`superadmin-action-item ${activeAction === action.label ? 'active' : ''}`}
                    onClick={() => setActiveAction(action.label)}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="announcement-card">
              <span>{activeActionDetails.label}</span>
              <Link to={activeActionDetails.to} className="announcement-add" style={{ textDecoration: 'none' }}>
                +
              </Link>
            </div>

            <div className="birthday-card">
              <div className="birthday-section-title">Recent Manager Activity</div>
              <div className="superadmin-client-list">
                {managerActivity.map((item) => (
                  <ActivityRow key={`${item.action}-${item.details}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {managerMetrics.map((metric) => (
                  <StatBlock key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            <SmallCard title="Reports Summary">
              <div className="superadmin-list">
                {managerHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <div className="organization-tabs">
              <button type="button" className="organization-tab">
                Team
              </button>
              <button type="button" className="organization-tab active">
                Reports
              </button>
            </div>

            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active">
                  <Icon name="chart-line" size={14} /> Reports
                </button>
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row">
                  <div>
                    <strong>Team Summary</strong>
                    <span>{managerHighlights[0].value}</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
                <div className="superadmin-report-row">
                  <div>
                    <strong>Timesheet Queue</strong>
                    <span>{managerMetrics[3].value}</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
                <div className="superadmin-report-row">
                  <div>
                    <strong>Project Load</strong>
                    <span>{managerMetrics[1].value}</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
              </div>
            </div>

            <div className="announcement-card">
              <span>{activeActionDetails.label}</span>
              <Link to={activeActionDetails.to} className="announcement-add" style={{ textDecoration: 'none' }}>
                +
              </Link>
            </div>

            <div className="birthday-card">
              <div className="birthday-section-title">Recent Manager Activity</div>
              <div className="superadmin-client-list">
                {managerActivity.map((item) => (
                  <ActivityRow key={`${item.action}-${item.details}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

export default function Dashboard() {
  const role = resolveRoleFromStorage();

  if (role === ROLES.SUPER_ADMIN) {
    return <SuperAdminDashboard />;
  }

  if (role === ROLES.SUB_ADMIN) {
    return <SubAdminDashboard />;
  }

  if (role === ROLES.COMPANY_ADMIN) {
    return <CompanyAdminDashboard />;
  }

  if (role === ROLES.HR) {
    return <HrDashboard />;
  }

  if (role === ROLES.MANAGER) {
    return <ManagerDashboard />;
  }

  return <EmployeeDashboard />;
}
