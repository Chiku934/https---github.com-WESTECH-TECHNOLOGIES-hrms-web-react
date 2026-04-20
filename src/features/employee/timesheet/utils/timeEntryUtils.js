export function minutesToLabel(totalMinutes) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}`;
}

export function parseTimeLabel(value) {
  const [hoursPart = '0', minutesPart = '0'] = String(value || '0:00').split(':');
  const hours = Number.parseInt(hoursPart, 10);
  const minutes = Number.parseInt(minutesPart, 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

export function sumTimeLabels(values) {
  return minutesToLabel(values.reduce((total, value) => total + parseTimeLabel(value), 0));
}

export function buildEmptyTimesheetRow(id = `ts-${String(Date.now()).slice(-6)}`) {
  return {
    id,
    project: '',
    task: '',
    billable: 'Billable',
    status: 'Draft',
    hours: ['0:00', '0:00', '0:00', '0:00', '0:00', '0:00', '0:00'],
    comment: '',
    attachmentCount: 0,
  };
}
