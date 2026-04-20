import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Icon from '../components/Icon';
import { ROUTES } from '../router/routePaths';

const leaveSubNavItems = [{ label: 'Summary', path: ROUTES.userLeave, activeKey: 'user-leave' }];

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

const periodOptions = ['Apr 2025 - Mar 2026', 'Apr 2024 - Mar 2025', 'Apr 2023 - Mar 2024'];
const leaveTypeOptions = [
  { label: 'All Leave Types', value: 'all' },
  { label: 'Sick Leave', value: 'sick leave' },
  { label: 'Earned Leave', value: 'earned leave' },
  { label: 'Casual Leave', value: 'casual leave' },
  { label: 'Optional Leave', value: 'optional leave' },
  { label: 'Paternity Leave', value: 'paternity leave' },
];
const statusOptions = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
];

function periodLabel(index) {
  return periodOptions[index] ?? periodOptions[0];
}

export default function Leave() {
  const [periodIndex, setPeriodIndex] = useState(0);
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return leaveHistoryRows.filter((row) => {
      const rowSearch = [row.date, row.type, row.status, row.requestedBy, row.note, row.reason].join(' ').toLowerCase();
      const matchesSearch = !term || rowSearch.includes(term);
      const matchesType = selectedLeaveType === 'all' || row.type.toLowerCase() === selectedLeaveType;
      const matchesStatus = selectedStatus === 'all' || row.status.toLowerCase() === selectedStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, selectedLeaveType, selectedStatus]);

  return (
    <MainLayout
      activeKey="user-leave"
      moduleActiveKey="user-leave"
      subNavActiveKey="user-leave"
      showSubNav
      subNavItems={leaveSubNavItems}
    >
      <div className="leave-page">
        <div className="leave-topline">Summary</div>

        <div className="leave-toolbar">
          <div className="leave-section-title" style={{ margin: 0 }}>
            Pending leave requests
          </div>
          <button type="button" className="period-select" onClick={() => setPeriodIndex((value) => (value + 1) % periodOptions.length)}>
            {periodLabel(periodIndex)}
            <Icon name="chevron-down" size={10} />
          </button>
        </div>

        <div className="request-grid">
          <div className="panel panel-pad">
            <div className="request-banner">
              <div className="request-icon">
                <Icon name="sparkles" size={16} />
              </div>
              <div>
                <div className="request-title">Hurray! No pending leave requests</div>
                <div className="request-sub">Request leave on the right!</div>
              </div>
            </div>
          </div>
          <div className="panel panel-pad">
            <div className="request-actions">
              <Link className="request-btn" to={ROUTES.userLeaveApply}>
                Request Leave
              </Link>
              <a className="request-link" href="#">
                Request Credit for Compensatory Off
              </a>
              <a className="request-link" href="#">
                Leave Policy Explanation
              </a>
            </div>
          </div>
        </div>

        <div style={{ height: 18 }} />
        <div className="leave-section-title">My Leave Stats</div>
        <div className="leave-stats-grid">
          <div className="panel panel-pad mini-chart-card">
            <div className="mini-chart-head">
              <div className="mini-title">Weekly Pattern</div>
              <Icon name="circle-question" size={12} style={{ color: '#b6bfd0' }} />
            </div>
            <div className="leave-bars">
              <span style={{ height: 10 }} />
              <span style={{ height: 20 }} />
              <span style={{ height: 14 }} />
              <span style={{ height: 18 }} />
              <span style={{ height: 28 }} />
              <span className="muted" style={{ height: 4 }} />
              <span className="muted" style={{ height: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8b95a5', marginTop: 6 }}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          <div className="panel panel-pad mini-chart-card">
            <div className="mini-chart-head">
              <div className="mini-title">Consumed Leave Types</div>
              <Icon name="circle-question" size={12} style={{ color: '#b6bfd0' }} />
            </div>
            <div className="mini-donut">
              <svg viewBox="0 0 100 100" aria-label="Leave types">
                <circle cx="50" cy="50" r="34" fill="none" stroke="#efeafc" strokeWidth="12" />
                <circle cx="50" cy="50" r="34" fill="none" stroke="#9fc33a" strokeWidth="12" strokeDasharray="140 85" strokeDashoffset="20" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="34" fill="none" stroke="#f3c24f" strokeWidth="12" strokeDasharray="32 193" strokeDashoffset="-130" transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="34" fill="none" stroke="#8f7bd7" strokeWidth="12" strokeDasharray="24 201" strokeDashoffset="-170" transform="rotate(-90 50 50)" />
                <text x="50" y="47" textAnchor="middle" fontSize="10">
                  Leave
                </text>
                <text x="50" y="59" textAnchor="middle" fontSize="10">
                  Types
                </text>
              </svg>
            </div>
          </div>

          <div className="panel panel-pad mini-chart-card">
            <div className="mini-chart-head">
              <div className="mini-title">Monthly Stats</div>
              <Icon name="circle-question" size={12} style={{ color: '#b6bfd0' }} />
            </div>
            <div className="mini-months">
              <div className="month-bar" style={{ height: 8 }} />
              <div className="month-bar" style={{ height: 22 }} />
              <div className="month-bar" style={{ height: 6 }} />
              <div className="month-bar" style={{ height: 15 }} />
              <div className="month-bar" style={{ height: 23 }} />
              <div className="month-bar" style={{ height: 12 }} />
              <div className="month-bar" style={{ height: 25 }} />
              <div className="month-bar" style={{ height: 20 }} />
              <div className="month-bar" style={{ height: 24 }} />
              <div className="month-bar" style={{ height: 12 }} />
              <div className="month-bar" style={{ height: 19 }} />
              <div className="month-bar" style={{ height: 25 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#8b95a5', marginTop: 6 }}>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
            </div>
          </div>
        </div>

        <div style={{ height: 18 }} />
        <div className="leave-section-title">Leave Balances</div>
        <div className="bal-grid">
          <div className="panel balance-card">
            <div className="balance-head">
              Casual Leave <a href="#" className="view-link">View details</a>
            </div>
            <div className="ring-wrap">
              <svg viewBox="0 0 120 120" aria-label="Casual leave balance">
                <circle cx="60" cy="60" r="42" fill="none" stroke="#e3dcf4" strokeWidth="14" />
                <text x="60" y="56" className="ring-center" fontSize="12">
                  0 Days
                </text>
                <text x="60" y="70" className="ring-center" fontSize="12">
                  Available
                </text>
              </svg>
            </div>
          </div>

          <div className="panel balance-card">
            <div className="balance-head">
              Comp Offs <a href="#" className="view-link">View details</a>
            </div>
            <div className="ring-wrap" style={{ fontSize: 12, color: '#9aa4b2' }}>
              No data to display.
            </div>
          </div>

          <div className="panel balance-card">
            <div className="balance-head">
              Earned Leave <a href="#" className="view-link">View details</a>
            </div>
            <div className="ring-wrap">
              <svg viewBox="0 0 120 120" aria-label="Earned leave balance">
                <circle cx="60" cy="60" r="42" fill="none" stroke="#dce8b0" strokeWidth="14" />
                <circle cx="60" cy="60" r="42" fill="none" stroke="#a4c43a" strokeWidth="14" strokeDasharray="10 270" strokeDashoffset="75" transform="rotate(-90 60 60)" />
                <text x="60" y="56" className="ring-center" fontSize="12">
                  0.25 Days
                </text>
                <text x="60" y="70" className="ring-center" fontSize="12">
                  Available
                </text>
              </svg>
            </div>
          </div>

          <div className="panel balance-card">
            <div className="balance-head">
              Sick Leave <a href="#" className="view-link">View details</a>
            </div>
            <div className="ring-wrap">
              <svg viewBox="0 0 120 120" aria-label="Sick leave balance">
                <circle cx="60" cy="60" r="42" fill="none" stroke="#f6e4a7" strokeWidth="14" />
                <text x="60" y="56" className="ring-center" fontSize="12">
                  0 Days
                </text>
                <text x="60" y="70" className="ring-center" fontSize="12">
                  Available
                </text>
              </svg>
            </div>
          </div>

          <div className="panel balance-card">
            <div className="balance-head">
              Unpaid Leave <a href="#" className="view-link">View details</a>
            </div>
            <div className="ring-wrap">
              <svg viewBox="0 0 120 120" aria-label="Unpaid leave balance">
                <circle cx="60" cy="60" r="42" fill="none" stroke="#e9daf5" strokeWidth="14" />
                <text x="60" y="56" className="ring-center" fontSize="12">
                  ∞ Days
                </text>
                <text x="60" y="70" className="ring-center" fontSize="12">
                  Available
                </text>
              </svg>
            </div>
            <div className="balance-foot">
              <div>
                AVAILABLE
                <strong>∞</strong>
              </div>
              <div>
                CONSUMED
                <strong>2.5 days</strong>
              </div>
              <div style={{ gridColumn: '1 / span 2' }}>
                ANNUAL QUOTA
                <strong>∞</strong>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 18 }} />
        <div className="other-types">Other Leave Types Available : &nbsp;&nbsp; Optional Leave, Paternity Leave</div>

        <div className="history-head">
          <div className="leave-section-title" style={{ margin: 0 }}>
            Leave History
          </div>
          <div className="history-tools">
            <div className="filter-wrap">
              <button type="button" className="filter-pill" onClick={() => setOpenMenu(openMenu === 'type' ? null : 'type')}>
                Leave Type
                <Icon name="chevron-down" size={10} />
              </button>
              <div className={`filter-menu ${openMenu === 'type' ? 'open' : ''}`}>
                {leaveTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-filter-value={option.value}
                    className={selectedLeaveType === option.value ? 'active' : ''}
                    onClick={() => {
                      setSelectedLeaveType(option.value);
                      setOpenMenu(null);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-wrap">
              <button type="button" className="filter-pill" onClick={() => setOpenMenu(openMenu === 'status' ? null : 'status')}>
                Status
                <Icon name="chevron-down" size={10} />
              </button>
              <div className={`filter-menu ${openMenu === 'status' ? 'open' : ''}`}>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-filter-value={option.value}
                    className={selectedStatus === option.value ? 'active' : ''}
                    onClick={() => {
                      setSelectedStatus(option.value);
                      setOpenMenu(null);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <input className="search-box" type="search" placeholder="Search" aria-label="Search leave history" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </div>

        <div className="table-card">
          <div className="table-top">
            <div />
            <div className="table-count">Total: {filteredRows.length}</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="leave-table">
              <thead>
                <tr>
                  <th style={{ width: '14%' }}>Leave Dates</th>
                  <th style={{ width: '11%' }}>Leave Type</th>
                  <th style={{ width: '14%' }}>Status</th>
                  <th style={{ width: '12%' }}>Requested By</th>
                  <th style={{ width: '11%' }}>Action Taken On</th>
                  <th style={{ width: '18%' }}>Leave Note</th>
                  <th style={{ width: '15%' }}>Reject/Cancellation Reason</th>
                  <th style={{ width: '5%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length ? (
                  filteredRows.map((row) => (
                    <tr
                      key={`${row.date}-${row.type}-${row.requestedBy}`}
                      data-type={row.type.toLowerCase()}
                      data-status={row.status.toLowerCase()}
                      data-search={[row.date, row.type, row.status, row.requestedBy, row.note, row.reason].join(' ').toLowerCase()}
                    >
                      <td className="leave-date">
                        {row.date}
                        <span className="leave-sub">{row.length}</span>
                      </td>
                      <td>
                        <span className={`type-pill ${row.typeClass}`}>{row.type}</span>
                        <span className="leave-sub">Requested on {row.requestedOn}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${row.statusClass}`}>{row.status}</span>
                        <span className="leave-sub">by {row.requestedBy}</span>
                      </td>
                      <td>{row.requestedBy}</td>
                      <td>{row.actionTakenOn}</td>
                      <td>{row.note}</td>
                      <td>{row.reason}</td>
                      <td className="actions-cell">⋮</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="leave-empty" colSpan={8}>
                      No leave history matches your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
