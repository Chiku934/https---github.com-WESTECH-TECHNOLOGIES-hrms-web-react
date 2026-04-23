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
  { key: 'requests', label: 'Requests', activeKey: 'myteam_profile_changes_requests' },
  { key: 'approvals', label: 'Approvals', activeKey: 'myteam_profile_changes_approvals' },
  { key: 'history', label: 'History', activeKey: 'myteam_profile_changes_history' },
];

const subNavItems = tabs.map((tab) => ({ label: tab.label, path: `${ROUTES.myTeamProfileChanges}#${tab.key}`, activeKey: tab.activeKey }));

const requestRows = [
  { employee: 'Jitesh Kumar Das', change: 'Designation Update', date: '31 Mar 2026', status: 'Pending' },
  { employee: 'Kajal Dikhit', change: 'Department Change', date: '29 Mar 2026', status: 'Pending' },
  { employee: 'Prajwal Chandra Nayak', change: 'Reporting Manager Update', date: '28 Mar 2026', status: 'Pending' },
];

const approvalRows = [
  { employee: 'Animesh Das', change: 'Mobile Number Update', date: '30 Mar 2026', status: 'Approved' },
  { employee: 'Bijay Kumar Sahoo', change: 'Email Correction', date: '30 Mar 2026', status: 'Approved' },
];

const historyRows = [
  { employee: 'Deepak Kumar Gouda', change: 'Location Update', date: '21 Mar 2026', status: 'Completed' },
  { employee: 'Krutika Mishra', change: 'Legal Entity Change', date: '18 Mar 2026', status: 'Completed' },
];

function SectionTable({ rows, emptyText }) {
  return rows.length ? (
    <div className="myteam-section-table-card">
      <table className="myteam-section-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Change</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.employee}-${row.change}`}>
              <td>{row.employee}</td>
              <td>{row.change}</td>
              <td>{row.date}</td>
              <td><span className={`myteam-section-badge ${row.status === 'Approved' ? 'success' : row.status === 'Completed' ? 'success' : 'pending'}`}>{row.status}</span></td>
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

export default function MyTeamProfileChanges() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const activeTabInfo = tabs.find((tab) => tab.key === activeTab) || tabs[0];

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} myteam-page myteam-section-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  useEffect(() => {
    const hashMap = { '#requests': 'requests', '#approvals': 'approvals', '#history': 'history' };
    setActiveTab(hashMap[hash] || 'requests');
  }, [hash, pathname]);

  useEffect(() => {
    if (!hash) navigate(`${pathname}#requests`, { replace: true });
  }, [hash, navigate, pathname]);

  const content = useMemo(() => {
    if (activeTab === 'approvals') {
      return { title: 'Pending Profile Change Approvals', subtitle: 'Approve changes requested by managers and employees.', rows: approvalRows, emptyText: { title: 'No pending approvals', subtitle: 'Pending profile changes will appear here.' } };
    }
    if (activeTab === 'history') {
      return { title: 'Profile Change History', subtitle: 'Completed profile updates and audit trail.', rows: historyRows, emptyText: { title: 'No history yet', subtitle: 'Completed profile changes will appear here.' } };
    }
    return { title: 'Pending Profile Change Requests', subtitle: 'Requests that are waiting to be reviewed.', rows: requestRows, emptyText: { title: 'No profile change requests', subtitle: 'Pending requests will appear here.' } };
  }, [activeTab]);

  return (
    <MainLayout
      activeKey={activeTabInfo.activeKey}
      moduleActiveKey="myteam_profile_changes"
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
            <h1 className="myteam-section-title">Profile Changes</h1>
            <p className="myteam-section-subtitle">Manage team profile updates, approval queues, and audit history.</p>
          </div>
          <div className="myteam-section-pill">
            <Icon name="circle-question" size={13} />
            Team profile updates
          </div>
        </div>

        <div className="myteam-section-grid two">
          <div className="myteam-section-card">
            <div className="myteam-section-card-title">{content.title}</div>
            <div className="myteam-section-card-help">{content.subtitle}</div>
            <SectionTable rows={content.rows} emptyText={content.emptyText} />
          </div>
          <div className="myteam-section-card">
            <div className="myteam-section-card-title">Overview</div>
            <div className="myteam-section-list">
              <div className="myteam-section-list-item">
                <div className="myteam-section-list-item-title">Requests waiting</div>
                <div className="myteam-section-list-item-sub">3 open profile change requests are awaiting review.</div>
              </div>
              <div className="myteam-section-list-item">
                <div className="myteam-section-list-item-title">Approved today</div>
                <div className="myteam-section-list-item-sub">2 profile change approvals were completed today.</div>
              </div>
              <div className="myteam-section-list-item">
                <div className="myteam-section-list-item-title">Audit trail</div>
                <div className="myteam-section-list-item-sub">All completed changes are preserved for compliance.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
