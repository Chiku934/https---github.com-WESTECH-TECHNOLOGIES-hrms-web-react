import React from 'react';
import Icon from '../../../../components/Icon';

export default function TimesheetGridActionsCell({ data, actions = [] }) {
  if (!data) return null;

  return (
    <div className="timesheet-grid-actions">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={`timesheet-grid-icon-button ${action.tone || ''}`.trim()}
          onClick={() => action.onClick?.(data)}
          aria-label={action.label}
        >
          <Icon name={action.icon} size={13} />
        </button>
      ))}
    </div>
  );
}
