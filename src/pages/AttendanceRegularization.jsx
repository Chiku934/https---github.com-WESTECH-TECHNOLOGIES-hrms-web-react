import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { ROUTES } from '../router/routePaths';

export default function AttendanceRegularization() {
  return (
    <MainLayout activeKey="user-attendance" moduleActiveKey="user-attendance">
      <div className="shell-card" style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, color: '#1e293b' }}>Attendance Regularization</h2>
            <p style={{ margin: '8px 0 0', color: '#64748b', lineHeight: 1.6 }}>
              Request corrections for missed punches, late arrivals, or other attendance exceptions.
            </p>
          </div>
          <a
            href={ROUTES.userAttendance}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 40,
              padding: '0 14px',
              borderRadius: 999,
              textDecoration: 'none',
              background: '#eef4ff',
              color: '#4f46e5',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Back to Attendance
          </a>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <section
            style={{
              border: '1px solid #e5eaf2',
              borderRadius: 16,
              background: '#fff',
              padding: 18,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: '#334155', marginBottom: 14 }}>
              Regularization Request
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Request Type</div>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {['Missed Punch', 'Late Arrival', 'Forgot Punch', 'System Issue'].map((item) => (
                    <span
                      key={item}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 999,
                        border: '1px solid #dbe5f4',
                        background: '#f8fbff',
                        color: '#334155',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Date</div>
                  <div style={{ height: 42, border: '1px solid #dbe5f4', borderRadius: 12, background: '#f8fbff' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Shift</div>
                  <div style={{ height: 42, border: '1px solid #dbe5f4', borderRadius: 12, background: '#f8fbff' }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>Reason</div>
                <div style={{ minHeight: 120, border: '1px solid #dbe5f4', borderRadius: 16, background: '#f8fbff' }} />
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{
                    border: 0,
                    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color: '#fff',
                    fontWeight: 800,
                    borderRadius: 14,
                    height: 44,
                    padding: '0 16px',
                  }}
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  style={{
                    border: '1px solid #dbe5f4',
                    background: '#fff',
                    color: '#334155',
                    fontWeight: 700,
                    borderRadius: 14,
                    height: 44,
                    padding: '0 16px',
                  }}
                >
                  Save Draft
                </button>
              </div>
            </div>
          </section>

          <aside
            style={{
              border: '1px solid #e5eaf2',
              borderRadius: 16,
              background: '#fff',
              padding: 18,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: '#334155', marginBottom: 12 }}>Quick Tips</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                'Submit requests as soon as you notice a missed punch.',
                'Use the correct shift and date so approval is faster.',
                'Add a clear reason to avoid follow-up questions.',
              ].map((tip) => (
                <div
                  key={tip}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: '#f8fbff',
                    border: '1px solid #e5eaf2',
                    color: '#475569',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {tip}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
