import React from 'react';
import { UserSetupField, UserSetupSelect, UserSetupTextArea } from './UserSetupComponents';

export function UserSetupFieldGroup({
  title,
  description,
  items,
  errors,
  onChange,
  typeMap = {},
  headerRight = null,
  columns = 4,
  className = '',
}) {
  return (
    <div className={`user-setup-form-section${headerRight ? ' has-header-extra' : ''} ${className}`.trim()}>
      <div className="user-setup-form-section-header">
        <div className="user-setup-form-section-copy">
          <h4>{title}</h4>
          {description ? <p>{description}</p> : null}
        </div>
        {headerRight ? <div className="user-setup-form-section-extra">{headerRight}</div> : null}
      </div>
      <div className="user-setup-form-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          if (item.options) {
            return (
              <UserSetupSelect
                key={item.key}
                label={item.label}
                value={item.value}
                onChange={(event) => onChange(item.key, event.target.value)}
                options={item.options}
                hint={item.hint}
                error={errors[item.key]}
                className={item.span || ''}
              />
            );
          }

          if (item.type === 'textarea') {
            return (
              <UserSetupTextArea
                key={item.key}
                label={item.label}
                value={item.value}
                onChange={(event) => onChange(item.key, event.target.value)}
                hint={item.hint}
                error={errors[item.key]}
                rows={item.rows || 3}
                className={item.span || ''}
              />
            );
          }

          if (item.type === 'file') {
            return (
              <UserSetupField key={item.key} label={item.label} hint={item.hint} error={errors[item.key]} className={item.span || ''}>
                <input
                  type="file"
                  accept={item.accept || 'image/*'}
                  onChange={(event) => onChange(item.key, event.target.files?.[0] || null)}
                />
              </UserSetupField>
            );
          }

          return (
            <UserSetupField key={item.key} label={item.label} hint={item.hint} error={errors[item.key]} className={item.span || ''}>
              <input
                value={item.value}
                onChange={(event) => onChange(item.key, item.numeric ? event.target.value.replace(/\D/g, '').slice(0, item.maxLength || 10) : event.target.value)}
                placeholder={item.placeholder || `Enter ${item.label}`}
                type={typeMap[item.key] || item.type || 'text'}
                inputMode={item.inputMode}
                maxLength={item.maxLength}
                pattern={item.pattern}
                autoComplete={item.autoComplete}
              />
            </UserSetupField>
          );
        })}
      </div>
    </div>
  );
}
