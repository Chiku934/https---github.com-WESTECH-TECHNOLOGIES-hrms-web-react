import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardShell from '../../shared/components/DashboardShell';

function PreviewCard({ title, description, routes = [] }) {
  return (
    <section className="dashboard-card superadmin-package-mini-card">
      <div className="dashboard-card-title">{title}</div>
      <div className="superadmin-package-insight">
        <strong>{description}</strong>
      </div>
      <div className="superadmin-list" style={{ marginTop: 12 }}>
        {routes.map((item) => (
          <Link key={item.label} to={item.to} className="superadmin-list-item" replace>
            <span>{item.label}</span>
            <strong>{item.note}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function FeaturePreview({
  activeKey = 'dashboard',
  title,
  subtitle,
  tabs,
  sections,
  companyText,
  intro,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(tabs[0]?.key || 'overview');

  const tabToHash = useMemo(() => tabs.reduce((acc, item) => ({ ...acc, [item.key]: item.hash }), {}), [tabs]);
  const hashToTab = useMemo(() => tabs.reduce((acc, item) => ({ ...acc, [item.hash]: item.key }), {}), [tabs]);

  useEffect(() => {
    const nextTab = hashToTab[location.hash] || tabs[0]?.key || 'overview';
    if (tab !== nextTab) {
      setTab(nextTab);
    }
  }, [hashToTab, location.hash, tab, tabs]);

  useEffect(() => {
    if (!location.hash && tabToHash[tab]) {
      navigate({ pathname: location.pathname, search: '', hash: tabToHash[tab] }, { replace: true });
    }
  }, [location.hash, location.pathname, navigate, tab, tabToHash]);

  const currentSection = sections.find((item) => item.key === tab) || sections[0];

  return (
    <DashboardShell activeKey={activeKey} headerProps={{ companyText }}>
      <div className="superadmin-section-header">
        <div>
          <div className="dashboard-section-heading">{title}</div>
          <div className="superadmin-package-detail-note">{subtitle}</div>
        </div>
      </div>

      <div className="superadmin-package-tabs" role="tablist" aria-label={`${title} tabs`}>
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`superadmin-package-tab ${tab === item.key ? 'active' : ''}`}
            onClick={() => {
              setTab(item.key);
              navigate({ pathname: location.pathname, search: '', hash: tabToHash[item.key] }, { replace: true });
            }}
            aria-current={tab === item.key ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="dashboard-layout welcome-layout">
        <div className="welcome-main">
          <PreviewCard
            title={currentSection?.title || 'Preview'}
            description={currentSection?.description || intro}
            routes={currentSection?.routes || []}
          />
        </div>

        <div className="dashboard-right-col">
          <section className="dashboard-card superadmin-package-mini-card">
            <div className="dashboard-card-title">What this preview means</div>
            <div className="superadmin-package-insight">
              <strong>{intro}</strong>
              <span>This is a super-admin preview. It keeps the full feature set visible even if a company later gets a smaller permission set.</span>
            </div>
          </section>

          <section className="dashboard-card superadmin-package-mini-card">
            <div className="dashboard-card-title">Enabled modules</div>
            <div className="superadmin-list">
              {sections.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`superadmin-list-item ${tab === item.key ? 'active' : ''}`.trim()}
                  onClick={() => {
                    setTab(item.key);
                    navigate({ pathname: location.pathname, search: '', hash: tabToHash[item.key] }, { replace: true });
                  }}
                >
                  <span>{item.label}</span>
                  <strong>{item.summary}</strong>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
