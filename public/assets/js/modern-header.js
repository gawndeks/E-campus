/**
 * eCampus Modern Dynamic Header Logic
 * Handles Role-based navigation, Notifications, Chat, and Scroll animations.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- State & Mock Config ---
    // In a real application, ID and ROLE come from JWT/Session
    const currentUser = {
        role: localStorage.getItem('user_role') || 'student', // 'student', 'teacher', 'admin'
        id: localStorage.getItem('user_id') || 1
    };

    // --- Elements ---
    const header = document.getElementById('dynamic-header');
    const profileToggle = document.getElementById('profile-toggle');
    const notifToggle = document.getElementById('notif-toggle');
    const chatToggle = document.getElementById('chat-toggle');
    const chatPanel = document.getElementById('chat-panel');
    const chatOverlay = document.getElementById('chat-overlay');
    const closeChatBtn = document.getElementById('close-chat');

    // --- 1. Sticky Header Scroll Effect ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // --- 2. Dropdown Toggles ---
    function closeAllDropdowns() {
        profileToggle.classList.remove('open');
        notifToggle.classList.remove('open');
    }

    profileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = profileToggle.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) profileToggle.classList.add('open');
    });

    notifToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = notifToggle.classList.contains('open');
        closeAllDropdowns();
        if (!isOpen) {
            notifToggle.classList.add('open');
            fetchNotifications(); // Load on open
        }
    });

    document.addEventListener('click', () => closeAllDropdowns());

    // --- 3. Chat Slide Panel ---
    chatToggle.addEventListener('click', () => {
        chatPanel.classList.add('open');
        chatOverlay.classList.add('active');
        fetchChatMessages();
    });

    const closeChat = () => {
        chatPanel.classList.remove('open');
        chatOverlay.classList.remove('active');
    };
    closeChatBtn.addEventListener('click', closeChat);
    chatOverlay.addEventListener('click', closeChat);

    // --- 4. Dynamic Data Integration (AJAX) ---

    // Define Navigation Links by Role
    const navStructure = {
        student: [
            { name: 'Home', url: 'student-dashboard.html', active: true },
            { name: 'Courses', url: '#' },
            { name: 'Assignments', url: '#' },
            { name: 'Attendance', url: '#' },
            { name: 'Results', url: '#' }
        ],
        teacher: [
            { name: 'Dashboard', url: 'teacher-dashboard.html', active: true },
            { name: 'My Classes', url: '#' },
            { name: 'Assignments', url: '#' },
            { name: 'Grading', url: '#' }
        ],
        admin: [
            { name: 'Dashboard', url: 'admin.html', active: true },
            { name: 'Students', url: '#' },
            { name: 'Teachers', url: '#' },
            { name: 'Finances', url: '#' },
            { name: 'Settings', url: '#' }
        ]
    };

    // Render Navigation
    function renderNav() {
        const navList = document.getElementById('h-nav-dynamic');
        if (!navList) return;
        const links = navStructure[currentUser.role] || navStructure.student;

        navList.innerHTML = links.map(link => `
            <li class="h-nav-item">
                <a href="${link.url}" class="h-nav-link ${link.active ? 'active' : ''}">${link.name}</a>
            </li>
        `).join('');
    }

    // Fetch User Profile
    async function fetchUserProfile() {
        try {
            const res = await fetch(`/api/auth/me?role=${currentUser.role}&id=${currentUser.id}`);
            const data = await res.json();
            if (data.success && data.user) {
                document.getElementById('h-user-name').textContent = data.user.name || data.user.first_name || 'User';
                document.getElementById('h-user-role').textContent = data.user.role;
                document.getElementById('header-avatar').src = `https://ui-avatars.com/api/?name=${data.user.name || 'User'}&background=2563eb&color=fff&bold=true`;
            }
        } catch (e) {
            console.error("Profile fetch error", e);
        }
    }

    // Fetch Notification Badges with Animation
    async function fetchBadges() {
        try {
            // Notifications
            const resNotif = await fetch(`/api/notifications/unread?role=${currentUser.role}&id=${currentUser.id}`);
            const dataNotif = await resNotif.json();
            const nBadge = document.getElementById('notif-badge');

            if (dataNotif.success && dataNotif.unread_count > 0) {
                if (nBadge.textContent !== String(dataNotif.unread_count)) {
                    nBadge.textContent = dataNotif.unread_count;
                    nBadge.style.display = 'flex';
                    // Pop animation
                    nBadge.classList.add('pop');
                    setTimeout(() => nBadge.classList.remove('pop'), 300);
                }
            } else {
                nBadge.style.display = 'none';
            }

            // Chat Messages
            const resChat = await fetch(`/api/messages/unread?role=${currentUser.role}&id=${currentUser.id}`);
            const dataChat = await resChat.json();
            const cBadge = document.getElementById('chat-badge');
            if (dataChat.success && dataChat.unread_count > 0) {
                cBadge.textContent = dataChat.unread_count;
                cBadge.style.display = 'flex';
                // Pop animation
                cBadge.classList.add('pop');
                setTimeout(() => cBadge.classList.remove('pop'), 300);
            } else {
                cBadge.style.display = 'none';
            }
        } catch (e) {
            console.error("Badge fetch error", e);
        }
    }

    // Fetch Notification List
    async function fetchNotifications() {
        const list = document.getElementById('notif-list');
        list.innerHTML = `<li class="notif-empty">Fetching...</li>`;
        try {
            const res = await fetch(`/api/notifications?role=${currentUser.role}&id=${currentUser.id}`);
            const data = await res.json();
            if (data.success && data.notifications.length > 0) {
                list.innerHTML = data.notifications.map(n => `
                    <li>
                        <strong>${n.title}</strong>
                        <span>${n.message}</span>
                    </li>
                `).join('');
            } else {
                list.innerHTML = `<li class="notif-empty">No new notifications</li>`;
            }
        } catch (e) {
            list.innerHTML = `<li class="notif-empty">No notifications found</li>`;
        }
    }

    // Fetch Chat Messages List
    async function fetchChatMessages() {
        const list = document.getElementById('chat-body');
        list.innerHTML = `<div class="chat-empty">Loading messages...</div>`;
        try {
            const res = await fetch(`/api/messages?role=${currentUser.role}&id=${currentUser.id}`);
            const data = await res.json();
            if (data.success && data.messages.length > 0) {
                list.innerHTML = data.messages.map(m => `
                    <div style="padding: 1rem; border-bottom: 1px solid #eee;">
                        <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 5px; font-weight: bold; text-transform: uppercase;">
                            ${m.sender_type}
                        </div>
                        <div style="color: #1e293b;">${m.message}</div>
                    </div>
                `).join('');
            } else {
                list.innerHTML = `<div class="chat-empty">No messages right now!</div>`;
            }
        } catch (e) {
            list.innerHTML = `<div class="chat-empty" style="color:red;">Start a conversation!</div>`;
        }
    }

    // Execute Initializers
    renderNav();
    fetchUserProfile();
    fetchBadges();

    // Poll for Badges every 30 seconds to show "dynamic alerts"
    setInterval(fetchBadges, 30000);
});
