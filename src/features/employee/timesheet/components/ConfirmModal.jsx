import React from 'react';
import Icon from '../../../../components/Icon';

export default function ConfirmModal({ title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'primary', onConfirm, onCancel, children }) {
  return (
    <div className="timesheet-modal-backdrop" onClick={onCancel} role="presentation">
      <div className="timesheet-modal" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="timesheet-modal-head">
          <div>
            <div className="timesheet-modal-kicker">Timesheet</div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="timesheet-modal-close" onClick={onCancel} aria-label="Close dialog">
            <Icon name="circle-xmark" size={14} />
          </button>
        </div>
        {description ? <p className="timesheet-modal-description">{description}</p> : null}
        {children ? <div className="timesheet-modal-body">{children}</div> : null}
        <div className="timesheet-modal-footer">
          <button type="button" className="timesheet-secondary-button" onClick={onCancel}>{cancelLabel}</button>
          <button type="button" className={`timesheet-primary-button tone-${tone}`.trim()} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
