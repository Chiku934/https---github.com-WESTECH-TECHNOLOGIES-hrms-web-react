import React from 'react';
import { UserSetupActionButton, UserSetupStatusChip } from './UserSetupComponents';

export default function UserSetupUserTable({ rows, selectedId, onView, onEdit, onDelete }) {
  return (
    <table className="user-setup-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Email</th>
          <th>Code</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((item) => (
            <tr key={item.id} className={selectedId === item.id ? 'user-setup-row active' : 'user-setup-row'}>
              <td>
                <div className="user-setup-user-cell">
                  <strong>{item.fullName}</strong>
                  <span>{item.userName}</span>
                </div>
              </td>
              <td>{item.email}</td>
              <td>{item.empCode || '-'}</td>
              <td>
                <span className="user-setup-role-chip">{item.role}</span>
              </td>
              <td>
                <UserSetupStatusChip value={item.status} />
              </td>
              <td>
                <div className="user-setup-actions">
                  <UserSetupActionButton label="View" onClick={() => onView(item)} />
                  <UserSetupActionButton label="Edit" onClick={() => onEdit(item)} />
                  <UserSetupActionButton label="Delete" onClick={() => onDelete(item)} tone="danger" />
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6}>
              <div className="user-setup-empty-state">No users found for this filter.</div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
