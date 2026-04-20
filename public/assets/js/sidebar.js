/**
 * Sidebar flyout helper with a dedicated floating layer.
 */

function initSidebarFlyouts() {
    const normalizeRoute = (value) => {
        const raw = (value || '').split('?')[0].split('#')[0].trim();
        const lastSegment = raw.split('/').pop() || '';
        return lastSegment
            .replace(/\.php$/i, '')
            .replace(/\.html$/i, '')
            .toLowerCase();
    };

    const currentPath = normalizeRoute(window.location.pathname);
    const currentHash = (window.location.hash || '').replace(/^#/, '').toLowerCase();

    let activeSource = null;
    let closeTimer = null;

    const layer = document.createElement('div');
    layer.className = 'sidebar-flyout-layer';
    const panel = document.createElement('div');
    panel.className = 'sidebar-flyout-panel';
    layer.appendChild(panel);
    document.body.appendChild(layer);

    const clearCloseTimer = () => {
        if (closeTimer) {
            window.clearTimeout(closeTimer);
            closeTimer = null;
        }
    };

    const setPanelPosition = (source) => {
        if (!source) return;
        const trigger = source.querySelector('.sidebar-subitem--trigger, .sidebar-link');
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const margin = 12;
        const maxTop = Math.max(margin, window.innerHeight - (panel.offsetHeight || 0) - margin);
        const top = Math.max(margin, Math.min(rect.top, maxTop));

        panel.style.top = `${top}px`;
        panel.style.left = `${rect.right}px`;
    };

    const openFlyout = (source) => {
        if (!source) return;
        clearCloseTimer();

        if (activeSource && activeSource !== source) {
            activeSource.classList.remove('is-open');
        }

        const sourcePanel = source.querySelector('.sidebar-expandable-panel');
        if (!sourcePanel) return;

        panel.innerHTML = `<div class="flyout-content">${sourcePanel.innerHTML}</div>`;
        panel.style.display = 'flex';
        panel.classList.add('is-open');
        activeSource = source;
        setPanelPosition(source);
    };

    const closeFlyout = (source) => {
        if (!source) return;
        source.classList.remove('is-open');
        if (activeSource === source) {
            activeSource = null;
        }
        panel.classList.remove('is-open');
        window.setTimeout(() => {
            if (!panel.classList.contains('is-open')) {
                panel.style.display = 'none';
            }
        }, 220);
    };

    document.querySelectorAll('.sidebar-expandable').forEach((expandable) => {
        const sourcePanel = expandable.querySelector('.sidebar-expandable-panel');
        const trigger = expandable.querySelector('.sidebar-subitem--trigger, .sidebar-link');
        if (!sourcePanel || !trigger) return;

        expandable.addEventListener('mouseenter', () => {
            openFlyout(expandable);
        });

        expandable.addEventListener('mouseleave', () => {
            clearCloseTimer();
            closeTimer = window.setTimeout(() => closeFlyout(expandable), 160);
        });

        trigger.addEventListener('mouseenter', () => {
            openFlyout(expandable);
        });
    });

    document.addEventListener('mouseover', (event) => {
        const trigger = event.target.closest('.sidebar-subitem--trigger');
        if (!trigger) return;
        const expandable = trigger.closest('.sidebar-expandable');
        if (!expandable) return;
        openFlyout(expandable);
    });

    panel.addEventListener('mouseenter', () => {
        clearCloseTimer();
        panel.classList.add('is-open');
        panel.style.display = 'flex';
    });

    panel.addEventListener('mouseleave', () => {
        clearCloseTimer();
        closeTimer = window.setTimeout(() => {
            panel.classList.remove('is-open');
            if (activeSource) {
                activeSource.classList.remove('is-open');
                activeSource = null;
            }
            panel.style.display = 'none';
        }, 160);
    });

    const activateMatchingItem = () => {
        document.querySelectorAll('[data-sidebar-path]').forEach((item) => {
            const path = normalizeRoute(item.getAttribute('data-sidebar-path') || '');
            const hash = (item.getAttribute('data-sidebar-hash') || '').toLowerCase();

            if (path !== currentPath) return;
            if (hash && hash !== currentHash) return;

            item.classList.add('active');
            const section = item.closest('.sidebar-section');
            if (section) section.classList.add('active');
            const expandable = item.closest('.sidebar-expandable');
            if (expandable) {
                expandable.classList.add('active');
            }
        });
    };

    activateMatchingItem();

    const sectionLinks = [
        { id: 'sidebar-me-link', paths: ['user-attendance', 'timesheet', 'user-leave', 'user-performance', 'user-performance-meetings', 'user-performance-feedback', 'user-performance-pip', 'user-performance-reviews', 'user-performance-skills', 'user-performance-competencies', 'user-expenses', 'user-support'] },
        { id: 'sidebar-my-team-link', paths: ['myteam_leave_overview', 'myteam_leave_approvals', 'myteam_leave_direct', 'myteam_leave_indirect', 'myteam_leave_digital_services'] },
    ];

    sectionLinks.forEach(({ id, paths }) => {
        const link = document.getElementById(id);
        if (!link) return;
        if (paths.includes(currentPath)) {
            link.classList.add('active');
            const section = link.closest('.sidebar-section');
            if (section) section.classList.add('active');
        }
    });

    window.addEventListener('scroll', () => {
        if (activeSource && panel.classList.contains('is-open')) {
            setPanelPosition(activeSource);
        }
    }, true);

    window.addEventListener('resize', () => {
        if (activeSource && panel.classList.contains('is-open')) {
            setPanelPosition(activeSource);
        }
    });
}

window.initSidebarFlyouts = initSidebarFlyouts;
