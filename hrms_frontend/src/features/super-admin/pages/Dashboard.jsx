import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import { ROUTES } from '../../../router/routePaths';
import {
  superAdminHighlights,
  superAdminMetrics,
  superAdminQuickActions,
  superAdminRecentClients,
} from '../data/dashboardData';

const dashboardTabs = ['Dashboard', 'Welcome'];
const clientFilters = ['All', 'Active', 'Onboarding', 'Pending'];

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

function ClientRow({ item }) {
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
  return (
    <div className="avatar-strip">
      {items.map((item) => (
        <div key={item.name} className="dashboard-avatar-item compact">
          <div className="dashboard-avatar-badge">{initialFromName(item.name)}</div>
          <div title={item.name}>{item.name}</div>
          <span>{item.status}</span>
        </div>
      ))}
      {items.length > 5 ? <div className="avatar-more">+{items.length - 5}</div> : null}
    </div>
  );
}

function actionIcon(label) {
  if (label === 'Create Package' || label === 'Manage Pricing') return 'briefcase';
  if (label === 'Update Location') return 'calendar';
  return 'chart-line';
}

function actionRoute(label) {
  if (label === 'Create Package') return ROUTES.superAdminPackages;
  if (label === 'Manage Pricing') return ROUTES.superAdminPackages;
  if (label === 'Update Location') return ROUTES.superAdminLocationMaster;
  if (label === 'Open Reports') return ROUTES.superAdminReports;
  return null;
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(superAdminQuickActions[0].label);
  const navigate = useNavigate();

  const filteredClients = useMemo(() => {
    if (activeFilter === 'All') return superAdminRecentClients;
    return superAdminRecentClients.filter((client) => client.status === activeFilter);
  }, [activeFilter]);

  const activeActionDetails =
    superAdminQuickActions.find((item) => item.label === activeAction) ?? superAdminQuickActions[0];

  const quickClients = superAdminRecentClients.slice(0, 4);
  const highlight = superAdminHighlights[0];

  const handleAction = (label) => {
    const route = actionRoute(label);
    if (route) navigate(route);
  };

  return (
    <DashboardShell activeKey="dashboard" headerProps={{ companyText: 'Super Admin' }}>
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

      <div className="welcome-banner">
        <div className="welcome-profile">
          <div className="welcome-banner-badge">SA</div>
          <div className="welcome-profile-copy">
            <h1>Welcome back, Super Admin</h1>
            <p>Manage packages, locations, and reporting from one shared control room.</p>
          </div>
        </div>
      </div>

      {activeTab === 'Dashboard' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <div className="holiday-card superadmin-highlight-card">
              <div className="holiday-card-header">
                <span>Key Highlight</span>
                <button type="button" class="time-action time-action--primary" onClick={() => navigate(ROUTES.superAdminLocationMaster)}>
                  View All
                </button>
              </div>
              <div className="holiday-hero superadmin-highlight-hero">
                <div className="holiday-hero-copy">
                  <div className="holiday-name">{highlight.label}</div>
                  <div className="holiday-date">{highlight.value}</div>
                  <span className="holiday-pill">{highlight.note}</span>
                </div>
                <div className="holiday-skyline superadmin-highlight-icon">
                  <Icon name="sparkles" size={28} />
                </div>
              </div>
            </div>

            <SmallCard title="Recent Activity">
              <AvatarStrip items={quickClients} />
            </SmallCard>

            <SmallCard title="Platform Snapshot">
              <div className="superadmin-list">
                {superAdminMetrics.slice(0, 3).map((metric) => (
                  <div key={metric.label} className="superadmin-list-item">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>

            <div className="time-card">
              <div className="time-card-head">
                <span>Revenue Pulse</span>
                <button type="button" className="birthday-collapse" onClick={() => navigate(ROUTES.superAdminReports)}>
                  View Reports
                </button>
              </div>
              <div className="time-card-label">Current month revenue</div>
              <div className="time-row">
                <div className="time-value">
                  <strong>{superAdminMetrics[3].value}</strong>
                  <span>month</span>
                </div>
                <div className="time-actions">
                  <button
                    type="button"
                    className="time-action time-action--primary"
                    onClick={() => navigate(ROUTES.superAdminPackages)}
                  >
                    Packages
                  </button>
                  <button
                    type="button"
                    className="time-action time-action--ghost"
                    onClick={() => navigate(ROUTES.superAdminReports)}
                  >
                    Reports
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-right-col">
            <div className="organization-tabs">
              <button type="button" className="organization-tab active">
                Packages
              </button>
              <button type="button" className="organization-tab">
                Reports
              </button>
            </div>

            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                {superAdminQuickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={`feed-tab ${activeAction === action.label ? 'active' : ''}`}
                    onClick={() => setActiveAction(action.label)}
                  >
                    <Icon name={actionIcon(action.label)} size={14} />
                    {action.label === 'Create Package'
                      ? 'Package'
                      : action.label === 'Update Location'
                        ? 'Location'
                        : action.label === 'Manage Pricing'
                          ? 'Pricing'
                          : 'Reports'}
                  </button>
                ))}
              </div>
              <textarea
                className="feed-input"
                readOnly
                value={`Draft your ${activeAction.toLowerCase()} update here before publishing.`}
              />
            </div>

            <div className="announcement-card">
              <span>{activeActionDetails.label}</span>
              <button type="button" className="announcement-add" onClick={() => handleAction(activeActionDetails.label)}>
                +
              </button>
            </div>

            <div className="birthday-card">
              <div className="birthday-tabs">
                {clientFilters.map((filter) => (
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

              <div className="birthday-section-title">Recent Client Activity</div>
              <div className="superadmin-client-list">
                {filteredClients.length ? (
                  filteredClients.map((item) => <ClientRow key={item.name} item={item} />)
                ) : (
                  <div className="superadmin-empty-state">No clients found for this filter.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {superAdminMetrics.map((metric) => (
                  <StatBlock key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            <SmallCard title="Reports Summary">
              <div className="superadmin-list">
                {superAdminHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>

            <SmallCard title="Quick Reach">
              <div className="superadmin-dashboard-module-grid">
                {superAdminQuickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="superadmin-package-action superadmin-dashboard-module-card"
                    onClick={() => handleAction(action.label)}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <div className="organization-tabs">
              <button type="button" className="organization-tab active">
                Welcome
              </button>
              <button type="button" className="organization-tab">
                Reports
              </button>
            </div>

            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                {superAdminQuickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={`feed-tab ${activeAction === action.label ? 'active' : ''}`}
                    onClick={() => setActiveAction(action.label)}
                  >
                    <Icon name={actionIcon(action.label)} size={14} />
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="superadmin-dashboard-module-grid">
                {superAdminQuickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="superadmin-package-action superadmin-dashboard-module-card"
                    onClick={() => handleAction(action.label)}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="announcement-card">
              <span>{activeActionDetails.label}</span>
              <button type="button" className="announcement-add" onClick={() => handleAction(activeActionDetails.label)}>
                +
              </button>
            </div>

            <div className="birthday-card">
              <div className="birthday-section-title">Client Watchlist</div>
              <div className="superadmin-client-list">
                {superAdminRecentClients.map((item) => (
                  <ClientRow key={item.name} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
