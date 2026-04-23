import React from 'react';
import Icon from '../../../../components/Icon';

export default function CommentPanel({ title = 'Comments', subtitle = 'Notes attached to the selected timesheet.', children }) {
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
          <Icon name="comments" size={24} />
          <strong>No comments yet</strong>
          <span>Leave a note on the weekly entry or approval item.</span>
        </div>
      )}
    </section>
  );
}
