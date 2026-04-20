import React from 'react';

export default function TimesheetGridEmptyOverlay({ title, subtitle }) {
  return (
    <div className="timesheet-grid-empty">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}
