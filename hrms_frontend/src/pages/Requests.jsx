import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Icon from '../components/Icon';

const taskGroups = [
  { key: 'attendance', label: 'Attendance Regularization', icon: 'calendar-check' },
  { key: 'leave', label: 'Leave Requests', icon: 'clipboard' },
  { key: 'exit', label: 'Exit Request', icon: 'right-from-bracket' },
  { key: 'wfh', label: 'Working Remotely', icon: 'house' },
  { key: 'probation', label: 'Probation Feedbacks', icon: 'comments' },
];

const notificationsSeed = [
  {
    id: 'n1',
    title: 'Policy update published',
    body: 'Leave policy for FY 2026-27 is now available.',
    time: '12 min ago',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Payroll reminder',
    body: 'Please submit expense claims before Friday.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Team meeting scheduled',
    body: 'Quarterly review invite was accepted by all participants.',
    time: 'Yesterday',
    unread: false,
  },
];

const requestSeed = [
  {
    id: 'att-1',
    groupKey: 'attendance',
    name: 'Subrat Kumar Sahoo',
    timeAgo: '6 hours ago',
    title: 'Attendance Regularization - 02 Apr 2026',
    note: 'Due to emergency work',
    avatar: '/assets/images/avatar1.png',
    status: 'Pending',
    kind: 'attendance',
    requestedByLine: 'Requested by Subrat Kumar Sahoo on 03 Apr 2026 07:34 am',
    detailTitle: 'Attendance Regularization request',
    dayBox: { day: '02', weekday: 'THU' },
    detailMeta: [
      ['Request Date', '02 Apr 2026'],
      ['Shift', 'General Shift'],
      ['Location', 'Bhubaneswar'],
      ['Regularization Type', 'Time correction'],
    ],
    punchRows: [
      ['IN', '11:07 AM'],
      ['OUT', '11:16 AM'],
      ['IN', '11:18 AM'],
      ['OUT', '01:16 PM'],
      ['IN', '01:17 PM'],
      ['OUT', '01:45 PM'],
      ['IN', '01:45 PM'],
      ['OUT', '01:52 PM'],
      ['IN', '02:05 PM'],
      ['OUT', '02:16 PM'],
      ['IN', '04:39 PM'],
    ],
  },
  {
    id: 'att-2',
    groupKey: 'attendance',
    name: 'Prajwal Chandra Nayak',
    timeAgo: '13 hours ago',
    title: 'Attendance Regularization - 02 Apr 2026',
    note: 'health issues',
    avatar: '/assets/images/avatar2.png',
    status: 'Pending',
    kind: 'attendance',
    requestedByLine: 'Requested by Prajwal Chandra Nayak on 03 Apr 2026 06:22 am',
    detailTitle: 'Attendance Regularization request',
    dayBox: { day: '02', weekday: 'THU' },
    detailMeta: [
      ['Request Date', '02 Apr 2026'],
      ['Shift', 'General Shift'],
      ['Location', 'Bhubaneswar'],
      ['Regularization Type', 'Manual punch correction'],
    ],
    punchRows: [
      ['IN', '10:55 AM'],
      ['OUT', '11:03 AM'],
      ['IN', '11:10 AM'],
      ['OUT', '01:12 PM'],
      ['IN', '01:38 PM'],
      ['OUT', '04:45 PM'],
    ],
  },
  {
    id: 'leave-1',
    groupKey: 'leave',
    name: 'Kajal Dikhit',
    timeAgo: '4 hours ago',
    title: 'Leave Request - 31 Mar 2026',
    note: 'Half day leave request',
    avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png',
    status: 'Pending',
    kind: 'leave',
    requestedByLine: 'Requested by Kajal Dikhit on 03 Apr 2026 08:18 am',
    detailTitle: 'Leave request',
    dayBox: { day: '31', weekday: 'MON' },
    detailMeta: [
      ['Leave Dates', '31 Mar 2026 - 01 Apr 2026'],
      ['Leave Type', 'Earned Leave'],
      ['Duration', '1.0 Day'],
      ['Reason', 'Personal work'],
    ],
    punchRows: [],
  },
  {
    id: 'leave-2',
    groupKey: 'leave',
    name: 'Arpita Panda',
    timeAgo: '8 hours ago',
    title: 'Leave Request - 01 Apr 2026',
    note: 'Medical appointment',
    avatar: '/assets/images/avatar2.png',
    status: 'Pending',
    kind: 'leave',
    requestedByLine: 'Requested by Arpita Panda on 03 Apr 2026 08:50 am',
    detailTitle: 'Leave request',
    dayBox: { day: '01', weekday: 'TUE' },
    detailMeta: [
      ['Leave Dates', '01 Apr 2026'],
      ['Leave Type', 'Sick Leave'],
      ['Duration', '1.0 Day'],
      ['Reason', 'Medical appointment'],
    ],
    punchRows: [],
  },
  {
    id: 'exit-1',
    groupKey: 'exit',
    name: 'Bikram Behera',
    timeAgo: '1 day ago',
    title: 'Exit Request - Notice Period',
    note: 'Resignation submitted',
    avatar: '/assets/images/avatar1.png',
    status: 'Pending',
    kind: 'exit',
    requestedByLine: 'Requested by Bikram Behera on 02 Apr 2026 10:12 am',
    detailTitle: 'Exit request',
    dayBox: { day: '15', weekday: 'WED' },
    detailMeta: [
      ['Last Working Day', '15 Apr 2026'],
      ['Notice Period', '30 Days'],
      ['Reason', 'Career growth opportunity'],
      ['Handover', 'In progress'],
    ],
    punchRows: [],
  },
  {
    id: 'wfh-1',
    groupKey: 'wfh',
    name: 'Radharani Behera',
    timeAgo: '2 hours ago',
    title: 'Work from Home - 03 Apr 2026',
    note: 'Internet issue at office',
    avatar: '/assets/images/avatar2.png',
    status: 'Pending',
    kind: 'wfh',
    requestedByLine: 'Requested by Radharani Behera on 03 Apr 2026 09:02 am',
    detailTitle: 'Work from home request',
    dayBox: { day: '03', weekday: 'FRI' },
    detailMeta: [
      ['Date', '03 Apr 2026'],
      ['Location', 'Home'],
      ['Reason', 'Internet issue at office'],
      ['Approval Note', 'Pending manager sign-off'],
    ],
    punchRows: [],
  },
  {
    id: 'wfh-2',
    groupKey: 'wfh',
    name: 'Chitra Nayak',
    timeAgo: '5 hours ago',
    title: 'Work from Home - 04 Apr 2026',
    note: 'Doctor appointment',
    avatar: '/assets/images/mamata_guddu_avatar_1774439604744.png',
    status: 'Pending',
    kind: 'wfh',
    requestedByLine: 'Requested by Chitra Nayak on 03 Apr 2026 09:44 am',
    detailTitle: 'Work from home request',
    dayBox: { day: '04', weekday: 'SAT' },
    detailMeta: [
      ['Date', '04 Apr 2026'],
      ['Location', 'Home'],
      ['Reason', 'Doctor appointment'],
      ['Approval Note', 'Pending manager sign-off'],
    ],
    punchRows: [],
  },
  {
    id: 'prob-1',
    groupKey: 'probation',
    name: 'Soumya Mishra',
    timeAgo: '3 hours ago',
    title: 'Probation feedback - Cycle 2',
    note: 'Needs review',
    avatar: '/assets/images/avatar1.png',
    status: 'Pending',
    kind: 'probation',
    requestedByLine: 'Requested by HR on 03 Apr 2026 09:55 am',
    detailTitle: 'Probation feedback',
    dayBox: { day: 'C2', weekday: 'REV' },
    detailMeta: [
      ['Reviewer', 'Team lead'],
      ['Cycle', 'Cycle 2'],
      ['Summary', 'Consistent delivery, needs communication improvement'],
      ['Outcome', 'Pending approval'],
    ],
    punchRows: [],
  },
  {
    id: 'prob-2',
    groupKey: 'probation',
    name: 'Puja Sahu',
    timeAgo: '5 hours ago',
    title: 'Probation feedback - Cycle 1',
    note: 'Awaiting comments',
    avatar: '/assets/images/avatar2.png',
    status: 'Pending',
    kind: 'probation',
    requestedByLine: 'Requested by HR on 03 Apr 2026 10:14 am',
    detailTitle: 'Probation feedback',
    dayBox: { day: 'C1', weekday: 'REV' },
    detailMeta: [
      ['Reviewer', 'Delivery manager'],
      ['Cycle', 'Cycle 1'],
      ['Summary', 'Good progress and ownership'],
      ['Outcome', 'Pending approval'],
    ],
    punchRows: [],
  },
];

function RequestRow({ item, selected, onSelect }) {
  return (
    <button type="button" className={`requests-list-item${selected ? ' active' : ''}`} onClick={() => onSelect(item.id)}>
      <img className="requests-list-avatar" src={item.avatar} alt="" />
      <div className="requests-list-copy">
        <div className="requests-list-head">
          <strong>{item.name}</strong>
          <span>{item.timeAgo}</span>
        </div>
        <div className="requests-list-title">{item.title}</div>
        <div className="requests-list-note">{item.note}</div>
        <div className="requests-list-footer">
          <span className={`requests-status-pill status-${item.status.toLowerCase()}`}>{item.status}</span>
          <span className="requests-list-kind">{item.kind}</span>
        </div>
      </div>
    </button>
  );
}

function SectionMeta({ detailMeta }) {
  return (
    <div className="requests-meta-grid">
      {detailMeta.map(([label, value]) => (
        <div className="requests-meta-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function PunchTable({ rows }) {
  return (
    <table className="requests-table">
      <colgroup>
        <col />
        <col className="requests-time-col" />
      </colgroup>
      <thead>
        <tr>
          <th className="requests-punch-head">Punch Type</th>
          <th className="requests-time-head">Time Entry</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([type, time], index) => (
          <tr className="requests-table-row" key={`${type}-${time}-${index}`}>
            <td className="requests-punch-cell">
              <div className="requests-punch-type">
                <span className={`requests-punch-mark ${type.toLowerCase()}`}>{type === 'IN' ? '↙' : '↗'}</span>
                <strong>{type}</strong>
              </div>
            </td>
            <td className="requests-time-cell">
              <div className="requests-time-entry">{time}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function detailCopy(item) {
  if (!item) return null;

  return (
    <>
      <div className="requests-detail-header">
        <img className="requests-detail-avatar" src={item.avatar} alt="" />
        <div className="requests-detail-copy">
          <div className="requests-detail-name">{item.name}</div>
          <div className="requests-detail-sub">{item.requestedByLine}</div>
        </div>
      </div>

      <div className="requests-day-card">
        <div className="requests-day-date">
          <strong>{item.dayBox.day}</strong>
          <span>{item.dayBox.weekday}</span>
        </div>
        <div className="requests-day-title">{item.detailTitle}</div>
      </div>
    </>
  );
}

export default function Requests() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = location.pathname.includes('/requests/notifications')
    ? 'notifications'
    : location.pathname.includes('/requests/archive')
      ? 'archive'
      : 'take-action';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedGroupKey, setSelectedGroupKey] = useState('attendance');
  const [selectedRequestId, setSelectedRequestId] = useState('att-1');
  const [requests, setRequests] = useState(requestSeed);
  const [notifications, setNotifications] = useState(notificationsSeed);
  const [search, setSearch] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [comment, setComment] = useState('');
  const [selectedNotificationId, setSelectedNotificationId] = useState('n1');

  useEffect(() => {
    const previous = document.body.className;
    document.body.className = `${previous} requests-page`.trim();
    return () => {
      document.body.className = previous;
    };
  }, []);

  useEffect(() => {
    const pathToTab = {
      '/requests/take-action': 'take-action',
      '/requests/notifications': 'notifications',
      '/requests/archive': 'archive',
    };
    const nextTab = pathToTab[location.pathname];
    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab);
      setComment('');
    }
  }, [activeTab, location.pathname]);

  const pendingCounts = useMemo(() => {
    return Object.fromEntries(
      taskGroups.map((group) => [
        group.key,
        requests.filter((item) => item.bucket !== 'archive' && item.groupKey === group.key).length,
      ]),
    );
  }, [requests]);

  const archiveCount = requests.filter((item) => item.bucket === 'archive').length;
  const unreadCount = notifications.filter((item) => item.unread).length;
  const takeActionCount = requests.filter((item) => item.bucket !== 'archive').length;

  const tabs = [
    { label: `Take Action (${takeActionCount})`, key: 'take-action' },
    { label: `Notifications (${unreadCount})`, key: 'notifications' },
    { label: `Archive (${archiveCount})`, key: 'archive' },
  ];

  const visibleGroup = useMemo(() => {
    return taskGroups.find((group) => group.key === selectedGroupKey) || taskGroups[0];
  }, [selectedGroupKey]);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (activeTab === 'notifications') {
      const list = notifications.filter((item) => !term || `${item.title} ${item.body} ${item.time}`.toLowerCase().includes(term));
      return sortNewest ? list : [...list].reverse();
    }

    const list = requests.filter((item) => {
      const inCurrentBucket = activeTab === 'archive' ? item.bucket === 'archive' : item.bucket !== 'archive';
      const matchesGroup = activeTab === 'take-action' ? item.groupKey === selectedGroupKey : true;
      const haystack = `${item.name} ${item.title} ${item.note} ${item.status} ${item.kind}`.toLowerCase();
      return inCurrentBucket && matchesGroup && (!term || haystack.includes(term));
    });

    return sortNewest ? list : [...list].reverse();
  }, [activeTab, notifications, requests, search, selectedGroupKey, sortNewest]);

  const selectedRequest = useMemo(() => {
    if (activeTab === 'notifications') {
      return notifications.find((item) => item.id === selectedNotificationId) || visibleItems[0] || null;
    }
    return visibleItems.find((item) => item.id === selectedRequestId) || visibleItems[0] || null;
  }, [activeTab, notifications, selectedNotificationId, selectedRequestId, visibleItems]);

  useEffect(() => {
    if (!visibleItems.length) {
      setSelectedRequestId('');
      return;
    }

    if (activeTab === 'notifications') {
      if (!visibleItems.some((item) => item.id === selectedNotificationId)) {
        setSelectedNotificationId(visibleItems[0].id);
      }
      return;
    }

    if (!visibleItems.some((item) => item.id === selectedRequestId)) {
      setSelectedRequestId(visibleItems[0].id);
    }
  }, [activeTab, selectedRequestId, visibleItems]);

  useEffect(() => {
    if (activeTab === 'take-action' && pendingCounts[selectedGroupKey] === 0) {
      const nextGroup = taskGroups.find((group) => pendingCounts[group.key] > 0);
      if (nextGroup) {
        setSelectedGroupKey(nextGroup.key);
      }
    }
  }, [activeTab, pendingCounts, selectedGroupKey]);

  const activeListTitle = useMemo(() => {
    if (activeTab === 'notifications') return 'Notifications';
    if (activeTab === 'archive') return 'Archive';
    return visibleGroup.label;
  }, [activeTab, visibleGroup.label]);

  const handleDecision = (decision) => {
    if (!selectedRequest || activeTab !== 'take-action') return;

    setRequests((current) =>
      current.map((item) =>
        item.id === selectedRequest.id
          ? {
              ...item,
              bucket: 'archive',
              status: decision === 'approve' ? 'Approved' : 'Rejected',
              handledAt: 'just now',
            }
          : item,
      ),
    );
    setComment('');
  };

  return (
    <MainLayout
      activeKey={activeTab === 'notifications' ? 'requests-notifications' : activeTab === 'archive' ? 'requests-archive' : 'requests-take-action'}
      moduleActiveKey="dashboard"
      subNavActiveKey="dashboard"
      showModuleNav={false}
      showSubNav={false}
      moduleNavItems={[]}
    >
      <div className="requests-page-shell">
        <div className="requests-tabs">
          {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`requests-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => {
                  navigate(tab.key === 'take-action' ? '/requests/take-action' : tab.key === 'notifications' ? '/requests/notifications' : '/requests/archive');
                  setActiveTab(tab.key);
                  if (tab.key === 'take-action' && pendingCounts[selectedGroupKey] === 0) {
                    const nextGroup = taskGroups.find((group) => pendingCounts[group.key] > 0);
                    if (nextGroup) setSelectedGroupKey(nextGroup.key);
                  }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

          <section className="requests-workspace">
            <aside className="requests-left">
              <div className="requests-sidebar-title">
                {activeTab === 'take-action' ? 'Pending Tasks' : activeTab === 'notifications' ? 'Notification Center' : 'Archive Filters'}
              </div>

            {activeTab === 'take-action' ? (
              <div className="requests-sidebar-list">
                {taskGroups.map((item) => {
                  const count = pendingCounts[item.key] || 0;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`requests-task-link${selectedGroupKey === item.key ? ' active' : ''}${count === 0 ? ' disabled' : ''}`}
                      onClick={() => {
                        if (count > 0) {
                          setSelectedGroupKey(item.key);
                          setSelectedRequestId('');
                        }
                      }}
                    >
                      <span className="requests-task-icon">
                        <Icon name={item.icon} size={14} />
                      </span>
                      <span className="requests-task-label">{item.label}</span>
                      <span className="requests-task-count">({count})</span>
                    </button>
                  );
                })}
              </div>
            ) : activeTab === 'notifications' ? (
              <div className="requests-sidebar-list">
                {[
                  ['Unread', unreadCount],
                  ['Read', notifications.length - unreadCount],
                  ['Policy', 1],
                  ['Payroll', 1],
                ].map(([label, count]) => (
                  <button key={label} type="button" className="requests-task-link">
                    <span className="requests-task-icon">
                      <Icon name="bell" size={14} />
                    </span>
                    <span className="requests-task-label">{label}</span>
                    <span className="requests-task-count">({count})</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="requests-sidebar-list">
                {[
                  ['Approved', requests.filter((item) => item.bucket === 'archive' && item.status === 'Approved').length],
                  ['Rejected', requests.filter((item) => item.bucket === 'archive' && item.status === 'Rejected').length],
                  ['Handled Today', requests.filter((item) => item.bucket === 'archive').length],
                ].map(([label, count]) => (
                  <button key={label} type="button" className="requests-task-link">
                    <span className="requests-task-icon">
                      <Icon name="clock-rotate-left" size={14} />
                    </span>
                    <span className="requests-task-label">{label}</span>
                    <span className="requests-task-count">({count})</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <section className="requests-middle">
            <div className="requests-middle-toolbar">
              <label className="requests-select-all">
                <input
                  type="checkbox"
                  checked={visibleItems.length > 0 && visibleItems.every((item) => item.id === selectedRequestId)}
                  onChange={() => {}}
                />
              </label>
              <div className="requests-middle-title">{activeListTitle}</div>
              <button type="button" className="requests-sort-btn" onClick={() => setSortNewest((value) => !value)}>
                {sortNewest ? 'Newest' : 'Oldest'} <Icon name="caret-down" size={10} />
              </button>
            </div>

            <div className="requests-search-wrap">
              <Icon name="search" size={12} />
              <input
                type="search"
                placeholder="Search"
                aria-label="Search requests"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="requests-list">
              {activeTab === 'notifications'
                ? visibleItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`requests-notification-item${item.unread ? ' unread' : ''}${selectedNotificationId === item.id ? ' active' : ''}`}
                      onClick={() => {
                        setSelectedNotificationId(item.id);
                        setNotifications((current) =>
                          current.map((notification) =>
                            notification.id === item.id ? { ...notification, unread: false } : notification,
                          ),
                        );
                      }}
                    >
                      <div className="requests-notification-dot" />
                      <div className="requests-notification-copy">
                        <div className="requests-list-head">
                          <strong>{item.title}</strong>
                          <span>{item.time}</span>
                        </div>
                        <div className="requests-list-title">{item.body}</div>
                      </div>
                    </button>
                  ))
                : visibleItems.map((item) => (
                    <RequestRow
                      key={item.id}
                      item={item}
                      selected={selectedRequest?.id === item.id}
                      onSelect={setSelectedRequestId}
                    />
                  ))}
              {!visibleItems.length ? <div className="requests-empty-state">Nothing to show for this view.</div> : null}
            </div>
          </section>

          <section className="requests-detail">
            {selectedRequest ? (
              activeTab === 'notifications' ? (
                <>
                  <div className="requests-detail-header">
                    <div className="requests-detail-copy">
                      <div className="requests-detail-name">{selectedRequest.title}</div>
                      <div className="requests-detail-sub">{selectedRequest.body}</div>
                    </div>
                  </div>
                  <div className="requests-detail-body">
                    <SectionMeta
                      detailMeta={[
                        ['Received', selectedRequest.time],
                        ['State', selectedRequest.unread ? 'Unread' : 'Read'],
                        ['Channel', 'System notification'],
                        ['Priority', selectedRequest.unread ? 'High' : 'Normal'],
                      ]}
                    />
                  </div>
                </>
              ) : (
                <>
                  {detailCopy(selectedRequest)}
                  <div className="requests-detail-body">
                    {selectedRequest.kind === 'attendance' && <PunchTable rows={selectedRequest.punchRows} />}
                    {selectedRequest.kind !== 'attendance' && <SectionMeta detailMeta={selectedRequest.detailMeta} />}
                  </div>
                </>
              )
            ) : (
              <div className="requests-empty-detail">
                <div className="requests-empty-title">No item selected</div>
                <div className="requests-empty-copy">Pick a request from the middle column to see the full details.</div>
              </div>
            )}
            <div className="requests-footer">
              <input
                className="requests-comment"
                type="text"
                placeholder={activeTab === 'archive' ? 'Add comment here' : 'Add comment or reject reason here'}
                aria-label="Add comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              <div className="requests-actions">
                <button type="button" className="requests-icon-btn" aria-label="Comment">
                  <Icon name="comments" size={16} />
                </button>
                <button type="button" className="requests-approve" onClick={() => handleDecision('approve')} disabled={activeTab !== 'take-action'}>
                  Approve
                </button>
                <button type="button" className="requests-reject" onClick={() => handleDecision('reject')} disabled={activeTab !== 'take-action'}>
                  Reject
                </button>
              </div>
            </div>
          </section>
        </section>
      </div>
    </MainLayout>
  );
}
