import React from 'react';
import Icon from '../../../../components/Icon';

export default function WeekNavigator({ period, onPrev, onNext }) {
  return (
    <div className="timesheet-week-nav">
      <button type="button" className="timesheet-icon-button" onClick={onPrev} aria-label="Previous week">
        <Icon name="chevron-left" size={12} />
      </button>
      <div className="timesheet-week-pill">
        <strong>{period.label}</strong>
        <span>{period.status}</span>
      </div>
      <button type="button" className="timesheet-icon-button" onClick={onNext} aria-label="Next week">
        <Icon name="chevron-right" size={12} />
      </button>
      <div className="timesheet-week-note">{period.subtitle}</div>
    </div>
  );
}
