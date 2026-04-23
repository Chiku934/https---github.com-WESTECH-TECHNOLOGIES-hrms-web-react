import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../components/Icon';
import MainLayout from '../layouts/MainLayout';
import { ROUTES } from '../router/routePaths';

const moduleNavItems = [
  { label: 'Attendance', path: ROUTES.userAttendance, activeKey: 'user-attendance' },
  { label: 'Timesheet', path: ROUTES.timesheet, activeKey: 'timesheet' },
  { label: 'Leave', path: ROUTES.userLeave, activeKey: 'user-leave' },
  { label: 'Performance', path: ROUTES.userPerformance, activeKey: 'user-performance' },
  { label: 'Expenses & Travel', path: ROUTES.userExpenses, activeKey: 'user-expenses' },
  { label: 'Helpdesk', path: ROUTES.userSupport, activeKey: 'user-support' },
];

const performanceSubNavItems = [
  { label: 'KRAs', path: ROUTES.userPerformance, activeKey: 'user-performance' },
  { label: '1:1 Meetings', path: ROUTES.userPerformanceMeetings, activeKey: 'user-performance-meetings' },
  { label: 'Feedback', path: ROUTES.userPerformanceFeedback, activeKey: 'user-performance-feedback' },
  { label: 'PIP', path: ROUTES.userPerformancePip, activeKey: 'user-performance-pip' },
  { label: 'Reviews', path: ROUTES.userPerformanceReviews, activeKey: 'user-performance-reviews' },
  { label: 'Skills', path: ROUTES.userPerformanceSkills, activeKey: 'user-performance-skills' },
  { label: 'Competencies & Core values', path: ROUTES.userPerformanceCompetencies, activeKey: 'user-performance-competencies' },
];

function SectionShell({ title, subtitle, actionLabel, children, activeKey = 'user-performance' }) {
  return (
    <MainLayout
      activeKey={activeKey}
      moduleActiveKey="user-performance"
      subNavActiveKey={activeKey}
      showSubNav
      subNavItems={performanceSubNavItems}
    >
      <div className="performance-section">
        <div className="head">
          <div>
            <div className="title">{title}</div>
            <div className="subtitle">{subtitle}</div>
          </div>
          <a className="action" href="#">
            {actionLabel}
          </a>
        </div>
        {children}
      </div>
    </MainLayout>
  );
}

function TopTabs({ value, onChange }) {
  return (
    <div className="top-tabs" id="perf-main-tabs">
      <button type="button" className={`top-tab${value === 'kras' ? ' active' : ''}`} onClick={() => onChange('kras')}>
        My KRAs
      </button>
      <button type="button" className={`top-tab${value === 'company' ? ' active' : ''}`} onClick={() => onChange('company')}>
        Company KRAs
      </button>
    </div>
  );
}

function KRAView() {
  const [view, setView] = useState('kras');

  return (
    <SectionShell title="Performance" subtitle="Track goals, reviews, feedback, and improvement plans." actionLabel="Edit KRA">
      <TopTabs value={view} onChange={setView} />
      {view === 'kras' ? (
        <>
          <div className="title" style={{ marginBottom: 10 }}>
            My KRAs
          </div>
          <div className="content-panel empty-state">
            <div>
              <div className="icon">
                <Icon name="bullseye" />
              </div>
              <strong>Welcome to Keka KRAs!</strong>
              <small>There are no kras available. Add kras to align and track progress.</small>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="title" style={{ marginBottom: 10 }}>
            Company KRAs
          </div>
          <div className="content-panel" style={{ padding: 14 }}>
            <div className="grid two">
              {[
                ['Customer Experience', 'Improve service response times across all regional support centers.'],
                ['Delivery Reliability', 'Ship planned initiatives on time with fewer escalations.'],
                ['Team Capability', 'Increase completion of learning goals and role-based skills.'],
                ['Process Health', 'Standardize review cycles and reduce stalled approvals.'],
              ].map(([cardTitle, body]) => (
                <div key={cardTitle} className="card" style={{ background: '#f8fafc' }}>
                  <div className="card-title">{cardTitle}</div>
                  <div className="soft-item">{body}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </SectionShell>
  );
}

function MeetingsView() {
  const [view, setView] = useState('meetings');
  const [dateFrom, setDateFrom] = useState('2026-03-16');
  const [dateTo, setDateTo] = useState('2026-04-15');
  const [selectedTypes, setSelectedTypes] = useState(['team', 'review', 'manager']);
  const [search, setSearch] = useState('');
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const selectedTypeLabel = useMemo(() => {
    if (selectedTypes.length === 3) return '3 selected';
    return `${selectedTypes.length} selected`;
  }, [selectedTypes]);

  const dateRangeLabel = `${new Date(dateFrom + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(dateTo + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;

  const visibleRail = ['Upcoming Meetings', 'Pending Meetings', 'Completed Meetings'].filter((label) => label.toLowerCase().includes(search.toLowerCase()));

  return (
    <SectionShell title="1:1 meetings" subtitle="Discover meetings you've initiated or ones where you're involved as a participant." actionLabel="Schedule 1:1 meeting" activeKey="user-performance-meetings">
      <div className="top-tabs" style={{ marginBottom: 10 }}>
        <button type="button" className={`top-tab${view === 'meetings' ? ' active' : ''}`} onClick={() => setView('meetings')}>
          My Meetings
        </button>
        <button type="button" className={`top-tab${view === 'templates' ? ' active' : ''}`} onClick={() => setView('templates')}>
          Agenda Templates
        </button>
      </div>

      {view === 'meetings' ? (
        <>
          <div className="performance-section">
            <div className="perf-searchbar">
              <div className="perf-field">
                <label>Meeting Type</label>
                <button type="button" className="perf-calendar-btn" onClick={() => setShowTypeMenu((v) => !v)}>
                  <span>{selectedTypeLabel}</span>
                  <Icon name="chevron-down" size={10} />
                </button>
                {showTypeMenu ? (
                  <div className="perf-filter-popover" style={{ marginTop: 42 }}>
                    {['all', 'team', 'review', 'manager'].map((type) => (
                      <div
                        key={type}
                        className="soft-item"
                        style={{ cursor: 'pointer', marginBottom: 8 }}
                        onClick={() => {
                          setSelectedTypes(type === 'all' ? ['team', 'review', 'manager'] : selectedTypes.includes(type) ? selectedTypes.filter((item) => item !== type) : [...selectedTypes, type]);
                          setShowTypeMenu(false);
                        }}
                      >
                        {type === 'all' ? 'All meeting types' : type === 'team' ? 'Team sync' : type === 'review' ? 'Review' : 'Manager 1:1'}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="perf-field">
                <label>Date Range</label>
                <button type="button" className="perf-calendar-btn" onClick={() => setShowDateMenu((v) => !v)}>
                  <span>{dateRangeLabel}</span>
                  <Icon name="calendar" size={12} />
                </button>
                {showDateMenu ? (
                  <div className="perf-filter-popover" style={{ marginTop: 42 }}>
                    <div className="row">
                      <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    </div>
                    <div className="row">
                      <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                    <div className="row">
                      <button type="button" className="apply" onClick={() => { setDemoMode(true); setShowDateMenu(false); }}>
                        Apply
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="perf-field" style={{ flex: 1 }}>
                <label>Search Meetings</label>
                <div className="perf-input-wrap">
                  <input className="perf-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search meetings" />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '164px 1fr', gap: 12 }}>
            <div className="perf-left-rail">
              {visibleRail.map((item) => (
                <div key={item} className={`perf-rail-item${item === 'Completed Meetings' ? ' active' : ''}`}>
                  {item} <Icon name={item === 'Completed Meetings' ? 'chevron-right' : 'chevron-down'} size={10} />
                </div>
              ))}
              <div style={{ padding: 12, color: '#8a94a6', fontSize: 11 }}>No past meetings</div>
            </div>
            <div className="content-panel">
              {!demoMode ? (
                <div className="meetings-empty">
                  <div>
                    <div className="ghost">
                      <Icon name="calendar" size={38} />
                    </div>
                    <strong>No meetings scheduled in this date range.</strong>
                    <small>Adjust the date range to view meetings.</small>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '18px 20px' }}>
                  <div className="meetings-demo-summary">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Upcoming 1:1 meetings</div>
                      <small className="subtitle">Demo meetings for the selected date range.</small>
                    </div>
                    <span className="inline-pill">{selectedTypes.length} selected</span>
                  </div>
                  <div className="soft-list">
                    <div className="soft-item">
                      <strong style={{ display: 'block', color: '#334155', fontSize: 13, marginBottom: 4 }}>Weekly sync with Goutham Kurangi</strong>
                      <small style={{ color: '#8b95a5', fontSize: 11 }}>Tue, 16 Mar 2026 - 11:00 AM to 11:30 AM</small>
                    </div>
                    <div className="soft-item">
                      <strong style={{ display: 'block', color: '#334155', fontSize: 13, marginBottom: 4 }}>Project review with Sowmya Dash</strong>
                      <small style={{ color: '#8b95a5', fontSize: 11 }}>Thu, 18 Mar 2026 - 3:00 PM to 3:45 PM</small>
                    </div>
                    <div className="soft-item">
                      <strong style={{ display: 'block', color: '#334155', fontSize: 13, marginBottom: 4 }}>Quarterly check-in with Jitesh Kumar Das</strong>
                      <small style={{ color: '#8b95a5', fontSize: 11 }}>Mon, 22 Mar 2026 - 10:15 AM to 10:45 AM</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="grid two">
          {[
            ['Weekly 1:1 Template', 'Review priorities, blockers, wins, and next week actions.'],
            ['Quarterly Review Template', 'Discuss goals, feedback, growth areas, and follow-up tasks.'],
            ['Manager Check-in', 'Use for quick updates, risks, and support requests.'],
            ['Project Sync Agenda', 'Agenda for dependency tracking, milestones, and decisions.'],
          ].map(([title, body]) => (
            <div key={title} className="card">
              <div className="card-title">{title}</div>
              <small style={{ fontSize: 11, color: '#8b95a5', lineHeight: 1.4 }}>{body}</small>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function FeedbackView() {
  const [requested, setRequested] = useState(false);
  return (
    <SectionShell title="Feedback" subtitle="Capture feedback shared by managers, peers, and collaborators." actionLabel="Request feedback" activeKey="user-performance-feedback">
      <div className="grid two">
        <div className="card">
          <div className="card-title">Received Feedback</div>
          {requested ? (
            <div className="soft-list">
              <div className="soft-item">Goutham Kurangi - Helpfulness and collaboration were excellent during the release cycle.</div>
              <div className="soft-item">Sowmya Dash - Communication stayed clear while handling the UAT feedback loop.</div>
              <div className="soft-item">Jitesh Kumar Das - Delivered the module quickly and kept the team informed.</div>
            </div>
          ) : (
            <div className="empty-state" style={{ minHeight: 220 }}>
              <div>
                <div className="icon">
                  <Icon name="comments" />
                </div>
                <strong>No feedback received yet.</strong>
                <small>Feedback shared with you will appear here once it is published.</small>
              </div>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title">Feedback Requests</div>
          {requested ? (
            <div className="soft-list">
              <div className="soft-item">Requested from Goutham Kurangi - Due 03 Apr 2026 - Status: Pending</div>
              <div className="soft-item">Requested from Sowmya Dash - Due 05 Apr 2026 - Status: Sent</div>
              <div className="soft-item">Requested from Jitesh Kumar Das - Due 08 Apr 2026 - Status: Draft</div>
            </div>
          ) : (
            <div className="soft-list">
              <div className="soft-item">No pending feedback requests to show.</div>
              <div className="soft-item">Request feedback from your manager or peers to keep a record.</div>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="action" onClick={() => setRequested(true)}>
          Request feedback
        </button>
      </div>
    </SectionShell>
  );
}

function PipView() {
  const [active, setActive] = useState(false);
  return (
    <SectionShell title="PIP" subtitle="Review active improvement plans, milestones, and next actions." actionLabel="Create PIP" activeKey="user-performance-pip">
      <div className="content-panel">
        {!active ? (
          <div className="empty-state">
            <div>
              <div className="icon">
                <Icon name="clipboard" />
              </div>
              <strong>No active PIPs found.</strong>
              <small>When a performance improvement plan is created, the milestones and progress will appear here.</small>
            </div>
          </div>
        ) : (
          <div style={{ padding: 16 }}>
            <div className="grid three">
              {[
                ['Plan Overview', ['Owner: Goutham Kurangi', 'Start: 01 Mar 2026', 'Target Review: 30 Apr 2026']],
                ['Milestones', ['Week 1 - Documentation cleanup', 'Week 2 - UAT defect closure', 'Week 3 - Peer review follow-up']],
                ['Status', ['In progress', 'Progress is on track with weekly check-ins.', 'Action items are logged.']],
              ].map(([title, items]) => (
                <div key={title} className="card">
                  <div className="card-title">{title}</div>
                  <div className="soft-list">
                    {items.map((item) => (
                      <div key={item} className="soft-item">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="soft-list" style={{ marginTop: 12 }}>
              <div className="soft-item">Next check-in scheduled for 04 Apr 2026.</div>
              <div className="soft-item">Manager note: keep defect closure speed above 90% this cycle.</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="action" onClick={() => setActive(true)}>
          Create PIP
        </button>
      </div>
    </SectionShell>
  );
}

function ReviewsView() {
  const [cycle, setCycle] = useState('fy');
  const label = cycle === 'q4' ? 'Q4 2025' : cycle === 'q1' ? 'Q1 2026' : 'FY 2025 - 2026';
  const showDemo = cycle !== 'fy';
  return (
    <SectionShell title="Reviews" subtitle="Track review cycles, manager notes, and completion status." actionLabel="Start review cycle" activeKey="user-performance-reviews">
      <div className="perf-searchbar" style={{ marginTop: -2 }}>
        <div className="perf-field">
          <label>Review Cycle</label>
          <div className="value perf-select">
            <select value={cycle} onChange={(e) => setCycle(e.target.value)}>
              <option value="fy">FY 2025 - 2026</option>
              <option value="q4">Q4 2025</option>
              <option value="q1">Q1 2026</option>
            </select>
            <Icon name="chevron-down" size={10} />
          </div>
        </div>
        <div className="perf-field">
          <label>Reviewer</label>
          <div className="value">Goutham Kurangi</div>
        </div>
        <div className="perf-toolbar-end">
          <span className="inline-pill">{label}</span>
        </div>
      </div>
      <div className="grid three">
        {[
          ['Current Cycle', ['Cycle: FY 2025 - 2026 - Status: In progress', 'Manager: Goutham Kurangi', 'Review date: 15 Apr 2026'], 'No active review cycle.', 'Your next review cycle will appear here when scheduled.'],
          ['Last Review', ['Q4 2025 - Rating: 4.5 / 5', 'Outcome: Exceeded expectations', 'Next review prep starts in 30 days.'], 'No review history yet.', 'Completed reviews and ratings will be listed here.'],
          ['Review Notes', ['Self review submitted on 26 Mar 2026.', 'Manager note: excellent delivery and clear communication.', 'Action item: complete leadership workshop by 20 Apr 2026.'], 'Manager notes, self review, and action items will appear here.', 'Use reviews to track goals and development conversations.'],
        ].map(([title, items, emptyTitle, emptySub]) => (
          <div key={title} className="card">
            <div className="card-title">{title}</div>
            {showDemo ? (
              <div className="soft-list">
                {items.map((item) => (
                  <div key={item} className="soft-item">
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ minHeight: 180 }}>
                <div>
                  <div className="icon">
                    <Icon name="calendar-check" />
                  </div>
                  <strong>{emptyTitle}</strong>
                  <small>{emptySub}</small>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function SkillsView() {
  const [group, setGroup] = useState('all');
  const [count, setCount] = useState(3);
  const [goals, setGoals] = useState(false);
  const [gaps, setGaps] = useState(false);
  const [rows, setRows] = useState([
    { name: 'JavaScript', score: '90%', group: 'core' },
    { name: 'PHP', score: '85%', group: 'core' },
    { name: 'Communication', score: '95%', group: 'role' },
  ]);
  const filtered = rows.filter((row) => group === 'all' || row.group === group);
  const next = [
    { name: 'Node.js', score: '80%', group: 'core' },
    { name: 'Mentoring', score: '82%', group: 'role' },
    { name: 'API Design', score: '88%', group: 'core' },
    { name: 'Presentation', score: '86%', group: 'role' },
  ][count % 4];

  return (
    <SectionShell title="Skills" subtitle="Track key skills and progress against the role expectations." actionLabel="Add skill" activeKey="user-performance-skills">
      <div className="perf-searchbar" style={{ marginTop: -2 }}>
        <div className="perf-field">
          <label>Skill Group</label>
          <div className="value perf-select">
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="all">All skills</option>
              <option value="core">Core skills</option>
              <option value="role">Role skills</option>
            </select>
            <Icon name="chevron-down" size={10} />
          </div>
        </div>
        <div className="perf-field">
          <label>Progress</label>
          <div className="value">{count} active skills</div>
        </div>
        <div className="perf-toolbar-end">
          <span className="inline-pill">Demo skill matrix</span>
        </div>
      </div>

      <div className="grid three">
        <div className="card">
          <div className="card-title">Top Skills</div>
          <div className="soft-list">
            {filtered.map((skill) => (
              <div key={skill.name} className="soft-item">
                {skill.name}
                <strong style={{ float: 'right', color: '#6b55bc' }}>{skill.score}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Learning Goals</div>
          {!goals ? (
            <div className="empty-state" style={{ minHeight: 180 }}>
              <div>
                <div className="icon">
                  <Icon name="compass" />
                </div>
                <strong>No learning goals added.</strong>
                <small>Add learning goals to track the skills you want to build this cycle.</small>
              </div>
            </div>
          ) : (
            <div className="soft-list">
              <div className="soft-item">Learn advanced PHP patterns by 20 Apr 2026.</div>
              <div className="soft-item">Improve meeting facilitation by running two demos this month.</div>
              <div className="soft-item">Complete one backend refactor exercise per week.</div>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title">Skill Gaps</div>
          {!gaps ? (
            <div className="empty-state" style={{ minHeight: 180 }}>
              <div>
                <div className="icon">
                  <Icon name="compass" />
                </div>
                <strong>No skill gaps identified.</strong>
                <small>Assessments will appear here after a review or manager update.</small>
              </div>
            </div>
          ) : (
            <div className="soft-list">
              <div className="soft-item">Leadership: developing through quarterly project ownership.</div>
              <div className="soft-item">Testing: improve automation coverage for core flows.</div>
              <div className="soft-item">Documentation: standardize release notes and handoffs.</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          type="button"
          className="action"
          onClick={() => {
            setGoals(true);
            setGaps(true);
            setRows((prev) => [next, ...prev]);
            setCount((value) => value + 1);
          }}
        >
          Add skill
        </button>
      </div>
    </SectionShell>
  );
}

function CompetenciesView() {
  const [mode, setMode] = useState('values');
  const [published, setPublished] = useState('4 values active');
  return (
    <SectionShell title="Competencies & Core values" subtitle="Keep core behavior indicators aligned with your organization values." actionLabel="Edit core values" activeKey="user-performance-competencies">
      <div className="perf-searchbar" style={{ marginTop: -2 }}>
        <div className="perf-field">
          <label>View</label>
          <div className="value perf-select">
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="values">Core values</option>
              <option value="behaviour">Behavior indicators</option>
            </select>
            <Icon name="chevron-down" size={10} />
          </div>
        </div>
        <div className="perf-field">
          <label>Published</label>
          <div className="value">{published}</div>
        </div>
        <div className="perf-toolbar-end">
          <span className="inline-pill">Editable demo</span>
        </div>
      </div>

      {mode === 'values' ? (
        <div className="grid three">
          {[
            ['Ownership', 'Take responsibility, follow through, and deliver outcomes with accountability.'],
            ['Collaboration', 'Work across teams, share context, and keep communication clear.'],
            ['Empathy', 'Listen actively, respect differences, and respond with care.'],
          ].map(([title, body]) => (
            <div key={title} className="card">
              <div className="card-title">{title}</div>
              <div className="soft-item">{body}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid three">
          {[
            ['Ownership', 'Own the outcome', 'Follow through'],
            ['Collaboration', 'Share context', 'Coordinate clearly'],
            ['Empathy', 'Listen actively', 'Respond with care'],
          ].map(([title, one, two]) => (
            <div key={title} className="card">
              <div className="card-title">{title}</div>
              <div className="soft-list">
                <div className="soft-item">{one}</div>
                <div className="soft-item">{two}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button type="button" className="action" onClick={() => setPublished(mode === 'behaviour' ? '3 indicators active' : '4 values active')}>
          Save changes
        </button>
      </div>
    </SectionShell>
  );
}

export default function Performance() {
  const { pathname } = useLocation();
  if (pathname.includes('meetings')) return <MeetingsView />;
  if (pathname.includes('feedback')) return <FeedbackView />;
  if (pathname.includes('pip')) return <PipView />;
  if (pathname.includes('reviews')) return <ReviewsView />;
  if (pathname.includes('skills')) return <SkillsView />;
  if (pathname.includes('competencies')) return <CompetenciesView />;
  return <KRAView />;
}
