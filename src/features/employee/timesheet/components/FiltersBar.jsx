import React from 'react';

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="timesheet-toolbar-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default function FiltersBar({ filters, onChange }) {
  return (
    <div className="timesheet-toolbar-filters">
      {filters.map((filter) => (
        <FilterSelect
          key={filter.label}
          label={filter.label}
          value={filter.value}
          options={filter.options}
          onChange={(nextValue) => onChange(filter.key, nextValue)}
        />
      ))}
    </div>
  );
}
