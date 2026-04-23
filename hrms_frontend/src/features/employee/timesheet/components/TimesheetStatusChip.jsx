import React from 'react';
import { getStatusTone } from '../utils/timesheetUtils';

export default function TimesheetStatusChip({ value, tone }) {
  const resolvedTone = tone || getStatusTone(value);
  return <span className={`timesheet-chip tone-${resolvedTone}`}>{value}</span>;
}
