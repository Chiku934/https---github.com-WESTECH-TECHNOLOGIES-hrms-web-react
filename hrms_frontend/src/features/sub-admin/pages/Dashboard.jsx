import React, { useMemo, useState } from 'react';
import Icon from '../../../components/Icon';
import DashboardShell from '../../shared/components/DashboardShell';
import {
  subAdminHighlights,
  subAdminMetrics,
  subAdminQuickActions,
  subAdminRecentActivity,
} from '../data/dashboardData';

const accessFilters = ['All', 'Approved', 'Pending'];

function SmallCard({ title, children }) {
  return (
    <section className="dashboard-card superadmin-mini-card">
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

function FilterRow({ filters, activeFilter, onChange }) {
  return (
    <div className="birthday-tabs">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className={`birthday-tab ${activeFilter === filter ? 'active' : ''}`}
          onClick={() => onChange(filter)}
        >
          <Icon name="calendar" size={14} /> {filter}
        </button>
      ))}
      <button type="button" className="birthday-collapse">
        <Icon name="chevron-down" size={12} />
      </button>
    </div>
  );
}

function QuickMetric({ label, value }) {
  return (
    <div className="superadmin-list-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function SubAdminDashboard() {
  const [topTab, setTopTab] = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(subAdminQuickActions[0].label);

  const filteredActivity = useMemo(() => {
    if (activeFilter === 'All') return subAdminRecentActivity;
    if (activeFilter === 'Approved') return subAdminRecentActivity.slice(0, 2);
    return subAdminRecentActivity.slice(2);
  }, [activeFilter]);

  const activeActionDetails =
    subAdminQuickActions.find((item) => item.label === activeAction) ?? subAdminQuickActions[0];

  return (
    <DashboardShell activeKey="dashboard" headerProps={{ companyText: 'Sub Admin' }}>
      <div className="superadmin-module-tabs">
        <button
          type="button"
          className={`superadmin-module-tab ${topTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTopTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          type="button"
          className={`superadmin-module-tab ${topTab === 'reports' ? 'active' : ''}`}
          onClick={() => setTopTab('reports')}
        >
          Reports
        </button>
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">
          {topTab === 'dashboard' ? 'Overview' : 'Reports'}
        </div>
        <div className="superadmin-section-actions">
          <button type="button" className="superadmin-module-primary superadmin-action-small" onClick={() => setTopTab('dashboard')}>
            Dashboard
          </button>
          <button type="button" className="superadmin-module-secondary superadmin-action-small" onClick={() => setTopTab('reports')}>
            Reports
          </button>
        </div>
      </div>

      {topTab === 'dashboard' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {subAdminMetrics.map((metric) => (
                  <StatBlock key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            <div className="holiday-card superadmin-highlight-card">
              <div className="holiday-card-header">
                <span>Priority Note</span>
                <a href="#" class="time-action time-action--primary" onClick={(event) => event.preventDefault()}>
                  View All
                </a>
              </div>
              <div className="holiday-hero superadmin-highlight-hero">
                <div className="holiday-hero-copy">
                  <div className="holiday-name">{subAdminHighlights[0].label}</div>
                  <div className="holiday-date">{subAdminHighlights[0].value}</div>
                  <span className="holiday-pill">{subAdminHighlights[0].note}</span>
                </div>
                <div className="holiday-skyline superadmin-highlight-icon">
                  <Icon name="circle-check" size={28} />
                </div>
              </div>
            </div>

            <SmallCard title="Assigned Clients">
              <div className="superadmin-list">
                {subAdminHighlights.slice(0, 2).map((item) => (
                  <QuickMetric key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </SmallCard>

            <SmallCard title="Permission Queue">
              <div className="superadmin-list">
                {subAdminMetrics.slice(0, 2).map((metric) => (
                  <QuickMetric key={metric.label} label={metric.label} value={metric.value} />
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active">
                  <Icon name="users" size={14} /> Clients
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="lock" size={14} /> Permissions
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="chart-line" size={14} /> Reports
                </button>
              </div>
              <div className="superadmin-action-grid">
                {subAdminQuickActions.map((action) => (
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
              <FilterRow filters={accessFilters} activeFilter={activeFilter} onChange={setActiveFilter} />

              <div className="birthday-section-title">Recent Activity</div>
              <div className="superadmin-client-list">
                {filteredActivity.length ? (
                  filteredActivity.map((item) => <ActivityRow key={`${item.action}-${item.details}`} item={item} />)
                ) : (
                  <div className="superadmin-empty-state">No activity found for this filter.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {subAdminMetrics.map((metric) => (
                  <StatBlock key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            <SmallCard title="Reports Summary">
              <div className="superadmin-list">
                {subAdminHighlights.map((item) => (
                  <QuickMetric key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active">
                  <Icon name="chart-line" size={14} /> Summary
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="users" size={14} /> Clients
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="lock" size={14} /> Access
                </button>
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row">
                  <div>
                    <strong>Assigned Clients</strong>
                    <span>24 total</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
                <div className="superadmin-report-row">
                  <div>
                    <strong>Pending Permissions</strong>
                    <span>7 items</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
                <div className="superadmin-report-row">
                  <div>
                    <strong>Reports Ready</strong>
                    <span>11 reports</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
              </div>
            </div>

            <div className="announcement-card">
              <span>Report review queue</span>
              <button type="button" className="announcement-add">
                +
              </button>
            </div>

            <div className="birthday-card">
              <div className="birthday-section-title">Quick Actions</div>
              <div className="superadmin-report-actions">
                {subAdminQuickActions.map((action) => (
                  <button key={action.label} type="button" className="superadmin-report-action">
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
