import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ROUTES } from '../router/routePaths';

const tabs = [
  { label: 'Pending Expenses', path: ROUTES.userExpenses, key: 'pending' },
  { label: 'Past Claims', path: ROUTES.userExpensesPastClaims, key: 'past' },
  { label: 'Advance Requests', path: ROUTES.userExpensesAdvanceRequests, key: 'advance' },
];

function Screen({ title, subtitle, buttonLabel, sections, activeKey }) {
  return (
    <MainLayout activeKey="user-expenses" moduleActiveKey="user-expenses">
      <div className="expenses-page">
        <div className="expenses-tabs">
          {tabs.map((tab) => (
            <Link key={tab.key} to={tab.path} className={`expenses-tab${tab.key === activeKey ? ' active' : ''}`}>
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="expenses-head">
          <div>
            <div className="expenses-title">{title}</div>
            <div className="expenses-sub">{subtitle}</div>
          </div>
          <a className="expenses-btn" href={buttonLabel === 'advance' ? '#' : '#'}>
            {buttonLabel === 'advance' ? '+ Request Advance' : '+ Add an Expense'}
          </a>
        </div>

        {sections.map((section) => (
          <div key={section.title} className="section">
            <div className="section-title">{section.title}</div>
            <div className="section-help">{section.help}</div>
            <div className="expenses-panel" style={{ marginBottom: 0 }}>
              <div className="expenses-box">{section.empty}</div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
}

export default function Expenses() {
  const { pathname } = useLocation();

  if (pathname.includes('past-claims')) {
    return (
      <Screen
        title="Past Claims"
        subtitle="Completed and processed expenses are shown here"
        buttonLabel="past"
        activeKey="past"
        sections={[{ title: 'Settled Claims', help: 'Approved and reimbursed claims appear here once processed.', empty: 'No settled claims found.' }]}
      />
    );
  }

  if (pathname.includes('advance-requests')) {
    return (
      <Screen
        title="Advance Requests"
        subtitle="Advance requests that are pending approval or settlement"
        buttonLabel="advance"
        activeKey="advance"
        sections={[{ title: 'Advance Requests', help: 'Advance requests that are pending approval or settlement', empty: 'No advance requests to show.' }]}
      />
    );
  }

  return (
    <Screen
      title="Expenses to be Claimed"
      subtitle="The following are the expenses that you are yet to claim"
      buttonLabel="pending"
      activeKey="pending"
      sections={[
        {
          title: 'Expense claims in process',
          help: 'The following are the expense claims that are yet to be approved or yet to be paid are shown here',
          empty: 'No saved expenses to show.',
        },
        {
          title: 'Advance settlements in process',
          help: 'The following are the advance settlements that are yet to be approved or yet to be paid are shown here',
          empty: 'No pending expenses claims to show.',
        },
      ]}
    />
  );
}
