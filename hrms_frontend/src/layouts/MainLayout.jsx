import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function MainLayout({
  children,
  activeKey = 'dashboard',
  moduleActiveKey = activeKey,
  subNavActiveKey = activeKey,
  brandText = 'HRPulse',
  companyText = '',
  showModuleNav = true,
  showSubNav = false,
  moduleNavItems,
  subNavItems,
}) {
  return (
    <div className="myteam-shell">
      <Sidebar activeKey={activeKey} />
      <div className="myteam-main">
        <Header
          brandText={brandText}
          companyText={companyText}
          activeKey={activeKey}
          moduleActiveKey={moduleActiveKey}
          subNavActiveKey={subNavActiveKey}
          showModuleNav={showModuleNav}
          showSubNav={showSubNav}
          moduleNavItems={moduleNavItems}
          subNavItems={subNavItems}
        />
        <main className="myteam-content">
          {children}
        </main>
      </div>
    </div>
  );
}
