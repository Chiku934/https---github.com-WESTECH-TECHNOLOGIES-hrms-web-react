import React, { useMemo, useState } from 'react';
import Icon from '../../../components/Icon';
import DashboardShell from '../../shared/components/DashboardShell';
import { hrHighlights, hrMetrics, hrQuickActions, hrRecentItems } from '../data/dashboardData';

const hrFilters = ['All', 'Leave', 'Attendance'];

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

export default function HrDashboard() {
  const [topTab, setTopTab] = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(hrQuickActions[0].label);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'All') {
      return hrRecentItems;
    }

    if (activeFilter === 'Leave') {
      return hrRecentItems.slice(0, 2);
    }

    return hrRecentItems.slice(1);
  }, [activeFilter]);

  const activeActionDetails = hrQuickActions.find((item) => item.label === activeAction) ?? hrQuickActions[0];

  return (
    <DashboardShell activeKey="dashboard" headerProps={{ companyText: 'HR' }}>
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
              {hrMetrics.map((metric) => (
                <StatBlock key={metric.label} metric={metric} />
              ))}
            </div>
          </div>

          <div className="holiday-card superadmin-highlight-card">
            <div className="holiday-card-header">
              <span>HR Priority</span>
              <a href="#" class="time-action time-action--primary" onClick={(event) => event.preventDefault()}>
                View All
              </a>
            </div>
            <div className="holiday-hero superadmin-highlight-hero">
              <div className="holiday-hero-copy">
                <div className="holiday-name">{hrHighlights[0].label}</div>
                <div className="holiday-date">{hrHighlights[0].value}</div>
                <span className="holiday-pill">{hrHighlights[0].note}</span>
              </div>
              <div className="holiday-skyline superadmin-highlight-icon">
                <Icon name="clipboard" size={28} />
              </div>
            </div>
          </div>

          <SmallCard title="Master Data">
            <div className="superadmin-list">
              {hrHighlights.slice(1).map((item) => (
                <div key={item.label} className="superadmin-list-item">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </SmallCard>

          <SmallCard title="Holiday List">
            <div className="superadmin-list">
              {hrMetrics.slice(1, 3).map((metric) => (
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
              HR
            </button>
            <button type="button" className="organization-tab">
              Reports
            </button>
          </div>

          <div className="feed-card superadmin-action-card">
            <div className="feed-tabs">
              <button type="button" className="feed-tab active">
                <Icon name="calendar" size={14} /> Leave
              </button>
              <button type="button" className="feed-tab">
                <Icon name="clock" size={14} /> Attendance
              </button>
              <button type="button" className="feed-tab">
                <Icon name="clipboard" size={14} /> Masters
              </button>
            </div>
            <div className="superadmin-action-grid">
              {hrQuickActions.map((action) => (
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
              {hrFilters.map((filter) => (
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
              {filteredItems.map((item) => (
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
                {hrMetrics.map((metric) => (
                  <StatBlock key={metric.label} metric={metric} />
                ))}
              </div>
            </div>

            <SmallCard title="Reports Summary">
              <div className="superadmin-list">
                {hrHighlights.map((item) => (
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
                HR
              </button>
              <button type="button" className="organization-tab">
                Reports
              </button>
            </div>

            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active">
                  <Icon name="calendar" size={14} /> Leave
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="clock" size={14} /> Attendance
                </button>
                <button type="button" className="feed-tab">
                  <Icon name="clipboard" size={14} /> Masters
                </button>
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row">
                  <div>
                    <strong>Leaves</strong>
                    <span>{hrMetrics[1].value}</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
                <div className="superadmin-report-row">
                  <div>
                    <strong>Attendance</strong>
                    <span>{hrMetrics[2].value}</span>
                  </div>
                  <Icon name="chevron-right" size={12} />
                </div>
                <div className="superadmin-report-row">
                  <div>
                    <strong>Holiday List</strong>
                    <span>{hrMetrics[3].value}</span>
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
                {hrFilters.map((filter) => (
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
                {filteredItems.map((item) => (
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
