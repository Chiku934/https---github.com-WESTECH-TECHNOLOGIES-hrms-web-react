export function getStatusTone(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('approved') || normalized.includes('completed')) return 'green';
  if (normalized.includes('pending') || normalized.includes('submitted') || normalized.includes('review')) return 'amber';
  if (normalized.includes('rejected') || normalized.includes('overdue') || normalized.includes('returned')) return 'red';
  if (normalized.includes('draft') || normalized.includes('saved')) return 'slate';
  if (normalized.includes('locked') || normalized.includes('payroll')) return 'violet';
  return 'blue';
}
