import React, { useMemo } from 'react';
import TimesheetStatusChip from './TimesheetStatusChip';
import { sumTimeLabels } from '../utils/timeEntryUtils';
import { isTimesheetEditable } from '../data/workflow';

const dayKeys = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

export default function WeeklyEntryGrid({
  rows,
  projectOptions,
  taskOptions,
  onChangeRow,
  onRemoveRow,
  onAddRow,
  onCopyLastWeek,
}) {
  const dayTotals = useMemo(
    () => dayKeys.map(({ key }, index) => sumTimeLabels(rows.map((row) => row.hours[index] || '0:00'))),
    [rows],
  );

  const grandTotal = useMemo(
    () => sumTimeLabels(rows.flatMap((row) => row.hours)),
    [rows],
  );

  if (!rows.length) {
    return (
      <div className="timesheet-empty-state timesheet-empty-state--grid">
        <strong>No weekly entries yet</strong>
        <span>Add a project row or copy the last week to begin logging time.</span>
        <div className="timesheet-empty-state-actions">
          <button type="button" className="timesheet-primary-button" onClick={onAddRow}>Add First Row</button>
          <button type="button" className="timesheet-secondary-button" onClick={onCopyLastWeek}>Copy Last Week</button>
        </div>
      </div>
    );
  }

  return (
    <div className="timesheet-week-grid-shell">
      <table className="timesheet-week-grid">
        <thead>
          <tr>
            <th className="col-project">Project</th>
            <th className="col-task">Task</th>
            <th className="col-billable">Type</th>
            {dayKeys.map((day) => <th key={day.key}>{day.label}</th>)}
            <th className="col-total">Total</th>
            <th className="col-status">Status</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const total = sumTimeLabels(row.hours);
            const editable = isTimesheetEditable(row.status);
            return (
              <tr key={row.id} className={editable ? '' : 'timesheet-row-locked'}>
                <td>
                  <select value={row.project} onChange={(event) => onChangeRow(row.id, 'project', event.target.value)} disabled={!editable}>
                    <option value="">Select project</option>
                    {projectOptions.map((project) => <option key={project} value={project}>{project}</option>)}
                  </select>
                </td>
                <td>
                  <select value={row.task} onChange={(event) => onChangeRow(row.id, 'task', event.target.value)} disabled={!editable}>
                    <option value="">Select task</option>
                    {(taskOptions[row.project] || []).map((task) => <option key={task} value={task}>{task}</option>)}
                  </select>
                </td>
                <td>
                  <button
                    type="button"
                    className={`timesheet-billable-pill ${row.billable === 'Billable' ? 'billable' : 'nonbillable'}`}
                    onClick={() => onChangeRow(row.id, 'billable', row.billable === 'Billable' ? 'Non-billable' : 'Billable')}
                    disabled={!editable}
                  >
                    {row.billable}
                  </button>
                </td>
                {row.hours.map((value, index) => (
                  <td key={`${row.id}-${dayKeys[index].key}`}>
                    <input
                      value={value}
                      onChange={(event) => onChangeRow(row.id, 'hour', event.target.value, index)}
                      inputMode="numeric"
                      placeholder="0:00"
                      disabled={!editable}
                    />
                  </td>
                ))}
                <td className="col-total">
                  <strong>{total}</strong>
                </td>
                <td className="col-status">
                  <TimesheetStatusChip value={row.status} />
                </td>
                <td className="col-actions">
                  <div className="timesheet-row-actions">
                    <button type="button" className="timesheet-row-action" onClick={() => onRemoveRow(row.id)} aria-label="Remove row" disabled={!editable}>
                      -
                    </button>
                    <button type="button" className="timesheet-row-action" onClick={() => onAddRow(row.id)} aria-label="Duplicate row" disabled={!editable}>
                      +
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}><strong>Total hours/day</strong></td>
            {dayTotals.map((total, index) => <td key={`total-${dayKeys[index].key}`}><strong>{total}</strong></td>)}
            <td><strong>{grandTotal}</strong></td>
            <td />
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
