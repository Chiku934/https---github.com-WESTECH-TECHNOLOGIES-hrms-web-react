import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';

export default function DashboardShell({
  activeKey = 'dashboard',
  children,
  headerProps = {},
  showSidebarSubmenus = true,
  hiddenSidebarSubmenuKeys = [],
}) {
  const location = useLocation();

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = 'dashboard-page';
    return () => {
      document.body.className = previous;
    };
  }, []);

  return (
    <div className="dashboard-shell">
      <Sidebar
        activeKey={activeKey}
        showSectionSubmenus={showSidebarSubmenus}
        hiddenSubmenuKeys={hiddenSidebarSubmenuKeys}
      />
      <div className="dashboard-main">
        <Header brandText="HRPulse" showModuleNav={false} {...headerProps} />
        <div key={`${location.pathname}${location.search}${location.hash}`} className="dashboard-content dashboard-content-transition">
          {children}
        </div>
        <div className="dashboard-watermark" />
      </div>
    </div>
  );
}
