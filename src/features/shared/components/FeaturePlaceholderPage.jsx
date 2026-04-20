import React from 'react';
import MainLayout from '../../../layouts/MainLayout';

export default function FeaturePlaceholderPage({
  title,
  description,
  activeKey = 'dashboard',
  moduleNavItems,
  subNavItems,
  showModuleNav = false,
  showSubNav = false,
  brandText = 'PLAT',
  companyText = '',
}) {
  return (
    <MainLayout
      activeKey={activeKey}
      brandText={brandText}
      companyText={companyText}
      showModuleNav={showModuleNav}
      showSubNav={showSubNav}
      moduleNavItems={moduleNavItems}
      subNavItems={subNavItems}
    >
      <div className="placeholder-page">
        <section className="placeholder-card">
          <div className="placeholder-kicker">Frontend Only</div>
          <h1 className="placeholder-title">{title}</h1>
          <p className="placeholder-description">{description}</p>
          <div className="placeholder-grid">
            <div className="placeholder-panel">
              <strong>What to add next</strong>
              <span>Forms, filters, tables, dialogs, validation, and mock data interactions.</span>
            </div>
            <div className="placeholder-panel">
              <strong>Backend later</strong>
              <span>API hooks, role permissions, database persistence, and server validation.</span>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
