// Admin Layout Injection and Core Logic
document.addEventListener('DOMContentLoaded', () => {
    initAdminLayout();
});

function initAdminLayout() {
    const layoutHTML = `
        <nav class="admin-sidebar" id="adminSidebar">
            <div class="sidebar-header">
                <div class="logo"><i class="fas fa-graduation-cap"></i></div>
                <h2 class="brand-text">eCampus</h2>
            </div>
            <div class="sidebar-scroll">
                <ul class="sidebar-menu">
                    <li><a href="/admin/index.html" class="menu-item" data-path="/admin/index.html"><span class="icon"><i class="fas fa-chart-pie"></i></span><span class="text">Dashboard</span></a></li>
                    <li><a href="/admin/students/list.html" class="menu-item" data-path="/admin/students"><span class="icon"><i class="fas fa-user-graduate"></i></span><span class="text">Manage Students</span></a></li>
                    <li><a href="/admin/teachers/list.html" class="menu-item" data-path="/admin/teachers"><span class="icon"><i class="fas fa-chalkboard-teacher"></i></span><span class="text">Manage Teachers</span></a></li>
                    <li><a href="/admin/classes/list.html" class="menu-item" data-path="/admin/classes"><span class="icon"><i class="fas fa-school"></i></span><span class="text">Manage Classes</span></a></li>
                    <li><a href="/admin/subjects/list.html" class="menu-item" data-path="/admin/subjects"><span class="icon"><i class="fas fa-book-open"></i></span><span class="text">Manage Courses</span></a></li>
                    <li><a href="/admin/attendance/students.html" class="menu-item" data-path="/admin/attendance"><span class="icon"><i class="fas fa-calendar-check"></i></span><span class="text">Attendance</span></a></li>
                    <li><a href="/admin/fees/structure.html" class="menu-item" data-path="/admin/fees"><span class="icon"><i class="fas fa-money-check-alt"></i></span><span class="text">Fees Management</span></a></li>
                    <li><a href="/admin/exams/list.html" class="menu-item" data-path="/admin/exams"><span class="icon"><i class="fas fa-file-alt"></i></span><span class="text">Exams & Results</span></a></li>
                    <li><a href="/admin/notices/list.html" class="menu-item" data-path="/admin/notices"><span class="icon"><i class="fas fa-bullhorn"></i></span><span class="text">Notices</span></a></li>
                    <li><a href="/admin/users/list.html" class="menu-item" data-path="/admin/users"><span class="icon"><i class="fas fa-user-shield"></i></span><span class="text">Admin Users</span></a></li>
                    <li><a href="/admin/cms/pages.html" class="menu-item" data-path="/admin/cms"><span class="icon"><i class="fas fa-globe"></i></span><span class="text">Website CMS</span></a></li>
                    <li><a href="/admin/profile.html" class="menu-item" data-path="/admin/profile"><span class="icon"><i class="fas fa-cog"></i></span><span class="text">Settings</span></a></li>
                    <li><a href="/admin/login.html" class="menu-item text-danger" onclick="localStorage.removeItem('token');" style="margin-top: 20px;"><span class="icon"><i class="fas fa-sign-out-alt"></i></span><span class="text">Logout</span></a></li>
                </ul>
            </div>
        </nav>
        <main class="admin-main" id="adminMain">
            <header class="admin-header">
                <div class="header-left">
                    <button id="sidebarToggle" class="icon-btn" aria-label="Toggle Sidebar">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 id="pageTitle" class="page-title">Loading...</h1>
                </div>
                
                <div class="header-center search-container" style="flex: 1; max-width: 400px; margin: 0 20px; position: relative; display: none;">
                    <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
                    <input type="text" placeholder="Search students, staff or classes..." style="width: 100%; padding: 10px 15px 10px 40px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg-main); color: var(--text-main); outline: none;">
                </div>

                <div class="header-right">
                    <span id="currentDateDisplay" style="color: var(--text-muted); font-size: 0.9rem; font-weight: 500; font-family: 'Poppins', sans-serif; display: none;"></span>
                    <button class="icon-btn theme-toggle" id="themeToggle" aria-label="Toggle Dark Mode"><i class="fas fa-moon"></i></button>
                    <div class="header-notif">
                        <button class="icon-btn" aria-label="Notifications">
                            <i class="fas fa-bell"></i>
                        </button>
                        <span class="badge">3</span>
                    </div>
                    <div class="header-profile">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=1e3a8a&color=fff" alt="Profile" class="h-avatar">
                        <div class="profile-info">
                            <span class="user-name">Super Admin</span>
                        </div>
                    </div>
                </div>
            </header>
            <div class="admin-content" id="adminContent">
                <!-- Content gets moved here -->
            </div>
        </main>
        <div id="toastContainer" class="toast-container"></div>
    `;

    // Wrap body
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = layoutHTML;
    document.getElementById('adminContent').innerHTML = originalContent;

    // Show dynamic date
    const dateSpan = document.getElementById('currentDateDisplay');
    if (dateSpan) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateSpan.textContent = new Date().toLocaleDateString('en-US', options);
        if (window.innerWidth > 768) {
            dateSpan.style.display = 'block';
            document.querySelector('.search-container').style.display = 'block';
        }
    }

    setupLayoutInteractions();
}

function setupLayoutInteractions() {
    // Sidebar toggle
    const sidebar = document.getElementById('adminSidebar');
    const main = document.getElementById('adminMain');
    const toggleBtn = document.getElementById('sidebarToggle');

    // Check local storage for sidebar state
    if (localStorage.getItem('sidebar_collapsed') === 'true') {
        sidebar.classList.add('collapsed');
        main.classList.add('expanded');
    }

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        main.classList.toggle('expanded');
        localStorage.setItem('sidebar_collapsed', sidebar.classList.contains('collapsed'));
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });

    // Active link highlighting & Page Title
    const currentPath = window.location.pathname;
    const menuItems = document.querySelectorAll('.menu-item');
    let matched = false;

    menuItems.forEach(item => {
        const itemPath = item.getAttribute('data-path');
        if (currentPath === itemPath || (itemPath !== '/admin/index.html' && currentPath.startsWith(itemPath))) {
            item.classList.add('active');
            let txt = item.querySelector('.text').textContent;

            // Sub page title overrides
            if (currentPath.includes('add.html') || currentPath.includes('create.html')) txt = 'Add ' + txt;
            if (currentPath.includes('edit.html')) txt = 'Edit ' + txt;
            if (currentPath.includes('assign.html')) txt = 'Assign ' + txt;

            document.getElementById('pageTitle').textContent = txt;
            matched = true;
        }
    });

    if (!matched && document.getElementById('pageTitle')) {
        document.getElementById('pageTitle').textContent = 'Admin Portal';
    }
}

// Global functions for pages
window.showToast = function (message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span>' + message + '</span>';
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
};

window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
};

// Auto attach close events to generic modal close buttons
document.addEventListener('click', (e) => {
    if (e.target.closest('.modal-close')) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('active');
    }
});
