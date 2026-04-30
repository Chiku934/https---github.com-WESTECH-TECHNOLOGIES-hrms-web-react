import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { resolveEffectiveRoleFromStorage, resolveRoleFromStorage, roleTopNavItems, subNavItems, topNavItems } from '../data/navigation/index.js';
import { ROUTES } from '../router/routePaths';
import { ROLES } from '../app/config/roles';

function isActive(item, activeKey) {
  return item.activeKey === activeKey;
}

function NavTarget({ item, children, className = '' }) {
  if (!item?.path || item.path === '#') {
    return (
      <a href="#" className={className} onClick={(event) => event.preventDefault()}>
        {children}
      </a>
    );
  }

  return (
    <Link to={item.path} className={className} preventScrollReset>
      {children}
    </Link>
  );
}

export default function Header({
  brandText = 'HRPulse',
  companyText = '',
  activeKey = 'dashboard',
  moduleActiveKey = activeKey,
  subNavActiveKey = activeKey,
  showModuleNav = true,
  showSubNav = false,
  showActions = true,
  moduleNavItems = topNavItems,
  subNavItems: customSubNavItems = subNavItems,
}) {
  const actualRole = resolveRoleFromStorage();
  const role = resolveEffectiveRoleFromStorage();
  const location = useLocation();
  const navigate = useNavigate();
  const roleModuleNavItems = roleTopNavItems[role] ?? topNavItems;
  const effectiveModuleNavItems = moduleNavItems === topNavItems ? roleModuleNavItems : moduleNavItems;
  const isCompanyPreviewRoute = location.pathname === ROUTES.superAdminCompanyView;
  const isEmployeePreviewRoute = location.pathname === ROUTES.superAdminEmployeeView;

  // Check if user is super admin
  const isSuperAdmin = actualRole === ROLES.SUPER_ADMIN;

  const syncViewMode = (mode) => {
    window.localStorage.setItem('hrms_view_mode', mode);
    window.localStorage.setItem('hrms_persistent_view_mode', mode);
  };

  const clearViewMode = () => {
    window.localStorage.removeItem('hrms_view_mode');
    window.localStorage.removeItem('hrms_persistent_view_mode');
  };
  
  // Get current view mode from localStorage (default to actual role)
  const getCurrentViewMode = () => {
    const viewMode = window.localStorage.getItem('hrms_view_mode');
    return viewMode || role;
  };

  // Handle view mode switch
  const handleSwitchToCompanyAdminView = () => {
    syncViewMode(ROLES.COMPANY_ADMIN);
    navigate(ROUTES.superAdminCompanyView, { replace: true });
  };

  const handleSwitchToEmployeeView = () => {
    syncViewMode(ROLES.EMPLOYEE);
    navigate(ROUTES.superAdminEmployeeView, { replace: true });
  };

  const handleSwitchToSuperAdminView = () => {
    clearViewMode();
    navigate(ROUTES.dashboard, { replace: true });
  };

  const currentViewMode = isCompanyPreviewRoute
    ? 'company-view'
    : isEmployeePreviewRoute
      ? 'employee-view'
      : getCurrentViewMode();
  const persistentViewMode = window.localStorage.getItem('hrms_persistent_view_mode');
  const isInCompanyAdminView = currentViewMode === ROLES.COMPANY_ADMIN || isCompanyPreviewRoute || persistentViewMode === ROLES.COMPANY_ADMIN;
  const isInEmployeeView = currentViewMode === ROLES.EMPLOYEE || isEmployeePreviewRoute || persistentViewMode === ROLES.EMPLOYEE;
  const isInSuperAdminView = !isInCompanyAdminView && !isInEmployeeView && !persistentViewMode;
  
  // Display text for company area - show proper view mode text
  const displayRoleText = persistentViewMode === ROLES.COMPANY_ADMIN
    ? 'COMPANY VIEW'
    : persistentViewMode === ROLES.EMPLOYEE
      ? 'EMPLOYEE VIEW'
      : isCompanyPreviewRoute
        ? 'COMPANY VIEW'
        : isEmployeePreviewRoute
          ? 'EMPLOYEE VIEW'
          : currentViewMode.replace('-', ' ').toUpperCase();

  return (
    <>
      <div className="myteam-topbar">
        <div className="myteam-brand">
          <div className="myteam-brand-mark">{brandText}</div>
          <div className="myteam-company">{companyText || displayRoleText}</div>
        </div>
        <div className="myteam-search">
          <Icon name="search" size={12} />
          <input type="text" placeholder="Search employees or action (Ex: Apply Leave)" aria-label="Search" />
          <span className="hotkey-badge">Alt + K</span>
        </div>
        {showActions ? (
          <div className="myteam-actions">
            <button className="myteam-icon-btn" aria-label="Notifications">
              <Icon name="bell" />
            </button>
            <div className="myteam-profile-menu">
              <button type="button" className="myteam-profile-trigger" aria-label="Open profile menu">
                <img
                  src="/assets/images/mamata_guddu_avatar_1774439604744.png"
                  alt="User avatar"
                  className="myteam-avatar"
                />
              </button>
              <div className="myteam-profile-dropdown" role="menu" aria-label="Profile menu">
                <Link to={{ pathname: ROUTES.userSetup, search: '?mode=profile' }} className="myteam-profile-dropdown-item" role="menuitem">
                  View profile
                </Link>
                
                {/* Super Admin View Mode Options */}
                {isSuperAdmin && (
                  <>
                    <div className="myteam-profile-dropdown-divider">Switch View</div>
                    
                    {/* Current View Mode Indicator */}
                    {isInSuperAdminView && (
                      <div className="myteam-profile-dropdown-item active-view">
                        <Icon name="check" size={12} />
                        <span>Super View</span>
                      </div>
                    )}
                    {isInCompanyAdminView && (
                      <div className="myteam-profile-dropdown-item active-view">
                        <Icon name="check" size={12} />
                        <span>Company View</span>
                      </div>
                    )}
                    {isInEmployeeView && (
                      <div className="myteam-profile-dropdown-item active-view">
                        <Icon name="check" size={12} />
                        <span>Employee View</span>
                      </div>
                    )}
                    
                    {/* Switch to Company Admin View */}
                    {!isInCompanyAdminView && (
                      <button
                        type="button"
                        className="myteam-profile-dropdown-item"
                        role="menuitem"
                        onClick={handleSwitchToCompanyAdminView}
                      >
                        <Icon name="building" size={12} />
                        <span>Company View</span>
                      </button>
                    )}
                    
                    {/* Switch to Employee View */}
                    {!isInEmployeeView && (
                      <button
                        type="button"
                        className="myteam-profile-dropdown-item"
                        role="menuitem"
                        onClick={handleSwitchToEmployeeView}
                      >
                        <Icon name="user" size={12} />
                        <span>Employee View</span>
                      </button>
                    )}
                    
                    {/* Switch back to Super Admin View if not already in it */}
                    {!isInSuperAdminView && (
                      <button
                        type="button"
                        className="myteam-profile-dropdown-item"
                        role="menuitem"
                        onClick={handleSwitchToSuperAdminView}
                      >
                        <Icon name="shield" size={12} />
                        <span>Super View</span>
                      </button>
                    )}
                    
                    <div className="myteam-profile-dropdown-divider"></div>
                  </>
                )}
                
                <button
                  type="button"
                  className="myteam-profile-dropdown-item danger"
                  role="menuitem"
                  onClick={() => {
                    window.localStorage.removeItem('hrms_role');
                    clearViewMode();
                    navigate('/login', { replace: true });
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {showModuleNav && !isCompanyPreviewRoute && !isEmployeePreviewRoute && !persistentViewMode ? (
        <nav className="myteam-module-nav" aria-label="Primary navigation">
          {effectiveModuleNavItems.map((item) => (
            <NavTarget
              item={item}
              key={item.label}
              className={isActive(item, moduleActiveKey) ? 'active' : ''}
            >
              {item.label}
            </NavTarget>
          ))}
        </nav>
      ) : null}

      {showSubNav ? (
        <nav className="myteam-subnav">
          {customSubNavItems.map((item) => (
            <NavTarget
              item={item}
              key={item.label}
              className={isActive(item, subNavActiveKey) ? 'active' : ''}
            >
              {item.label}
            </NavTarget>
          ))}
        </nav>
      ) : null}
    </>
  );
}
