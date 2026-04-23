import React from 'react';
import { UserSetupActionButton, UserSetupEmptyState, UserSetupStatusChip } from './UserSetupComponents';

export function UserSetupDocumentList({ rows, onEdit, onDelete, emptyLabel = 'No documents found.' }) {
  if (!rows.length) {
    return <UserSetupEmptyState title="No documents" description={emptyLabel} />;
  }

  return (
    <div className="user-setup-record-list">
      {rows.map((row) => (
        <div key={row.id} className="user-setup-record-row">
          <div>
            <strong>{row.docName}</strong>
            <span>
              {row.documentType} · {row.date || 'No date'}
            </span>
          </div>
          <div className="user-setup-record-actions">
            <UserSetupStatusChip value={row.status} />
            <UserSetupActionButton label="Edit" onClick={() => onEdit(row)} />
            <UserSetupActionButton label="Delete" onClick={() => onDelete(row)} tone="danger" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function UserSetupAddressList({ rows, onEdit, onDelete, emptyLabel = 'No addresses found.' }) {
  if (!rows.length) {
    return <UserSetupEmptyState title="No addresses" description={emptyLabel} />;
  }

  return (
    <div className="user-setup-record-list">
      {rows.map((row) => (
        <div key={row.id} className="user-setup-record-row">
          <div>
            <strong>{row.address1}</strong>
            <span>
              {row.address2 || 'No secondary line'} · {row.pin}
            </span>
          </div>
          <div className="user-setup-record-actions">
            <span className="user-setup-role-chip">{row.addressType}</span>
            <UserSetupActionButton label="Edit" onClick={() => onEdit(row)} />
            <UserSetupActionButton label="Delete" onClick={() => onDelete(row)} tone="danger" />
          </div>
        </div>
      ))}
    </div>
  );
}
