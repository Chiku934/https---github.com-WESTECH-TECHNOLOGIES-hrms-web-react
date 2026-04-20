import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/Icon';

function normalizeOptionValue(option) {
  if (option && typeof option === 'object') {
    return option.value ?? option.id ?? option.key ?? option.code ?? option.label ?? option.fullName ?? option.name ?? option.title ?? '';
  }

  return option ?? '';
}

function normalizeOptionLabel(option) {
  if (option && typeof option === 'object') {
    return option.label ?? option.fullName ?? option.name ?? option.title ?? option.id ?? option.value ?? '';
  }

  return option ?? '';
}

export function UserSetupSectionCard({ title, description, actions, children, className = '' }) {
  return (
    <section className={`dashboard-card user-setup-card ${className}`.trim()}>
      {(title || description || actions) && (
        <div className="user-setup-card-header">
          <div>
            {title ? <div className="dashboard-card-title">{title}</div> : null}
            {description ? <p className="user-setup-card-description">{description}</p> : null}
          </div>
          {actions ? <div className="user-setup-card-actions">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

export function UserSetupField({ label, children, hint, error, className = '', required = true }) {
  return (
    <label className={`user-setup-field ${required ? 'is-required' : 'is-optional'} ${className} ${error ? 'has-error' : ''}`.trim()}>
      <span>{label}</span>
      {children}
      {error ? <small className="user-setup-error">{error}</small> : hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function UserSetupSelect({ label, value, onChange, options, hint, error, className = '', required = true }) {
  return (
    <UserSetupField label={label} hint={hint} error={error} className={className} required={required}>
      <select value={value} onChange={onChange}>
        {options.map((option, index) => {
          const optionValue = normalizeOptionValue(option);
          return (
            <option key={`${String(optionValue)}-${index}`} value={String(optionValue)}>
              {String(normalizeOptionLabel(option))}
            </option>
          );
        })}
      </select>
    </UserSetupField>
  );
}

export function UserSetupTextArea({ label, value, onChange, hint, error, rows = 3, className = '', required = true }) {
  return (
    <UserSetupField label={label} hint={hint} error={error} className={className} required={required}>
      <textarea value={value} onChange={onChange} rows={rows} />
    </UserSetupField>
  );
}

export function UserSetupTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="user-setup-tabs" role="tablist" aria-label="User setup tabs">
      {tabs.map((tab) => (
        tab.to ? (
          <Link
            key={tab.key}
            to={tab.to}
            className={`user-setup-tab ${activeTab === tab.key ? 'active' : ''} ${tab.disabled ? 'is-disabled' : ''}`.trim()}
            aria-current={activeTab === tab.key ? 'page' : undefined}
            aria-disabled={tab.disabled ? 'true' : 'false'}
            onClick={(event) => {
              if (tab.disabled) {
                event.preventDefault();
              }
            }}
          >
            {tab.label}
          </Link>
        ) : (
          <button
            key={tab.key}
            type="button"
            className={`user-setup-tab ${activeTab === tab.key ? 'active' : ''} ${tab.disabled ? 'is-disabled' : ''}`.trim()}
            onClick={() => {
              if (!tab.disabled) {
                onChange(tab.key);
              }
            }}
            disabled={tab.disabled}
            aria-disabled={tab.disabled ? 'true' : 'false'}
          >
            {tab.label}
          </button>
        )
      ))}
    </div>
  );
}

export function UserSetupEmptyState({ title, description, action }) {
  return (
    <div className="user-setup-empty-state">
      <strong>{title}</strong>
      <span>{description}</span>
      {action ? <div className="user-setup-empty-state-action">{action}</div> : null}
    </div>
  );
}

export function UserSetupStatusChip({ value }) {
  const tone = String(value).toLowerCase() === 'active'
    ? 'tone-active'
    : String(value).toLowerCase() === 'pending'
      ? 'tone-pending'
      : 'tone-inactive';

  return <span className={`role-status-chip ${tone}`}>{value}</span>;
}

export function UserSetupModal({ title, onClose, children, footer, kicker = 'Frontend Demo' }) {
  return (
    <div className="user-setup-modal-backdrop" onClick={onClose} role="presentation">
      <div className="user-setup-modal" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="user-setup-modal-header">
          <div>
            <div className="user-setup-modal-kicker">{kicker}</div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="user-setup-modal-close" onClick={onClose} aria-label="Close dialog">
            &times;
          </button>
        </div>
        <div className="user-setup-modal-body">{children}</div>
        {footer ? <div className="user-setup-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export function UserSetupActionButton({ icon, label, onClick, tone = 'default', type = 'button' }) {
  return (
    <button type={type} className={`user-setup-action-button tone-${tone}`} onClick={onClick}>
      {icon ? <Icon name={icon} size={12} /> : null}
      <span>{label}</span>
    </button>
  );
}
