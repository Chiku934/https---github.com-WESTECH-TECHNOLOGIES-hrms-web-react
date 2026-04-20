import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import MainLayout from '../layouts/MainLayout';
import { ROUTES } from '../router/routePaths';

const moduleNavItems = [
  { label: 'Summary', path: ROUTES.myTeamSummary, activeKey: 'myteam_summary' },
  { label: 'Leave', path: ROUTES.myTeamLeaveOverview, activeKey: 'myteam_leave_overview' },
  { label: 'Attendance', path: ROUTES.myTeamAttendance, activeKey: 'myteam_attendance' },
  { label: 'Expenses & Travel', path: ROUTES.myTeamExpenses, activeKey: 'myteam_expenses' },
  { label: 'Timesheet', path: ROUTES.myTeamTimesheet, activeKey: 'myteam_timesheet' },
  { label: 'Profile Changes', path: ROUTES.myTeamProfileChanges, activeKey: 'myteam_profile_changes' },
  { label: 'Performance', path: ROUTES.myTeamPerformance, activeKey: 'myteam_performance' },
];

const tabs = [
  { key: 'kpis', label: 'KPIs', activeKey: 'myteam_performance_kpis' },
  { key: 'meetings', label: '1:1 Meetings', activeKey: 'myteam_performance_meetings' },
  { key: 'feedback', label: 'Feedback', activeKey: 'myteam_performance_feedback' },
];

const subNavItems = tabs.map((tab) => ({
  label: tab.label,
  path: `${ROUTES.myTeamPerformance}#${tab.key}`,
  activeKey: tab.activeKey,
}));

const kpiRows = [
  { employee: 'Jitesh Kumar Das', kpi: 'Delivery Quality', score: '4.8/5', target: '4.5/5', owner: 'Ashutosh Nayak', status: 'On Track', searchText: 'Jitesh Kumar Das Delivery Quality 4.8/5 4.5/5 Ashutosh Nayak On Track' },
  { employee: 'Kajal Dikhit', kpi: 'Team Collaboration', score: '4.6/5', target: '4.5/5', owner: 'Ashutosh Nayak', status: 'On Track', searchText: 'Kajal Dikhit Team Collaboration 4.6/5 4.5/5 Ashutosh Nayak On Track' },
  { employee: 'Prajwal Chandra Nayak', kpi: 'Client Satisfaction', score: '4.2/5', target: '4.5/5', owner: 'Ashutosh Nayak', status: 'Watch', searchText: 'Prajwal Chandra Nayak Client Satisfaction 4.2/5 4.5/5 Ashutosh Nayak Watch' },
  { employee: 'Smruti Ranjan Rout', kpi: 'Delivery Quality', score: '4.1/5', target: '4.5/5', owner: 'Ashutosh Nayak', status: 'Watch', searchText: 'Smruti Ranjan Rout Delivery Quality 4.1/5 4.5/5 Ashutosh Nayak Watch' },
];

const meetingRows = [
  { employee: 'Animesh Das', topic: 'Goal review and growth plan', date: '04 Apr 2026', time: '11:30 AM', type: 'Scheduled', status: 'Upcoming', searchText: 'Animesh Das Goal review and growth plan 04 Apr 2026 11:30 AM Scheduled Upcoming' },
  { employee: 'Bhasha Mishra', topic: 'Quarterly performance check-in', date: '05 Apr 2026', time: '03:00 PM', type: 'Scheduled', status: 'Upcoming', searchText: 'Bhasha Mishra Quarterly performance check-in 05 Apr 2026 03:00 PM Scheduled Upcoming' },
  { employee: 'Bijay Kumar Sahoo', topic: 'Feedback discussion', date: '02 Apr 2026', time: '09:30 AM', type: 'Completed', status: 'Done', searchText: 'Bijay Kumar Sahoo Feedback discussion 02 Apr 2026 09:30 AM Completed Done' },
];

const feedbackRows = [
  { employee: 'Deepak Kumar Gouda', source: 'Peer Feedback', summary: 'Strong ownership on deliveries and solid code reviews.', date: '31 Mar 2026', status: 'Positive', searchText: 'Deepak Kumar Gouda Peer Feedback Strong ownership on deliveries and solid code reviews. 31 Mar 2026 Positive' },
  { employee: 'Lipsi Mohanty', source: 'Manager Feedback', summary: 'Needs support on communication turnaround for blockers.', date: '30 Mar 2026', status: 'Action Required', searchText: 'Lipsi Mohanty Manager Feedback Needs support on communication turnaround for blockers. 30 Mar 2026 Action Required' },
  { employee: 'Krutika Mishra', source: 'Self Review', summary: 'Looking to improve cross-team coordination and planning.', date: '29 Mar 2026', status: 'Positive', searchText: 'Krutika Mishra Self Review Looking to improve cross-team coordination and planning. 29 Mar 2026 Positive' },
];

const periodTabs = [
  { key: 'quarter', label: 'Quarter' },
  { key: 'half-year', label: 'Half-year' },
  { key: 'year', label: 'Year' },
];

function badgeClass(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('positive') || normalized.includes('on track') || normalized.includes('done')) return 'success';
  if (normalized.includes('watch') || normalized.includes('upcoming')) return 'pending';
  return 'danger';
}

function SectionTable({ rows, columns, renderCell, emptyText }) {
  return rows.length ? (
    <div className="myteam-section-table-card">
      <table className="myteam-section-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.employee}-${row.date || row.kpi || row.topic}`}>
              {columns.map((column) => (
                <td key={`${row.employee}-${column}`}>{renderCell(row, column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="myteam-section-empty-panel">
      <Icon name="clipboard" />
      <strong>{emptyText.title}</strong>
      <span>{emptyText.subtitle}</span>
    </div>
  );
}

export default function MyTeamPerformance() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('kpis');
  const [period, setPeriod] = useState('quarter');
  const [search, setSearch] = useState('');

  const activeTabInfo = tabs.find((tab) => tab.key === activeTab) || tabs[0];

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} myteam-page myteam-section-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  useEffect(() => {
    const hashMap = { '#kpis': 'kpis', '#meetings': 'meetings', '#feedback': 'feedback' };
    setActiveTab(hashMap[hash] || 'kpis');
  }, [hash, pathname]);

  useEffect(() => {
    if (!hash) {
      navigate(`${pathname}#kpis`, { replace: true });
    }
  }, [hash, navigate, pathname]);

  const kpiMetrics = [
    ['High performers', '12'],
    ['On track', '18'],
    ['Needs support', '3'],
  ];

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = activeTab === 'meetings' ? meetingRows : activeTab === 'feedback' ? feedbackRows : kpiRows;
    return rows.filter((row) => !term || String(row.searchText || '').toLowerCase().includes(term));
  }, [activeTab, search]);

  const columns = useMemo(() => {
    if (activeTab === 'meetings') return ['Employee', 'Topic', 'Date', 'Time', 'Type', 'Status'];
    if (activeTab === 'feedback') return ['Employee', 'Source', 'Summary', 'Date', 'Status'];
    return ['Employee', 'KPI', 'Score', 'Target', 'Owner', 'Status'];
  }, [activeTab]);

  const renderCell = (row, column) => {
    if (column === 'Employee') {
      return (
        <div className="myteam-section-employee">
          <strong>{row.employee}</strong>
        </div>
      );
    }
    if (column === 'Status') {
      return <span className={`myteam-section-badge ${badgeClass(row.status)}`}>{row.status}</span>;
    }
    return row[column.toLowerCase()] || row[column] || '';
  };

  const content = useMemo(() => {
    if (activeTab === 'meetings') {
      return {
        title: '1:1 Meeting Tracker',
        subtitle: 'Track the team check-ins that are planned, completed, or waiting to be held.',
        emptyText: { title: 'No meetings found', subtitle: 'Scheduled meetings will appear here.' },
      };
    }

    if (activeTab === 'feedback') {
      return {
        title: 'Feedback Review',
        subtitle: 'Review manager, peer, and self feedback submitted for your team.',
        emptyText: { title: 'No feedback found', subtitle: 'Feedback items will appear here.' },
      };
    }

    return {
      title: 'KPI Progress',
      subtitle: 'Monitor quarterly goals and team performance checkpoints.',
      emptyText: { title: 'No KPI rows found', subtitle: 'KPI items will appear here.' },
    };
  }, [activeTab]);

  return (
    <MainLayout
      activeKey={activeTabInfo.activeKey}
      moduleActiveKey="myteam_performance"
      subNavActiveKey={activeTabInfo.activeKey}
      brandText="PLAT"
      companyText=""
      showModuleNav
      showSubNav
      moduleNavItems={moduleNavItems}
      subNavItems={subNavItems}
    >
      <div className="myteam-section-page">
        <div className="myteam-section-header">
          <div>
            <h1 className="myteam-section-title">Performance</h1>
            <p className="myteam-section-subtitle">Track goals, meetings, and feedback for your team members.</p>
          </div>
          <div className="myteam-section-pill">
            <Icon name="circle-question" size={13} />
            Team performance
          </div>
        </div>

        <div className="myteam-section-toolbar">
          <div className="date-pill">{period === 'quarter' ? 'Q1 2026' : period === 'half-year' ? 'H2 2025 - H1 2026' : '2026'}</div>
          <div className="scope-tabs" role="tablist" aria-label="Performance periods">
            {periodTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`scope-tab ${period === tab.key ? 'active' : ''}`}
                onClick={() => setPeriod(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            type="search"
            placeholder="Search"
            aria-label="Search performance records"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="myteam-section-grid three">
          {kpiMetrics.map(([label, value]) => (
            <article className="myteam-section-card" key={label}>
              <div className="myteam-section-card-title">{label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#334155', marginTop: '6px' }}>{value}</div>
              <div className="myteam-section-card-help">Updated for the current review cycle.</div>
            </article>
          ))}
        </div>

        <div className="myteam-section-card" style={{ marginTop: '14px' }}>
          <div className="myteam-section-card-title">{content.title}</div>
          <div className="myteam-section-card-help">{content.subtitle}</div>
          <SectionTable
            rows={filteredRows}
            columns={columns}
            renderCell={renderCell}
            emptyText={content.emptyText}
          />
        </div>
      </div>
    </MainLayout>
  );
}
