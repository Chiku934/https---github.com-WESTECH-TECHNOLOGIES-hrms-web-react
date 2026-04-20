/**
 * Header Handler
 * Manages the dynamic loading and configuration of the HRMS header.
 */

const HeaderHandler = {
    // Current Configuration
    config: {
        title: 'Dashboard',
        subtitle: 'Welcome, Admin',
        activeModule: 'dashboard',
        activeTab: '',
        focusMode: false,
        showModuleNav: true,
        showTabBar: true,
        modules: [
            { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge', url: 'dashboard.php' },
            { id: 'me', label: 'Me', icon: 'fa-user', url: 'user-attendance.php' },
            { id: 'inbox', label: 'Inbox', icon: 'fa-inbox', url: 'requests.php', badge: 25 },
            { id: 'finances', label: 'My Finances', icon: 'fa-wallet', url: 'payroll.php' }
        ],
        // Module-specific navigation (Secondary Header)
        secondaryNav: {
            'me': [
                { id: 'attendance', label: 'Attendance', icon: 'fa-regular fa-calendar-check', url: 'user-attendance.php' },
                { id: 'timesheet', label: 'Timesheet', icon: 'fa-regular fa-clock', url: 'timesheet.php' },
                { id: 'leave', label: 'Leave', icon: 'fa-regular fa-calendar-minus', url: 'user-leave.php' },
                { id: 'performance', label: 'Performance', icon: 'fa-solid fa-chart-line', url: 'user-performance.php' },
                { id: 'expenses', label: 'Expenses & Travel', icon: 'fa-solid fa-plane-departure', url: 'user-expenses.php' },
                { id: 'helpdesk', label: 'Helpdesk', icon: 'fa-solid fa-headset', url: 'user-support.php' },
            ],
            'dashboard': []
        },
        // Module-specific tabs (Tertiary Header)
        tabs: {
            'attendance': [
                { id: 'log', label: 'Attendance Log', url: 'user-attendance.php' },
                { id: 'requests', label: 'Attendance Requests', url: '#' },
                { id: 'regularization', label: 'Regularization', url: 'user-attendance-regularization.php' }
            ],
            'timesheet': [
                { id: 'all', label: 'All Timesheets', url: 'timesheet.php' },
                { id: 'past', label: 'Past Due', url: '#', badge: 4 },
                { id: 'rejected', label: 'Rejected Timesheets', url: '#' },
                { id: 'project-time', label: 'Project Time', url: '#' },
                { id: 'time-summary', label: 'Time Summary', url: '#' },
                { id: 'my-tasks', label: 'My Tasks', url: '#' },
                { id: 'projects-allocated', label: 'Projects Allocated', url: '#' }
            ],
            'leave': [
                { id: 'summary', label: 'Leave Summary', url: 'user-leave.php' },
                { id: 'apply', label: 'Apply Leave', url: 'user-leave-apply.php' },
                { id: 'logs', label: 'Leave Logs', url: 'user-leave-status.php' }
            ]
        }
    },

    /**
     * Initializes the header
     * @param {Object} override - Configuration overrides for the specific page
     */
    init(override = {}) {
        this.config = { ...this.config, ...override };

        // Fetch and Inject Header
        fetch('/HRMS/app/includes/header.php?v=' + new Date().getTime())
            .then(response => response.text())
            .then(html => {
                const container = document.getElementById('header-container');
                if (container) {
                    container.innerHTML = html;
                    if (this.config.focusMode) {
                        this.applyFocusModeStyles();
                    } else {
                        this.applyConfig();
                    }
                }
            })
            .catch(error => console.error('Error loading header:', error));
    },

    /**
     * Applies styles for focus mode (hides module nav and tab bar)
     */
    applyFocusModeStyles() {
        // Still apply basic title if needed
        document.getElementById('header-title').innerText = this.config.title;
        document.getElementById('header-subtitle').innerText = this.config.subtitle;

        const moduleNav = document.getElementById('header-module-nav');
        const tabBar = document.getElementById('header-tab-bar');
        if (moduleNav) moduleNav.style.display = 'none';
        if (tabBar) tabBar.style.display = 'none';
    },

    /**
     * Applies the current configuration to the injected HTML
     */
    applyConfig() {
        // Update Title & Subtitle
        document.getElementById('header-title').innerText = this.config.title;
        document.getElementById('header-subtitle').innerText = this.config.subtitle;

        // Update Module Nav (Secondary)
        const moduleList = document.getElementById('header-module-list');
        const secondaryItems = this.config.secondaryNav[this.config.activeModule] || [];

        if (secondaryItems.length > 0 && this.config.showModuleNav) {
            moduleList.innerHTML = secondaryItems.map(item => {
                const subItems = this.config.tabs[item.id] || [];
                const hasSubmenu = subItems.length > 0;

                return `
                <li class="module-nav-item-wrapper">
                    <a href="${item.url}" class="module-nav-item ${item.id === this.config.activeSecondary ? 'active' : ''}">
                        ${item.icon ? `<i class="${item.icon}"></i>` : ''} 
                        <span>${item.label}</span>
                        ${hasSubmenu ? `<i class="fa-solid fa-chevron-down submenu-indicator"></i>` : ''}
                    </a>
                    ${hasSubmenu ? `
                    <div class="header-submenu">
                        <div class="header-submenu-header">${item.label} Details</div>
                        <ul class="header-submenu-list">
                            ${subItems.map(sub => `
                                <li>
                                    <a href="${sub.url}" class="header-submenu-item ${sub.id === this.config.activeTab ? 'active' : ''}">
                                        <span>${sub.label}</span>
                                        ${sub.badge ? `<span class="nav-badge">${sub.badge}</span>` : ''}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </li>
            `}).join('');
            document.getElementById('header-module-nav').style.display = 'block';
        } else {
            document.getElementById('header-module-nav').style.display = 'none';
        }

        // Update Tabs (Tertiary)
        const tabList = document.getElementById('header-tab-list');
        const tabItems = this.config.tabs[this.config.activeSecondary] || [];

        if (tabItems.length > 0 && this.config.showTabBar) {
            tabList.innerHTML = tabItems.map(item => `
                <li>
                    <a href="${item.url}" class="tab-item ${item.id === this.config.activeTab ? 'active' : ''}">
                        ${item.label} ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                    </a>
                </li>
            `).join('');
            document.getElementById('header-tab-bar').style.display = 'block';
        } else {
            document.getElementById('header-tab-bar').style.display = 'none';
        }
    }
};

// Global Exposure
window.HeaderHandler = HeaderHandler;

