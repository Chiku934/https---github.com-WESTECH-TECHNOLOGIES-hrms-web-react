import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import '../../super-admin/styles/packages.css';
import {
  hrAttendanceHighlights,
  hrAttendanceList,
  hrAttendanceMetrics,
  hrAttendanceModes,
  hrAttendanceQuickActions,
  hrAttendanceShifts,
  hrAttendanceStatuses,
} from '../data/attendanceData';

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'attendance', label: 'Attendance List' },
  { key: 'mark', label: 'Mark Attendance' },
];

const filters = ['All', ...hrAttendanceStatuses.slice(1)];
const emptyForm = {
  employee: '',
  employeeId: '',
  date: '',
  mode: 'Present',
  shift: 'General',
  checkIn: '',
  checkOut: '',
  status: 'Present',
  note: '',
};
const storageKey = 'hr_attendance';

function SmallCard({ title, children }) {
  return (
    <section className="dashboard-card superadmin-package-mini-card">
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

function StatBlock({ metric }) {
  return (
    <div className="superadmin-package-stat">
      <div className="superadmin-package-stat-label">{metric.label}</div>
      <div className="superadmin-package-stat-value">{metric.value}</div>
      <div className="superadmin-package-stat-change">{metric.change}</div>
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="superadmin-package-modal-backdrop" onClick={onClose} role="presentation">
      <div className="superadmin-package-modal" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="superadmin-package-modal-header">
          <div>
            <div className="superadmin-package-modal-kicker">HR</div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="superadmin-package-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="superadmin-package-modal-body">{children}</div>
        {footer ? <div className="superadmin-package-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function AttendanceRow({ item, onView, onEdit, onDelete, selected }) {
  return (
    <tr className={selected ? 'superadmin-package-row active' : 'superadmin-package-row'}>
      <td>
        <div className="superadmin-package-cell">
          <strong>{item.employee}</strong>
          <span>{item.employeeId}</span>
        </div>
      </td>
      <td>{item.date}</td>
      <td>{item.checkIn || '-'}</td>
      <td>{item.checkOut || '-'}</td>
      <td>{item.shift}</td>
      <td>
        <span className={`role-status-chip tone-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
      </td>
      <td>
        <div className="superadmin-package-actions">
          <button type="button" className="superadmin-package-action" onClick={() => onView(item)}>View</button>
          <button type="button" className="superadmin-package-action" onClick={() => onEdit(item)}>Edit</button>
          <button type="button" className="superadmin-package-action danger" onClick={() => onDelete(item)}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

function AttendanceForm({ formData, setFormData, onSubmit, submitLabel, errors = {} }) {
  return (
    <form className="superadmin-package-form-grid" onSubmit={onSubmit}>
      <label className="superadmin-package-form-field">
        <span>Employee</span>
        <input
          value={formData.employee}
          onChange={(event) => setFormData((current) => ({ ...current, employee: event.target.value }))}
          placeholder="Enter employee name"
        />
        {errors.employee ? <small className="superadmin-package-error">{errors.employee}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Date</span>
        <input type="date" value={formData.date} onChange={(event) => setFormData((current) => ({ ...current, date: event.target.value }))} />
        {errors.date ? <small className="superadmin-package-error">{errors.date}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Mode</span>
        <select value={formData.mode} onChange={(event) => setFormData((current) => ({ ...current, mode: event.target.value }))}>
          {hrAttendanceModes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Shift</span>
        <select value={formData.shift} onChange={(event) => setFormData((current) => ({ ...current, shift: event.target.value }))}>
          {hrAttendanceShifts.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="superadmin-package-form-field">
        <span>Check In</span>
        <input type="time" value={formData.checkIn} onChange={(event) => setFormData((current) => ({ ...current, checkIn: event.target.value }))} />
        {errors.checkIn ? <small className="superadmin-package-error">{errors.checkIn}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Check Out</span>
        <input type="time" value={formData.checkOut} onChange={(event) => setFormData((current) => ({ ...current, checkOut: event.target.value }))} />
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
          {hrAttendanceStatuses.slice(1).map((item) => <option key={item}>{item}</option>)}
        </select>
        {errors.status ? <small className="superadmin-package-error">{errors.status}</small> : null}
      </label>
      <label className="superadmin-package-form-field superadmin-project-wide-field">
        <span>Note</span>
        <textarea value={formData.note} onChange={(event) => setFormData((current) => ({ ...current, note: event.target.value }))} placeholder="Add a short note" />
      </label>
      <div className="superadmin-package-form-actions">
        <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
      </div>
    </form>
  );
}

function loadAttendance() {
  if (typeof window === 'undefined') return hrAttendanceList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return hrAttendanceList;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : hrAttendanceList;
  } catch {
    return hrAttendanceList;
  }
}

function saveAttendance(records) {
  if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, JSON.stringify(records));
}

export default function Attendance() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeAction, setActiveAction] = useState(hrAttendanceQuickActions[0].label);
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState(() => loadAttendance());
  const [selectedId, setSelectedId] = useState(loadAttendance()[0]?.id ?? null);
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => saveAttendance(records), [records]);
  useEffect(() => {
    if (!records.some((item) => item.id === selectedId)) {
      setSelectedId(records[0]?.id ?? null);
    }
  }, [records, selectedId]);

  const selected = useMemo(() => records.find((item) => item.id === selectedId) ?? records[0] ?? null, [records, selectedId]);
  const viewRecord = useMemo(() => records.find((item) => item.id === viewId) ?? null, [records, viewId]);
  const editRecord = useMemo(() => records.find((item) => item.id === editId) ?? null, [records, editId]);
  const deleteRecord = useMemo(() => records.find((item) => item.id === deleteId) ?? null, [records, deleteId]);

  useEffect(() => {
    if (editRecord) {
      setFormData({
        employee: editRecord.employee,
        employeeId: editRecord.employeeId,
        date: editRecord.date,
        mode: editRecord.mode,
        shift: editRecord.shift,
        checkIn: editRecord.checkIn,
        checkOut: editRecord.checkOut,
        status: editRecord.status,
        note: editRecord.note,
      });
      setFormErrors({});
    } else {
      setFormData(emptyForm);
    }
  }, [editRecord]);

  const filteredRecords = useMemo(
    () =>
      records.filter((item) => {
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        const haystack = `${item.employee} ${item.employeeId} ${item.date} ${item.mode} ${item.shift} ${item.status} ${item.note}`.toLowerCase();
        return matchesStatus && haystack.includes(searchTerm.toLowerCase());
      }),
    [records, searchTerm, statusFilter],
  );

  const statusCounts = useMemo(
    () =>
      hrAttendanceStatuses.slice(1).reduce((acc, status) => {
        acc[status] = records.filter((item) => item.status === status).length;
        return acc;
      }, {}),
    [records],
  );

  const startMark = () => {
    setEditId(null);
    setFormErrors({});
    setFormData(emptyForm);
    setTab('mark');
  };

  const goToAttendanceList = () => {
    setTab('attendance');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.attendance }, { replace: true });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.employee.trim()) errors.employee = 'Employee is required.';
    if (!formData.date.trim()) errors.date = 'Date is required.';
    if (!formData.checkIn.trim()) errors.checkIn = 'Check in time is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';
    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    const next = { id: `a-${String(Date.now()).slice(-5)}`, ...formData, employeeId: formData.employeeId || `e-${String(Date.now()).slice(-3)}` };
    setRecords((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    goToAttendanceList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!editId) return;
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    setRecords((current) => current.map((item) => (item.id === editId ? { ...item, ...formData } : item)));
    setSelectedId(editId);
    setEditId(null);
    setFormErrors({});
    goToAttendanceList();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setRecords((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  return (
    <DashboardShell activeKey="hr-attendance" headerProps={{ companyText: 'HR' }}>
      <div className="superadmin-package-tabs">{tabs.map((item) => <Link key={item.key} to={{ pathname: location.pathname, search: '', hash: tabToHash[item.key] }} replace className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}>{item.label}</Link>)}</div>
      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : tab === 'attendance' ? 'Attendance Directory' : 'Mark Attendance'}</div>
      </div>

      {tab === 'overview' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">{hrAttendanceMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div>
            </div>
            <SmallCard title="Attendance Snapshot">
              <div className="superadmin-list">
                {hrAttendanceHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Selected Attendance">
              {selected ? (
                <div className="superadmin-package-detail">
                  <div><span>Employee</span><strong>{selected.employee}</strong></div>
                  <div><span>Date</span><strong>{selected.date}</strong></div>
                  <div><span>Mode</span><strong>{selected.mode}</strong></div>
                  <div><span>Status</span><strong>{selected.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Select a record to preview the details.</div>}
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-overview-row">
              <SmallCard title="Status Split">
                <div className="superadmin-package-cycle-grid">
                  {hrAttendanceStatuses.slice(1).map((status) => (
                    <div key={status} className="superadmin-package-cycle-card">
                      <strong>{statusCounts[status] || 0}</strong>
                      <span>{status}</span>
                    </div>
                  ))}
                </div>
              </SmallCard>
              <SmallCard title="Quick Actions">
                <div className="superadmin-package-action-grid">
                  {hrAttendanceQuickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className={`superadmin-package-action ${activeAction === action.label ? 'active' : ''}`}
                      onClick={() => setActiveAction(action.label)}
                    >
                      <strong>{action.label}</strong>
                      <span>{action.description}</span>
                    </button>
                  ))}
                </div>
              </SmallCard>
            </div>
            <SmallCard title="Workspace Notes">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Scope</span><strong>HR attendance tracking</strong></div>
                <div className="superadmin-list-item"><span>Total Records</span><strong>{records.length}</strong></div>
                <div className="superadmin-list-item"><span>Current Focus</span><strong>{selected?.status || 'Present'}</strong></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'attendance' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Summary">
              <div className="superadmin-list">
                {hrAttendanceHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Selected Attendance">
              {selected ? (
                <div className="superadmin-package-detail">
                  <div><span>Employee</span><strong>{selected.employee}</strong></div>
                  <div><span>Mode</span><strong>{selected.mode}</strong></div>
                  <div><span>Shift</span><strong>{selected.shift}</strong></div>
                  <div><span>Status</span><strong>{selected.status}</strong></div>
                </div>
              ) : <div className="superadmin-empty-state">Pick a record to preview the details.</div>}
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-filterbar">
              <div className="superadmin-package-search">
                <Icon name="search" size={14} />
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search employee, date, mode, note" />
              </div>
              <button type="button" className="superadmin-package-secondary" onClick={startMark}>+ Mark Attendance</button>
            </div>
            <div className="superadmin-package-filters">
              {filters.map((item) => (
                <button key={item} type="button" className={`superadmin-package-filter ${statusFilter === item ? 'active' : ''}`} onClick={() => setStatusFilter(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="superadmin-package-table-card">
              <table className="superadmin-package-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Shift</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length ? filteredRecords.map((item) => (
                    <AttendanceRow
                      key={item.id}
                      item={item}
                      selected={selected?.id === item.id}
                      onView={(record) => setViewId(record.id)}
                      onEdit={(record) => {
                        setEditId(record.id);
                        setTab('mark');
                      }}
                      onDelete={(record) => setDeleteId(record.id)}
                    />
                  )) : (
                    <tr><td colSpan={7}><div className="superadmin-empty-state">No attendance records found for this filter.</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'mark' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <SmallCard title="Mark Notes">
              <div className="superadmin-list">
                <div className="superadmin-list-item"><span>Mode</span><strong>{editId ? 'Editing attendance' : 'Creating attendance'}</strong></div>
                <div className="superadmin-list-item"><span>Storage</span><strong>localStorage demo</strong></div>
                <div className="superadmin-list-item"><span>Backend</span><strong>Payload ready</strong></div>
              </div>
            </SmallCard>
            <SmallCard title="Quick Actions">
              <div className="superadmin-package-create-actions">
                <button type="button" className="superadmin-package-action" onClick={() => setTab('attendance')}>
                  <strong>Attendance List</strong>
                  <span>Review records.</span>
                </button>
                <button type="button" className="superadmin-package-action" onClick={startMark}>
                  <strong>Reset Form</strong>
                  <span>Clear current fields.</span>
                </button>
              </div>
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-form-card">
              <h4>{editId ? 'Edit Attendance' : 'New Attendance Entry'}</h4>
              <p className="superadmin-package-card-copy">Compact attendance form with validation and backend-ready record fields.</p>
              <AttendanceForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={editId ? submitEdit : submitCreate}
                submitLabel={editId ? 'Update Attendance' : 'Save Attendance'}
                errors={formErrors}
              />
              {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
            </div>
          </div>
        </div>
      ) : null}

      {false && tab === 'reports' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-sidebar">
            <div className="dashboard-card superadmin-package-stats-card">
              <div className="superadmin-package-stats-grid">{hrAttendanceMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}</div>
            </div>
            <SmallCard title="Report Snapshot">
              <div className="superadmin-list">
                {hrAttendanceHighlights.map((item) => (
                  <div key={item.label} className="superadmin-list-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
          </div>
          <div className="superadmin-package-workspace">
            <SmallCard title="Report Summary">
              <div className="superadmin-package-report-tabs">
                {['Monthly', 'Quarterly', 'Yearly'].map((period) => (
                  <button key={period} type="button" className="superadmin-package-report-pill active">
                    <Icon name="chart-line" size={14} /> {period}
                  </button>
                ))}
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Present</strong><span>{statusCounts.Present || 0}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Late</strong><span>{statusCounts.Late || 0}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Regularized</strong><span>{statusCounts.Regularized || 0}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {viewRecord ? (
        <Modal
          title="View Attendance"
          onClose={() => setViewId(null)}
          footer={<button type="button" className="superadmin-package-modal-button secondary" onClick={() => setViewId(null)}>Close</button>}
        >
          <div className="superadmin-view-summary">
            <div className="superadmin-view-summary-main">
              <span>Attendance Record</span>
              <strong>{viewRecord.employee}</strong>
              <p>{viewRecord.note}</p>
            </div>
            <div className="superadmin-view-summary-meta">
              <div><span>Date</span><strong>{viewRecord.date}</strong></div>
              <div><span>Mode</span><strong>{viewRecord.mode}</strong></div>
              <div><span>Status</span><strong>{viewRecord.status}</strong></div>
            </div>
          </div>
          <div className="superadmin-package-detail view">
            <div><span>Employee ID</span><strong>{viewRecord.employeeId}</strong></div>
            <div><span>Shift</span><strong>{viewRecord.shift}</strong></div>
            <div><span>Check In</span><strong>{viewRecord.checkIn}</strong></div>
            <div><span>Check Out</span><strong>{viewRecord.checkOut}</strong></div>
            <div><span>Note</span><strong>{viewRecord.note}</strong></div>
          </div>
        </Modal>
      ) : null}

      {editRecord ? (
        <Modal title="Edit Attendance" onClose={() => setEditId(null)} footer={null}>
          <div className="superadmin-package-detail superadmin-edit-summary">
            <div><span>Editing</span><strong>{editRecord.employee}</strong></div>
            <div><span>Date</span><strong>{editRecord.date}</strong></div>
            <div><span>Mode</span><strong>{editRecord.mode}</strong></div>
            <div><span>Status</span><strong>{editRecord.status}</strong></div>
          </div>
          <AttendanceForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={submitEdit}
            submitLabel="Update Attendance"
            errors={formErrors}
          />
        </Modal>
      ) : null}

      {deleteRecord ? (
        <Modal
          title="Delete Attendance"
          onClose={() => setDeleteId(null)}
          footer={(
            <>
              <button type="button" className="superadmin-package-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="superadmin-package-modal-button danger" onClick={confirmDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-package-delete-copy">This will remove the attendance entry from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}
