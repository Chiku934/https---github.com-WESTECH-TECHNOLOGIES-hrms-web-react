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
  { key: 'open-roles', label: 'Open Roles', activeKey: 'myteam_hiring_open_roles' },
  { key: 'candidates', label: 'Candidates', activeKey: 'myteam_hiring_candidates' },
  { key: 'interviews', label: 'Interviews', activeKey: 'myteam_hiring_interviews' },
];

const subNavItems = tabs.map((tab) => ({
  label: tab.label,
  path: `${ROUTES.myTeamHiring}#${tab.key}`,
  activeKey: tab.activeKey,
}));

const roleRows = [
  { role: 'Associate Software Engineer', team: 'Digital Services Innovation Lab', location: 'Bhubaneswar', openSince: '21 Mar 2026', status: 'Open', searchText: 'Associate Software Engineer Digital Services Innovation Lab Bhubaneswar 21 Mar 2026 Open' },
  { role: 'QA Engineer', team: 'Product Engineering', location: 'Remote', openSince: '18 Mar 2026', status: 'Open', searchText: 'QA Engineer Product Engineering Remote 18 Mar 2026 Open' },
  { role: 'Business Analyst', team: 'Digital Services Innovation Lab', location: 'Bhubaneswar', openSince: '25 Mar 2026', status: 'On Hold', searchText: 'Business Analyst Digital Services Innovation Lab Bhubaneswar 25 Mar 2026 On Hold' },
];

const candidateRows = [
  { candidate: 'Rakesh Nayak', role: 'Associate Software Engineer', stage: 'Screening', owner: 'Ashutosh Nayak', updated: '01 Apr 2026', status: 'In Progress', searchText: 'Rakesh Nayak Associate Software Engineer Screening Ashutosh Nayak 01 Apr 2026 In Progress' },
  { candidate: 'Puja Sahu', role: 'QA Engineer', stage: 'Manager Round', owner: 'Sasmita Behera', updated: '31 Mar 2026', status: 'In Progress', searchText: 'Puja Sahu QA Engineer Manager Round Sasmita Behera 31 Mar 2026 In Progress' },
  { candidate: 'Sonalika Nayak', role: 'Business Analyst', stage: 'Offer', owner: 'Ashutosh Nayak', updated: '30 Mar 2026', status: 'Offer Pending', searchText: 'Sonalika Nayak Business Analyst Offer Ashutosh Nayak 30 Mar 2026 Offer Pending' },
];

const interviewRows = [
  { candidate: 'Animesh Das', role: 'Associate Software Engineer', interviewer: 'Jitesh Kumar Das', date: '04 Apr 2026', time: '10:00 AM', mode: 'Virtual', status: 'Scheduled', searchText: 'Animesh Das Associate Software Engineer Jitesh Kumar Das 04 Apr 2026 10:00 AM Virtual Scheduled' },
  { candidate: 'Kajal Dikhit', role: 'QA Engineer', interviewer: 'Bhasha Mishra', date: '05 Apr 2026', time: '02:00 PM', mode: 'In-person', status: 'Scheduled', searchText: 'Kajal Dikhit QA Engineer Bhasha Mishra 05 Apr 2026 02:00 PM In-person Scheduled' },
  { candidate: 'Bijay Kumar Sahoo', role: 'Business Analyst', interviewer: 'Prajwal Chandra Nayak', date: '02 Apr 2026', time: '04:30 PM', mode: 'Virtual', status: 'Completed', searchText: 'Bijay Kumar Sahoo Business Analyst Prajwal Chandra Nayak 02 Apr 2026 04:30 PM Virtual Completed' },
];

const statusClass = (value) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('open') || normalized.includes('scheduled')) return 'success';
  if (normalized.includes('in progress') || normalized.includes('offer pending')) return 'pending';
  if (normalized.includes('on hold')) return 'danger';
  return 'success';
};

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
            <tr key={`${row.candidate || row.role}-${row.date || row.openSince}`}>
              {columns.map((column) => (
                <td key={`${row.candidate || row.role}-${column}`}>{renderCell(row, column)}</td>
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

export default function MyTeamHiring() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('open-roles');
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
    const hashMap = { '#open-roles': 'open-roles', '#candidates': 'candidates', '#interviews': 'interviews' };
    setActiveTab(hashMap[hash] || 'open-roles');
  }, [hash, pathname]);

  useEffect(() => {
    if (!hash) {
      navigate(`${pathname}#open-roles`, { replace: true });
    }
  }, [hash, navigate, pathname]);

  const columns = useMemo(() => {
    if (activeTab === 'candidates') return ['Candidate', 'Role', 'Stage', 'Owner', 'Updated', 'Status'];
    if (activeTab === 'interviews') return ['Candidate', 'Role', 'Interviewer', 'Date', 'Time', 'Mode', 'Status'];
    return ['Role', 'Team', 'Location', 'Open Since', 'Status'];
  }, [activeTab]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const source = activeTab === 'candidates' ? candidateRows : activeTab === 'interviews' ? interviewRows : roleRows;
    return source.filter((row) => !term || String(row.searchText || '').toLowerCase().includes(term));
  }, [activeTab, search]);

  const content = useMemo(() => {
    if (activeTab === 'candidates') {
      return {
        title: 'Candidate Pipeline',
        subtitle: 'Monitor active candidates and the stage each person is currently in.',
        emptyText: { title: 'No candidates found', subtitle: 'Candidates will appear here.' },
      };
    }

    if (activeTab === 'interviews') {
      return {
        title: 'Interview Schedule',
        subtitle: 'Review upcoming and completed interviews for the open roles.',
        emptyText: { title: 'No interviews found', subtitle: 'Interviews will appear here.' },
      };
    }

    return {
      title: 'Open Roles',
      subtitle: 'Track open positions across the team and review their hiring status.',
      emptyText: { title: 'No open roles found', subtitle: 'Open roles will appear here.' },
    };
  }, [activeTab]);

  const renderCell = (row, column) => {
    switch (column) {
      case 'Candidate':
        return <strong>{row.candidate}</strong>;
      case 'Role':
        return <strong>{row.role}</strong>;
      case 'Team':
        return row.team;
      case 'Location':
        return row.location;
      case 'Open Since':
        return row.openSince;
      case 'Stage':
        return row.stage;
      case 'Owner':
        return row.owner;
      case 'Updated':
        return row.updated;
      case 'Interviewer':
        return row.interviewer;
      case 'Date':
        return row.date;
      case 'Time':
        return row.time;
      case 'Mode':
        return row.mode;
      case 'Status':
        return <span className={`myteam-section-badge ${statusClass(row.status)}`}>{row.status}</span>;
      default:
        return '';
    }
  };

  return (
    <MainLayout
      activeKey={activeTabInfo.activeKey}
      moduleActiveKey="myteam_hiring"
      subNavActiveKey={activeTabInfo.activeKey}
      brandText="HRPulse"
      companyText=""
      showModuleNav
      showSubNav
      moduleNavItems={moduleNavItems}
      subNavItems={subNavItems}
    >
      <div className="myteam-section-page">
        <div className="myteam-section-header">
          <div>
            <h1 className="myteam-section-title">Hiring</h1>
            <p className="myteam-section-subtitle">Manage requisitions, candidate flow, and interview activity in one place.</p>
          </div>
          <div className="myteam-section-pill">
            <Icon name="circle-question" size={13} />
            Hiring dashboard
          </div>
        </div>

        <div className="myteam-section-toolbar">
          <div className="date-pill">Mar 2026 - Apr 2026</div>
          <input
            className="search-input"
            type="search"
            placeholder="Search"
            aria-label="Search hiring records"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="scope-tabs" role="tablist" aria-label="Hiring status">
            <button type="button" className="scope-tab active">
              Active
            </button>
          </div>
        </div>

        <div className="myteam-section-grid three">
          <article className="myteam-section-card">
            <div className="myteam-section-card-title">Open Positions</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#334155', marginTop: '6px' }}>3</div>
            <div className="myteam-section-card-help">Positions currently open for hiring.</div>
          </article>
          <article className="myteam-section-card">
            <div className="myteam-section-card-title">Candidates in Pipeline</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#334155', marginTop: '6px' }}>9</div>
            <div className="myteam-section-card-help">All active candidates across roles.</div>
          </article>
          <article className="myteam-section-card">
            <div className="myteam-section-card-title">Interviews This Week</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#334155', marginTop: '6px' }}>5</div>
            <div className="myteam-section-card-help">Scheduled interviews for the current week.</div>
          </article>
        </div>

        <div className="myteam-section-card" style={{ marginTop: '14px' }}>
          <div className="myteam-section-card-title">{content.title}</div>
          <div className="myteam-section-card-help">{content.subtitle}</div>
          <SectionTable rows={rows} columns={columns} renderCell={renderCell} emptyText={content.emptyText} />
        </div>
      </div>
    </MainLayout>
  );
}
