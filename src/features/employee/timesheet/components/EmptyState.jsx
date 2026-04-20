import React from 'react';
import Icon from '../../../../components/Icon';

export default function EmptyState({ title, subtitle, actionLabel, onAction, icon = 'ghost' }) {
  return (
    <div className="timesheet-empty-state">
      <Icon name={icon} size={28} />
      <strong>{title}</strong>
      <span>{subtitle}</span>
      {actionLabel ? (
        <button type="button" className="timesheet-secondary-button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
