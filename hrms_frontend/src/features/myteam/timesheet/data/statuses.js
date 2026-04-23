export const timesheetStatuses = {
  approval: ['Draft', 'Submitted', 'Manager Approved', 'Payroll Ready', 'Payroll Processed', 'Rejected', 'Overdue', 'Changes Requested'],
  summary: ['Draft', 'Submitted', 'Manager Approved', 'Payroll Ready', 'Payroll Processed', 'Rejected', 'Overdue', 'Changes Requested'],
  exception: ['Overdue', 'Rejected', 'Partial', 'Missing'],
  scope: ['All Scope', 'Direct Reports', 'Indirect Reports'],
};

export function statusTone(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('payroll ready') || normalized.includes('hr approved') || normalized.includes('approved')) return 'green';
  if (normalized.includes('payroll processed') || normalized.includes('sent to payroll')) return 'violet';
  if (normalized.includes('manager approved') || normalized.includes('pending') || normalized.includes('submitted')) return 'amber';
  if (normalized.includes('rejected') || normalized.includes('overdue')) return 'red';
  if (normalized.includes('changes')) return 'blue';
  if (normalized.includes('partial')) return 'violet';
  if (normalized.includes('missing')) return 'slate';
  return 'slate';
}
