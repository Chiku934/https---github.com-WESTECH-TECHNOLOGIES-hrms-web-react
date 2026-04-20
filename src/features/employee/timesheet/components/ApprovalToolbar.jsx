import React from 'react';
import ActionToolbar from './ActionToolbar';

export default function ApprovalToolbar({ children, search, onSearchChange }) {
  return (
    <div className="timesheet-approval-toolbar">
      <div className="timesheet-approval-toolbar-search">
        <span>Search</span>
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search employee, project, week" />
      </div>
      <ActionToolbar>{children}</ActionToolbar>
    </div>
  );
}
