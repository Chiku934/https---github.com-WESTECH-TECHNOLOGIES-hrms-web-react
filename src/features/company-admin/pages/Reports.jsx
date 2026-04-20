import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import { companyAdminProjectList } from '../data/projectData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'reports', label: 'Report List' },
  { key: 'summary', label: 'Summary' },
];

const tabToHash = {
  overview: '#overview',
  reports: '#reports',
  summary: '#summary',
};

const hashToTab = {
  '#overview': 'overview',
  '#reports': 'reports',
  '#summary': 'summary',
};

const sidebarActiveKeyMap = {
  overview: 'company-admin-reports-overview',
  reports: 'company-admin-reports-list',
  summary: 'company-admin-reports-summary',
};

const statusFilters = ['All', 'Active', 'On Hold', 'Completed', 'Draft'];

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

function formatDateDisplay(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value || 'N/A';
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

function countByStatus(projects) {
  return projects.reduce(
    (acc, item) => {
      const status = item.status || 'Draft';
      acc[status] = (acc[status] || 0) + 1;
      acc.total += 1;
      acc.budget += Number(item.budget || 0);
      return acc;
    },
    { total: 0, Active: 0, 'On Hold': 0, Completed: 0, Draft: 0, budget: 0 },
  );
}

function getNextDueProject(projects) {
  const sorted = [...projects]
    .filter((item) => item.endDate)
    .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  return sorted[0] || null;
}

function getRecentCompleted(projects) {
  return [...projects]
    .filter((item) => item.status === 'Completed')
    .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
    .slice(0, 3);
}

function ReportRow({ title, note, value }) {
  return (
    <div className="superadmin-report-row">
      <div>
        <strong>{title}</strong>
        <span>{note}</span>
      </div>
      <strong>{value}</strong>
    </div>
  );
}

export default function CompanyAdminReports() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const counts = useMemo(() => countByStatus(companyAdminProjectList), []);
  const nextDueProject = useMemo(() => getNextDueProject(companyAdminProjectList), []);
  const recentCompleted = useMemo(() => getRecentCompleted(companyAdminProjectList), []);
  const activeProjects = useMemo(
    () => companyAdminProjectList.filter((item) => item.status === 'Active'),
    [],
  );

  const overviewMetrics = useMemo(
    () => [
      { label: 'Projects', value: String(counts.total), change: 'Live project list' },
      { label: 'Active', value: String(counts.Active), change: 'In progress' },
      { label: 'On Hold', value: String(counts['On Hold']), change: 'Waiting review' },
      { label: 'Completed', value: String(counts.Completed), change: 'Delivered work' },
    ],
    [counts],
  );

  const filteredProjects = useMemo(
    () => (selectedStatus === 'All'
      ? companyAdminProjectList
      : companyAdminProjectList.filter((item) => item.status === selectedStatus)),
    [selectedStatus],
  );

  const budgetRows = useMemo(
    () => [
      { title: 'Total Budget', note: 'Across all listed projects', value: formatCurrency(counts.budget) },
      { title: 'Average Budget', note: 'Per project baseline', value: formatCurrency(counts.total ? counts.budget / counts.total : 0) },
      { title: 'Next Due', note: nextDueProject ? formatDateDisplay(nextDueProject.endDate) : 'No date available', value: nextDueProject ? nextDueProject.name : 'N/A' },
    ],
    [counts.budget, counts.total, nextDueProject],
  );

  React.useEffect(() => {
    const nextTab = hashToTab[location.hash] || 'overview';
    if (tab !== nextTab) {
      setTab(nextTab);
    }
  }, [location.hash, tab]);

  React.useEffect(() => {
    if (!location.hash) {
      navigate(tabToHash[tab], { replace: true });
    }
  }, [location.hash, navigate, tab]);

  return (
    <DashboardShell activeKey={sidebarActiveKeyMap[tab] || sidebarActiveKeyMap.overview} headerProps={{ companyText: 'Company Admin' }}>
      <div className="superadmin-package-tabs">
        {tabs.map((item) => (
          <Link
            key={item.key}
            to={{ pathname: location.pathname, search: '', hash: tabToHash[item.key] }}
            replace
            className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
            aria-current={tab === item.key ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">
          {tab === 'overview' ? 'Overview' : tab === 'reports' ? 'Report Directory' : 'Summary'}
        </div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout welcome-layout">
          <div className="welcome-main">
            <SmallCard title="Snapshot">
              <div className="superadmin-list">
                {overviewMetrics.map((metric) => (
                  <div key={metric.label} className="superadmin-list-item">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>

            <SmallCard title="Due Soon">
              <div className="superadmin-list">
                {nextDueProject ? (
                  <>
                    <div className="superadmin-list-item">
                      <span>Project</span>
                      <strong>{nextDueProject.name}</strong>
                    </div>
                    <div className="superadmin-list-item">
                      <span>Client</span>
                      <strong>{nextDueProject.client}</strong>
                    </div>
                    <div className="superadmin-list-item">
                      <span>End Date</span>
                      <strong>{formatDateDisplay(nextDueProject.endDate)}</strong>
                    </div>
                  </>
                ) : (
                  <div className="superadmin-empty-state">No project due soon.</div>
                )}
              </div>
            </SmallCard>
          </div>

          <div className="dashboard-right-col">
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-insight">
                <strong>Use live project counts, due dates, and delivery status to keep reporting practical.</strong>
                <span>This overview shows only real data and real next steps.</span>
                <div className="superadmin-package-overview-actions">
                  <button type="button" className="superadmin-package-action" onClick={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.reports }, { replace: true })}>
                    <strong>Open Report List</strong>
                    <span>See detailed project rows.</span>
                  </button>
                  <button type="button" className="superadmin-package-action" onClick={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.summary }, { replace: true })}>
                    <strong>Open Summary</strong>
                    <span>Review the budget and status rollup.</span>
                  </button>
                </div>
              </div>
            </SmallCard>

            <SmallCard title="Recent Completion">
              <div className="superadmin-list">
                {recentCompleted.length ? (
                  recentCompleted.map((item) => (
                    <div key={item.id} className="superadmin-list-item">
                      <span>{item.name}</span>
                      <strong>{formatDateDisplay(item.endDate)}</strong>
                    </div>
                  ))
                ) : (
                  <div className="superadmin-empty-state">No completed projects available.</div>
                )}
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'reports' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Status Counts">
              <div className="superadmin-list">
                {overviewMetrics.map((metric) => (
                  <div key={metric.label} className="superadmin-list-item">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>

            <SmallCard title="Status Filter">
              <div className="superadmin-package-report-tabs">
                {statusFilters.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`superadmin-package-report-pill ${selectedStatus === status ? 'active' : ''}`}
                    onClick={() => setSelectedStatus(status)}
                  >
                    <Icon name="filter" size={14} /> {status}
                  </button>
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="superadmin-package-workspace">
            <SmallCard title="Detailed Project Report">
              <div className="superadmin-report-list">
                {filteredProjects.map((item) => (
                  <ReportRow
                    key={item.id}
                    title={item.name}
                    note={`${item.client} · ${formatDateDisplay(item.startDate)} to ${formatDateDisplay(item.endDate)}`}
                    value={`${item.status} · ${formatCurrency(item.budget)}`}
                  />
                ))}
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'summary' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">
                {overviewMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>

            <SmallCard title="Budget Rollup">
              <div className="superadmin-list">
                {budgetRows.map((item) => (
                  <div key={item.title} className="superadmin-list-item">
                    <span>{item.title}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>

          <div className="superadmin-package-workspace">
            <SmallCard title="Status Notes">
              <div className="superadmin-report-list">
                <ReportRow title="Active Projects" note="Currently in delivery" value={String(counts.Active)} />
                <ReportRow title="On Hold Projects" note="Waiting for review or client input" value={String(counts['On Hold'])} />
                <ReportRow title="Completed Projects" note="Already delivered and closed" value={String(counts.Completed)} />
                <ReportRow title="Draft Projects" note="Still in preparation" value={String(counts.Draft)} />
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
