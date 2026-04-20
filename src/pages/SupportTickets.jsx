import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

const columnsByView = {
  my: ['Ticket Number', 'Title', 'Raised On', 'Priority', 'Category', 'Assigned To', 'Ticket Status', 'Last Updated'],
  following: ['Ticket Number', 'Title', 'Ticket Raised By', 'Raised On', 'Priority', 'Category', 'Assigned To', 'Ticket Status', 'Last Updated'],
};

export default function SupportTickets() {
  const [params] = useSearchParams();
  const view = params.get('view') === 'following' ? 'following' : 'my';
  const pageTitle = view === 'following' ? 'Following Tickets' : 'My Tickets';
  const pageIntro =
    view === 'following'
      ? 'These are the open tickets in which you are added as follower.'
      : 'These are your tickets that are yet to be addressed.';
  const openColumns = columnsByView[view];
  const openColspan = openColumns.length;

  return (
    <MainLayout activeKey="user-support" moduleActiveKey="user-support" moduleNavItems={moduleNavItems}>
      <div className="ticket-page">
        <div className="ticket-section">
          <div className="ticket-head">
            <div>
              <div className="ticket-title">{pageTitle}</div>
            </div>
          </div>

          <div className="ticket-inner-tabs">
            <Link to={`${ROUTES.userSupportTickets}?view=my`} className={`ticket-inner-tab${view === 'my' ? ' active' : ''}`}>
              My Tickets
            </Link>
            <Link to={`${ROUTES.userSupportTickets}?view=following`} className={`ticket-inner-tab${view === 'following' ? ' active' : ''}`}>
              Following
            </Link>
          </div>

          <div className="ticket-card">
            <div className="ticket-card-head">
              <div>
                <div className="ticket-card-title">Open Tickets</div>
                <div className="ticket-card-meta">{pageIntro}</div>
              </div>
              <Link to={ROUTES.userSupportTickets} className="ticket-btn">
                + New Ticket
              </Link>
            </div>
            <div className="ticket-toolbar">
              <div />
              <div className="ticket-toolbar-right">
                <input className="ticket-input" type="text" placeholder="Search" />
                <select className="ticket-select" defaultValue="Last 3 months">
                  <option>Last 3 months</option>
                  <option>Last 7 days</option>
                  <option>This month</option>
                </select>
              </div>
            </div>
            <div className="ticket-table-wrap">
              <table className="ticket-table">
                <thead>
                  <tr>
                    {openColumns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="empty-row">
                    <td colSpan={openColspan}>No records found</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="ticket-footer">
              <span>0 to 0 of 0</span>
              <span>Page 0 of 0</span>
            </div>
          </div>

          <div className="ticket-card">
            <div className="ticket-card-head">
              <div>
                <div className="ticket-card-title">Closed Tickets</div>
                <div className="ticket-card-meta">
                  {view === 'following' ? 'These are the closed tickets you are following.' : 'These are your tickets that have been addressed.'}
                </div>
              </div>
            </div>
            <div className="ticket-toolbar">
              <div />
              <div className="ticket-toolbar-right">
                <input className="ticket-input" type="text" placeholder="Search" />
                <select className="ticket-select" defaultValue="Last 3 months">
                  <option>Last 3 months</option>
                  <option>Last 7 days</option>
                  <option>This month</option>
                </select>
              </div>
            </div>
            <div className="ticket-table-wrap">
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Ticket Number</th>
                    <th>Title</th>
                    <th>Raised On</th>
                    <th>Priority</th>
                    <th>Category</th>
                    <th>Closed By</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="empty-row">
                    <td colSpan={7}>No records found</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="ticket-footer">
              <span>0 to 0 of 0</span>
              <span>Page 0 of 0</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
