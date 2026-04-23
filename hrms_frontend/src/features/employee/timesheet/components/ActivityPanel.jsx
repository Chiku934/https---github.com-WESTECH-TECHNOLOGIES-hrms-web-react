import React from 'react';
import Icon from '../../../../components/Icon';

export default function ActivityPanel({ title = 'Activity', subtitle = 'Recent timesheet actions and audit trail.', children }) {
  return (
    <section className="timesheet-card">
      <div className="timesheet-card-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {children ? (
        <div className="timesheet-panel-content">{children}</div>
      ) : (
        <div className="timesheet-side-panel-empty">
          <Icon name="ghost" size={24} />
          <strong>No activity found</strong>
          <span>Approvals, edits, and resubmissions will appear here.</span>
        </div>
      )}
    </section>
  );
}
