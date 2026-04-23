import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Icon from '../components/Icon';
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

const expenseTabs = [
  { key: 'waiting-approval', label: 'Waiting For Approval', activeKey: 'myteam_expenses_waiting' },
  { key: 'approved-claims', label: 'Approved Claims', activeKey: 'myteam_expenses_approved' },
  { key: 'past-claims', label: 'Past Claims', activeKey: 'myteam_expenses_past_claims' },
  { key: 'past-advances', label: 'Past Advances', activeKey: 'myteam_expenses_past_advances' },
];

const expenseSubNavItems = expenseTabs.map((tab) => ({
  label: tab.label,
  path: `${ROUTES.myTeamExpenses}#${tab.key}`,
  activeKey: tab.activeKey,
}));

const scopeTabs = [
  { key: 'digital-services', label: 'Digital Services In...' },
  { key: 'direct-reports', label: 'Direct Reports' },
  { key: 'indirect-reports', label: 'Indirect Reports' },
];

const sectionCopy = {
  'waiting-approval': {
    title: 'Pending Advance Request Approvals',
    subtitle: "The following are your team's advance requests that are waiting for approval.",
    sections: [
      {
        title: 'Pending Advance Request Approvals',
        help: 'The following are your team’s advance requests that are waiting for approval.',
        empty: 'No pending advance requests are there to show.',
      },
      {
        title: 'Pending Expense Claim Approvals',
        help: 'The following are your team’s expense claims that are waiting for approval.',
        empty: 'No pending expense claims/advance settlements are there to show.',
      },
      {
        title: 'Pending Advance Settlement Approvals',
        help: 'The following are your team’s advance settlements that are waiting for approval.',
        empty: 'No pending expense claims/advance settlements are there to show.',
      },
    ],
  },
  'approved-claims': {
    title: 'Approved Claims',
    subtitle: 'Claims and settlements that were approved for your team.',
    sections: [
      {
        title: 'Approved Expense Claims',
        help: 'Recently approved claims are listed here.',
        empty: 'No approved expense claims to show.',
      },
      {
        title: 'Approved Advance Settlements',
        help: 'Recently approved advance settlements are listed here.',
        empty: 'No approved advance settlements to show.',
      },
    ],
  },
  'past-claims': {
    title: 'Past Claims',
    subtitle: 'Completed expense claims and their final status.',
    sections: [
      {
        title: 'Past Claim History',
        help: 'Processed expense claims appear here for audit and review.',
        empty: 'No past claims to show.',
      },
    ],
  },
  'past-advances': {
    title: 'Past Advances',
    subtitle: 'Previously raised advances and settlements.',
    sections: [
      {
        title: 'Past Advance History',
        help: 'Processed advances appear here for audit and review.',
        empty: 'No past advances to show.',
      },
    ],
  },
};

const scopeData = {
  'digital-services': ['Pending requests', 'Approved this week', 'Settled this month'],
  'direct-reports': ['Pending requests', 'Approved this week', 'Settled this month'],
  'indirect-reports': ['Pending requests', 'Approved this week', 'Settled this month'],
};

function ExpenseCard({ section }) {
  return (
    <section className="myteam-expense-card">
      <div className="myteam-expense-card-title">{section.title}</div>
      <div className="myteam-expense-card-help">{section.help}</div>
      <div className="myteam-expense-empty">
        <Icon name="circle-question" size={14} />
        <span>{section.empty}</span>
      </div>
    </section>
  );
}

export default function MyTeamExpenses() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('waiting-approval');
  const [scopeKey, setScopeKey] = useState('digital-services');

  const activeTabInfo = expenseTabs.find((tab) => tab.key === activeTab) || expenseTabs[0];
  const currentCopy = sectionCopy[activeTab] || sectionCopy['waiting-approval'];
  const sidebarActiveKey = activeTabInfo.activeKey;

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} myteam-page myteam-expenses-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  useEffect(() => {
    const hashMap = {
      '#waiting-approval': 'waiting-approval',
      '#approved-claims': 'approved-claims',
      '#past-claims': 'past-claims',
      '#past-advances': 'past-advances',
    };

    setActiveTab(hashMap[hash] || 'waiting-approval');
  }, [hash, pathname]);

  useEffect(() => {
    if (!hash) {
      navigate(`${pathname}#waiting-approval`, { replace: true });
    }
  }, [hash, navigate, pathname]);

  const details = useMemo(() => scopeData[scopeKey] || scopeData['digital-services'], [scopeKey]);

  return (
    <MainLayout
      activeKey={sidebarActiveKey}
      moduleActiveKey="myteam_expenses"
      subNavActiveKey={sidebarActiveKey}
      brandText="HRPulse"
      companyText=""
      showModuleNav
      showSubNav
      moduleNavItems={moduleNavItems}
      subNavItems={expenseSubNavItems}
    >
      <div className="myteam-expenses-page">
        <div className="myteam-expenses-scopebar">
          <button type="button" className="scope-dropdown">
            {scopeKey === 'digital-services' ? 'Digital Services In...' : scopeKey === 'direct-reports' ? 'Direct Reports' : 'Indirect Reports'}
            <Icon name="caret-down" size={10} />
          </button>
          <div className="scope-tabs" role="tablist" aria-label="Expense scopes">
            {scopeTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`scope-tab ${scopeKey === tab.key ? 'active' : ''}`}
                onClick={() => setScopeKey(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="myteam-expenses-summary">
          <div>
            <h1>{currentCopy.title}</h1>
            <p>{currentCopy.subtitle}</p>
          </div>
          <div className="myteam-expenses-pill">
            {details[0]} • {details[1]} • {details[2]}
          </div>
        </div>

        <div className="myteam-expenses-stack">
          {currentCopy.sections.map((section) => (
            <ExpenseCard key={section.title} section={section} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
