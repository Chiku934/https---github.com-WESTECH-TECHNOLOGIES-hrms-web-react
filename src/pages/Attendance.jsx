import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ROUTES } from '../router/routePaths';

const attendanceStats = {
  '30DAYS': { me: '9h 20m', meSecondary: '100%', team: '2h 54m', teamSecondary: '33%' },
  FEB: { me: '8h 42m', meSecondary: '96%', team: '3h 12m', teamSecondary: '41%' },
  JAN: { me: '8h 31m', meSecondary: '94%', team: '3h 01m', teamSecondary: '39%' },
  DEC: { me: '8h 08m', meSecondary: '92%', team: '2h 47m', teamSecondary: '36%' },
  NOV: { me: '8h 36m', meSecondary: '95%', team: '3h 04m', teamSecondary: '38%' },
  OCT: { me: '8h 15m', meSecondary: '93%', team: '2h 58m', teamSecondary: '35%' },
  SEP: { me: '8h 11m', meSecondary: '91%', team: '2h 51m', teamSecondary: '34%' },
};

const attendancePeriodOptions = [
  { key: '30DAYS', label: 'Last Week' },
  { key: 'FEB', label: 'February' },
  { key: 'JAN', label: 'January' },
  { key: 'DEC', label: 'December' },
  { key: 'NOV', label: 'November' },
  { key: 'OCT', label: 'October' },
  { key: 'SEP', label: 'September' },
];

const attendancePeriodLabelByKey = Object.fromEntries(attendancePeriodOptions.map((option) => [option.key, option.label]));

const timingsWeekData = {
  '30DAYS': [
    { caption: 'Monday (11:00 AM - 7:30 PM)', duration: '8h 30m', break: '30 min', bar: 'linear-gradient(90deg,#72c6d7 0 41%,#c8dfe5 41% 54%,#72c6d7 54% 100%)' },
    { caption: 'Tuesday (10:45 AM - 7:15 PM)', duration: '8h 25m', break: '30 min', bar: 'linear-gradient(90deg,#72c6d7 0 38%,#c8dfe5 38% 51%,#72c6d7 51% 100%)' },
    { caption: 'Wednesday (10:30 AM - 7:00 PM)', duration: '8h 20m', break: '30 min', bar: 'linear-gradient(90deg,#72c6d7 0 36%,#c8dfe5 36% 49%,#72c6d7 49% 100%)' },
    { caption: 'Thursday (10:30 AM - 7:00 PM)', duration: '8h 20m', break: '30 min', bar: 'linear-gradient(90deg,#72c6d7 0 36%,#c8dfe5 36% 49%,#72c6d7 49% 100%)' },
    { caption: 'Friday (10:15 AM - 6:45 PM)', duration: '8h 15m', break: '30 min', bar: 'linear-gradient(90deg,#72c6d7 0 35%,#c8dfe5 35% 48%,#72c6d7 48% 100%)' },
    { caption: 'Saturday (10:00 AM - 5:30 PM)', duration: '7h 30m', break: '20 min', bar: 'linear-gradient(90deg,#72c6d7 0 30%,#c8dfe5 30% 42%,#72c6d7 42% 100%)' },
    { caption: 'Sunday (Weekly Off)', duration: '0h 00m', break: '0 min', bar: 'linear-gradient(90deg,#c8dfe5 0 100%)' },
  ],
  FEB: [
    { caption: 'Monday (10:30 AM - 7:00 PM)', duration: '8h 15m', break: '45 min', bar: 'linear-gradient(90deg,#72c6d7 0 35%,#c8dfe5 35% 46%,#72c6d7 46% 100%)' },
    { caption: 'Tuesday (10:30 AM - 7:00 PM)', duration: '8h 15m', break: '45 min', bar: 'linear-gradient(90deg,#72c6d7 0 35%,#c8dfe5 35% 46%,#72c6d7 46% 100%)' },
    { caption: 'Wednesday (10:30 AM - 7:00 PM)', duration: '8h 15m', break: '45 min', bar: 'linear-gradient(90deg,#72c6d7 0 35%,#c8dfe5 35% 46%,#72c6d7 46% 100%)' },
    { caption: 'Thursday (10:30 AM - 7:00 PM)', duration: '8h 15m', break: '45 min', bar: 'linear-gradient(90deg,#72c6d7 0 35%,#c8dfe5 35% 46%,#72c6d7 46% 100%)' },
    { caption: 'Friday (10:30 AM - 7:00 PM)', duration: '8h 15m', break: '45 min', bar: 'linear-gradient(90deg,#72c6d7 0 35%,#c8dfe5 35% 46%,#72c6d7 46% 100%)' },
    { caption: 'Saturday (Weekly Off)', duration: '0h 00m', break: '0 min', bar: 'linear-gradient(90deg,#c8dfe5 0 100%)' },
    { caption: 'Sunday (Weekly Off)', duration: '0h 00m', break: '0 min', bar: 'linear-gradient(90deg,#c8dfe5 0 100%)' },
  ],
};

const logData = {
  '30DAYS': {
    title: 'Last 30 Days',
    rows: [
      { date: 'Mon, 30 Mar', visual: [{ cls: 'fill-teal', style: { width: '18%' } }], effective: '6h 4m', gross: '6h 41m', arrival: 'On Time', log: 'check' },
      { date: 'Sun, 29 Mar', tag: 'W-OFF', soft: true, effective: 'Full day Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
      { date: 'Sat, 28 Mar', tag: 'W-OFF', soft: true, effective: 'Full day Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
      { date: 'Fri, 27 Mar', tag: ['PENALTY ?', 'LEAVE'], visual: [{ cls: 'fill-teal', style: { width: '11%' } }, { cls: 'fill-purple', style: { left: '27%', width: '13%' } }], effective: '3h 42m', gross: '3h 44m', arrival: 'On Time', log: 'check' },
      { date: 'Thu, 26 Mar', visual: [{ cls: 'fill-teal', style: { width: '24%' } }], effective: '6h 41m', gross: '8h 21m', arrival: 'On Time', log: 'check' },
      { date: 'Wed, 25 Mar', tag: 'OD', visual: [{ cls: 'fill-amber', style: { width: '33%' } }], effective: '15h 1m', gross: '15h 3m', arrival: 'On Time', log: 'check' },
      { date: 'Tue, 24 Mar', visual: [{ cls: 'fill-teal', style: { width: '15%' } }], effective: '5h 9m', gross: '5h 40m', arrival: 'Late', log: 'check' },
    ],
  },
  FEB: {
    title: 'February 2026',
    rows: [
      { date: 'Mon, 23 Feb', visual: [{ cls: 'fill-teal', style: { width: '20%' } }], effective: '6h 12m', gross: '6h 48m', arrival: 'On Time', log: 'check' },
      { date: 'Tue, 24 Feb', visual: [{ cls: 'fill-teal', style: { width: '22%' } }], effective: '6h 20m', gross: '6h 55m', arrival: 'On Time', log: 'check' },
      { date: 'Wed, 25 Feb', tag: 'OD', visual: [{ cls: 'fill-amber', style: { width: '30%' } }], effective: '12h 4m', gross: '12h 20m', arrival: 'On Time', log: 'check' },
      { date: 'Thu, 26 Feb', visual: [{ cls: 'fill-teal', style: { width: '16%' } }], effective: '5h 16m', gross: '5h 50m', arrival: 'Late', log: 'check' },
      { date: 'Fri, 27 Feb', tag: 'LEAVE', soft: true, effective: 'Leave', gross: '', arrival: '', log: 'ellipsis' },
      { date: 'Sat, 28 Feb', tag: 'W-OFF', soft: true, effective: 'Full day Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
    ],
  },
  JAN: {
    title: 'January 2026',
    rows: [
      { date: 'Mon, 26 Jan', visual: [{ cls: 'fill-teal', style: { width: '19%' } }], effective: '6h 8m', gross: '6h 33m', arrival: 'On Time', log: 'check' },
      { date: 'Tue, 27 Jan', visual: [{ cls: 'fill-teal', style: { width: '21%' } }], effective: '6h 27m', gross: '6h 59m', arrival: 'On Time', log: 'check' },
      { date: 'Wed, 28 Jan', tag: 'OD', visual: [{ cls: 'fill-amber', style: { width: '31%' } }], effective: '11h 2m', gross: '11h 18m', arrival: 'On Time', log: 'check' },
      { date: 'Thu, 29 Jan', visual: [{ cls: 'fill-teal', style: { width: '14%' } }], effective: '4h 56m', gross: '5h 20m', arrival: 'Late', log: 'check' },
      { date: 'Fri, 30 Jan', tag: 'LEAVE', soft: true, effective: 'Leave', gross: '', arrival: '', log: 'ellipsis' },
      { date: 'Sat, 31 Jan', tag: 'W-OFF', soft: true, effective: 'Full day Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
    ],
  },
  DEC: {
    title: 'December 2025',
    rows: [
      { date: 'Mon, 22 Dec', visual: [{ cls: 'fill-teal', style: { width: '18%' } }], effective: '6h 2m', gross: '6h 21m', arrival: 'On Time', log: 'check' },
      { date: 'Tue, 23 Dec', visual: [{ cls: 'fill-teal', style: { width: '22%' } }], effective: '6h 36m', gross: '7h 02m', arrival: 'On Time', log: 'check' },
      { date: 'Wed, 24 Dec', tag: 'HOLIDAY', soft: true, effective: 'Holiday', gross: '', arrival: '', log: 'ellipsis' },
      { date: 'Thu, 25 Dec', tag: 'W-OFF', soft: true, effective: 'Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
      { date: 'Fri, 26 Dec', visual: [{ cls: 'fill-teal', style: { width: '24%' } }], effective: '7h 1m', gross: '7h 18m', arrival: 'On Time', log: 'check' },
      { date: 'Sat, 27 Dec', soft: true, effective: 'Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
    ],
  },
  NOV: {
    title: 'November 2025',
    rows: [
      { date: 'Mon, 24 Nov', visual: [{ cls: 'fill-teal', style: { width: '20%' } }], effective: '6h 17m', gross: '6h 42m', arrival: 'On Time', log: 'check' },
      { date: 'Tue, 25 Nov', visual: [{ cls: 'fill-teal', style: { width: '23%' } }], effective: '6h 49m', gross: '7h 10m', arrival: 'On Time', log: 'check' },
      { date: 'Wed, 26 Nov', tag: 'OD', visual: [{ cls: 'fill-amber', style: { width: '29%' } }], effective: '10h 54m', gross: '11h 12m', arrival: 'On Time', log: 'check' },
      { date: 'Thu, 27 Nov', tag: 'W-OFF', soft: true, effective: 'Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
      { date: 'Fri, 28 Nov', visual: [{ cls: 'fill-teal', style: { width: '16%' } }], effective: '5h 11m', gross: '5h 33m', arrival: 'Late', log: 'check' },
      { date: 'Sat, 29 Nov', tag: 'W-OFF', soft: true, effective: 'Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
    ],
  },
  OCT: {
    title: 'October 2025',
    rows: [
      { date: 'Mon, 27 Oct', visual: [{ cls: 'fill-teal', style: { width: '18%' } }], effective: '6h 1m', gross: '6h 25m', arrival: 'On Time', log: 'check' },
      { date: 'Tue, 28 Oct', visual: [{ cls: 'fill-teal', style: { width: '21%' } }], effective: '6h 29m', gross: '6h 54m', arrival: 'On Time', log: 'check' },
      { date: 'Wed, 29 Oct', tag: 'LEAVE', soft: true, effective: 'Leave', gross: '', arrival: '', log: 'ellipsis' },
      { date: 'Thu, 30 Oct', visual: [{ cls: 'fill-teal', style: { width: '24%' } }], effective: '7h 6m', gross: '7h 29m', arrival: 'On Time', log: 'check' },
      { date: 'Fri, 31 Oct', tag: 'W-OFF', soft: true, effective: 'Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
    ],
  },
  SEP: {
    title: 'September 2025',
    rows: [
      { date: 'Mon, 22 Sep', visual: [{ cls: 'fill-teal', style: { width: '19%' } }], effective: '6h 10m', gross: '6h 35m', arrival: 'On Time', log: 'check' },
      { date: 'Tue, 23 Sep', visual: [{ cls: 'fill-teal', style: { width: '22%' } }], effective: '6h 42m', gross: '7h 02m', arrival: 'On Time', log: 'check' },
      { date: 'Wed, 24 Sep', tag: 'OD', visual: [{ cls: 'fill-amber', style: { width: '30%' } }], effective: '11h 5m', gross: '11h 24m', arrival: 'On Time', log: 'check' },
      { date: 'Thu, 25 Sep', visual: [{ cls: 'fill-teal', style: { width: '16%' } }], effective: '5h 19m', gross: '5h 42m', arrival: 'Late', log: 'check' },
      { date: 'Fri, 26 Sep', tag: 'W-OFF', soft: true, effective: 'Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
      { date: 'Sat, 27 Sep', tag: 'W-OFF', soft: true, effective: 'Weekly-off', gross: '', arrival: '', log: 'ellipsis' },
    ],
  },
};

function tagClassName(tag) {
  const normalized = String(tag || '').toUpperCase();
  if (normalized.includes('LEAVE')) return 'leave';
  if (normalized.includes('OD')) return 'od';
  if (normalized.includes('PENALTY')) return 'penalty';
  if (normalized.includes('W-OFF')) return 'woff';
  return 'woff';
}

const calendarEvents = {
  '2026-03-01': { type: 'woff' },
  '2026-03-04': { type: 'holiday' },
  '2026-03-07': { type: 'woff' },
  '2026-03-08': { type: 'woff' },
  '2026-03-11': { type: 'od' },
  '2026-03-14': { type: 'leave' },
  '2026-03-15': { type: 'woff' },
  '2026-03-21': { type: 'woff' },
  '2026-03-22': { type: 'woff' },
  '2026-03-25': { type: 'od' },
  '2026-03-27': { type: 'leave' },
  '2026-03-28': { type: 'woff' },
  '2026-03-29': { type: 'woff' },
};

function formatCalendarKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMondayOffset(date) {
  const day = date.getDay();
  return (day + 6) % 7;
}

function renderCalendar(date) {
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startOffset = getMondayOffset(firstOfMonth);
  const previousMonthDays = new Date(date.getFullYear(), date.getMonth(), 0).getDate();
  const cells = [];

  for (let cell = 0; cell < 42; cell += 1) {
    const dayNumber = cell - startOffset + 1;
    let displayDay = dayNumber;
    let muted = false;
    let activeDate = new Date(date.getFullYear(), date.getMonth(), dayNumber);

    if (dayNumber <= 0) {
      const prevDay = previousMonthDays - (startOffset - cell) + 1;
      displayDay = prevDay;
      muted = true;
      activeDate = new Date(date.getFullYear(), date.getMonth() - 1, prevDay);
    } else if (dayNumber > daysInMonth) {
      displayDay = dayNumber - daysInMonth;
      muted = true;
      activeDate = new Date(date.getFullYear(), date.getMonth() + 1, displayDay);
    }

    const event = calendarEvents[formatCalendarKey(activeDate)];
    cells.push({ displayDay, muted, event });
  }

  return cells;
}

export default function Attendance() {
  const [statsKey, setStatsKey] = useState('30DAYS');
  const [logKey, setLogKey] = useState('30DAYS');
  const [activeTab, setActiveTab] = useState('attendance-log');
  const [statsMenuOpen, setStatsMenuOpen] = useState(false);
  const [isTwentyFourHour, setIsTwentyFourHour] = useState(false);
  const [timingDayIndex, setTimingDayIndex] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 2, 1));
  const calendarDays = useMemo(() => renderCalendar(calendarMonth), [calendarMonth]);
  const stats = attendanceStats[statsKey];
  const timing = timingsWeekData[statsKey][timingDayIndex] || timingsWeekData[statsKey][0];
  const log = logData[logKey] || logData['30DAYS'];
  const selectedPeriodLabel = attendancePeriodLabelByKey[statsKey] || 'Last Week';

  useEffect(() => {
    const handleDocumentClick = (event) => {
      const trigger = event.target?.closest?.('.stats-period');
      if (!trigger) {
        setStatsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setStatsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setTimingDayIndex(0);
  }, [statsKey]);

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} attendance-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  return (
    <div className="attendance-shell">
      <Sidebar activeKey="user-attendance" />
      <div className="attendance-main">
        <div className="attendance-topbar">
          <div className="attendance-brand">
            <div className="attendance-brand-mark">PLAT</div>
            <div className="attendance-company" />
          </div>
          <div className="attendance-search">
            <Icon name="search" size={12} />
            <input type="text" placeholder="Search employees or action (Ex: Apply Leave)" aria-label="Search" />
            <span className="hotkey-badge">Alt + K</span>
          </div>
          <div className="attendance-actions">
            <button className="attendance-icon-btn" aria-label="Notifications"><Icon name="bell" /></button>
            <img src="/assets/images/mamata_guddu_avatar_1774439604744.png" alt="User avatar" className="attendance-avatar" />
          </div>
        </div>

        <nav className="attendance-module-nav" aria-label="Primary attendance navigation">
          <Link to={ROUTES.userAttendance} className="active">Attendance</Link>
          <Link to={ROUTES.timesheet}>Timesheet</Link>
          <Link to={ROUTES.userLeave}>Leave</Link>
          <Link to={ROUTES.userPerformance}>Performance</Link>
          <Link to={ROUTES.userExpenses}>Expenses & Travel</Link>
          <Link to={ROUTES.userSupport}>Helpdesk</Link>
        </nav>

        <main className="attendance-content">
          <div className="section-heading">Attendance Stats</div>
          <div className="top-grid">
            <section className="panel-card">
              <div className="panel-inner">
                <div className="stats-header">
                  <div className="stats-period">
                    <button
                      type="button"
                      className="small-select"
                      aria-haspopup="listbox"
                      aria-expanded={statsMenuOpen}
                      onClick={(event) => {
                        event.stopPropagation();
                        setStatsMenuOpen((prev) => !prev);
                      }}
                    >
                      <span>{selectedPeriodLabel}</span>
                      <Icon name="chevron-down" size={9} />
                    </button>
                    <div className={`small-select-menu ${statsMenuOpen ? 'open' : ''}`} role="listbox" aria-label="Attendance stats period">
                      {attendancePeriodOptions.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          className={`small-select-option ${statsKey === option.key ? 'active' : ''}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setStatsKey(option.key);
                            setLogKey(option.key);
                            setStatsMenuOpen(false);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="info-circle">i</span>
                </div>
                <table className="stats-table" aria-label="Attendance summary">
                  <tbody>
                    <tr className="stats-row">
                      <td className="stats-cell">
                        <div className="stats-person"><span className="stats-badge" style={{ background: '#f3b519' }}><Icon name="user" size={11} /></span><span>Me</span></div>
                      </td>
                      <td className="stats-cell stats-metric"><div className="metric-label">Avg Hrs / Day</div><div className="metric-value">{stats.me}</div></td>
                      <td className="stats-cell stats-metric"><div className="metric-label">On Time Arrival</div><div className="metric-value">{stats.meSecondary}</div></td>
                    </tr>
                    <tr className="stats-row">
                      <td className="stats-cell">
                        <div className="stats-person"><span className="stats-badge" style={{ background: '#61a0db' }}><Icon name="users" size={11} /></span><span>My Team</span></div>
                      </td>
                      <td className="stats-cell stats-metric"><div className="metric-label">Avg Hrs / Day</div><div className="metric-value">{stats.team}</div></td>
                      <td className="stats-cell stats-metric"><div className="metric-label">On Time Arrival</div><div className="metric-value">{stats.teamSecondary}</div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel-card">
              <div className="panel-inner">
                <div className="section-heading" style={{ marginBottom: '6px' }}>Timings</div>
                <div className="week-dots">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                    <button
                      key={`${day}-${index}`}
                      type="button"
                      className={`week-dot ${index === timingDayIndex ? 'active' : ''}`}
                      onClick={() => setTimingDayIndex(index)}
                      aria-pressed={index === timingDayIndex}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="timings-main">
                  <div className="timings-caption">
                    {isTwentyFourHour ? timing.caption.replace(/(\d{1,2}:\d{2}\s*(?:AM|PM))/gi, (match) => {
                      const result = match.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
                      if (!result) return match;
                      let hours = Number(result[1]);
                      const minutes = result[2] || '00';
                      const period = result[3].toUpperCase();
                      if (period === 'AM') {
                        if (hours === 12) hours = 0;
                      } else if (hours !== 12) {
                        hours += 12;
                      }
                      return `${String(hours).padStart(2, '0')}:${minutes}`;
                    }) : timing.caption}
                  </div>
                  <div className="timings-bar" style={{ background: timing.bar }} />
                </div>
                <div className="timings-footer">
                  <div><strong style={{ fontSize: '11px', color: '#4b5563' }}>Duration:</strong> {timing.duration}</div>
                  <div className="break-chip"><Icon name="mug-hot" /> <span>{timing.break}</span></div>
                </div>
              </div>
            </section>

            <section className="panel-card">
              <div className="panel-inner">
                <div className="section-heading" style={{ marginBottom: '10px' }}>Actions</div>
                <div className="action-layout">
                  <div className="clock-box">
                    <div className="clock-label">Shift Timer</div>
                    <div className="clock-time">00:00:00</div>
                    <div className="clock-date">Mon, 30 Mar 2026</div>
                    <div className="clock-progress" aria-hidden="true"><div className="clock-progress-fill" style={{ width: '0%' }} /></div>
                  </div>
                  <div className="action-links">
                    <Link to={ROUTES.userLeaveApply}><Icon name="house" size={11} /> Work From Home</Link>
                    <Link to={ROUTES.userLeaveStatus}><Icon name="briefcase" size={11} /> On Duty</Link>
                    <Link to={ROUTES.userSupport}><Icon name="file-lines" size={11} /> Attendance Policy</Link>
                    <Link to={ROUTES.userAttendanceRegularization}><Icon name="pen-to-square" size={11} /> Regularization</Link>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="logs-header">
              <div className="section-heading" style={{ marginBottom: 0 }}>Logs & Requests</div>
              <div className="toggle-wrap">
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => setIsTwentyFourHour((prev) => !prev)}
                  aria-pressed={isTwentyFourHour}
                >
                  <span className={`switch ${isTwentyFourHour ? 'on' : ''}`} aria-hidden="true" />
                  <span>24 hour format</span>
                </button>
              </div>
          </div>

          <div className="log-tabs" role="tablist" aria-label="Attendance sections">
            <button type="button" className={`log-tab ${activeTab === 'attendance-log' ? 'active' : ''}`} onClick={() => setActiveTab('attendance-log')}>Attendance Log</button>
            <button type="button" className={`log-tab ${activeTab === 'calendar-view' ? 'active' : ''}`} onClick={() => setActiveTab('calendar-view')}>Calendar</button>
            <button type="button" className={`log-tab ${activeTab === 'attendance-requests' ? 'active' : ''}`} onClick={() => setActiveTab('attendance-requests')}>Attendance Requests</button>
          </div>

          <section className={`tab-panel ${activeTab === 'attendance-log' ? 'active' : ''}`} id="attendance-log">
            <div className="log-subsection">
              <div className="log-subsection-header">
                <div className="range-title">{log.title}</div>
                <div className="range-pills" aria-label="Monthly filters">
                  {['30DAYS', 'FEB', 'JAN', 'DEC', 'NOV', 'OCT', 'SEP'].map((item) => (
                    <button key={item} type="button" className={`range-pill ${logKey === item ? 'active' : ''}`} onClick={() => setLogKey(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="attendance-table-wrap">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }}>Date</th>
                      <th style={{ width: '36%' }}>Attendance Visual</th>
                      <th style={{ width: '12%' }}>Effective Hours</th>
                      <th style={{ width: '12%' }}>Gross Hours</th>
                      <th style={{ width: '12%' }}>Arrival</th>
                      <th style={{ width: '10%' }}>Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {log.rows.map((row) => (
                      <tr key={row.date} className={row.soft ? 'row-soft' : ''}>
                        <td className="attendance-date">
                          {row.date}
                          {Array.isArray(row.tag) ? row.tag.map((tag) => <span key={tag} className={`day-tag ${tagClassName(tag)}`}>{tag}</span>) : row.tag ? <span className={`day-tag ${tagClassName(row.tag)}`}>{row.tag}</span> : null}
                        </td>
                        <td>{row.visual?.length ? <div className="visual-track">{row.visual.map((seg) => <span key={`${seg.cls}-${JSON.stringify(seg.style)}`} className={`visual-fill ${seg.cls}`} style={seg.style} />)}</div> : ''}</td>
                        <td>{row.effective}</td>
                        <td>{row.gross}</td>
                        <td className={row.arrival === 'Late' ? 'status-ok' : ''}>{row.arrival}</td>
                        <td>{row.log === 'check' ? <Icon name="circle-check" className="log-icon" /> : <Icon name="ellipsis" style={{ color: '#b7b0a0' }} />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className={`tab-panel ${activeTab === 'calendar-view' ? 'active' : ''}`} id="calendar-view">
              <div className="calendar-shell">
                <div className="calendar-toolbar" aria-label="Calendar month navigation">
                  <button className="calendar-nav-btn" type="button" aria-label="Previous month" onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                    <Icon name="chevron-left" />
                  </button>
                  <button className="calendar-month-btn" type="button">{calendarMonth.toLocaleString('en-US', { month: 'short', year: 'numeric' })}</button>
                  <button className="calendar-nav-btn" type="button" aria-label="Next month" onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                    <Icon name="chevron-right" />
                  </button>
                </div>
              <div className="calendar-grid">
                <div className="calendar-weekdays">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day}>{day}</div>)}
                </div>
                <div className="calendar-days">
                  {calendarDays.map((day) => (
                    <div key={`${day.displayDay}-${day.muted ? 'muted' : 'active'}`} className={`calendar-day ${day.muted ? 'muted' : ''}`}>
                      <div className="calendar-day-number">{day.displayDay}</div>
                      {day.event ? <span className={`calendar-chip ${day.event.type}`}>{day.event.type.toUpperCase()}</span> : <div className="calendar-note">11:00 AM - 7:30 PM</div>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="calendar-key" aria-label="Calendar legend">
                <span><span className="calendar-chip woff" style={{ marginTop: 0 }}>W-OFF</span> Weekly off</span>
                <span><span className="calendar-chip holiday" style={{ marginTop: 0 }}>HOLIDAY</span> Holiday</span>
                <span><span className="calendar-chip od" style={{ marginTop: 0 }}>OD</span> On duty</span>
                <span><span className="calendar-chip leave" style={{ marginTop: 0 }}>LEAVE</span> Leave</span>
              </div>
            </div>
          </section>

          <section className={`tab-panel ${activeTab === 'attendance-requests' ? 'active' : ''}`} id="attendance-requests">
            <div className="requests-shell">
              <div className="requests-header">
                <div className="requests-title">Work From Home / On Duty Requests</div>
                <div className="requests-range">
                  <span>28 Feb 2026 - 13 Apr 2026</span>
                  <span className="requests-kebab" aria-hidden="true">&#8942;</span>
                </div>
              </div>
              <div className="requests-table-wrap">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Request Type</th>
                      <th>Requested On</th>
                      <th>Attachments</th>
                      <th>Note</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Last Action By</th>
                      <th>Next Approver</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="requests-date">10 Mar 2026 <span className="requests-day"><Icon name="briefcase" size={11} /><span className="requests-sub">1 Day</span></span></td>
                      <td>On Duty</td>
                      <td>10 Mar 2026 11:10 AM<br /><span className="requests-sub">by Dipti Ranjan Sahoo</span></td>
                      <td />
                      <td className="requests-note">Watco for PLC discussion</td>
                      <td className="requests-reason" />
                      <td className="requests-status approved">Approved</td>
                      <td className="requests-action-by">Ashutosh Nayak<br /><span className="requests-sub">on 11 Mar 2026</span></td>
                      <td className="requests-next" />
                      <td><div className="requests-actions"><Icon name="comments" /><Icon name="ellipsis" /></div></td>
                    </tr>
                    <tr>
                      <td className="requests-date">11 Mar 2026 <span className="requests-day"><Icon name="briefcase" size={11} /><span className="requests-sub">1 Day</span></span></td>
                      <td>On Duty</td>
                      <td>11 Mar 2026 03:20 PM<br /><span className="requests-sub">by Subash Behera</span></td>
                      <td />
                      <td className="requests-note">Silicon University for Training Discussion</td>
                      <td className="requests-reason" />
                      <td className="requests-status approved">Approved</td>
                      <td className="requests-action-by">Sasmita Behera<br /><span className="requests-sub">on 13 Mar 2026</span></td>
                      <td className="requests-next" />
                      <td><div className="requests-actions"><Icon name="comments" /><Icon name="ellipsis" /></div></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
