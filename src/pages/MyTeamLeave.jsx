import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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

const leaveSubNavItems = [
  { label: 'Leave Overview', path: ROUTES.myTeamLeaveOverview, activeKey: 'myteam_leave_overview' },
  { label: 'Leave Approvals', path: ROUTES.myTeamLeaveApprovals, activeKey: 'myteam_leave_approvals' },
];

const leaveHistoryRows = [
  {
    date: '31 Mar 2026',
    length: '1 Day',
    type: 'Sick Leave',
    typeClass: 'green',
    status: 'Approved',
    statusClass: 'approved',
    requestedBy: 'Jitesh Kumar Das',
    actionTakenOn: '31 Mar 2026',
    note: 'mother not well',
    reason: '',
    requestedOn: '31 Mar 2026',
  },
  {
    date: '27 Mar 2026 (Second half)',
    length: '0.5 Day',
    type: 'Earned Leave',
    typeClass: '',
    status: 'Approved',
    statusClass: 'approved',
    requestedBy: 'Jitesh Kumar Das',
    actionTakenOn: '28 Mar 2026',
    note: 'Taking half day leave as mother not well.',
    reason: '',
    requestedOn: '27 Mar 2026',
  },
  {
    date: '24 Mar 2026',
    length: '1 Day',
    type: 'Casual Leave',
    typeClass: '',
    status: 'Pending',
    statusClass: 'pending',
    requestedBy: 'Jitesh Kumar Das',
    actionTakenOn: '-',
    note: 'Personal work',
    reason: '',
    requestedOn: '24 Mar 2026',
  },
  {
    date: '19 Mar 2026',
    length: '1 Day',
    type: 'Optional Leave',
    typeClass: '',
    status: 'Approved',
    statusClass: 'approved',
    requestedBy: 'Soumyadarshini Dash',
    actionTakenOn: '20 Mar 2026',
    note: 'Festival leave',
    reason: '',
    requestedOn: '19 Mar 2026',
  },
  {
    date: '13 Mar 2026',
    length: '1 Day',
    type: 'Paternity Leave',
    typeClass: '',
    status: 'Rejected',
    statusClass: 'pending',
    requestedBy: 'Prajwal Chandra Nayak',
    actionTakenOn: '14 Mar 2026',
    note: 'Family support',
    reason: 'Insufficient balance',
    requestedOn: '13 Mar 2026',
  },
];

const leavePeopleSections = {
  unplanned: [
    { name: 'Kajal Dikhit', role: 'Associate Software Engineer', stat: '3 Instances', note: 'a day ago', avatar: '/assets/images/avatar2.png' },
    { name: 'Smruti Ranjan Rout', role: 'Software Engineer', stat: '3 Instances', note: '2 days ago', avatar: '/assets/images/avatar1.png' },
    { name: 'Jitesh Kumar Das', role: 'Associate Director - Projects', stat: '2 Instances', note: '2 days ago', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png' },
    { name: 'Ankita Panda', role: 'Associate Software Engineer', stat: '2 Instances', note: '2 days ago', avatar: '/assets/images/avatar2.png' },
    { name: 'Arpita Panda', role: 'Associate Software Engineer', stat: '2 Instances', note: '2 days ago', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png' },
  ],
  noLeave: [
    { name: 'Bhasha Mishra', role: 'Senior Software Engineer', stat: '8 days ago', note: 'Last Leave Taken', avatar: '/assets/images/avatar1.png' },
    { name: 'Dinesh Ranjan Biswal', role: 'Associate Software Engineer', stat: '9 days ago', note: 'Last Leave Taken', avatar: '/assets/images/avatar2.png' },
    { name: 'Krutika Mishra', role: 'Associate Software Engineer', stat: '10 days ago', note: 'Last Leave Taken', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png' },
    { name: 'Pranaba Kumar Mohanty', role: 'Test Engineer', stat: '20 days ago', note: 'Last Leave Taken', avatar: '/assets/images/avatar1.png' },
    { name: 'Pratikshya Sundaray', role: 'Associate Software Engineer', stat: '8 days ago', note: 'Last Leave Taken', avatar: '/assets/images/avatar2.png' },
  ],
  mostLeave: [
    { name: 'Bijay Kumar Sahoo', role: 'Business Analyst', stat: '3 Days', note: '1 Instance', avatar: '/assets/images/avatar1.png' },
    { name: 'Kajal Dikhit', role: 'Associate Software Engineer', stat: '3 Days', note: '3 Instances', avatar: '/assets/images/avatar2.png' },
    { name: 'Smruti Ranjan Rout', role: 'Software Engineer', stat: '2.5 Days', note: '3 Instances', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png' },
    { name: 'Deepak Kumar Gouda', role: 'Associate Software Engineer', stat: '2 Days', note: '1 Instance', avatar: '/assets/images/avatar1.png' },
    { name: 'Layatmika Priyadarshini', role: 'Associate Software Engineer', stat: '2 Days', note: '2 Instances', avatar: '/assets/images/avatar2.png' },
  ],
};

const leaveBalanceRows = [
  ['Jitesh Kumar Das', 'Associate Director - Projects', '15.75 days', '6/6', '1.25/16.75', '∞', '1/1', 'Not Applicable', '6/6', '0/0', 'Not Applicable', '1.5/2'],
  ['Animesh Das', 'Associate Software Engineer', '20 days', '6/6', '6/20.25', '∞', '0/1', 'Not Applicable', '6/6', '0/0', 'Not Applicable', '2/2'],
  ['Ankita Panda', 'Associate Software Engineer', '18.5 days', '6/6', '3.5/17.75', '∞', '1/1', 'Not Applicable', '6/6', '0/0', 'Not Applicable', '2/2'],
  ['Arpita Panda', 'Associate Software Engineer', '26 days', '6/6', '11/24.75', '∞', '1/1', 'Not Applicable', '6/6', '0/0', 'Not Applicable', '2/2'],
];

function Shell({ children, activeKey, subNavActiveKey }) {
  return (
    <MainLayout
      activeKey={activeKey}
      moduleActiveKey="myteam_leave_overview"
      subNavActiveKey={subNavActiveKey}
      brandText="HRPulse"
      companyText=""
      showModuleNav
      showSubNav
      moduleNavItems={moduleNavItems}
      subNavItems={leaveSubNavItems}
    >
      {children}
    </MainLayout>
  );
}

function LeaveOverviewView() {
  const [periodIndex, setPeriodIndex] = useState(0);

  const periodOptions = ['Apr 2025 - Mar 2026', 'Apr 2024 - Mar 2025', 'Apr 2023 - Mar 2024'];
  const trendStats = ['5 Leave', '9 Leave', '0 Leave', '1 Leave'];

  return (
    <Shell activeKey="myteam_leave_overview" subNavActiveKey="myteam_leave_overview">
      <div className="leave-overview">
        <div className="leave-toolbar">
          <div className="leave-section-title" style={{ margin: 0 }}>
            Leave Overview
          </div>
          <button
            type="button"
            className="period-select"
            onClick={() => setPeriodIndex((value) => (value + 1) % periodOptions.length)}
          >
            {periodOptions[periodIndex]}
            <Icon name="chevron-down" size={10} />
          </button>
        </div>

        <div className="panel panel-pad">
          <div className="trend-header">
            <div className="trend-title">Leave Consumption Trend</div>
            <div className="trend-range">
              <span>24 Mar 2026 - 30 Mar 2026</span>
              <Icon name="ellipsis-vertical" className="trend-kebab" />
            </div>
          </div>
          <div className="trend-stats">
            <div className="trend-stat"><div className="label">Total Sick Leave</div><div className="value">{trendStats[0]}</div></div>
            <div className="trend-stat"><div className="label">Total Earned Leave</div><div className="value">{trendStats[1]}</div></div>
            <div className="trend-stat"><div className="label">Total Unpaid Leave</div><div className="value">{trendStats[2]}</div></div>
            <div className="trend-stat"><div className="label">Total Optional Leave</div><div className="value">{trendStats[3]}</div></div>
            <div className="trend-stat"><div className="label">Total Special Leave</div><div className="value">0 Leave</div></div>
            <div className="trend-stat"><div className="label">Total Casual Leave</div><div className="value">4.5 Leave</div></div>
            <div className="trend-stat"><div className="label">Total Comp Offs</div><div className="value">0 Leave</div></div>
            <div className="trend-stat"><div className="label">Total Client Leave</div><div className="value">0 Leave</div></div>
            <div className="trend-stat"><div className="label">Total Natural Disaster/ Curfew</div><div className="value">0 Leave</div></div>
          </div>
          <div className="chart-wrap">
            <svg viewBox="0 0 1200 320" width="100%" height="320" aria-label="Leave consumption chart">
              <g stroke="#eef2f7" strokeWidth="1">
                <line x1="60" y1="40" x2="1160" y2="40" />
                <line x1="60" y1="84" x2="1160" y2="84" />
                <line x1="60" y1="128" x2="1160" y2="128" />
                <line x1="60" y1="172" x2="1160" y2="172" />
                <line x1="60" y1="216" x2="1160" y2="216" />
                <line x1="60" y1="260" x2="1160" y2="260" />
              </g>
              <g fill="#a4aab7" fontSize="10" fontFamily="Inter, sans-serif">
                <text x="20" y="266">0</text>
                <text x="20" y="222">1</text>
                <text x="20" y="178">2</text>
                <text x="20" y="134">3</text>
                <text x="20" y="90">4</text>
                <text x="20" y="46">5</text>
                <text x="58" y="292">24 Mar</text>
                <text x="590" y="292">27 Mar</text>
                <text x="1118" y="292">30 Mar</text>
              </g>
              <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="60,208 240,128 420,172 600,84 780,260 960,260 1160,208" stroke="#4cc5ce" />
                <polyline points="60,260 240,216 420,216 600,172 780,260 960,260 1160,260" stroke="#7875c7" />
                <polyline points="60,172 240,260 420,260 600,150 780,260 960,260 1160,172" stroke="#c19adf" />
                <polyline points="60,260 240,260 420,260 600,216 780,260 960,260 1160,260" stroke="#f0c84a" />
              </g>
            </svg>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot" style={{ color: '#7875c7' }} /> Sick Leave</span>
              <span className="legend-item"><span className="legend-dot" style={{ color: '#4cc5ce' }} /> Earned Leave</span>
              <span className="legend-item"><span className="legend-dot" style={{ color: '#f3a4a4' }} /> Unpaid Leave</span>
              <span className="legend-item"><span className="legend-dot" style={{ color: '#f0c84a' }} /> Optional Leave</span>
              <span className="legend-item"><span className="legend-dot" style={{ color: '#a9d3c2' }} /> Special Leave</span>
              <span className="legend-item"><span className="legend-dot" style={{ color: '#c19adf' }} /> Casual Leave</span>
              <span className="legend-item"><span className="legend-dot" style={{ color: '#9ed7e5' }} /> Comp Offs</span>
              <span className="legend-item"><span className="legend-dot" style={{ color: '#8c8fd7' }} /> Client Leave</span>
              <span className="legend-item"><span className="legend-dot" style={{ color: '#6dd1d1' }} /> Natural Disaster/ Curfew</span>
            </div>
          </div>
        </div>

        <div className="mini-card-row" style={{ marginTop: '14px' }}>
          <section className="mini-card">
            <div className="mini-card-header">
              <div>Unplanned Leave</div>
              <div className="mini-card-range">
                26 Mar 2026 - 01 Apr 2026 <Icon name="ellipsis-vertical" className="muted" />
              </div>
            </div>
            {leavePeopleSections.unplanned.map((person) => (
              <div className="person-row" key={person.name}>
                <div className="person-left">
                  <img className="person-avatar" src={person.avatar} alt="" />
                  <div>
                    <div className="person-name">{person.name}</div>
                    <div className="person-role">{person.role}</div>
                  </div>
                </div>
                <div className="person-right">
                  {person.stat}
                  <br />
                  <span className="muted">{person.note}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="mini-card">
            <div className="mini-card-header">
              <div>No Leave Taken</div>
              <div className="mini-card-range">
                26 Mar 2026 - 01 Apr 2026 <Icon name="ellipsis-vertical" className="muted" />
              </div>
            </div>
            {leavePeopleSections.noLeave.map((person) => (
              <div className="person-row" key={person.name}>
                <div className="person-left">
                  <img className="person-avatar" src={person.avatar} alt="" />
                  <div>
                    <div className="person-name">{person.name}</div>
                    <div className="person-role">{person.role}</div>
                  </div>
                </div>
                <div className="person-right">
                  {person.stat}
                  <br />
                  <span className="muted">{person.note}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="mini-card">
            <div className="mini-card-header">
              <div>Most Leave Taken</div>
              <div className="mini-card-range">
                26 Mar 2026 - 01 Apr 2026 <Icon name="ellipsis-vertical" className="muted" />
              </div>
            </div>
            {leavePeopleSections.mostLeave.map((person) => (
              <div className="person-row" key={person.name}>
                <div className="person-left">
                  <img className="person-avatar" src={person.avatar} alt="" />
                  <div>
                    <div className="person-name">{person.name}</div>
                    <div className="person-role">{person.role}</div>
                  </div>
                </div>
                <div className="person-right">
                  {person.stat}
                  <br />
                  <span className="muted">{person.note}</span>
                </div>
              </div>
            ))}
          </section>
        </div>

        <section className="balance-card">
          <div className="balance-header">
            <div className="balance-title">Leave Balance (Available/Total)</div>
            <input className="balance-search" type="search" placeholder="Search" aria-label="Search leave balance" />
          </div>
          <div className="balance-table-wrap">
            <table className="balance-table">
              <thead>
                <tr>
                  <th>Employee Details</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Total Available Balance</th>
                  <th>Sick Leave</th>
                  <th>Earned Leave</th>
                  <th>Unpaid Leave</th>
                  <th>Optional Leave</th>
                  <th>Special Leave</th>
                  <th>Casual Leave</th>
                  <th>Comp Offs</th>
                  <th>Client Leave</th>
                  <th>Natural Disaster/ Curfew</th>
                </tr>
              </thead>
              <tbody>
                {leaveBalanceRows.map((row) => (
                  <tr key={row[0]}>
                    <td>
                      <div className="employee-name">{row[0]}</div>
                      <div className="employee-role">{row[1]}</div>
                    </td>
                    <td>Digital Services...</td>
                    <td>Bhubaneswar</td>
                    {row.slice(2).map((cell, index) => (
                      <td key={`${row[0]}-${index}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function LeaveApprovalsView() {
  return (
    <Shell activeKey="myteam_leave_overview" subNavActiveKey="myteam_leave_approvals">
      <section className="approvals-card">
        <div className="approvals-title">Pending Leave Approvals</div>
        <div className="approvals-toolbar">
          {['Department', 'Location', 'Leave Type', 'Leave Status', 'Business Unit', 'Legal Entity', 'Leave Duration', 'Search'].map((label) => (
            <div key={label}>
              {label}
              {label === 'Leave Duration' ? <Icon name="calendar" /> : <Icon name="chevron-down" className="muted" />}
            </div>
          ))}
        </div>
        <div className="approval-actions">
          <span style={{ fontSize: '18px', color: '#8a93a5' }}>
            <Icon name="arrow-down" />
          </span>
          <button className="approve-btn">Approve</button>
          <button className="reject-btn">Reject</button>
        </div>
        <div className="approvals-table-wrap">
          <table className="approvals-table">
            <thead>
              <tr>
                <th style={{ width: '2%' }}>
                  <input type="checkbox" />
                </th>
                <th style={{ width: '15%' }}>Employee</th>
                <th style={{ width: '7%' }}>Employee Number</th>
                <th style={{ width: '9%' }}>Department</th>
                <th style={{ width: '8%' }}>Location</th>
                <th style={{ width: '10%' }}>Business Unit</th>
                <th style={{ width: '10%' }}>Legal Entity</th>
                <th style={{ width: '11%' }}>Leave Dates</th>
                <th style={{ width: '9%' }}>Leave Type</th>
                <th style={{ width: '6%' }}>Status</th>
                <th style={{ width: '9%' }}>Last Action By</th>
                <th style={{ width: '9%' }}>Next Approver</th>
                <th style={{ width: '10%' }}>Leave Note</th>
                <th style={{ width: '5%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistoryRows.map((row) => (
                <tr key={row.date}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <div className="emp-cell">
                      <img className="emp-avatar" src="/assets/images/mamata_guddu_avatar_1774439604744.png" alt="" />
                      <div>
                        <div className="emp-name">{row.requestedBy}</div>
                        <div className="emp-role">Associate Software Engineer</div>
                      </div>
                    </div>
                  </td>
                  <td>GI2696</td>
                  <td>Digital Services...</td>
                  <td>Bhubaneswar</td>
                  <td>Digital Services...</td>
                  <td>Gemini Consulting</td>
                  <td>
                    <div className="stack">
                      <span>{row.date}</span>
                      <span className="muted">{row.length}</span>
                    </div>
                  </td>
                  <td>
                    <div className="stack">
                      <span>{row.type}</span>
                      <span className="muted">Requested on {row.requestedOn}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status ${row.statusClass.toLowerCase()}`}>{row.status}</span>
                  </td>
                  <td>{row.actionTakenOn}</td>
                  <td>Not Available</td>
                  <td>{row.note}</td>
                  <td className="actions">...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}

export default function MyTeamLeave() {
  const { pathname } = useLocation();

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} myteam-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  const isApprovals = useMemo(() => pathname.includes('myteam_leave_approvals'), [pathname]);

  if (isApprovals) {
    return <LeaveApprovalsView />;
  }

  return <LeaveOverviewView />;
}
