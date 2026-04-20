import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Icon from '../components/Icon';
import { ROUTES } from '../router/routePaths';

const moduleNavItems = [
  { label: 'Summary', path: ROUTES.myTeamSummary, activeKey: 'myteam_summary' },
  { label: 'Leave', path: ROUTES.myTeamLeaveOverview, activeKey: 'myteam_leave_overview' },
  { label: 'Attendance', path: ROUTES.myTeamAttendance, activeKey: 'myteam_attendance' },
  { label: 'Expenses & Travel', path: ROUTES.myTeamExpenses, activeKey: 'myteam_expenses' },
  { label: 'Timesheet', path: ROUTES.myTeamTimesheet, activeKey: 'myteam_timesheet' },
  { label: 'Profile Changes', path: ROUTES.myTeamProfileChanges, activeKey: 'myteam_profile_changes' },
  { label: 'Performance', path: ROUTES.myTeamPerformance, activeKey: 'myteam_performance' },
];

const attendanceTabs = [
  { key: 'attendance-approvals', label: 'Attendance Approvals', activeKey: 'myteam_attendance_approvals' },
  { key: 'ot-requests', label: 'OT Request Approvals', activeKey: 'myteam_attendance_ot' },
  { key: 'regularize', label: 'Regularize & Cancel Penalties', activeKey: 'myteam_attendance_regularize' },
  { key: 'shift-off', label: 'Shift & Weekly Off Approvals', activeKey: 'myteam_attendance_shift' },
  { key: 'efforts', label: 'Efforts / Punctuality', activeKey: 'myteam_attendance_efforts' },
  { key: 'negligence', label: 'Negligence', activeKey: 'myteam_attendance_negligence' },
  { key: 'assignments', label: 'Employee Assignments', activeKey: 'myteam_attendance_assignments' },
  { key: 'reports', label: 'Reports', activeKey: 'myteam_attendance_reports' },
];

const attendanceSubNavItems = attendanceTabs.map((tab) => ({
  label: tab.label,
  path: `${ROUTES.myTeamAttendance}#${tab.key}`,
  activeKey: tab.activeKey,
}));

const tabConfigs = {
  'attendance-approvals': {
    banner: 'Review pending attendance approvals raised by employees and keep the team log consistent.',
    actionLabel: 'Approve Selected',
    columns: [
      'Employee',
      'Request Type',
      'Attendance Date',
      'Requested On',
      'Location',
      'Department',
      'Status',
      'Actions',
    ],
    filters: [
      { key: 'status', label: 'Status', options: ['Pending', 'Approved', 'Rejected'] },
      { key: 'location', label: 'Location', options: ['Bhubaneswar', 'Remote'] },
      { key: 'department', label: 'Department', options: ['Digital Services Innovation Lab', 'Product Engineering'] },
    ],
    rows: [
      {
        id: 'aa-1',
        employeeId: 'GI2673',
        employeeName: 'Jitesh Kumar Das',
        role: 'Associate Director - Projects',
        requestType: 'Attendance Missed',
        attendanceDate: '27 Mar 2026',
        requestedOn: '29 Mar 2026',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        status: 'Pending',
        searchText: 'GI2673 Jitesh Kumar Das Attendance Missed 27 Mar 2026 29 Mar 2026 Bhubaneswar Digital Services Innovation Lab Pending',
      },
      {
        id: 'aa-2',
        employeeId: 'GI2689',
        employeeName: 'Kshirabdhitanya Aich',
        role: 'Associate Software Engineer',
        requestType: 'Regularization',
        attendanceDate: '30 Mar 2026',
        requestedOn: '01 Apr 2026',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        status: 'Approved',
        searchText: 'GI2689 Kshirabdhitanya Aich Regularization 30 Mar 2026 01 Apr 2026 Bhubaneswar Digital Services Innovation Lab Approved',
      },
      {
        id: 'aa-3',
        employeeId: 'GI2691',
        employeeName: 'Lipsi Mohanty',
        role: 'Software Engineer',
        requestType: 'Late Arrival',
        attendanceDate: '12 Mar 2026',
        requestedOn: '14 Mar 2026',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        status: 'Rejected',
        searchText: 'GI2691 Lipsi Mohanty Late Arrival 12 Mar 2026 14 Mar 2026 Bhubaneswar Digital Services Innovation Lab Rejected',
      },
    ],
  },
  'ot-requests': {
    banner: 'Track overtime requests, review the reported work duration, and approve eligible OT entries.',
    actionLabel: 'Approve OT',
    columns: ['Employee', 'OT Hours', 'Shift', 'Requested On', 'Location', 'Status', 'Actions'],
    filters: [
      { key: 'status', label: 'Status', options: ['Pending', 'Approved', 'Rejected'] },
      { key: 'location', label: 'Location', options: ['Bhubaneswar', 'Remote'] },
    ],
    rows: [
      {
        id: 'ot-1',
        employeeId: 'GI2705',
        employeeName: 'Smruti Ranjan Rout',
        role: 'Software Engineer',
        otHours: '2h 30m',
        shift: '10:15 AM - 7:15 PM',
        requestedOn: '30 Mar 2026',
        location: 'Bhubaneswar',
        status: 'Pending',
        searchText: 'GI2705 Smruti Ranjan Rout 2h 30m 10:15 AM - 7:15 PM 30 Mar 2026 Bhubaneswar Pending',
      },
      {
        id: 'ot-2',
        employeeId: 'GI2694',
        employeeName: 'Pranaba Kumar Mohanty',
        role: 'Test Engineer',
        otHours: '1h 45m',
        shift: '09:45 AM - 6:30 PM',
        requestedOn: '29 Mar 2026',
        location: 'Bhubaneswar',
        status: 'Approved',
        searchText: 'GI2694 Pranaba Kumar Mohanty 1h 45m 09:45 AM - 6:30 PM 29 Mar 2026 Bhubaneswar Approved',
      },
    ],
  },
  regularize: {
    banner: 'Employees who are already regularised or have pending regularisation requests will not be shown.',
    actionLabel: 'Cancel Penalty',
    columns: ['Employee ID', 'Employee Name', 'Incident Date', 'Penalized On', 'Status', 'Location', 'Department', 'Attendance Discrepancy', 'Actions'],
    filters: [
      { key: 'dateRange', label: 'Date Range', options: ['03 Mar 2026 - 01 Apr 2026', '01 Mar 2026 - 31 Mar 2026', '01 Apr 2026 - 30 Apr 2026'] },
      { key: 'status', label: 'Status', options: ['Penalised', 'Pending', 'Cancelled'] },
      { key: 'discrepancy', label: 'Attendance Discrepancy', options: ['Work hours shortage', 'No attendance', 'Late coming'] },
      { key: 'department', label: 'Department', options: ['Digital Services Innovation Lab', 'Product Engineering'] },
      { key: 'location', label: 'Location', options: ['Bhubaneswar', 'Remote'] },
    ],
    rows: [
      {
        id: 'rg-1',
        employeeId: 'GI2673',
        employeeName: 'Jitesh Kumar Das',
        role: 'Associate Director - Projects',
        incidentDate: '27 Mar 2026',
        penalizedOn: '29 Mar 2026',
        status: 'Penalised',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        discrepancy: 'Work hours shortage',
        searchText: 'GI2673 Jitesh Kumar Das 27 Mar 2026 29 Mar 2026 Penalised Bhubaneswar Digital Services Innovation Lab Work hours shortage',
      },
      {
        id: 'rg-2',
        employeeId: 'GI2689',
        employeeName: 'Kshirabdhitanya Aich',
        role: 'Associate Software Engineer',
        incidentDate: '30 Mar 2026',
        penalizedOn: '01 Apr 2026',
        status: 'Penalised',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        discrepancy: 'No attendance',
        searchText: 'GI2689 Kshirabdhitanya Aich 30 Mar 2026 01 Apr 2026 Penalised Bhubaneswar Digital Services Innovation Lab No attendance',
      },
      {
        id: 'rg-3',
        employeeId: 'GI2691',
        employeeName: 'Lipsi Mohanty',
        role: 'Software Engineer',
        incidentDate: '12 Mar 2026',
        penalizedOn: '14 Mar 2026',
        status: 'Penalised',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        discrepancy: 'Work hours shortage',
        searchText: 'GI2691 Lipsi Mohanty 12 Mar 2026 14 Mar 2026 Penalised Bhubaneswar Digital Services Innovation Lab Work hours shortage',
      },
      {
        id: 'rg-4',
        employeeId: 'GI2693',
        employeeName: 'Prajwal Chandra Nayak',
        role: 'Software Engineer',
        incidentDate: '06 Mar 2026',
        penalizedOn: '08 Mar 2026',
        status: 'Penalised',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        discrepancy: 'Work hours shortage',
        searchText: 'GI2693 Prajwal Chandra Nayak 06 Mar 2026 08 Mar 2026 Penalised Bhubaneswar Digital Services Innovation Lab Work hours shortage',
      },
      {
        id: 'rg-5',
        employeeId: 'GI2694',
        employeeName: 'Pranaba Kumar Mohanty',
        role: 'Test Engineer',
        incidentDate: '27 Mar 2026',
        penalizedOn: '29 Mar 2026',
        status: 'Penalised',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        discrepancy: 'No attendance',
        searchText: 'GI2694 Pranaba Kumar Mohanty 27 Mar 2026 29 Mar 2026 Penalised Bhubaneswar Digital Services Innovation Lab No attendance',
      },
      {
        id: 'rg-6',
        employeeId: 'GI2705',
        employeeName: 'Smruti Ranjan Rout',
        role: 'Software Engineer',
        incidentDate: '30 Mar 2026',
        penalizedOn: '01 Apr 2026',
        status: 'Penalised',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        discrepancy: 'Work hours shortage',
        searchText: 'GI2705 Smruti Ranjan Rout 30 Mar 2026 01 Apr 2026 Penalised Bhubaneswar Digital Services Innovation Lab Work hours shortage',
      },
      {
        id: 'rg-7',
        employeeId: 'GI2709',
        employeeName: 'Pooja Behera',
        role: 'Senior Software Engineer',
        incidentDate: '24 Mar 2026',
        penalizedOn: '26 Mar 2026',
        status: 'Penalised',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        discrepancy: 'Late coming',
        searchText: 'GI2709 Pooja Behera 24 Mar 2026 26 Mar 2026 Penalised Bhubaneswar Digital Services Innovation Lab Late coming',
      },
    ],
  },
  'shift-off': {
    banner: 'Approve shift changes and weekly off adjustments requested by employees and managers.',
    actionLabel: 'Approve Shift',
    columns: ['Employee', 'Requested Shift', 'Effective Date', 'Requested On', 'Status', 'Actions'],
    filters: [
      { key: 'status', label: 'Status', options: ['Pending', 'Approved', 'Rejected'] },
      { key: 'location', label: 'Location', options: ['Bhubaneswar', 'Remote'] },
    ],
    rows: [
      {
        id: 'so-1',
        employeeId: 'GI2721',
        employeeName: 'Ankita Panda',
        role: 'Associate Software Engineer',
        requestedShift: 'Weekly Off Swap',
        effectiveDate: '03 Apr 2026',
        requestedOn: '31 Mar 2026',
        status: 'Pending',
        location: 'Bhubaneswar',
        searchText: 'GI2721 Ankita Panda Weekly Off Swap 03 Apr 2026 31 Mar 2026 Pending Bhubaneswar',
      },
      {
        id: 'so-2',
        employeeId: 'GI2731',
        employeeName: 'Arpita Panda',
        role: 'Associate Software Engineer',
        requestedShift: 'Shift Change',
        effectiveDate: '04 Apr 2026',
        requestedOn: '01 Apr 2026',
        status: 'Approved',
        location: 'Bhubaneswar',
        searchText: 'GI2731 Arpita Panda Shift Change 04 Apr 2026 01 Apr 2026 Approved Bhubaneswar',
      },
    ],
  },
  efforts: {
    banner: 'Measure punctuality, attendance pattern, and effort consistency across the team.',
    actionLabel: 'Refresh Metrics',
    columns: ['Employee', 'Avg Hrs / Day', 'On Time Arrival', 'Late Arrivals', 'Status', 'Actions'],
    filters: [
      { key: 'status', label: 'Status', options: ['Good', 'Watchlist', 'At Risk'] },
      { key: 'department', label: 'Department', options: ['Digital Services Innovation Lab', 'Product Engineering'] },
    ],
    rows: [
      {
        id: 'ef-1',
        employeeId: 'GI2673',
        employeeName: 'Jitesh Kumar Das',
        role: 'Associate Director - Projects',
        avgHours: '8h 04m',
        onTime: '97%',
        lateArrivals: '1',
        status: 'Good',
        department: 'Digital Services Innovation Lab',
        searchText: 'GI2673 Jitesh Kumar Das 8h 04m 97% 1 Good Digital Services Innovation Lab',
      },
      {
        id: 'ef-2',
        employeeId: 'GI2691',
        employeeName: 'Lipsi Mohanty',
        role: 'Software Engineer',
        avgHours: '7h 28m',
        onTime: '85%',
        lateArrivals: '4',
        status: 'Watchlist',
        department: 'Digital Services Innovation Lab',
        searchText: 'GI2691 Lipsi Mohanty 7h 28m 85% 4 Watchlist Digital Services Innovation Lab',
      },
    ],
  },
  negligence: {
    banner: 'Identify repeated attendance misses and policy deviations that need manager intervention.',
    actionLabel: 'Mark Reviewed',
    columns: ['Employee', 'Incident', 'Count', 'Last Incident', 'Severity', 'Actions'],
    filters: [
      { key: 'severity', label: 'Severity', options: ['High', 'Medium', 'Low'] },
      { key: 'location', label: 'Location', options: ['Bhubaneswar', 'Remote'] },
    ],
    rows: [
      {
        id: 'ng-1',
        employeeId: 'GI2694',
        employeeName: 'Pranaba Kumar Mohanty',
        role: 'Test Engineer',
        incident: 'No attendance',
        count: '3',
        lastIncident: '29 Mar 2026',
        severity: 'High',
        location: 'Bhubaneswar',
        searchText: 'GI2694 Pranaba Kumar Mohanty No attendance 3 29 Mar 2026 High Bhubaneswar',
      },
      {
        id: 'ng-2',
        employeeId: 'GI2709',
        employeeName: 'Pooja Behera',
        role: 'Senior Software Engineer',
        incident: 'Late coming',
        count: '2',
        lastIncident: '26 Mar 2026',
        severity: 'Medium',
        location: 'Bhubaneswar',
        searchText: 'GI2709 Pooja Behera Late coming 2 26 Mar 2026 Medium Bhubaneswar',
      },
    ],
  },
  assignments: {
    banner: 'Manage employee-to-manager assignments and keep reporting lines up to date.',
    actionLabel: 'Update Assignments',
    columns: ['Employee', 'Current Manager', 'Location', 'Department', 'Effective From', 'Actions'],
    filters: [
      { key: 'department', label: 'Department', options: ['Digital Services Innovation Lab', 'Product Engineering'] },
      { key: 'location', label: 'Location', options: ['Bhubaneswar', 'Remote'] },
    ],
    rows: [
      {
        id: 'as-1',
        employeeId: 'GI2673',
        employeeName: 'Jitesh Kumar Das',
        role: 'Associate Director - Projects',
        manager: 'Ashutosh Nayak',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        effectiveFrom: '01 Apr 2026',
        searchText: 'GI2673 Jitesh Kumar Das Ashutosh Nayak Bhubaneswar Digital Services Innovation Lab 01 Apr 2026',
      },
      {
        id: 'as-2',
        employeeId: 'GI2689',
        employeeName: 'Kshirabdhitanya Aich',
        role: 'Associate Software Engineer',
        manager: 'Sasmita Behera',
        location: 'Bhubaneswar',
        department: 'Digital Services Innovation Lab',
        effectiveFrom: '01 Apr 2026',
        searchText: 'GI2689 Kshirabdhitanya Aich Sasmita Behera Bhubaneswar Digital Services Innovation Lab 01 Apr 2026',
      },
    ],
  },
  reports: {
    banner: 'Generate attendance reports by department, location, and custom date range.',
    actionLabel: 'Generate Report',
    columns: ['Report Name', 'Frequency', 'Last Generated', 'Owner', 'Status', 'Actions'],
    filters: [
      { key: 'frequency', label: 'Frequency', options: ['Daily', 'Weekly', 'Monthly'] },
      { key: 'status', label: 'Status', options: ['Ready', 'Scheduled', 'Archived'] },
    ],
    rows: [
      {
        id: 'rp-1',
        reportName: 'Regularization Penalty Summary',
        frequency: 'Daily',
        lastGenerated: '01 Apr 2026 08:30 AM',
        owner: 'Attendance Admin',
        status: 'Ready',
        searchText: 'Regularization Penalty Summary Daily 01 Apr 2026 08:30 AM Attendance Admin Ready',
      },
      {
        id: 'rp-2',
        reportName: 'Attendance Discrepancy Report',
        frequency: 'Weekly',
        lastGenerated: '31 Mar 2026 06:00 PM',
        owner: 'HR Operations',
        status: 'Scheduled',
        searchText: 'Attendance Discrepancy Report Weekly 31 Mar 2026 06:00 PM HR Operations Scheduled',
      },
    ],
  },
};

function badgeClass(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('approved') || normalized.includes('ready') || normalized.includes('good')) return 'badge-success';
  if (normalized.includes('pending') || normalized.includes('watchlist') || normalized.includes('scheduled')) return 'badge-warning';
  if (normalized.includes('rejected') || normalized.includes('at risk') || normalized.includes('high')) return 'badge-danger';
  if (normalized.includes('penalised')) return 'badge-penalised';
  if (normalized.includes('medium')) return 'badge-warning';
  if (normalized.includes('low')) return 'badge-neutral';
  return 'badge-neutral';
}

function fieldValue(row, key) {
  switch (key) {
    case 'status':
      return row.status;
    case 'location':
      return row.location;
    case 'department':
      return row.department;
    case 'discrepancy':
      return row.discrepancy;
    case 'severity':
      return row.severity;
    case 'frequency':
      return row.frequency;
    case 'dateRange':
      return '03 Mar 2026 - 01 Apr 2026';
    default:
      return row[key];
  }
}

function renderCell(row, label) {
  switch (label) {
    case 'Employee':
      return (
        <div className="attendance-employee">
          <div className="attendance-employee-avatar">
            {String(row.employeeName || row.reportName || 'A').slice(0, 1)}
          </div>
          <div className="attendance-employee-copy">
            <div className="attendance-employee-name">{row.employeeName || row.reportName}</div>
            <div className="attendance-employee-role">{row.role || row.owner || row.requestType || 'Employee'}</div>
          </div>
        </div>
      );
    case 'Employee ID':
      return <strong>{row.employeeId}</strong>;
    case 'Employee Name':
      return (
        <div className="attendance-name-cell">
          <strong>{row.employeeName}</strong>
          <span>{row.role}</span>
        </div>
      );
    case 'Attendance Date':
    case 'Incident Date':
      return <strong>{row.attendanceDate || row.incidentDate || row.lastIncident || row.effectiveDate}</strong>;
    case 'Requested On':
      return row.requestedOn || row.penalizedOn || row.lastGenerated;
    case 'Penalized On':
      return <strong>{row.penalizedOn}</strong>;
    case 'Location':
      return row.location;
    case 'Department':
      return row.department;
    case 'Status':
      return <span className={`attendance-badge ${badgeClass(row.status)}`}>{row.status}</span>;
    case 'Attendance Discrepancy':
      return <span className="attendance-chip">{row.discrepancy}</span>;
    case 'Request Type':
      return row.requestType;
    case 'OT Hours':
      return row.otHours;
    case 'Shift':
      return row.shift;
    case 'Current Manager':
      return row.manager;
    case 'Effective From':
      return row.effectiveFrom;
    case 'Avg Hrs / Day':
      return row.avgHours;
    case 'On Time Arrival':
      return row.onTime;
    case 'Late Arrivals':
      return row.lateArrivals;
    case 'Incident':
      return row.incident;
    case 'Count':
      return row.count;
    case 'Severity':
      return <span className={`attendance-badge ${badgeClass(row.severity)}`}>{row.severity}</span>;
    case 'Report Name':
      return row.reportName;
    case 'Frequency':
      return row.frequency;
    case 'Last Generated':
      return row.lastGenerated;
    case 'Owner':
      return row.owner;
    default:
      return row[label.toLowerCase().replace(/\s+/g, '')] ?? row[label] ?? '';
  }
}

function buildActions(tabKey, rowId) {
  if (tabKey === 'reports') {
    return ['Open', 'Download', 'Schedule'];
  }

  if (tabKey === 'negligence') {
    return ['Review', 'Escalate', 'Archive'];
  }

  if (tabKey === 'assignments') {
    return ['Edit', 'History', 'Reassign'];
  }

  return ['View details', 'Approve', 'Reject'];
}

function MyTeamAttendanceTable({ activeTab }) {
  const config = tabConfigs[activeTab];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);

  useEffect(() => {
    setSearchTerm('');
    setFilterValues({});
    setSelectedIds([]);
    setCurrentPage(1);
    setOpenActionId(null);
  }, [activeTab]);

  useEffect(() => {
    const handleClick = (event) => {
      if (!event.target?.closest?.('[data-action-menu]')) {
        setOpenActionId(null);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return config.rows.filter((row) => {
      if (term && !String(row.searchText || '').toLowerCase().includes(term)) return false;

      return Object.entries(filterValues).every(([key, value]) => {
        if (!value) return true;
        return String(fieldValue(row, key) || '').toLowerCase() === String(value).toLowerCase();
      });
    });
  }, [config.rows, filterValues, searchTerm]);

  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleIds = visibleRows.map((row) => row.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const toggleSelected = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleVisibleSelection = () => {
    setSelectedIds((current) => {
      const selectedSet = new Set(current);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => selectedSet.delete(id));
      } else {
        visibleIds.forEach((id) => selectedSet.add(id));
      }
      return [...selectedSet];
    });
  };

  const totalLabel = `${filteredRows.length} total`;

  return (
    <div className="attendance-panel">
      <div className="attendance-panel-banner">
        <Icon name="circle-question" size={14} />
        <span>{config.banner}</span>
      </div>

      <div className="attendance-filter-row">
        {config.filters.map((filter) => (
          <label className="attendance-filter" key={filter.key}>
            <span>{filter.label}</span>
            <select
              value={filterValues[filter.key] || ''}
              onChange={(event) => setFilterValues((current) => ({ ...current, [filter.key]: event.target.value }))}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}

        <label className="attendance-filter attendance-filter--search">
          <span>Search</span>
          <div className="attendance-search-box">
            <Icon name="search" size={12} />
            <input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
              type="search"
              placeholder="Search"
              aria-label="Search attendance records"
            />
          </div>
        </label>

        <button type="button" className="attendance-filter-icon" aria-label="Filter options">
          <Icon name="sparkles" size={14} />
        </button>
      </div>

      <div className="attendance-table-toolbar">
        <button type="button" className="attendance-bulk-btn" disabled={!someVisibleSelected}>
          {config.actionLabel}
        </button>
        <div className="attendance-total">{totalLabel}</div>
      </div>

      <div className="attendance-table-shell">
        <table className="attendance-grid">
          <thead>
            <tr>
              <th className="attendance-check-col">
                <input type="checkbox" checked={allVisibleSelected} ref={(node) => { if (node) node.indeterminate = !allVisibleSelected && someVisibleSelected; }} onChange={toggleVisibleSelection} aria-label="Select visible rows" />
              </th>
              {config.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id}>
                <td className="attendance-check-col">
                  <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} aria-label={`Select ${row.employeeName || row.reportName}`} />
                </td>
                {config.columns.map((column) => {
                  if (column === 'Actions') {
                    return (
                      <td key={`${row.id}-actions`}>
                        <div className="attendance-actions-cell" data-action-menu="true">
                          <button type="button" className="attendance-row-btn" onClick={() => setOpenActionId((current) => (current === row.id ? null : row.id))} aria-label="Row actions">
                            <Icon name="ellipsis-vertical" size={14} />
                          </button>
                          {openActionId === row.id ? (
                            <div className="attendance-action-menu" role="menu">
                              {buildActions(activeTab, row.id).map((action) => (
                                <button key={action} type="button" role="menuitem" onClick={() => setOpenActionId(null)}>
                                  {action}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </td>
                    );
                  }

                  return <td key={`${row.id}-${column}`}>{renderCell(row, column)}</td>;
                })}
              </tr>
            ))}

            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={config.columns.length + 1}>
                  <div className="attendance-empty">No records match your current filters.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="attendance-pagination">
        <div>
          {filteredRows.length ? `${(currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredRows.length)} of ${filteredRows.length}` : '0 to 0 of 0'}
        </div>
        <div className="attendance-pagination-actions">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}>
            <Icon name="chevron-left" size={11} />
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}>
            <Icon name="chevron-right" size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyTeamAttendance() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('attendance-approvals');

  const activeTabInfo = attendanceTabs.find((tab) => tab.key === activeTab) || attendanceTabs[2];
  const sidebarActiveKey = activeTabInfo.activeKey;

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} myteam-page myteam-attendance-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  useEffect(() => {
    const hashMap = {
      '#attendance-approvals': 'attendance-approvals',
      '#ot-requests': 'ot-requests',
      '#regularize': 'regularize',
      '#shift-off': 'shift-off',
      '#efforts': 'efforts',
      '#negligence': 'negligence',
      '#assignments': 'assignments',
      '#reports': 'reports',
    };

    setActiveTab(hashMap[hash] || 'attendance-approvals');
  }, [hash, pathname]);

  useEffect(() => {
    if (!hash) {
      navigate(`${pathname}#attendance-approvals`, { replace: true });
    }
  }, [hash, navigate, pathname]);

  return (
    <MainLayout
      activeKey={sidebarActiveKey}
      moduleActiveKey="myteam_attendance"
      subNavActiveKey={sidebarActiveKey}
      brandText="PLAt"
      companyText=""
      showModuleNav
      showSubNav
      moduleNavItems={moduleNavItems}
      subNavItems={attendanceSubNavItems}
    >
      <div className="attendance-page-frame">
        <MyTeamAttendanceTable activeTab={activeTab} />
      </div>
    </MainLayout>
  );
}
