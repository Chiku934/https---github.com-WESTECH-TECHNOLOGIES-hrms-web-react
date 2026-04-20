import React from 'react';

export default function ToastStack({ items = [] }) {
  return (
    <div className="timesheet-toast-stack" aria-live="polite" aria-atomic="true">
      {items.map((item) => (
        <div key={item.id} className={`timesheet-toast tone-${item.tone || 'slate'}`}>
          <strong>{item.title}</strong>
          {item.message ? <span>{item.message}</span> : null}
        </div>
      ))}
    </div>
  );
}
