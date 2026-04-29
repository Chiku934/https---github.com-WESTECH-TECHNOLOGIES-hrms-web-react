import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { getSidebarSectionsForRoleAndPermissions, viewModeSidebarSections } from '../data/navigation/sidebarConfig.js';
import { resolveRoleFromStorage, resolveCurrentRoleAsync } from '../data/navigation/index.js';
import { normalizeCompanyPermissionCodes } from '../data/navigation/companyPermissions';
import { ROLES } from '../app/config/roles';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../router/routePaths';

// Helper function to get effective role (view mode if set, otherwise actual role)
function getEffectiveRole() {
  if (typeof window === 'undefined') {
    return resolveRoleFromStorage();
  }
  
  const viewMode = window.localStorage.getItem('hrms_view_mode');
  if (viewMode && [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.EMPLOYEE].includes(viewMode)) {
    return viewMode;
  }
  
  return resolveRoleFromStorage();
}

function getStoredPermissions() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const permissions = [];

    const rawPermissions = window.localStorage.getItem('permissions');
    if (rawPermissions) {
      const parsed = JSON.parse(rawPermissions);
      if (Array.isArray(parsed)) {
        permissions.push(...parsed);
      }
    }

    const rawCompany = window.localStorage.getItem('company');
    if (rawCompany) {
      const parsedCompany = JSON.parse(rawCompany);
      if (Array.isArray(parsedCompany?.permissions)) {
        permissions.push(...parsedCompany.permissions);
      }
      if (Array.isArray(parsedCompany?.extra_data?.permissions)) {
        permissions.push(...parsedCompany.extra_data.permissions);
      }
    }

    const rawUser = window.localStorage.getItem('user');
    if (rawUser) {
      const parsedUser = JSON.parse(rawUser);
      if (Array.isArray(parsedUser?.permissions)) {
        permissions.push(...parsedUser.permissions);
      }
      if (Array.isArray(parsedUser?.extra_data?.permissions)) {
        permissions.push(...parsedUser.extra_data.permissions);
      }
    }

    return [...normalizeCompanyPermissionCodes(permissions)];
  } catch (error) {
    return [];
  }
}

function getUserDisplayName(user = {}) {
  const profile = user.profile || {};
  const fullName = String(profile.full_name || '').trim();
  if (fullName) return fullName;

  const combinedName = [
    profile.first_name || user.first_name || '',
    profile.middle_name || user.middle_name || '',
    profile.last_name || user.last_name || '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (combinedName) return combinedName;

  const plainName = String(user.name || '').trim();
  if (plainName) return plainName;

  const emailName = String(user.email || '').trim();
  if (emailName) return emailName.split('@')[0];

  return '';
}

// Helper function to generate short names for sections when sidebar is collapsed
function getSectionShortName(label) {
  if (!label) return '';
  
  // Common abbreviations for sidebar sections
  const abbreviationMap = {
    'dashboard': 'Dash',
    'user setup': 'User',
    'employee management': 'Emp',
    'package management': 'Pkg',
    'master settings': 'Master',
    'reporting': 'Report',
    'reports': 'Report',
    'attendance': 'Attend',
    'leave': 'Leave',
    'timesheet': 'Time',
    'permissions': 'Perm',
    'holiday list': 'Holiday',
    'project management': 'Project',
    'team setup': 'Team',
    'support': 'Support',
    'helpdesk': 'Help',
    'performance': 'Perf',
    'expenses': 'Exp',
    'payroll': 'Pay',
    'requests': 'Req',
  };
  
  const lowerLabel = label.toLowerCase();
  if (abbreviationMap[lowerLabel]) {
    return abbreviationMap[lowerLabel];
  }
  
  // Fallback: take first word or first 4-5 characters
  const words = label.split(' ');
  if (words.length > 1) {
    // For multi-word labels, take first word
    return words[0].substring(0, 5);
  }
  
  // For single word labels, take first 4 characters
  return label.substring(0, 4);
}

function isPathActive(to, location) {
  if (!to || to === '#') {
    return false;
  }

  const [pathname, hash = ''] = String(to).split('#');
  if (location.pathname !== pathname) {
    return false;
  }

  if (!hash) {
    return true;
  }

  return location.hash === `#${hash}`;
}

function isItemActive(item, activeKey, location) {
  if (item.activeKey && item.activeKey === activeKey) {
    return true;
  }

  if (isPathActive(item.path, location)) {
    return true;
  }

  return item.children?.some((child) => isItemActive(child, activeKey, location)) ?? false;
}

function isSectionActive(section, activeKey, location, role) {
  if (role === ROLES.EMPLOYEE && activeKey && activeKey.startsWith('myteam_hiring')) {
    return false;
  }

  return (
    section.activeKeys.includes(activeKey) ||
    section.items.some((item) => isItemActive(item, activeKey, location)) ||
    section.items.some((item) => isPathActive(item.path, location))
  );
}

function NavTarget({ to, className = '', children }) {
  if (!to || to === '#') {
    return (
      <a href="#" className={className} onClick={(event) => event.preventDefault()}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className} preventScrollReset>
      {children}
    </Link>
  );
}

function SidebarItem({ item, activeKey, location, depth = 0, isExpanded = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children?.length > 0;
  const isActive = isItemActive(item, activeKey, location);
  
  const itemClassName = [
    'sidebar-item',
    depth > 0 ? 'sidebar-item--nested' : '',
    hasChildren ? 'sidebar-item--has-children' : '',
    isActive ? 'active' : '',
    !isExpanded ? 'collapsed' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="sidebar-item-wrapper" key={item.activeKey || item.label}>
      <NavTarget 
        to={hasChildren ? '#' : item.path} 
        className={itemClassName}
        onClick={handleClick}
      >
        <div className="sidebar-item-icon">
          {depth === 0 && item.icon ? (
            <Icon name={item.icon} size={18} />
          ) : (
            <div className="sidebar-item-dot"></div>
          )}
        </div>
        {isExpanded && (
          <>
            <span className="sidebar-item-label">{item.label}</span>
            {hasChildren && (
              <Icon 
                name={isOpen ? 'chevron-up' : 'chevron-down'} 
                className="sidebar-item-chevron" 
                size={12} 
              />
            )}
            {item.badgeCount && item.badgeCount > 0 && (
              <span className="sidebar-item-badge">{item.badgeCount}</span>
            )}
          </>
        )}
      </NavTarget>
      
      {hasChildren && isOpen && isExpanded && (
        <div className="sidebar-submenu">
          {item.children.map((child) => (
            <SidebarItem
              key={child.activeKey || child.label}
              item={child}
              activeKey={activeKey}
              location={location}
              depth={depth + 1}
              isExpanded={isExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarSection({ section, activeKey, location, isExpanded, role }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isActive = isSectionActive(section, activeKey, location, role);
  const hasMultipleItems = section.items.length > 1;
  const shortName = getSectionShortName(section.label);
  
  // Get default path: use section.path if defined, otherwise first item's path
  const defaultPath = section.path || (section.items.length > 0 ? section.items[0].path : '#');

  const sectionClassName = [
    'sidebar-section',
    isActive ? 'active' : '',
    isCollapsed ? 'collapsed' : '',
    !isExpanded ? 'sidebar-section--collapsed' : ''
  ]
    .filter(Boolean)
    .join(' ');

  const handleSectionClick = (e) => {
    // If clicking on chevron, don't navigate - just toggle collapse
    if (e.target.closest('.sidebar-section-chevron')) {
      if (hasMultipleItems) {
        setIsCollapsed(!isCollapsed);
      }
      e.stopPropagation();
      return;
    }
    
    // Otherwise, navigate to default path
    if (defaultPath && defaultPath !== '#') {
      // Navigation will be handled by NavTarget
    }
  };

  const handleChevronClick = (e) => {
    if (hasMultipleItems) {
      setIsCollapsed(!isCollapsed);
    }
    e.stopPropagation();
  };

  return (
    <div className={sectionClassName}>
      <NavTarget
        to={defaultPath}
        className="sidebar-section-header"
        onClick={handleSectionClick}
      >
        <div className="sidebar-section-icon">
          <Icon name={section.icon} size={18} />
        </div>
        {isExpanded && (
          <>
            <span className="sidebar-section-label">{section.label}</span>
            {hasMultipleItems && (
              <Icon
                name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                className="sidebar-section-chevron"
                size={12}
                onClick={handleChevronClick}
              />
            )}
          </>
        )}
        {!isExpanded && shortName && (
          <div className="sidebar-section-shortname">
            {shortName}
          </div>
        )}
      </NavTarget>
      
      {(!isCollapsed || !hasMultipleItems) && isExpanded && (
        <div className="sidebar-section-items">
          {section.items.map((item) => (
            <SidebarItem
              key={item.activeKey || item.label}
              item={item}
              activeKey={activeKey}
              location={location}
              isExpanded={isExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  activeKey = 'dashboard',
  showSectionSubmenus: showSectionSubmenusProp = true,
  hiddenSubmenuKeys = [],
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // Get user data from AuthContext
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Changed to false for collapsed by default
  const effectiveRole = getEffectiveRole();
  const [actualRole, setActualRole] = useState(effectiveRole); // Store actual role from backend
  const hiddenSubmenuKeySet = new Set(hiddenSubmenuKeys);

  // Fetch fresh role from backend on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchRoleFromBackend = async () => {
      try {
        const freshRole = await resolveCurrentRoleAsync();
        if (isMounted) {
          setActualRole(freshRole); // Always update actual role
        }
      } catch (error) {
        console.warn('Failed to fetch role from backend, using cached role:', error);
        // Keep using the current role
      }
    };

    fetchRoleFromBackend();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Get role for sidebar navigation (view mode if set, otherwise actual role)
  const getRoleForSidebar = () => {
    const viewMode = window.localStorage.getItem('hrms_view_mode');
    const persistentViewMode = window.localStorage.getItem('hrms_persistent_view_mode');
    const isCompanyPreviewRoute = location.pathname === ROUTES.superAdminCompanyView;
    const isEmployeePreviewRoute = location.pathname === ROUTES.superAdminEmployeeView;
    
    // Set persistent view mode when entering preview routes
    if (isCompanyPreviewRoute) {
      window.localStorage.setItem('hrms_persistent_view_mode', ROLES.COMPANY_ADMIN);
      return ROLES.COMPANY_ADMIN;
    }
    
    if (isEmployeePreviewRoute) {
      window.localStorage.setItem('hrms_persistent_view_mode', ROLES.EMPLOYEE);
      return ROLES.EMPLOYEE;
    }
    
    // Use persistent view mode if set, otherwise use regular view mode
    const effectiveViewMode = persistentViewMode || viewMode;
    
    if (effectiveViewMode && [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.EMPLOYEE].includes(effectiveViewMode)) {
      return effectiveViewMode;
    }
    
    // Clear persistent view mode when returning to normal Super Admin mode
    if (persistentViewMode) {
      window.localStorage.removeItem('hrms_persistent_view_mode');
    }
    
    return actualRole;
  };

  // Get role for profile display (always actual role, never view mode)
  const getRoleForProfile = () => {
    return actualRole;
  };

  const roleForSidebar = getRoleForSidebar();
  const roleForProfile = getRoleForProfile();
  const sidebarPermissions = Array.isArray(user?.permissions) && user.permissions.length > 0
    ? user.permissions
    : getStoredPermissions();
  
  // Use view-mode-specific configurations (without Dashboard) when in persistent view mode
  const persistentViewMode = window.localStorage.getItem('hrms_persistent_view_mode');
  
  let sidebarSections;
  if (persistentViewMode === ROLES.COMPANY_ADMIN) {
    // For persistent Company View, use Company Admin sections without Dashboard
    sidebarSections = viewModeSidebarSections[ROLES.COMPANY_ADMIN];
  } else if (persistentViewMode === ROLES.EMPLOYEE) {
    // For persistent Employee View, use Employee sections without Dashboard
    sidebarSections = viewModeSidebarSections[ROLES.EMPLOYEE];
  } else {
    // For normal mode, use role-based sections with permissions
    sidebarSections = getSidebarSectionsForRoleAndPermissions(roleForSidebar, sidebarPermissions);
  }
  
  // Get user profile data
  const userProfile = user?.profile;
  const userName = getUserDisplayName(user);
  
  const userEmail = user?.email || '';
  const userPhotoUrl = userProfile?.photo_url;
  
  // Fallback to role display if no name available
  const roleDisplayName = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.COMPANY_ADMIN]: 'Company Admin',
    [ROLES.EMPLOYEE]: 'Employee',
  }[roleForProfile] || 'User';
  
  const displayName = userName || roleDisplayName;
  const displayRole = roleForProfile.replace('-', ' ');
  
  // Calculate initials from name or role (max 2 letters)
  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'U';
    
    // For single word, take first letter
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    
    // For multiple words, take first letter of first and last word (max 2 letters)
    const firstLetter = words[0][0].toUpperCase();
    const lastLetter = words[words.length - 1][0].toUpperCase();
    return firstLetter + lastLetter;
  };
  
  const userInitials = getInitials(userName || roleDisplayName);

  return (
    <div className={`sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {isSidebarExpanded ? (
            <>
              <div className="sidebar-brand-logo">HR</div>
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-title">HRPulse</span>
              </div>
            </>
          ) : (
            <div className="sidebar-brand-logo">HR</div>
          )}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          aria-label={isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Icon name={isSidebarExpanded ? 'chevron-left' : 'chevron-right'} size={16} />
        </button>
      </div>

      {/* User Profile */}
      <div className="sidebar-user-profile">
        <div className="sidebar-user-avatar">
          {userPhotoUrl ? (
            <img
              src={userPhotoUrl}
              alt={displayName}
              className="sidebar-user-avatar-img"
            />
          ) : (
            <span className="sidebar-user-avatar-initials">{userInitials}</span>
          )}
        </div>
        {isSidebarExpanded && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-role">{userEmail || displayRole}</div>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav">
        {sidebarSections.map((section) => (
          <SidebarSection
            key={section.key}
            section={section}
            activeKey={activeKey}
            location={location}
            isExpanded={isSidebarExpanded}
            role={roleForSidebar}
          />
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={() => {
            window.localStorage.removeItem('hrms_role');
            navigate('/login', { replace: true });
          }}
        >
          <Icon name="right-from-bracket" size={16} />
          {isSidebarExpanded && <span>Logout</span>}
        </button>
        
        {isSidebarExpanded && (
          <>
            {(persistentViewMode === ROLES.COMPANY_ADMIN || persistentViewMode === ROLES.EMPLOYEE) && (
              <button
                type="button"
                className="sidebar-return-btn"
                onClick={() => {
                  window.localStorage.removeItem('hrms_persistent_view_mode');
                  navigate('/dashboard');
                }}
              >
                <Icon name="arrow-left" size={16} />
                <span>Return to Super Admin</span>
              </button>
            )}
            <div className="sidebar-version">
              <span>v2.1.4</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
