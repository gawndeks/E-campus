/**
 * eCampus Admin Dashboard JS
 * Handles SPA navigation, sidebars, and API fetching for specific connected modules
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. SIDEBAR & MOBILE DRAWER LOGIC
       ========================================================================== */
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-sidebar');
    const closeBtn = document.getElementById('close-sidebar');

    const toggleSidebar = (force) => {
        const isOpen = sidebar.classList.contains('open');
        const state = force !== undefined ? force : !isOpen;
        if (state) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (openBtn) openBtn.addEventListener('click', () => toggleSidebar(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggleSidebar(false));
    if (overlay) overlay.addEventListener('click', () => toggleSidebar(false));


    /* ==========================================================================
       2. ACCORDION MENU LOGIC
       ========================================================================== */
    const groupBtns = document.querySelectorAll('.nav-group-btn');
    groupBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const group = e.currentTarget.closest('.nav-group');
            // Toggle expanded class
            group.classList.toggle('expanded');
        });
    });


    /* ==========================================================================
       3. SPA VIEW SWITCHING LOGIC
       ========================================================================== */
    const navLinks = document.querySelectorAll('[data-view]');
    const views = document.querySelectorAll('.admin-view');
    const topbarTitle = document.getElementById('topbar-title');

    const switchView = (viewId, title) => {
        // Hide all views
        views.forEach(v => v.classList.remove('active'));

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');

            // Re-trigger CSS animation
            targetView.style.animation = 'none';
            targetView.offsetHeight; /* trigger reflow */
            targetView.style.animation = null;
        }

        // Update Title
        if (title && topbarTitle) {
            topbarTitle.textContent = title;
        }

        // Close mobile sidebar immediately after clicking a link
        if (window.innerWidth < 1024) {
            toggleSidebar(false);
        }

        // Handle specific module API firing
        handleViewInit(viewId);
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active from all sub links and top links
            navLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const viewId = e.currentTarget.getAttribute('data-view');
            const title = e.currentTarget.textContent.trim();
            switchView(viewId, title);
        });
    });

    /* ==========================================================================
       4. API INTEGRATION (For Supported Modules)
       ========================================================================== */

    function handleViewInit(viewId) {
        if (viewId === 'view-notices') {
            fetchNotices();
        } else if (viewId === 'view-gallery') {
            fetchGallery();
        } else if (viewId === 'view-enquiries') {
            fetchEnquiries();
        }
    }

    // Notices logic (Existing API: GET /api/notices)
    function fetchNotices() {
        const tbody = document.getElementById('notices-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading notices...</td></tr>';

        fetch('/api/notices')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.notices.length > 0) {
                    tbody.innerHTML = '';
                    data.notices.forEach(n => {
                        const date = new Date(n.date).toLocaleDateString();
                        tbody.innerHTML += `
                            <tr>
                                <td>#${n.id}</td>
                                <td><strong>${n.title}</strong></td>
                                <td><span class="badge ${n.type === 'Urgent' ? 'badge-red' : 'badge-blue'}">${n.type}</span></td>
                                <td>${date}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline">Edit</button>
                                </td>
                            </tr>
                        `;
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No notices found.</td></tr>';
                }
            })
            .catch(() => tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;">Failed to load notices</td></tr>');
    }

    // Gallery Logic (Existing API: GET /api/gallery)
    function fetchGallery() {
        // Similar structure, inject into table or grid
    }

    // Enquiries Logic (Existing API: GET /api/enquiries)
    function fetchEnquiries() {
        const tbody = document.getElementById('enquiries-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading enquiries...</td></tr>';

        fetch('/api/enquiries')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.enquiries.length > 0) {
                    tbody.innerHTML = '';
                    data.enquiries.forEach(e => {
                        const date = new Date(e.created_at || Date.now()).toLocaleDateString();
                        tbody.innerHTML += `
                            <tr>
                                <td>${date}</td>
                                <td>${e.studentName}</td>
                                <td>${e.parentName}</td>
                                <td>${e.phone}</td>
                                <td><span class="badge badge-yellow">${e.classApplying}</span></td>
                                <td><button class="btn btn-sm btn-primary">Respond</button></td>
                            </tr>
                        `;
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No enquiries found.</td></tr>';
                }
            })
            .catch(() => tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Failed to load enquiries</td></tr>');
    }

});
