/**
 * eCampus Admin Dashboard JS (ERP MASTER System)
 * Handles SPA navigation, sidebars, JWT Auth, and fully connected API fetching.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       0. JWT SECURE AUTHENTICATION SYSTEM
       ========================================================================== */
    const TokenEngine = {
        getToken: () => localStorage.getItem('erp_token'),
        setToken: (token) => localStorage.setItem('erp_token', token),
        clear: () => {
            localStorage.removeItem('erp_token');
            localStorage.removeItem('erp_admin');
        }
    };

    const loginOverlay = document.getElementById('erp-login-overlay');
    const loginForm = document.getElementById('erp-login-form');
    const loginError = document.getElementById('erp-login-error');

    // On Load: Check if securely authenticated (Bypassed for Direct Open)
    TokenEngine.setToken('dummy_token');
    localStorage.setItem('erp_admin', JSON.stringify({ name: 'Admin User', role: 'admin' }));
    if (loginOverlay) loginOverlay.style.display = 'none';
    initAdminSystem();

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.textContent = 'Authenticating...';
            btn.disabled = true;

            const email = document.getElementById('erp-email').value;
            const password = document.getElementById('erp-password').value;

            try {
                const res = await fetch('/api/admin/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (data.success) {
                    TokenEngine.setToken(data.token);
                    localStorage.setItem('erp_admin', JSON.stringify(data.admin));
                    loginOverlay.style.display = 'none';
                    initAdminSystem();
                } else {
                    loginError.textContent = data.message || 'Access Denied';
                    loginError.style.display = 'block';
                }
            } catch (err) {
                loginError.textContent = 'Server connectivity failed.';
                loginError.style.display = 'block';
            } finally {
                btn.textContent = 'Authenticate';
                btn.disabled = false;
            }
        });
    }

    // Logout
    const logoutBtns = document.querySelectorAll('[data-action="logout"]');
    logoutBtns.forEach(b => b.addEventListener('click', () => {
        if (confirm('Disconnect secure session?')) {
            TokenEngine.clear();
            window.location.reload();
        }
    }));


    /* ==========================================================================
       1. SIDEBAR & MOBILE DRAWER LOGIC
       ========================================================================== */
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggleSidebar = (force) => {
        const isOpen = sidebar.classList.contains('open');
        const state = force !== undefined ? force : !isOpen;
        if (state) {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
        } else {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }
    };

    document.querySelectorAll('#open-sidebar').forEach(b => b.addEventListener('click', () => toggleSidebar(true)));
    document.querySelectorAll('#close-sidebar').forEach(b => b.addEventListener('click', () => toggleSidebar(false)));
    if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));

    /* ==========================================================================
       2. ACCORDION MENU LOGIC
       ========================================================================== */
    document.querySelectorAll('.nav-group-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.currentTarget.closest('.nav-group').classList.toggle('expanded');
        });
    });

    /* ==========================================================================
       3. SPA VIEW SWITCHING LOGIC
       ========================================================================== */
    const navLinks = document.querySelectorAll('[data-view]');
    const views = document.querySelectorAll('.admin-view');
    const topbarTitle = document.getElementById('topbar-title');

    const switchView = (viewId, title) => {
        views.forEach(v => v.classList.remove('active'));
        const targetView = document.getElementById(viewId);
        if (targetView) targetView.classList.add('active');
        if (title && topbarTitle) topbarTitle.textContent = title;
        if (window.innerWidth < 1024) toggleSidebar(false);
        fireModuleAPI(viewId);
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');
            switchView(e.currentTarget.getAttribute('data-view'), e.currentTarget.textContent.trim());
        });
    });

    /* ==========================================================================
       4. GLOBAL API FETCHER (JWT Injected)
       ========================================================================== */
    async function erpFetch(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TokenEngine.getToken()}`
        };
        const res = await fetch(`/api/admin${endpoint}`, { ...options, headers });
        if (res.status === 401) {
            TokenEngine.clear();
            window.location.reload();
        }
        return res.json();
    }

    /* ==========================================================================
       5. CORE MODULE BOOTSTRAPPING
       ========================================================================== */

    function initAdminSystem() {
        const adr = JSON.parse(localStorage.getItem('erp_admin'));
        const userHeader = document.querySelector('.sidebar-user-info h4');
        if (userHeader && adr) userHeader.textContent = adr.name;

        // Initial dashboard fire
        fireModuleAPI('view-dashboard');
    }

    // Routing Multiplexer
    function fireModuleAPI(viewId) {
        if (viewId === 'view-dashboard') loadDashboardStats();
        if (viewId === 'view-student-list') loadStudentsTable();
        // Add modules logically
    }

    /* ==========================================================================
       Module: DASHBOARD
       ========================================================================== */
    async function loadDashboardStats() {
        const res = await erpFetch('/dashboard/stats');
        if (res.success && document.querySelector('#view-dashboard.active')) {
            // Find stats cards in DOM and inject dynamically
            const cards = document.querySelectorAll('#view-dashboard .stat-card .stat-number');
            if (cards.length >= 2) {
                cards[0].textContent = res.stats.total_students || 0;
                cards[1].textContent = res.stats.total_teachers || 0;
            }
        }
    }

    /* ==========================================================================
       Module: STUDENTS LIST (Example Table Data Render)
       ========================================================================== */
    async function loadStudentsTable() {
        // Find or create Table mapping
        const tableBody = document.querySelector('#student-list-tbody');
        if (!tableBody) return;
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Fetching central database...</td></tr>';

        try {
            const res = await erpFetch('/students');
            if (res.success) {
                if (res.data.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No student records found.</td></tr>';
                } else {
                    tableBody.innerHTML = res.data.map(s => `
                        <tr>
                            <td>${s.admission_no || '-'}</td>
                            <td><strong>${s.name}</strong></td>
                            <td>${s.class_name || '-'} (${s.section_name || '-'})</td>
                            <td>${s.parent_name || 'N/A'}</td>
                            <td>
                                <span class="badge ${s.status === 1 ? 'badge-success' : 'badge-danger'}">
                                    ${s.status === 1 ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="alert('Viewing ID: ${s.id}')">View</button>
                                <button class="btn btn-warning btn-sm" onclick="alert('Edit logic triggered')">Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteStudent(${s.id})">Drop</button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (err) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">API Connection Error</td></tr>';
        }
    }

    // Global exposed deletes
    window.deleteStudent = async (id) => {
        if (!confirm('Permanently perform soft-deletion on this student record?')) return;
        const res = await erpFetch(`/students/${id}`, { method: 'DELETE' });
        if (res.success) loadStudentsTable();
    };

});
