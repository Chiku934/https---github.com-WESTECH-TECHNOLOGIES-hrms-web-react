import React from 'react';

export default function ActionToolbar({ children, className = '' }) {
  return <div className={`timesheet-toolbar-actions ${className}`.trim()}>{children}</div>;
}
