import React from 'react';

export function SummaryCard({ metric }) {
  return (
    <div className={`timesheet-kpi-card tone-${metric.tone}`}>
      <span>{metric.label}</span>
      <strong>{metric.value}</strong>
      <small>{metric.note}</small>
    </div>
  );
}

export default function SummaryCards({ metrics, compact = false }) {
  return (
    <div className={`timesheet-kpi-grid ${compact ? 'compact' : ''}`.trim()}>
      {metrics.map((metric) => (
        <SummaryCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
