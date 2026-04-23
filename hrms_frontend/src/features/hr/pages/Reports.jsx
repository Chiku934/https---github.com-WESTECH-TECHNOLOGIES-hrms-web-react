import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import { hrReportHighlights, hrReportMetrics, hrReportPeriods, hrReportRows, hrReportSummary } from '../data/reportData';

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

export default function Reports() {
  const location = useLocation();
  const [tab, setTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState(hrReportPeriods[0]);
  const rows = useMemo(() => hrReportRows[selectedPeriod] || [], [selectedPeriod]);

  return (
    <DashboardShell activeKey="hr-reports" headerProps={{ companyText: 'HR' }}>
      <div className="superadmin-package-tabs">{tabs.map((item) => <Link key={item.key} to={{ pathname: location.pathname, search: '', hash: item.key === 'overview' ? '#overview' : `#${item.key}` }} replace className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}>{item.label}</Link>)}</div>
      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : `${tab[0].toUpperCase()}${tab.slice(1)} Reports`}</div>
        <div className="superadmin-section-actions">
          <button type="button" className="superadmin-package-primary superadmin-action-small" onClick={() => setSelectedPeriod('Monthly')}>Monthly</button>
          <button type="button" className="superadmin-package-secondary superadmin-action-small" onClick={() => setSelectedPeriod('Yearly')}>Yearly</button>
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card"><div className="superadmin-package-stats-grid">{hrReportMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div></div>
            <SmallCard title="Report Snapshot"><div className="superadmin-list">{hrReportHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <SmallCard title="Summary"><div className="superadmin-package-cycle-grid">{hrReportSummary.map((item) => <div key={item.label} className="superadmin-package-cycle-card"><strong>{item.value}</strong><span>{item.label}</span></div>)}</div></SmallCard>
            <SmallCard title="Report Periods">
              <div className="superadmin-package-report-tabs">{hrReportPeriods.map((period) => <button key={period} type="button" className={`superadmin-package-report-pill ${selectedPeriod === period ? 'active' : ''}`} onClick={() => setSelectedPeriod(period)}><Icon name="chart-line" size={14} /> {period}</button>)}</div>
              <div className="superadmin-report-list">{rows.map((row) => <div key={row.title} className="superadmin-report-row"><div><strong>{row.title}</strong><span>{row.note}</span></div><div className="superadmin-report-row-value">{row.value}</div></div>)}</div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab !== 'overview' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Selected Period"><div className="superadmin-list"><div className="superadmin-list-item"><span>Period</span><strong>{tab[0].toUpperCase()}{tab.slice(1)}</strong></div><div className="superadmin-list-item"><span>Status</span><strong>Frontend demo</strong></div><div className="superadmin-list-item"><span>Scope</span><strong>HR reporting</strong></div></div></SmallCard>
            <SmallCard title="Highlights"><div className="superadmin-list">{hrReportHighlights.map((item) => <div key={item.label} className="superadmin-list-item"><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <SmallCard title={`${tab[0].toUpperCase()}${tab.slice(1)} Summary`}>
              <div className="superadmin-report-list">{rows.map((row) => <div key={row.title} className="superadmin-report-row"><div><strong>{row.title}</strong><span>{row.note}</span></div><div className="superadmin-report-row-value">{row.value}</div></div>)}</div>
            </SmallCard>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
