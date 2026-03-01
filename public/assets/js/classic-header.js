/**
 * eCampus Classic Header JS
 * Connects to the Node backend to display user data or fall back to login buttons.
 */
document.addEventListener('DOMContentLoaded', () => {

    const header = document.getElementById('classic-header');

    // Sticky Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 15) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // Profile Dropdown Toggle
    const profileBtn = document.getElementById('ch-profile-btn');
    const profileDropdown = document.getElementById('ch-profile-menu');

    if (profileBtn && profileDropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }

    // Role, Nav & Data Sync
    // For demo/prototype use localStorage. Usually this is a jwt session.
    const userRole = localStorage.getItem('user_role') || null;
    const userId = localStorage.getItem('user_id') || null;

    const guestView = document.getElementById('ch-guest-view');
    const userView = document.getElementById('ch-user-view');
    const chNavList = document.getElementById('ch-nav-dynamic');

    function renderNav() {
        if (!chNavList) return;

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const isActive = (path) => currentPath === path ? 'active' : '';

        let html = `
            <li class="ch-nav-item"><a href="index.html" class="ch-nav-link ${isActive('index.html')}">Home</a></li>
        `;

        if (userRole === 'admin') {
            html += `
                <li class="ch-nav-item"><a href="admin.html" class="ch-nav-link ${isActive('admin.html')}">Dashboard</a></li>
                <li class="ch-nav-item"><a href="admin.html#students" class="ch-nav-link">Students</a></li>
                <li class="ch-nav-item"><a href="admin.html#teachers" class="ch-nav-link">Teachers</a></li>
            `;
        } else if (userRole === 'teacher') {
            html += `
                <li class="ch-nav-item"><a href="teacher-dashboard.html" class="ch-nav-link ${isActive('teacher-dashboard.html')}">Dashboard</a></li>
                <li class="ch-nav-item"><a href="#" class="ch-nav-link">Assignments</a></li>
                <li class="ch-nav-item"><a href="#" class="ch-nav-link">Attendance</a></li>
            `;
        } else if (userRole === 'student') {
            html += `
                <li class="ch-nav-item"><a href="student-dashboard.html" class="ch-nav-link ${isActive('student-dashboard.html')}">Dashboard</a></li>
                <li class="ch-nav-item"><a href="#" class="ch-nav-link">Courses</a></li>
                <li class="ch-nav-item"><a href="results.html" class="ch-nav-link ${isActive('results.html')}">Results</a></li>
                <li class="ch-nav-item"><a href="#" class="ch-nav-link">Exams</a></li>
            `;
        } else {
            // Guest Nav
            html += `
                <li class="ch-nav-item"><a href="about.html" class="ch-nav-link ${isActive('about.html')}">About</a></li>
                <li class="ch-nav-item"><a href="academics.html" class="ch-nav-link ${isActive('academics.html')}">Academics</a></li>
                <li class="ch-nav-item"><a href="admissions.html" class="ch-nav-link ${isActive('admissions.html')}">Admissions</a></li>
                <li class="ch-nav-item"><a href="contact.html" class="ch-nav-link ${isActive('contact.html')}">Contact</a></li>
                
                <li class="ch-nav-item dropdown">
                    <a href="#" class="ch-nav-link" style="cursor: default;">
                        More 
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:5px; margin-top:2px;">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </a>
                    <ul class="ch-nav-dropdown-menu">
                        <li><a href="gallery.html" class="${isActive('gallery.html')}">Gallery</a></li>
                        <li><a href="calendar.html" class="${isActive('calendar.html')}">Calendar</a></li>
                        <li><a href="facilities.html" class="${isActive('facilities.html')}">Facilities</a></li>
                    </ul>
                </li>
            `;
        }
        chNavList.innerHTML = html;
    }

    async function loadUserData() {
        if (userRole && userId) {
            // Show logged-in view
            if (guestView) guestView.style.display = 'none';
            if (userView) userView.style.display = 'flex';

            try {
                // Fetch user info
                const resMe = await fetch(`/api/auth/me?role=${userRole}&id=${userId}`);
                const dataMe = await resMe.json();
                if (dataMe.success) {
                    const name = dataMe.user.name || dataMe.user.first_name || 'User';
                    const nameEl = document.getElementById('ch-user-name');
                    const roleEl = document.getElementById('ch-user-role');
                    const avatarEl = document.getElementById('ch-avatar');

                    if (nameEl) nameEl.textContent = name;
                    if (roleEl) roleEl.textContent = dataMe.user.role;
                    if (avatarEl) avatarEl.src = `https://ui-avatars.com/api/?name=${name}&background=0F3A62&color=fff`;
                }

                // Fetch badges
                const resNotif = await fetch(`/api/notifications/unread?role=${userRole}&id=${userId}`);
                const dataNotif = await resNotif.json();
                if (dataNotif.success && dataNotif.unread_count > 0) {
                    const el = document.getElementById('ch-notif-badge');
                    if (el) {
                        el.textContent = dataNotif.unread_count;
                        el.style.display = 'block';
                    }
                }

                const resMsg = await fetch(`/api/messages/unread?role=${userRole}&id=${userId}`);
                const dataMsg = await resMsg.json();
                if (dataMsg.success && dataMsg.unread_count > 0) {
                    const el = document.getElementById('ch-chat-badge');
                    if (el) {
                        el.textContent = dataMsg.unread_count;
                        el.style.display = 'block';
                    }
                }

            } catch (err) {
                console.error('API load failed for classic header:', err);
            }
        } else {
            // Show guest view
            if (guestView) guestView.style.display = 'flex';
            if (userView) userView.style.display = 'none';
        }
    }

    renderNav();
    loadUserData();
});
