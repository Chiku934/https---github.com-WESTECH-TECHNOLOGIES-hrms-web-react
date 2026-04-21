import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const summaryScopeTabs = [
  { label: 'Digital Services In...', path: ROUTES.myTeamSummaryDigitalServices, activeKey: 'myteam_summary_digital_services' },
  { label: 'Direct Reports', path: ROUTES.myTeamSummaryDirect, activeKey: 'myteam_summary_direct' },
  { label: 'Indirect Reports', path: ROUTES.myTeamSummaryIndirect, activeKey: 'myteam_summary_indirect' },
  { label: 'Peers', path: ROUTES.myTeamSummaryPeers, activeKey: 'myteam_summary_peers' },
];

function buildCalendarDays() {
  const start = new Date(Date.UTC(2026, 3, 1));
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      day: index + 1,
      weekday: new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(date),
    };
  });
}

const calendarDays = buildCalendarDays();

const overviewRows = [
  { name: 'Animesh Das', avatar: '/assets/images/avatar1.png', days: { 2: 'wfh', 3: 'paid', 4: 'weekly', 5: 'weekly', 11: 'weekly', 12: 'weekly', 18: 'weekly', 19: 'weekly', 25: 'weekly', 26: 'weekly' } },
  { name: 'Bijay Kumar Sahoo', avatar: '/assets/images/avatar2.png', days: { 2: 'od', 3: 'paid', 4: 'weekly', 5: 'weekly', 11: 'weekly', 12: 'weekly', 18: 'weekly', 19: 'weekly', 25: 'weekly', 26: 'weekly' } },
  { name: 'Kajal Dikhit', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', days: { 1: 'wfh', 2: 'wfh', 4: 'weekly', 5: 'weekly', 11: 'weekly', 12: 'weekly', 18: 'weekly', 19: 'weekly', 25: 'weekly', 26: 'weekly' } },
  { name: 'Prajwal Chandra Nayak', avatar: '/assets/images/avatar1.png', days: { 1: 'od', 4: 'weekly', 5: 'weekly', 11: 'weekly', 12: 'weekly', 18: 'weekly', 19: 'weekly', 25: 'weekly', 26: 'weekly' } },
  { name: 'Purushottama Sahoo', avatar: '/assets/images/avatar2.png', days: { 1: 'od', 4: 'weekly', 5: 'weekly', 11: 'weekly', 12: 'weekly', 18: 'weekly', 19: 'weekly', 25: 'weekly', 26: 'weekly' } },
  { name: 'Sanjay Patel', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', days: { 3: 'paid', 4: 'weekly', 5: 'weekly', 6: 'paid', 7: 'wfh', 11: 'weekly', 12: 'weekly', 18: 'weekly', 19: 'weekly', 25: 'weekly', 26: 'weekly' } },
];

const overviewLegend = [
  ['Work from home', 'legend-wfh'],
  ['On duty', 'legend-od'],
  ['Paid Leave', 'legend-paid'],
  ['Unpaid Leave', 'legend-unpaid'],
  ['Leave due to No Attendance', 'legend-noatt'],
  ['Weekly off', 'legend-weekly'],
  ['Holiday', 'legend-holiday'],
  ['Someone on Leave', 'legend-leave'],
  ['Multiple Leave on a day', 'legend-multi'],
  ['Someone on WFH/OD', 'legend-wfhod'],
];

const summaryCards = [
  ['Employees On Time today', '24', 'accent-cyan'],
  ['Late Arrivals today', '1', 'accent-plum'],
  ['Work from Home / On Duty today', '1', 'accent-green'],
  ['Remote Clock-ins today', '0', 'accent-gold'],
];

const peopleByScope = {
  myteam_summary_digital_services: {
    title: 'Digital Services Innovation Lab Employees (28)',
    cards: [
      { name: 'Animesh D...', role: 'Associate Software Engineer', avatar: '/assets/images/avatar1.png', status: 'OUT', statusClass: 'badge-out', secondaryStatus: 'SECOND HALF LEAVE', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'animesh.d@gemini-us.com', mobile: '977509265' },
      { name: 'Ankita Panda', role: 'Associate Software Engineer', avatar: '/assets/images/avatar2.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'ankita.p@gemini-us.com', mobile: '993765274' },
      { name: 'Arpita Panda', role: 'Associate Software Engineer', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'arpita.p@gemini-us.com', mobile: '7978238268' },
      { name: 'Bhasha Mishra', role: 'Senior Software Engineer', avatar: '/assets/images/avatar1.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'bhasha.m@gemini-us.com', mobile: '8280560141' },
      { name: 'Bijay Kumar Sahoo', role: 'Business Analyst', avatar: '/assets/images/avatar2.png', status: 'ON DUTY', statusClass: 'badge-duty', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'sbijay@gemini-us.com', mobile: '9348263634' },
      { name: 'Bimalabati Munda', role: 'Software Engineer', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'bimunda@gemini-us.com', mobile: '8917208095' },
      { name: 'Deepak Kumar Gouda', role: 'Associate Software Engineer', avatar: '/assets/images/avatar1.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'dgouda@gemini-us.com', mobile: '8327795583' },
      { name: 'Dinesh Ranjan Biswal', role: 'Associate Software Engineer', avatar: '/assets/images/avatar2.png', status: 'OUT', statusClass: 'badge-out', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'dbiswal@gemini-us.com', mobile: '7077967371' },
    ],
  },
  myteam_summary_direct: {
    title: 'Direct Reports Employees (12)',
    cards: [
      { name: 'Jashobanta Sahoo', role: 'Business Analyst', avatar: '/assets/images/avatar1.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'jashobanta@gemini-us.com', mobile: '8249003679' },
      { name: 'Jitesh Kumar Das', role: 'Associate Director - Projects', avatar: '/assets/images/avatar2.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'jitesh.d@gemini-us.com', mobile: '9007390995' },
      { name: 'Kajal Dikhit', role: 'Associate Software Engineer', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', status: 'LEAVE', statusClass: 'badge-leave', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'kdkhitt@gemini-us.com', mobile: '6371762721' },
      { name: 'Krutika Mishra', role: 'Associate Software Engineer', avatar: '/assets/images/avatar1.png', status: 'OUT', statusClass: 'badge-out', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'krutika.m@gemini-us.com', mobile: '9937769993' },
      { name: 'Lalit Kumar Sahoo', role: 'Software Engineer', avatar: '/assets/images/avatar2.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'lalit.s@gemini-us.com', mobile: '9876543210' },
      { name: 'Mitali Sahu', role: 'Associate Software Engineer', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', status: 'WFH', statusClass: 'badge-wfh', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'mitali.s@gemini-us.com', mobile: '9123456780' },
      { name: 'Niharika Sethi', role: 'Associate Software Engineer', avatar: '/assets/images/avatar1.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'niharika.s@gemini-us.com', mobile: '9988776655' },
      { name: 'Prakash Nayak', role: 'Associate Software Engineer', avatar: '/assets/images/avatar2.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'prakash.n@gemini-us.com', mobile: '9000112233' },
    ],
  },
  myteam_summary_indirect: {
    title: 'Indirect Reports Employees (10)',
    cards: [
      { name: 'Manisha Sahoo', role: 'Associate Software Engineer', avatar: '/assets/images/avatar1.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'manisha.s@gemini-us.com', mobile: '7001122334' },
      { name: 'Bikram Behera', role: 'Associate Software Engineer', avatar: '/assets/images/avatar2.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'bikram.b@gemini-us.com', mobile: '7002233445' },
      { name: 'Sonalika Nayak', role: 'Associate Software Engineer', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', status: 'LEAVE', statusClass: 'badge-leave', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'sonalika.n@gemini-us.com', mobile: '7003344556' },
      { name: 'Radharani Behera', role: 'Software Engineer', avatar: '/assets/images/avatar1.png', status: 'WFH', statusClass: 'badge-wfh', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'radharani.b@gemini-us.com', mobile: '7004455667' },
      { name: 'Chitra Nayak', role: 'Software Engineer', avatar: '/assets/images/avatar2.png', status: 'ON DUTY', statusClass: 'badge-duty', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'chitra.n@gemini-us.com', mobile: '7005566778' },
      { name: 'Sonalika Patra', role: 'Software Engineer', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'sonalika.p@gemini-us.com', mobile: '7006677889' },
      { name: 'Rupali Pradhan', role: 'Associate Software Engineer', avatar: '/assets/images/avatar1.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'rupali.p@gemini-us.com', mobile: '7007788990' },
      { name: 'Amit Nayak', role: 'Associate Software Engineer', avatar: '/assets/images/avatar2.png', status: 'OUT', statusClass: 'badge-out', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'amit.n@gemini-us.com', mobile: '7008899001' },
    ],
  },
  myteam_summary_peers: {
    title: 'Peers Employees (14)',
    cards: [
      { name: 'Sanjay Patel', role: 'Associate Director - Projects', avatar: '/assets/images/avatar1.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'sanjay.p@gemini-us.com', mobile: '7010011223' },
      { name: 'Soumya Mishra', role: 'Software Engineer', avatar: '/assets/images/avatar2.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'soumya.m@gemini-us.com', mobile: '7011122334' },
      { name: 'Puja Sahu', role: 'Associate Software Engineer', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', status: 'WFH', statusClass: 'badge-wfh', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'puja.s@gemini-us.com', mobile: '7012233445' },
      { name: 'Rakesh Nayak', role: 'Associate Software Engineer', avatar: '/assets/images/avatar1.png', status: 'LEAVE', statusClass: 'badge-leave', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'rakesh.n@gemini-us.com', mobile: '7013344556' },
      { name: 'Subarna Sethi', role: 'Associate Gen AI Engineer', avatar: '/assets/images/avatar2.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'subarna.s@gemini-us.com', mobile: '7014455667' },
      { name: 'Swapna Behera', role: 'Associate Software Engineer', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png', status: 'OUT', statusClass: 'badge-out', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'swapna.b@gemini-us.com', mobile: '7015566778' },
      { name: 'Jitendra Sahoo', role: 'Associate Director - Projects', avatar: '/assets/images/avatar1.png', status: 'ON DUTY', statusClass: 'badge-duty', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'jitendra.s@gemini-us.com', mobile: '7016677889' },
      { name: 'Sasmita Sahoo', role: 'Associate Software Engineer', avatar: '/assets/images/avatar2.png', status: 'IN', statusClass: 'badge-in', location: 'Bhubaneswar', department: 'Digital Services Innovation Lab', email: 'sasmita.s@gemini-us.com', mobile: '7017788990' },
    ],
  },
};

function RouteLink({ to, className, children }) {
  if (!to || to === '#') {
    return (
      <a href="#" className={className} onClick={(event) => event.preventDefault()}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

function ScopeTabs({ activeKey }) {
  return (
    <div className="team-view-tabs summary-scope-tabs" aria-label="Summary scopes">
      {summaryScopeTabs.map((item) => (
        <RouteLink key={item.label} to={item.path} className={item.activeKey === activeKey ? 'active' : ''}>
          {item.label}
        </RouteLink>
      ))}
    </div>
  );
}

function EmployeeCard({ employee }) {
  return (
    <article className="summary-employee-card">
      <div className="summary-employee-head">
        <img className="summary-employee-avatar" src={employee.avatar} alt="" />
        <div className="summary-employee-headings">
          <div className="summary-employee-name">{employee.name}</div>
          <div className="summary-employee-role">{employee.role}</div>
        </div>
        <div className="summary-employee-badges">
          <span className={`summary-status-badge ${employee.statusClass}`}>{employee.status}</span>
          {employee.secondaryStatus ? <span className="summary-status-badge summary-status-badge--ghost">{employee.secondaryStatus}</span> : null}
        </div>
      </div>
      <div className="summary-employee-details">
        <div>
          <span>Location</span>
          <strong>{employee.location}</strong>
        </div>
        <div>
          <span>Department</span>
          <strong>{employee.department}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{employee.email}</strong>
        </div>
        <div>
          <span>Mobile</span>
          <strong>{employee.mobile}</strong>
        </div>
      </div>
    </article>
  );
}

function SummaryShell({ children, activeKey, scopeKey }) {
  return (
    <MainLayout
      activeKey={activeKey}
      moduleActiveKey="myteam_summary"
      subNavActiveKey={scopeKey}
      brandText="HRPulse"
      companyText=""
      showModuleNav
      showSubNav={false}
      moduleNavItems={moduleNavItems}
    >
      {children}
    </MainLayout>
  );
}

function SummaryDashboard({ scopeKey }) {
  const scope = peopleByScope[scopeKey] || peopleByScope.myteam_summary_digital_services;
  const todayOff = [
    { name: 'Animesh Das', avatar: '/assets/images/avatar1.png' },
    { name: 'Kajal Dikhit', avatar: '/assets/images/avatar2.png' },
  ];
  const notInYet = [
    { name: 'Kshira...', avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png' },
    { name: 'Radhar...', avatar: '/assets/images/avatar1.png' },
  ];

  return (
    <SummaryShell activeKey="myteam_summary" scopeKey={scopeKey}>
      <div className="summary-toolbar">
        <RouteLink className="summary-group-btn" to={ROUTES.myTeamSummaryDigitalServices}>
          Digital Services In... <Icon name="caret-down" size={10} />
        </RouteLink>
        <ScopeTabs activeKey={scopeKey} />
      </div>

      <section className="summary-top-grid">
        <article className="status-card">
          <h2>Who is off today</h2>
          <div className="avatar-strip">
            {todayOff.map((person) => (
              <div className="avatar-chip" key={person.name}>
                <img src={person.avatar} alt={person.name} />
                <span>{person.name}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="status-card">
          <h2>Not in yet today</h2>
          <div className="avatar-strip">
            {notInYet.map((person) => (
              <div className="avatar-chip" key={person.name}>
                <img src={person.avatar} alt={person.name} />
                <span>{person.name}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="metric-grid">
        {summaryCards.map(([label, value, accent]) => (
          <article className={`metric-card ${accent}`} key={label}>
            <div className="metric-label">{label}</div>
            <div className="metric-value">{value}</div>
            <a className="metric-link" href="#">
              View Employees
            </a>
          </article>
        ))}
      </section>

      <section className="calendar-card">
        <div className="calendar-header">
          <div className="calendar-title">Team calendar</div>
          <div className="calendar-nav">
            <button type="button" className="calendar-nav-btn" aria-label="Previous month">
              <Icon name="chevron-left" />
            </button>
            <div className="calendar-month">Apr 2026</div>
            <button type="button" className="calendar-nav-btn" aria-label="Next month">
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>

        <div className="calendar-scroll">
          <div className="calendar-grid">
            <div className="calendar-columns calendar-head" aria-hidden="true">
              <div className="calendar-name-spacer" />
              {calendarDays.map((day) => (
                <div className="calendar-day" key={day.day}>
                  <small>{day.weekday.slice(0, 2)}</small>
                  <span>{day.day}</span>
                </div>
              ))}
            </div>
            <div className="calendar-rows">
              {overviewRows.map((row) => (
                <div className="calendar-row" key={row.name}>
                  <div className="calendar-employee">
                    <img src={row.avatar} alt={row.name} />
                    <span>{row.name}</span>
                  </div>
                  {calendarDays.map((day) => {
                    const status = row.days[day.day] || '';
                    return (
                      <div key={`${row.name}-${day.day}`} className={`calendar-cell${status ? ` is-${status}` : ''}`}>
                        {day.day}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="calendar-legend">
          {overviewLegend.map(([label, className]) => (
            <span className="legend-item" key={label}>
              <span className={`legend-dot ${className}`} />
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="summary-employees-section">
        <div className="summary-employees-header">
          <div className="summary-employees-title">{scope.title}</div>
          <div className="summary-employees-count">{scope.cards.length} visible</div>
        </div>
        <div className="summary-employee-grid">
          {scope.cards.map((employee) => (
            <EmployeeCard key={`${employee.name}-${employee.email}`} employee={employee} />
          ))}
        </div>
      </section>
    </SummaryShell>
  );
}

export default function MyTeamSummary() {
  const { pathname } = useLocation();

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} myteam-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  if (pathname.includes('myteam_summary_direct')) {
    return <SummaryDashboard scopeKey="myteam_summary_direct" />;
  }

  if (pathname.includes('myteam_summary_indirect')) {
    return <SummaryDashboard scopeKey="myteam_summary_indirect" />;
  }

  if (pathname.includes('myteam_summary_peers')) {
    return <SummaryDashboard scopeKey="myteam_summary_peers" />;
  }

  return <SummaryDashboard scopeKey="myteam_summary_digital_services" />;
}
