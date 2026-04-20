import React from 'react';
import Icon from '../../../../components/Icon';

export default function AttachmentPanel({ count = 0 }) {
  return (
    <section className="timesheet-card">
      <div className="timesheet-card-head">
        <div>
          <h2>Attachments</h2>
          <p>Upload supporting files or receipts for the selected week.</p>
        </div>
      </div>
      <div className="timesheet-side-panel-empty">
        <Icon name="paperclip" size={24} />
        <strong>{count ? `${count} file${count === 1 ? '' : 's'} attached` : 'No attachments yet'}</strong>
        <span>Use this area later for receipts, supporting docs, or exported work logs.</span>
        <button type="button" className="timesheet-secondary-button">Attach File</button>
      </div>
    </section>
  );
}
