import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from './Icon';
import { resolveRoleFromStorage, roleTopNavItems, subNavItems, topNavItems } from '../data/navigation/index.js';
import { ROUTES } from '../router/routePaths';

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
  brandText = 'PLAT',
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
  const role = resolveRoleFromStorage();
  const navigate = useNavigate();
  const roleModuleNavItems = roleTopNavItems[role] ?? topNavItems;
  const effectiveModuleNavItems = moduleNavItems === topNavItems ? roleModuleNavItems : moduleNavItems;

  return (
    <>
      <div className="myteam-topbar">
        <div className="myteam-brand">
          <div className="myteam-brand-mark">{brandText}</div>
          <div className="myteam-company">{companyText || role.replace('-', ' ').toUpperCase()}</div>
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
                <button
                  type="button"
                  className="myteam-profile-dropdown-item danger"
                  role="menuitem"
                  onClick={() => {
                    window.localStorage.removeItem('hrms_role');
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

      {showModuleNav ? (
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
