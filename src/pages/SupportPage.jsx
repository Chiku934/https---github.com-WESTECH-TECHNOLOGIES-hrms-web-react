import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ROUTES } from '../router/routePaths';

const supportTabs = [
  { label: 'Tickets', path: ROUTES.userSupportTickets, key: ROUTES.userSupportTickets },
  { label: 'Knowledge Base', path: ROUTES.userSupportKnowledgeBase, key: ROUTES.userSupportKnowledgeBase },
  { label: 'My Requests', path: ROUTES.userSupportRequests, key: ROUTES.userSupportRequests },
  { label: 'FAQ', path: ROUTES.userSupportFaq, key: ROUTES.userSupportFaq },
];

export default function SupportPage({ title = 'Helpdesk', subtitle = 'Track tickets, open knowledge articles, and submit new requests.' }) {
  const location = useLocation();
  const activePath = location.pathname;

  return (
    <MainLayout activeKey="user-support" moduleActiveKey="user-support">
      <div className="help-page">
        <div className="help-tabs">
          {supportTabs.map((tab, index) => (
            <Link
              key={tab.label}
              to={tab.path}
              className={`help-tab${activePath === tab.path || (index === 0 && activePath === ROUTES.userSupport) ? ' active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="help-head">
          <div>
            <div className="help-title">{title}</div>
            <div className="help-sub">{subtitle}</div>
          </div>
          <Link to={ROUTES.userSupportTickets} className="help-btn">
            + New Ticket
          </Link>
        </div>

        <div className="help-grid">
          <div className="help-panel">
            <div className="help-item">
              <div className="help-item-title">Open tickets</div>
              <div className="help-item-sub">Use the Tickets page to view open and closed items.</div>
            </div>
            <div className="help-item">
              <div className="help-item-title">Popular support areas</div>
              <div className="help-item-sub">Payroll, access requests, system issues, and onboarding help.</div>
            </div>
            <div className="help-item">
              <div className="help-item-title">Knowledge articles</div>
              <div className="help-item-sub">Search the knowledge base for common HRMS questions.</div>
            </div>
          </div>

          <div className="help-panel">
            <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 12 }}>Quick Links</div>
            <div className="help-box" style={{ marginBottom: 10 }}>
              Open the ticket board and review your queue.
            </div>
            <div className="help-box" style={{ marginBottom: 10 }}>
              Check ticket updates and agent responses.
            </div>
            <div className="help-box">Browse help articles and FAQs.</div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
