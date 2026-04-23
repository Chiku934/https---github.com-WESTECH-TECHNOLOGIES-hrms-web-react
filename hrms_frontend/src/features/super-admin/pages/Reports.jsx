import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../styles/packages.css';
import {
  superAdminReportOverviewGuides,
  superAdminReportOverviewStats,
  superAdminReportOverviewSummary,
  superAdminReportPeriods,
  superAdminReportQuickActions,
} from '../data/reportsData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'quarterly', label: 'Quarterly' },
  { key: 'yearly', label: 'Yearly' },
];
const tabToHash = {
  overview: '#overview',
  monthly: '#monthly',
  quarterly: '#quarterly',
  yearly: '#yearly',
};
const hashToTab = {
  '#overview': 'overview',
  '#monthly': 'monthly',
  '#quarterly': 'quarterly',
  '#yearly': 'yearly',
};

function SmallCard({ title, children }) {
  return (
    <section className="dashboard-card superadmin-package-mini-card">
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

export default function SuperAdminReports() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const periodRows = useMemo(() => superAdminReportPeriods[tab] || superAdminReportPeriods.monthly, [tab]);
  const sidebarActiveKey = tab === 'overview' ? 'super-admin-reports-overview' : tab === 'monthly' ? 'super-admin-reports-monthly' : tab === 'quarterly' ? 'super-admin-reports-quarterly' : 'super-admin-reports-yearly';

  useEffect(() => {
    const nextTab = hashToTab[location.hash] || 'overview';
    if (tab !== nextTab) {
      setTab(nextTab);
    }
  }, [location.hash, tab]);

  useEffect(() => {
    if (!location.hash) {
      navigate(tabToHash[tab], { replace: true });
    }
  }, [location.hash, navigate, tab]);

  return (
    <DashboardShell activeKey={sidebarActiveKey} headerProps={{ companyText: 'Super Admin' }}>
      <div className="superadmin-package-tabs">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
            onClick={() => {
              setTab(item.key);
              navigate(tabToHash[item.key], { replace: true });
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : `${tab.charAt(0).toUpperCase() + tab.slice(1)} Report`}</div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <SmallCard title="Report Guide">
              <div className="superadmin-package-limit-guide">
                {superAdminReportOverviewGuides.map((item) => (
                  <div key={item.period} className="superadmin-package-limit-item">
                    <div className="superadmin-package-limit-top">
                      <strong>{item.period}</strong>
                      <span>{item.title}</span>
                    </div>
                    <p>{item.note}</p>
                  </div>
                ))}
              </div>
            </SmallCard>

            <SmallCard title="Current Report">
              <div className="superadmin-package-detail superadmin-package-detail-compact">
                {superAdminReportOverviewSummary.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                    <small className="superadmin-package-detail-note">{item.note}</small>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-overview-actions">
                {superAdminReportQuickActions.slice(0, 3).map((action, index) => (
                  <button
                    key={action.label}
                    type="button"
                    className="superadmin-package-action"
                    onClick={() => {
                      const nextTab = index === 0 ? 'monthly' : index === 1 ? 'quarterly' : 'yearly';
                      setTab(nextTab);
                      navigate(tabToHash[nextTab], { replace: true });
                    }}
                  >
                    <strong>{action.label}</strong>
                    <span>{action.description}</span>
                  </button>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Overview Stats">
              <div className="superadmin-list">
                {superAdminReportOverviewStats.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab !== 'overview' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-workspace superadmin-package-full">
            <SmallCard title="Report Views">
              <div className="superadmin-package-report-tabs">
                {tabs.filter((item) => item.key !== 'overview').map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`superadmin-package-report-pill ${tab === item.key ? 'active' : ''}`}
                    onClick={() => {
                      setTab(item.key);
                      navigate(tabToHash[item.key], { replace: true });
                    }}
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
