import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { getSidebarSectionsForRole } from '../data/navigation/sidebarConfig.js';
import { resolveRoleFromStorage, resolveCurrentRoleAsync } from '../data/navigation/index.js';
import { ROLES } from '../app/config/roles';

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
    'employee management': 'Emp',
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false); // Changed to false for collapsed by default
  const [role, setRole] = useState(resolveRoleFromStorage()); // Initial role from localStorage
  const [sidebarSections, setSidebarSections] = useState(getSidebarSectionsForRole(resolveRoleFromStorage()));
  const hiddenSubmenuKeySet = new Set(hiddenSubmenuKeys);

  // Fetch fresh role from backend on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchRoleFromBackend = async () => {
      try {
        const freshRole = await resolveCurrentRoleAsync();
        if (isMounted && freshRole !== role) {
          setRole(freshRole);
          setSidebarSections(getSidebarSectionsForRole(freshRole));
        }
      } catch (error) {
        console.warn('Failed to fetch role from backend, using cached role:', error);
        // Keep using the localStorage role
      }
    };

    fetchRoleFromBackend();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const roleDisplayName = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.SUB_ADMIN]: 'Sub Admin',
    [ROLES.COMPANY_ADMIN]: 'Company Admin',
    [ROLES.HR_MANAGER]: 'HR Manager',
    [ROLES.HR_EXECUTIVE]: 'HR Executive',
    [ROLES.MANAGER]: 'Team Manager',
    [ROLES.EMPLOYEE]: 'Employee',
  }[role] || 'User';

  const userInitials = roleDisplayName.split(' ').map(word => word[0]).join('').toUpperCase();

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
          {userInitials}
        </div>
        {isSidebarExpanded && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{roleDisplayName}</div>
            <div className="sidebar-user-role">{role.replace('-', ' ')}</div>
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
            role={role}
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
          <div className="sidebar-version">
            <span>v2.1.4</span>
          </div>
        )}
      </div>
    </div>
  );
}
