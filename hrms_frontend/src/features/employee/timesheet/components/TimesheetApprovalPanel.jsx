import React from 'react';
import { isPayrollProcessedStatus, isPayrollReadyStatus } from '../../../../data/payrollHandoff';
import StatusBadge from './StatusBadge';
import WorkflowStepper from './WorkflowStepper';

export default function TimesheetApprovalPanel({
  mode = 'manager',
  selectedItem,
  auditTrail = [],
  selectedCount = 0,
  onBulkApprove,
  onApprove,
  onReject,
  onSendToPayroll,
  onViewInPayroll,
  onCommentChange,
  comment = '',
  readOnly = false,
}) {
  const isHRMode = mode === 'hr';
  const status = String(selectedItem?.status || '');
  const isPayrollReady = isPayrollReadyStatus(status);
  const isPayrollProcessed = isPayrollProcessedStatus(status);
  const managerActionLocked = isPayrollReady || isPayrollProcessed;
  const finalApproveLocked = isPayrollProcessed || (isHRMode ? status !== 'Manager Approved' : status !== 'Submitted');

  return (
    <div className="timesheet-approval-panel">
      <div className="timesheet-approval-panel-head">
        <div>
          <strong>{isHRMode ? 'HR Final Approval' : 'Manager Review'}</strong>
          <span>{isHRMode ? 'Finalize manager-approved timesheets and bulk close the queue.' : 'Approve or reject submitted records with comments.'}</span>
        </div>
        <StatusBadge value={selectedItem?.status || 'No selection'} />
      </div>

      {selectedItem ? (
        <>
          <WorkflowStepper status={selectedItem.status} note={selectedItem.comment || selectedItem.reviewComment || selectedItem.managerComment} />
          <div className="timesheet-approval-panel-summary">
            <div><span>Employee</span><strong>{selectedItem.employee || selectedItem.submittedBy || 'Employee'}</strong></div>
            <div><span>Project</span><strong>{selectedItem.project}</strong></div>
            <div><span>Week</span><strong>{selectedItem.week}</strong></div>
            <div><span>Queued</span><strong>{selectedCount} selected</strong></div>
          </div>
          {isHRMode ? (
            <div className="timesheet-approval-panel-indicator tone-violet">
              <strong>{isPayrollReady ? 'Payroll Ready' : isPayrollProcessed ? 'Payroll processed' : 'Awaiting HR final approval'}</strong>
              <span>{isPayrollReady ? 'This record can now be opened in Payroll for processing.' : 'HR approval unlocks the payroll handoff step.'}</span>
            </div>
          ) : null}
          {!readOnly ? (
            <>
              <label className="timesheet-form-field">
                <span>Comment</span>
                <textarea value={comment} onChange={(event) => onCommentChange?.(event.target.value)} placeholder={isHRMode ? 'Add a final approval note.' : 'Explain the approval or rejection reason.'} />
              </label>
              <div className="timesheet-approval-panel-actions">
                {isHRMode ? (
                  <>
                    <button type="button" className="timesheet-secondary-button" onClick={onBulkApprove} disabled={!selectedCount || isPayrollProcessed}>Bulk Approve</button>
                    <button type="button" className="timesheet-primary-button" onClick={onApprove} disabled={finalApproveLocked}>Final Approve</button>
                    <button type="button" className="timesheet-secondary-button" onClick={onSendToPayroll} disabled={!isPayrollReady || isPayrollProcessed}>Send to Payroll</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="timesheet-secondary-button" onClick={onReject} disabled={managerActionLocked}>Reject</button>
                    <button type="button" className="timesheet-primary-button" onClick={onApprove} disabled={managerActionLocked}>Approve</button>
                  </>
                )}
              </div>
            </>
          ) : null}
          {onViewInPayroll ? (
            <div className="timesheet-approval-panel-actions">
              <button type="button" className="timesheet-secondary-button" onClick={onViewInPayroll}>
                View in Payroll
              </button>
            </div>
          ) : null}
          {auditTrail.length ? (
            <div className="timesheet-audit-trail">
              <strong>Audit Trail</strong>
              {auditTrail.map((entry) => (
                <article key={entry.id} className="timesheet-audit-item">
                  <div>
                    <span>{entry.action}</span>
                    <small>{entry.time}</small>
                  </div>
                  <p>{entry.note}</p>
                  <em>{entry.actor}</em>
                </article>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="timesheet-approval-empty">
          <strong>No timesheet selected</strong>
          <span>Select a row from the queue to review details, comment, and approve.</span>
        </div>
      )}
    </div>
  );
}
