import React, { useMemo, useState } from 'react';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import {
  subAdminReportHighlights,
  subAdminReportMetrics,
  subAdminReportPeriods,
  subAdminReportQuickActions,
} from '../data/reportsData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];

function SmallCard({ title, children }) {
  return (
    <section className="dashboard-card superadmin-package-mini-card">
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

function StatBlock({ metric }) {
  return (
    <div className="superadmin-package-stat">
      <div className="superadmin-package-stat-label">{metric.label}</div>
      <div className="superadmin-package-stat-value">{metric.value}</div>
      <div className="superadmin-package-stat-change">{metric.change}</div>
    </div>
  );
}

export default function SubAdminReports() {
  const [tab, setTab] = useState('overview');
  const [activeAction, setActiveAction] = useState(subAdminReportQuickActions[0].label);

  const periodRows = useMemo(() => subAdminReportPeriods[tab] || subAdminReportPeriods.monthly, [tab]);

  return (
    <DashboardShell activeKey="sub-admin-reports" headerProps={{ companyText: 'Sub Admin' }}>
      <div className="superadmin-package-tabs">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Report`}</div>
        <div className="superadmin-section-actions">
          <button type="button" className="superadmin-package-primary superadmin-action-small" onClick={() => setTab('monthly')}>Monthly</button>
          <button type="button" className="superadmin-package-secondary superadmin-action-small" onClick={() => setTab('yearly')}>Yearly</button>
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">
                {subAdminReportMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
            <SmallCard title="Report Snapshot">
              <div className="superadmin-list">
                {subAdminReportHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-action-grid">
                {subAdminReportQuickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={`superadmin-package-action ${activeAction === action.label ? 'active' : ''}`}
                    onClick={() => setActiveAction(action.label)}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Workspace Notes">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Current Focus</span><strong>{activeAction}</strong></div>
                <div className="superadmin-list-item"><span>Current View</span><strong>Overview</strong></div>
                <div className="superadmin-list-item"><span>Report Ready</span><strong>Frontend demo</strong></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab !== 'overview' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title={`${tab.charAt(0).toUpperCase() + tab.slice(1)} Summary`}>
              <div className="superadmin-list">
                {subAdminReportHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">
                {subAdminReportMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
          </div>
          <div className="superadmin-package-workspace">
            <SmallCard title="Report Views">
              <div className="superadmin-package-report-tabs">
                {tabs.filter((item) => item.key !== 'overview').map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`superadmin-package-report-pill ${tab === item.key ? 'active' : ''}`}
                    onClick={() => setTab(item.key)}
                  >
                    <Icon name="chart-line" size={14} /> {item.label}
                  </button>
                ))}
              </div>
              <div className="superadmin-report-list">
                {periodRows.map((row) => (
                  <div key={row.label} className="superadmin-report-row">
                    <div>
                      <strong>{row.label}</strong>
                      <span>{row.note}</span>
                    </div>
                    <div>
                      <strong>{row.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Export Notes">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Period</span><strong>{tab.charAt(0).toUpperCase() + tab.slice(1)}</strong></div>
                <div className="superadmin-list-item"><span>Format</span><strong>Compact frontend summary</strong></div>
                <div className="superadmin-list-item"><span>Backend</span><strong>Ready later</strong></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
