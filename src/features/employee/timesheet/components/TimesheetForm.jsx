import React from 'react';
import StatusBadge from './StatusBadge';
import WorkflowStepper from './WorkflowStepper';
import { sumTimeLabels } from '../utils/timeEntryUtils';

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TimesheetForm({
  value,
  projectOptions = [],
  taskOptions = {},
  editable = true,
  onChange,
  onSaveDraft,
  onSubmit,
  onReject,
  onDelete,
}) {
  if (!value) {
    return (
      <div className="timesheet-form-empty">
        <strong>Select a timesheet</strong>
        <span>Pick a draft or rejected record to edit, or create a new one from the list.</span>
      </div>
    );
  }

  const total = sumTimeLabels(value.hours || []);

  return (
    <div className="timesheet-form">
      <div className="timesheet-form-head">
        <div>
          <strong>{value.project || 'Untitled timesheet'}</strong>
          <span>{value.week}</span>
        </div>
        <StatusBadge value={value.status} />
      </div>

      <WorkflowStepper status={value.status} note={value.comment || value.reviewComment || 'Use the buttons below to move the record forward.'} />

      <div className="timesheet-form-grid">
        <label className="timesheet-form-field">
          <span>Project</span>
          <select value={value.project} onChange={(event) => onChange('project', event.target.value)} disabled={!editable}>
            <option value="">Select project</option>
            {projectOptions.map((project) => <option key={project} value={project}>{project}</option>)}
          </select>
        </label>
        <label className="timesheet-form-field">
          <span>Task</span>
          <select value={value.task} onChange={(event) => onChange('task', event.target.value)} disabled={!editable}>
            <option value="">Select task</option>
            {(taskOptions[value.project] || []).map((task) => <option key={task} value={task}>{task}</option>)}
          </select>
        </label>
        <label className="timesheet-form-field">
          <span>Billable</span>
          <button type="button" className={`timesheet-billable-pill ${value.billable === 'Billable' ? 'billable' : 'nonbillable'}`} onClick={() => editable && onChange('billable', value.billable === 'Billable' ? 'Non-billable' : 'Billable')} disabled={!editable}>
            {value.billable}
          </button>
        </label>
      </div>

      <div className="timesheet-form-hours">
        {dayLabels.map((label, index) => (
          <label key={label} className="timesheet-form-field">
            <span>{label}</span>
            <input
              value={value.hours?.[index] || '0:00'}
              onChange={(event) => onChange('hour', event.target.value, index)}
              placeholder="0:00"
              disabled={!editable}
              inputMode="numeric"
            />
          </label>
        ))}
      </div>

      <label className="timesheet-form-field">
        <span>Comment</span>
        <textarea value={value.comment || ''} onChange={(event) => onChange('comment', event.target.value)} disabled={!editable} placeholder="Add context for manager or HR review." />
      </label>

      <div className="timesheet-form-footer">
        <div className="timesheet-form-total">
          <span>Total</span>
          <strong>{total}</strong>
        </div>
        <div className="timesheet-form-actions">
          <button type="button" className="timesheet-secondary-button" onClick={onSaveDraft} disabled={!editable}>Save Draft</button>
          <button type="button" className="timesheet-primary-button" onClick={onSubmit} disabled={!editable}>Submit Timesheet</button>
          {onReject ? <button type="button" className="timesheet-secondary-button" onClick={onReject}>Mark Rejected</button> : null}
          {onDelete ? <button type="button" className="timesheet-secondary-button" onClick={onDelete}>Delete Draft</button> : null}
        </div>
      </div>
    </div>
  );
}
