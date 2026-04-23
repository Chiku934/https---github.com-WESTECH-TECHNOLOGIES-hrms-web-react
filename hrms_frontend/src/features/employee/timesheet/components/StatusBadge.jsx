import React from 'react';
import { getTimesheetStatusMeta } from '../data/workflow';

export default function StatusBadge({ value, tone, className = '' }) {
  const meta = getTimesheetStatusMeta(value);
  const resolvedTone = tone || meta.tone;

  return (
    <span className={`timesheet-chip tone-${resolvedTone} timesheet-status-badge ${className}`.trim()}>
      <span className={`timesheet-status-badge-dot tone-${resolvedTone}`} aria-hidden="true" />
      {meta.label || value}
    </span>
  );
}
