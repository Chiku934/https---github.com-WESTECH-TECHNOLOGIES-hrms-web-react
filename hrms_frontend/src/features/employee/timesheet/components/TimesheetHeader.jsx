import React from 'react';

export default function TimesheetHeader({ activeLabel, currentWeek, title, description, workflowStatus, workflowNote }) {
  return (
    <header className="timesheet-hero">
      <div className="timesheet-hero-copy">
        <div className="timesheet-kicker">Employee Timesheet</div>
        <h1>{title || activeLabel}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="timesheet-hero-meta">
        <div className="timesheet-hero-pill">
          <span>Week</span>
          <strong>{currentWeek.label}</strong>
        </div>
        <div className="timesheet-hero-pill">
          <span>Status</span>
          <strong>{currentWeek.status}</strong>
        </div>
        {workflowStatus ? (
          <div className="timesheet-hero-pill">
            <span>Workflow</span>
            <strong>{workflowStatus}</strong>
            {workflowNote ? <small className="timesheet-hero-pill-note">{workflowNote}</small> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
