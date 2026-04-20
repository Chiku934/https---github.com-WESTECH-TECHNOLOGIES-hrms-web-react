import React from 'react';

export default function TimesheetTableWrapper({ columns, rows, renderRow, caption, minWidth = 980 }) {
  return (
    <div className="timesheet-grid-shell">
      <table className="timesheet-preview-table" style={{ minWidth }} aria-label={caption || 'Timesheet table'}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => renderRow(row))}
        </tbody>
      </table>
    </div>
  );
}
