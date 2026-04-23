import React from 'react';
import { getTimesheetWorkflowSteps } from '../data/workflow';
import StatusBadge from './StatusBadge';

export default function WorkflowStepper({ status, note, compact = false }) {
  const steps = getTimesheetWorkflowSteps(status);

  return (
    <div className={`timesheet-workflow-stepper ${compact ? 'compact' : ''}`.trim()}>
      <div className="timesheet-workflow-stepper-head">
        <StatusBadge value={status} />
        {note ? <span>{note}</span> : null}
      </div>
      <ol className="timesheet-workflow-stepper-track">
        {steps.map((step) => (
          <li key={step.key} className={`timesheet-workflow-step ${step.state}`}>
            <span className="timesheet-workflow-step-dot" aria-hidden="true" />
            <div>
              <strong>{step.label}</strong>
              {!compact ? <small>{step.owner}</small> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
