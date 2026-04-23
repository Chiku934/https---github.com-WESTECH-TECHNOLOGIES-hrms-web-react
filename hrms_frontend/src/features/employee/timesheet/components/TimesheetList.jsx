import React from 'react';
import Icon from '../../../../components/Icon';
import StatusBadge from './StatusBadge';
import WorkflowStepper from './WorkflowStepper';

export default function TimesheetList({
  items = [],
  selectedId,
  onSelect,
  onCreate,
  emptyTitle = 'No timesheets yet',
  emptySubtitle = 'Create a draft to begin the workflow.',
}) {
  if (!items.length) {
    return (
      <div className="timesheet-list-empty">
        <Icon name="clipboard" size={26} />
        <strong>{emptyTitle}</strong>
        <span>{emptySubtitle}</span>
        {onCreate ? <button type="button" className="timesheet-primary-button" onClick={onCreate}>Create Timesheet</button> : null}
      </div>
    );
  }

  return (
    <div className="timesheet-list">
      <div className="timesheet-list-head">
        <div>
          <strong>Timesheets</strong>
          <span>Track status, approvals, and comments in one place.</span>
        </div>
        {onCreate ? <button type="button" className="timesheet-secondary-button" onClick={onCreate}>New Draft</button> : null}
      </div>
      <div className="timesheet-list-items">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`timesheet-list-item ${selectedId === item.id ? 'active' : ''}`}
            onClick={() => onSelect?.(item)}
          >
            <div className="timesheet-list-item-head">
              <div>
                <strong>{item.project}</strong>
                <span>{item.week}</span>
              </div>
              <StatusBadge value={item.status} />
            </div>
            <div className="timesheet-list-item-meta">
              <span>{item.task}</span>
              <span>{item.billable}</span>
            </div>
            <WorkflowStepper status={item.status} note={item.comment || item.reviewComment || item.managerComment} compact />
          </button>
        ))}
      </div>
    </div>
  );
}
