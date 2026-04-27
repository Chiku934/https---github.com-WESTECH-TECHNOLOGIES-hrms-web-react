import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import DashboardShell from '../../shared/components/DashboardShell';
import Icon from '../../../components/Icon';
import CompanyAdminGridHeader from '../components/CompanyAdminGridHeader';
import { ROLES } from '../../../app/config/roles';
import '../../super-admin/styles/clients.css';
import '../../super-admin/styles/packages.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { loadCompanyRoster } from '../../company-setup/services/companySetupService';
import {
  companyAdminEmployeeOptions,
  companyAdminProjectOptions,
  companyAdminTeamList,
  companyAdminTeamMetrics,
} from '../data/teamData';

ModuleRegistry.registerModules([AllCommunityModule]);

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'teams', label: 'Project Assign List' },
  { key: 'team-setup', label: 'Project Assign' },
];

const tabToHash = {
  overview: '#overview',
  teams: '#list',
  'team-setup': '#create',
};

const hashToTab = {
  '#overview': 'overview',
  '#list': 'teams',
  '#create': 'team-setup',
};

const sidebarActiveKeyMap = {
  overview: 'company-admin-create-team-overview',
  teams: 'company-admin-create-team-list',
  'team-setup': 'company-admin-create-team-create',
};

const filters = ['All', 'Active', 'Onboarding', 'Draft'];
const emptyForm = { name: '', lead: '', members: '', project: '', status: 'Draft' };
const storageKey = 'company_admin_team_setup_v2';
const companyAdminGridTextFilterParams = {
  defaultOption: 'contains',
  maxNumConditions: 1,
  suppressAndOrCondition: true,
};

function splitMemberNames(value) {
  return value
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

function getMemberLabel(member) {
  if (!member) return '';
  if (typeof member === 'string') return member.trim();
  if (typeof member === 'object') return (member.fullName || member.name || member.label || member.userName || '').toString().trim();
  return String(member).trim();
}

function getActiveMemberQuery(value) {
  const lastCommaIndex = value.lastIndexOf(',');
  return (lastCommaIndex >= 0 ? value.slice(lastCommaIndex + 1) : value).trim();
}

function getMemberSummary(members) {
  const list = Array.isArray(members)
    ? members
        .map(getMemberLabel)
        .filter(Boolean)
    : typeof members === 'string' && members.trim()
      ? splitMemberNames(members)
      : [];
  const count = list.length;
  const preview = list.slice(0, 3).join(', ');
  const trailing = count > 3 ? `+${count - 3} more` : '';
  return { list, count, preview, trailing };
}

const seededAssignmentProjects = companyAdminTeamList.map((item) => item.project.toLowerCase());

function SmallCard({ title, children }) {
  return (
    <section className="dashboard-card superadmin-mini-card">
      <div className="dashboard-card-title">{title}</div>
      {children}
    </section>
  );
}

function StatBlock({ metric }) {
  return (
    <div className="superadmin-stat">
      <div className="superadmin-stat-label">{metric.label}</div>
      <div className="superadmin-stat-value">{metric.value}</div>
      <div className="superadmin-stat-change">{metric.change}</div>
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="superadmin-modal-backdrop" onClick={onClose} role="presentation">
      <div className="superadmin-modal" onClick={(event) => event.stopPropagation()} role="presentation">
        <div className="superadmin-modal-header">
          <div>
            <div className="superadmin-modal-kicker">Company Admin</div>
            <h3>{title}</h3>
          </div>
          <button type="button" className="superadmin-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="superadmin-modal-body">{children}</div>
        {footer ? <div className="superadmin-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function TeamRow({ item, onView, onEdit, onDelete, selected }) {
  const memberSummary = getMemberSummary(item.members);
  return (
    <tr className={selected ? 'superadmin-table-row active' : 'superadmin-table-row'}>
      <td>
        <div className="superadmin-client-cell">
          <strong>{item.name}</strong>
          <span>{item.lead}</span>
        </div>
      </td>
      <td>
        <div className="superadmin-team-member-cell">
          <strong>{memberSummary.count}</strong>
          <span>{memberSummary.count ? 'Members assigned' : 'No members added'}</span>
        </div>
      </td>
      <td>{item.project}</td>
      <td>
        <span className={`role-status-chip tone-${item.status.toLowerCase()}`}>{item.status}</span>
      </td>
      <td>
        <div className="superadmin-table-actions">
          <button type="button" className="superadmin-table-action" onClick={() => onView(item)}>View</button>
          <button type="button" className="superadmin-table-action" onClick={() => onEdit(item)}>Edit</button>
          <button type="button" className="superadmin-table-action danger" onClick={() => onDelete(item)}>Delete</button>
        </div>
      </td>
    </tr>
  );
}

function TeamGridEmptyOverlay({ title, subtitle }) {
  return (
    <div className="superadmin-grid-empty">
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  );
}

function TeamNameCell({ data }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-name-cell">
      <strong>{data.name}</strong>
      <div className="superadmin-grid-name-meta">
        <span>{data.lead}</span>
      </div>
    </div>
  );
}

function TeamStatusCell({ value }) {
  return <span className={`role-status-chip tone-${String(value).toLowerCase()}`}>{value}</span>;
}

function TeamActionsCell({ data, onView, onEdit, onDelete }) {
  if (!data) return null;
  return (
    <div className="superadmin-grid-actions">
      <Link
        to={onView?.(data)}
        replace
        className="superadmin-grid-icon-button view"
        aria-label="View team"
      >
        <Icon name="eye" size={14} />
      </Link>
      <Link
        to={onEdit?.(data)}
        replace
        className="superadmin-grid-icon-button edit"
        aria-label="Edit team"
      >
        <Icon name="pen-to-square" size={14} />
      </Link>
      <button type="button" className="superadmin-grid-icon-button danger" onClick={() => onDelete?.(data)} aria-label="Delete team">
        <Icon name="trash" size={14} />
      </button>
    </div>
  );
}

function TeamForm({ formData, setFormData, onSubmit, submitLabel, errors = {}, memberOptions = [], readOnly = false }) {
  const activeQuery = getActiveMemberQuery(formData.members);
  const matchingMembers = activeQuery
    ? memberOptions.filter((item) => `${item.fullName} ${item.userName || ''} ${item.role || ''}`.toLowerCase().includes(activeQuery.toLowerCase()))
    : memberOptions.slice(0, 6);

  const applySuggestion = (name) => {
    setFormData((current) => {
      const currentParts = splitMemberNames(current.members);
      const updatedParts = currentParts.slice(0, -1);
      const nextMembers = updatedParts.length ? `${updatedParts.join(', ')}, ${name}` : name;
      return { ...current, members: `${nextMembers}, ` };
    });
  };

  return (
    <form
      className="superadmin-package-form-grid superadmin-team-form-grid"
      onSubmit={onSubmit}
      style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}
    >
      <label className="superadmin-package-form-field">
        <span>Team Name</span>
        <input readOnly={readOnly} disabled={readOnly} value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} placeholder="Enter team name" />
        {errors.name ? <small className="superadmin-package-error">{errors.name}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Team Lead</span>
        <select disabled={readOnly} value={formData.lead} onChange={(event) => setFormData((current) => ({ ...current, lead: event.target.value }))}>
          <option value="">Select lead</option>
          {companyAdminEmployeeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        {errors.lead ? <small className="superadmin-package-error">{errors.lead}</small> : null}
      </label>
      <label className="superadmin-package-form-field superadmin-member-field">
        <span>Member Names</span>
        <input
          readOnly={readOnly}
          disabled={readOnly}
          value={formData.members}
          onChange={(event) => setFormData((current) => ({ ...current, members: event.target.value }))}
          placeholder="Type member names and choose from suggestions"
        />
        <small className="superadmin-form-hint"></small>
        {activeQuery ? (
          matchingMembers.length ? (
            <div className="superadmin-member-dropdown">
              {matchingMembers.map((item) => (
                <button key={item.id || item.fullName} type="button" className="superadmin-member-option" onClick={() => applySuggestion(item.fullName)}>
                  <span className="superadmin-member-option-name">{item.fullName}</span>
                  <span className="superadmin-member-option-meta">
                    {item.userName ? `${item.userName} · ` : ''}
                    {item.role || 'Employee'}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <small className="superadmin-package-error">User not exist in employee list.</small>
          )
        ) : null}
        {errors.members ? <small className="superadmin-package-error">{errors.members}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Project</span>
        <select disabled={readOnly} value={formData.project} onChange={(event) => setFormData((current) => ({ ...current, project: event.target.value }))}>
          <option value="">Select project</option>
          {companyAdminProjectOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        {errors.project ? <small className="superadmin-package-error">{errors.project}</small> : null}
      </label>
      <label className="superadmin-package-form-field">
        <span>Status</span>
        <select disabled={readOnly} value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}>
          <option>Draft</option>
          <option>Active</option>
          <option>Onboarding</option>
        </select>
      </label>
      <div className="superadmin-package-form-actions" style={{ gridColumn: '1 / -1' }}>
        {readOnly ? (
          <Link to={{ pathname: location.pathname, search: '', hash: tabToHash.teams }} replace className="superadmin-package-modal-button secondary">
            Back to List
          </Link>
        ) : (
          <button type="submit" className="superadmin-package-modal-button primary">{submitLabel}</button>
        )}
      </div>
    </form>
  );
}

function loadTeams() {
  if (typeof window === 'undefined') return companyAdminTeamList;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return companyAdminTeamList;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.length) return companyAdminTeamList;
    const normalized = parsed.map((item) => ({
      ...item,
      members: Array.isArray(item.members)
        ? item.members
        : typeof item.members === 'string' && item.members.trim()
          ? item.members.split(',').map((name) => name.trim()).filter(Boolean)
          : [],
    }));
    const hasSeedProjects = seededAssignmentProjects.some((project) => normalized.some((item) => String(item.project || '').toLowerCase() === project));
    return hasSeedProjects ? normalized : companyAdminTeamList;
  } catch {
    return companyAdminTeamList;
  }
}

function saveTeams(records) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }
}

export default function CompanyAdminTeamSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState(() => loadTeams());
  const [selectedId, setSelectedId] = useState(loadTeams()[0]?.id ?? null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const routeMode = searchParams.get('mode');
  const routeId = searchParams.get('id');
  const [employeeRoster, setEmployeeRoster] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  
  // Load employee roster from API
  useEffect(() => {
    async function loadEmployeeRoster() {
      setLoadingEmployees(true);
      try {
        const users = await loadCompanyRoster();
        const roster = users
          .filter((item) => [ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN, ROLES.EMPLOYEE].includes(item.role))
          .map((item) => ({
            id: item.id,
            fullName: item.fullName,
            userName: item.userName,
            role: item.role,
          }))
          .filter((item) => item.fullName);
        
        const fallback = companyAdminEmployeeOptions.map((item) => ({
          id: item.value,
          fullName: item.label,
          userName: '',
          role: 'Employee',
        }));
        
        const source = roster.length ? roster : fallback;
        const uniqueSource = source.filter((item, index, list) =>
          index === list.findIndex((entry) => entry.fullName.toLowerCase() === item.fullName.toLowerCase())
        );
        
        setEmployeeRoster(uniqueSource);
      } catch (error) {
        console.error('Error loading employee roster:', error);
        // Fallback to static data
        const fallback = companyAdminEmployeeOptions.map((item) => ({
          id: item.value,
          fullName: item.label,
          userName: '',
          role: 'Employee',
        }));
        setEmployeeRoster(fallback);
      } finally {
        setLoadingEmployees(false);
      }
    }
    
    loadEmployeeRoster();
  }, []);
  
  const employeeRosterMap = useMemo(() => {
    return new Map(employeeRoster.map((item) => [item.fullName.toLowerCase(), item]));
  }, [employeeRoster]);

  useEffect(() => saveTeams(teams), [teams]);

  useEffect(() => {
    if (!teams.some((item) => item.id === selectedId)) {
      setSelectedId(teams[0]?.id ?? null);
    }
  }, [selectedId, teams]);

  useEffect(() => {
    const nextTab = hashToTab[location.hash] || 'overview';
    if (tab !== nextTab) {
      setTab(nextTab);
    }
  }, [location.hash, tab]);

  useEffect(() => {
    if (!location.hash) {
      navigate(tabToHash[tab], { replace: true });
    }
  }, [location.hash, navigate, tab]);

  useEffect(() => {
    if (routeMode === 'edit' && routeId) {
      const editTeam = teams.find((item) => item.id === routeId);
      if (editTeam) {
        setFormData({
          name: editTeam.name,
          lead: editTeam.lead,
          members: Array.isArray(editTeam.members) ? editTeam.members.map(getMemberLabel).filter(Boolean).join(', ') : editTeam.members,
          project: editTeam.project,
          status: editTeam.status,
        });
        setFormErrors({});
      }
    } else {
      setFormData(emptyForm);
    }
  }, [routeId, routeMode, teams]);

  const selected = useMemo(() => teams.find((item) => item.id === selectedId) ?? teams[0] ?? null, [selectedId, teams]);
  const routeTeam = useMemo(() => teams.find((item) => item.id === routeId) ?? null, [routeId, teams]);
  const viewTeam = routeMode === 'view' ? routeTeam : null;
  const editTeam = routeMode === 'edit' ? routeTeam : null;
  const deleteTeam = useMemo(() => teams.find((item) => item.id === deleteId) ?? null, [deleteId, teams]);
  const viewSummary = useMemo(() => getMemberSummary(viewTeam?.members), [viewTeam]);
  const defaultGridColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: false,
    suppressMovable: true,
  }), []);
  const projectFocusRows = useMemo(
    () => teams.slice(0, 4).map((item) => ({
      project: item.project,
      name: item.name,
      status: item.status,
      lead: item.lead,
    })),
    [teams],
  );
  const teamOverviewCounts = useMemo(
    () => ({
      total: teams.length,
      active: teams.filter((item) => item.status === 'Active').length,
      onboarding: teams.filter((item) => item.status === 'Onboarding').length,
      completed: teams.filter((item) => item.status === 'Completed').length,
    }),
    [teams],
  );
  const teamGridColumns = useMemo(() => [
    {
      field: 'name',
      headerName: 'Team',
      minWidth: 220,
      flex: 1.1,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'people-group' },
      cellRenderer: TeamNameCell,
    },
    {
      field: 'members',
      headerName: 'Members',
      width: 130,
      valueFormatter: (params) => Array.isArray(params.value) ? String(params.value.length) : '0',
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'user' },
    },
    {
      field: 'project',
      headerName: 'Project',
      minWidth: 170,
      flex: 0.9,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'briefcase' },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      filter: 'agTextColumnFilter',
      filterParams: companyAdminGridTextFilterParams,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { headerIcon: 'circle-check' },
      cellRenderer: TeamStatusCell,
    },
    {
      headerName: 'Actions',
      colId: 'actions',
      width: 160,
      sortable: false,
      filter: false,
      resizable: false,
      headerComponent: CompanyAdminGridHeader,
      headerComponentParams: { showMenu: false, enableFilterButton: false, headerIcon: 'ellipsis-vertical' },
      cellRenderer: TeamActionsCell,
      cellRendererParams: {
        onView: (team) => ({ pathname: location.pathname, search: `?mode=view&id=${encodeURIComponent(team.id)}`, hash: tabToHash['team-setup'] }),
        onEdit: (team) => ({ pathname: location.pathname, search: `?mode=edit&id=${encodeURIComponent(team.id)}`, hash: tabToHash['team-setup'] }),
        onDelete: (team) => setDeleteId(team.id),
      },
    },
  ], [location.pathname]);

  useEffect(() => {
    if ((routeMode === 'view' || routeMode === 'edit') && routeTeam && tab !== 'team-setup') {
      setTab('team-setup');
      navigate({ pathname: location.pathname, search: location.search, hash: tabToHash['team-setup'] }, { replace: true });
    }
  }, [location.pathname, location.search, navigate, routeMode, routeTeam, tab]);

  useEffect(() => {
    if (routeMode === 'view' && routeTeam) {
      setSelectedId(routeTeam.id);
    }
  }, [routeMode, routeTeam]);

  const filteredTeams = useMemo(
    () =>
      teams.filter((item) => {
        const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
        const haystack = `${item.name} ${item.lead} ${item.project} ${item.status}`.toLowerCase();
        return matchesFilter && haystack.includes(searchTerm.toLowerCase());
      }),
    [activeFilter, searchTerm, teams],
  );

  const startCreate = () => {
    setFormErrors({});
    setFormData(emptyForm);
    setTab('team-setup');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash['team-setup'] }, { replace: true });
  };

  const goToTeamList = () => {
    setTab('teams');
    navigate({ pathname: location.pathname, search: '', hash: tabToHash.teams }, { replace: true });
  };

  const validateTeamForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Team name is required.';
    if (!formData.lead.trim()) errors.lead = 'Team lead is required.';
    if (!formData.members.trim()) errors.members = 'Add at least one member name.';
    if (!formData.project.trim()) errors.project = 'Project is required.';
    if (!formData.status.trim()) errors.status = 'Status is required.';

    const invalidMembers = splitMemberNames(formData.members).filter((name) => !employeeRosterMap.has(name.toLowerCase()));
    if (invalidMembers.length) {
      errors.members = `User not exist: ${invalidMembers.slice(0, 3).join(', ')}.`;
    }

    setFormErrors(errors);
    return errors;
  };

  const submitCreate = (event) => {
    event.preventDefault();
    const errors = validateTeamForm();
    if (Object.keys(errors).length > 0) return;
    const next = {
      id: `t-${String(Date.now()).slice(-5)}`,
      ...formData,
      members: splitMemberNames(formData.members).map((name) => employeeRosterMap.get(name.toLowerCase()) || name),
    };
    setTeams((current) => [next, ...current]);
    setSelectedId(next.id);
    setFormData(emptyForm);
    setFormErrors({});
    goToTeamList();
  };

  const submitEdit = (event) => {
    event.preventDefault();
    if (!routeId) return;
    const errors = validateTeamForm();
    if (Object.keys(errors).length > 0) return;
    setTeams((current) =>
      current.map((item) =>
        item.id === routeId
          ? {
              ...item,
              ...formData,
              members: splitMemberNames(formData.members).map((name) => employeeRosterMap.get(name.toLowerCase()) || name),
            }
          : item,
      ),
    );
    setSelectedId(routeId);
    setFormErrors({});
    goToTeamList();
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    setTeams((current) => current.filter((item) => item.id !== deleteId));
    if (selectedId === deleteId) setSelectedId(null);
    setDeleteId(null);
  };

  const confirmBulkDelete = () => {
    if (!selectedIds.length) return;
    setTeams((current) => current.filter((item) => !selectedIds.includes(item.id)));
    if (selectedIds.includes(selectedId)) setSelectedId(null);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  const handleSelectionChanged = (event) => {
    setSelectedIds(event.api.getSelectedRows().map((item) => item.id));
  };

  return (
    <DashboardShell
      activeKey={sidebarActiveKeyMap[tab] || sidebarActiveKeyMap.overview}
      headerProps={{ companyText: 'Company Admin' }}
    >
      <div className="superadmin-package-tabs company-admin-team-setup-tabs">
        {tabs.map((item) => (
          <Link
            key={item.key}
            to={{ pathname: location.pathname, search: '', hash: tabToHash[item.key] }}
            replace
            className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
            aria-current={tab === item.key ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="superadmin-section-header">
        <div className="dashboard-section-heading">{tab === 'overview' ? 'Overview' : tab === 'teams' ? 'Project Assign List' : 'Project Assign'}</div>
      </div>

      {tab === 'overview' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <SmallCard title="Assignment Summary">
              <div className="superadmin-list">
                <div className="superadmin-list-item">
                  <span>Total Assignments</span>
                  <strong>{teamOverviewCounts.total}</strong>
                </div>
                <div className="superadmin-list-item">
                  <span>Active</span>
                  <strong>{teamOverviewCounts.active}</strong>
                </div>
                <div className="superadmin-list-item">
                  <span>Onboarding</span>
                  <strong>{teamOverviewCounts.onboarding}</strong>
                </div>
                <div className="superadmin-list-item">
                  <span>Completed</span>
                  <strong>{teamOverviewCounts.completed}</strong>
                </div>
              </div>
            </SmallCard>
          </div>
          <div className="dashboard-right-col">
            <SmallCard title="Project Focus">
              <div className="superadmin-list">
                {projectFocusRows.map((item) => (
                  <div key={item.project} className="superadmin-list-item">
                    <span>{item.project}</span>
                    <strong>{item.status} · {item.lead}</strong>
                  </div>
                ))}
              </div>
            </SmallCard>
            <SmallCard title="Assignment Actions">
              <div className="superadmin-action-grid">
                <button type="button" className="superadmin-action-item active" onClick={() => navigate({ pathname: location.pathname, search: '', hash: tabToHash.teams }, { replace: true })}>
                  <strong>Open Assign List</strong>
                  <span>Review all project mappings.</span>
                </button>
                <button type="button" className="superadmin-action-item" onClick={() => startCreate()}>
                  <strong>Create Assignment</strong>
                  <span>Add a new project assignment.</span>
                </button>
              </div>
            </SmallCard>
          </div>
        </div>
      ) : null}

      {tab === 'teams' ? (
        <div className="superadmin-package-layout company-admin-list-page">
          <div className="superadmin-package-workspace">
            <div className="superadmin-package-table-card superadmin-master-grid-card">
              <div className="superadmin-master-searchbar superadmin-master-grid-headerbar">
                <div className="superadmin-master-searchbar-left">
                  <div className="superadmin-package-search superadmin-master-search">
                    <Icon name="search" size={14} />
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search team, lead, project" />
                  </div>
                </div>
                <div className="superadmin-master-searchbar-right">
                  <Link
                    to={{ pathname: location.pathname, search: '', hash: tabToHash['team-setup'] }}
                    replace
                    className="superadmin-master-action-button tone-primary"
                    onClick={() => setTab('team-setup')}
                  >
                    <Icon name="sparkles" size={14} />
                    <span>Project Assign</span>
                  </Link>
                  <button
                    type="button"
                    className="superadmin-master-action-button tone-danger icon-only"
                    onClick={() => setBulkDeleteOpen(true)}
                    disabled={!selectedIds.length}
                    aria-label="Delete selected project assignments"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
              <div className="superadmin-master-grid">
                <AgGridReact
                  theme="legacy"
                  rowData={filteredTeams}
                  columnDefs={teamGridColumns}
                  defaultColDef={defaultGridColDef}
                  domLayout="autoHeight"
                  animateRows
                  getRowId={(params) => params.data.id}
                  rowSelection={{ mode: 'multiRow', checkboxes: true, headerCheckbox: true, enableClickSelection: true }}
                  suppressCellFocus
                  pagination
                  paginationPageSize={6}
                  paginationPageSizeSelector={[6, 10, 15]}
                  headerHeight={52}
                  rowHeight={56}
                  noRowsOverlayComponent={TeamGridEmptyOverlay}
                  noRowsOverlayComponentParams={{
                    title: 'No teams found',
                    subtitle: 'Try a different search term or adjust the filters.',
                  }}
                  onSelectionChanged={handleSelectionChanged}
                  onRowClicked={(event) => {
                    if (event.data?.id) {
                      setSelectedId(event.data.id);
                    }
                  }}
                  rowClassRules={{
                    'superadmin-grid-row-selected': (params) => params.data?.id === selected?.id,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'team-setup' ? (
        <div className="superadmin-package-layout">
          <div className="superadmin-package-workspace superadmin-package-full">
            <div className="superadmin-package-form-card superadmin-package-full">
              {routeMode === 'view' ? (
                viewTeam ? (
                  <>
                    <h4>View Project Assign</h4>
                    <p className="superadmin-package-card-copy">Project assign details without a popup screen.</p>
                    <TeamForm
                      formData={viewTeam}
                      setFormData={() => {}}
                      onSubmit={(event) => event.preventDefault()}
                      submitLabel="Back to List"
                      memberOptions={memberOptions}
                      readOnly
                    />
                    <div className="superadmin-detail-card" style={{ marginTop: 16 }}>
                      <div className="superadmin-detail-head">
                        <div>
                          <strong>Member Names</strong>
                          <span>Selected employees linked to this team</span>
                        </div>
                      </div>
                      <div className="superadmin-chip-list">
                        {viewSummary.list.length ? viewSummary.list.map((name) => (
                          <span key={name} className="superadmin-chip">{name}</span>
                        )) : <div className="superadmin-empty-state">No members added.</div>}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h4>View Project Assign</h4>
                    <p className="superadmin-package-card-copy">Project assign details without a popup screen.</p>
                    <div className="superadmin-empty-state">No team selected.</div>
                    <div className="superadmin-package-form-actions">
                      <Link to={{ pathname: location.pathname, search: '', hash: tabToHash.teams }} replace className="superadmin-package-modal-button secondary">
                        Back to List
                      </Link>
                    </div>
                  </>
                )
              ) : (
                <>
                  <h4>{routeMode === 'edit' ? 'Edit Project Assign' : 'New Project Assign Entry'}</h4>
                  <p className="superadmin-package-card-copy">Compact project assign form with validation and backend-ready fields.</p>
                  <TeamForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={routeMode === 'edit' ? submitEdit : submitCreate}
                    submitLabel={routeMode === 'edit' ? 'Update Project Assign' : 'Save Project Assign'}
                    errors={formErrors}
                    memberOptions={employeeRoster}
                  />
                  {Object.keys(formErrors).length > 0 ? <div className="superadmin-package-form-alert">Please fill all required fields before saving.</div> : null}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {false && tab === 'reports' ? (
        <div className="dashboard-layout superadmin-layout">
          <div className="dashboard-left-col">
            <div className="dashboard-card superadmin-stats-card">
              <div className="superadmin-stats-grid">
                {companyAdminTeamMetrics.map((metric) => <StatBlock key={metric.label} metric={metric} />)}
              </div>
            </div>
          </div>
          <div className="dashboard-right-col">
            <div className="feed-card superadmin-action-card">
              <div className="feed-tabs">
                <button type="button" className="feed-tab active"><Icon name="chart-line" size={14} /> Monthly</button>
                <button type="button" className="feed-tab"><Icon name="people-group" size={14} /> Teams</button>
                <button type="button" className="feed-tab"><Icon name="briefcase" size={14} /> Projects</button>
              </div>
              <div className="superadmin-report-list">
                <div className="superadmin-report-row"><div><strong>Teams</strong><span>{companyAdminTeamMetrics[0].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Members</strong><span>{companyAdminTeamMetrics[2].value}</span></div><Icon name="chevron-right" size={12} /></div>
                <div className="superadmin-report-row"><div><strong>Assignments</strong><span>{companyAdminTeamMetrics[3].value}</span></div><Icon name="chevron-right" size={12} /></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {bulkDeleteOpen ? (
        <Modal
          title="Delete Selected Project Assignments"
          onClose={() => setBulkDeleteOpen(false)}
          footer={(
            <>
              <button type="button" className="superadmin-modal-button secondary" onClick={() => setBulkDeleteOpen(false)}>Cancel</button>
              <button type="button" className="superadmin-modal-button danger" onClick={confirmBulkDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-delete-copy">
            This will remove {selectedIds.length} selected project assignment{selectedIds.length === 1 ? '' : 's'} from the frontend list.
          </p>
        </Modal>
      ) : null}

      {deleteTeam ? (
        <Modal
          title="Delete Team"
          onClose={() => setDeleteId(null)}
          footer={(
            <>
              <button type="button" className="superadmin-modal-button secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button type="button" className="superadmin-modal-button danger" onClick={confirmDelete}>Delete</button>
            </>
          )}
        >
          <p className="superadmin-delete-copy">This will remove the team from the frontend list. Backend wiring can come later.</p>
        </Modal>
      ) : null}
    </DashboardShell>
  );
}
