import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import { ROUTES } from '../../../router/routePaths';
import {
  companyAdminHighlights,
  companyAdminMetrics,
  companyAdminQuickActions,
  companyAdminRecentItems,
  companyAdminRecentProjectStatuses,
  companyAdminOnLeaveToday,
  companyAdminWorkingRemotely,
} from '../data/dashboardData';

const dashboardTabs = ['Dashboard', 'Welcome'];
const activityFilters = ['All', 'Active', 'Pending', 'Onboarding'];

function SmallCard({ title, children, className = '' }) {
  return (
    <section className={`dashboard-card mini-list-card ${className}`}>
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
    <div className="superadmin-avatar-row">
      <div>
        <strong>{item.name}</strong>
        <span>{item.plan}</span>
      </div>
      <span className={`role-status-chip tone-${item.status.toLowerCase()}`}>{item.status}</span>
    </div>
  );
}

function initialFromName(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function AvatarStrip({ items }) {
  const visibleItems = items.slice(0, 4);
  return (
    <div className="avatar-strip">
      {visibleItems.map((item) => (
        <div key={item.name} className="dashboard-avatar-item compact">
          <div className="dashboard-avatar-badge">{initialFromName(item.name)}</div>
          <div title={item.name}>{item.name}</div>
          <span>{item.status}</span>
        </div>
      ))}
      {items.length > 4 ? <div className="avatar-more">+{items.length - 4}</div> : null}
    </div>
  );
}

export default function CompanyAdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeComposerTab, setActiveComposerTab] = useState('Post');
  const [timeLabel, setTimeLabel] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLabel(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') return companyAdminRecentProjectStatuses;
    return companyAdminRecentProjectStatuses.filter((item) => item.status === activeFilter);
  }, [activeFilter]);

  const openRoute = (label) => {
    if (label === 'Company Setup') navigate(ROUTES.companySetup);
    if (label === 'Master' || label === 'Organization') navigate(ROUTES.companyAdminMaster);
    if (label === 'Leave Management') navigate(ROUTES.companyAdminLeaveManagement);
    if (label === 'Attendance') navigate(ROUTES.companyAdminAttendance);
    if (label === 'Holiday List') navigate(ROUTES.companyAdminHolidayList);
    if (label === 'Project Management') navigate(ROUTES.companyAdminProjectManagement);
    if (label === 'Project Assign') navigate(ROUTES.companyAdminCreateTeam);
    if (label === 'Reports') navigate(ROUTES.companyAdminReports);
  };

  const quickPeople = companyAdminOnLeaveToday;
  const remotePeople = companyAdminWorkingRemotely;
  const actionLabels = companyAdminQuickActions.map((item) => item.label);
  const activeAction = companyAdminQuickActions.find((item) => item.label === activeComposerTab) ?? companyAdminQuickActions[0];

  return (
    <DashboardShell activeKey="dashboard" headerProps={{ companyText: 'Company Admin' }}>
      <div className="dashboard-top-strip">
        {dashboardTabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`dashboard-top-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {index === 1 ? <span className="dashboard-dot" /> : null}
            {activeTab === tab ? <span className="dashboard-tab-pointer" /> : null}
          </button>
        ))}
      </div>

      <div className="welcome-banner company-admin-welcome-banner">
        <div className="welcome-profile">
          <div className="welcome-banner-badge">CA</div>
          <div className="welcome-profile-copy">
            <h1>Welcome back, Company Admin</h1>
            <p>Manage employees, attendance, holidays, projects, and reports from one compact workspace.</p>
          </div>
        </div>
      </div>

      {activeTab === 'Dashboard' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <div className="holiday-card superadmin-highlight-card">
              <div className="holiday-card-header">
                <span>Quick Access</span>
                <button type="button" class="time-action time-action--primary" onClick={() => navigate(ROUTES.companyAdminHolidayList)}>
                  View All
                </button>
              </div>
              <div className="holiday-hero superadmin-highlight-hero">
                <div className="holiday-hero-copy">
                  <div className="holiday-name">Holiday List</div>
                  <div className="holiday-date">Next: {companyAdminHighlights[0].value}</div>
                  <span className="holiday-pill">{companyAdminHighlights[0].note}</span>
                </div>
                <div className="holiday-skyline superadmin-highlight-icon">
                  <Icon name="calendar" size={28} />
                </div>
              </div>
            </div>

            <SmallCard title="On Leave Today">
              <AvatarStrip items={quickPeople} />
            </SmallCard>

            <SmallCard title="Working Remotely">
              <AvatarStrip items={remotePeople} />
            </SmallCard>

            <div className="time-card">
              <div className="time-card-head">
                <span>Time Today - Company Admin</span>
                <button type="button" className="birthday-collapse" onClick={() => navigate(ROUTES.companyAdminAttendance)}>
                  View All
                </button>
              </div>
              <div className="time-card-label">Current time</div>
              <div className="time-row">
                <div className="time-value">
                  <strong>{timeLabel}</strong>
                  <span>PM</span>
                </div>
                <div className="time-actions">
                  <button type="button" className="time-action time-action--primary" onClick={() => navigate(ROUTES.companyAdminAttendance)}>
                    Mark In
                  </button>
                  <button type="button" className="time-action time-action--ghost" onClick={() => navigate(ROUTES.companyAdminAttendance)}>
                    Attendance
                  </button>
                </div>
              </div>
            </div>

            <SmallCard title="Project Time - Today" className="project-time-card">
              <div className="project-empty">No entries added today</div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <div className="organization-tabs">
              <button type="button" className="organization-tab active">
                Organization
              </button>
              <button type="button" className="organization-tab">
                Reports
              </button>
            </div>

            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                {actionLabels.map((label) => (
                  <button
                    key={label}
                    type="button"
                    className={`feed-tab ${activeComposerTab === label ? 'active' : ''}`}
                    onClick={() => setActiveComposerTab(label)}
                  >
                    <Icon name={label === 'Add Employee' ? 'users' : label === 'Create Team' ? 'people-group' : label === 'Assign Project' ? 'briefcase' : 'chart-line'} size={14} />
                    {label === 'Add Employee' ? 'Post' : label === 'Create Team' ? 'Poll' : label === 'Assign Project' ? 'Praise' : 'Report'}
                  </button>
                ))}
              </div>
              <textarea
                className="feed-input"
                readOnly
                value={`Write your ${activeComposerTab.toLowerCase()} here and mention your peers`}
              />
            </div>

            <div className="announcement-card">
              <span>{activeAction.label}</span>
              <button type="button" className="announcement-add" onClick={() => navigate(ROUTES.companyAdminReports)}>
                +
              </button>
            </div>

            <div className="birthday-card">
              <div className="birthday-tabs">
                {activityFilters.map((filter) => (
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
                {filteredItems.length ? (
                  filteredItems.map((item) => <ActivityRow key={item.name} item={item} />)
                ) : (
                  <div className="superadmin-empty-state">No items found for this filter.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">
                {companyAdminMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Reports Summary">
              <div className="superadmin-list">
                {companyAdminHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-overview-row">
              <SmallCard title="Module Coverage">
                <div className="superadmin-dashboard-module-grid">
                  {companyAdminQuickActions.map((action) => (
                    <button key={action.label} type="button" className="superadmin-package-action superadmin-dashboard-module-card">
                      <strong>{action.label}</strong>
                      <span>{action.description}</span>
                    </button>
                  ))}
                </div>
              </SmallCard>
              <SmallCard title="Reports Focus">
                <div className="superadmin-report-list">
                  <div className="superadmin-report-row">
                    <div>
                      <strong>Employees</strong>
                      <span>{companyAdminMetrics[0].value}</span>
                    </div>
                    <Icon name="chevron-right" size={12} />
                  </div>
                  <div className="superadmin-report-row">
                    <div>
                      <strong>Teams</strong>
                      <span>{companyAdminMetrics[1].value}</span>
                    </div>
                    <Icon name="chevron-right" size={12} />
                  </div>
                  <div className="superadmin-report-row">
                    <div>
                      <strong>Projects</strong>
                      <span>{companyAdminMetrics[2].value}</span>
                    </div>
                    <Icon name="chevron-right" size={12} />
                  </div>
                </div>
              </SmallCard>
            </div>
            <SmallCard title="Recent Activity">
              <div className="superadmin-list">
                {companyAdminRecentProjectStatuses.map((item) => (
                  <ActivityRow key={item.name} item={item} />
                ))}
              </div>
            </SmallCard>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
