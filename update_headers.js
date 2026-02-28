const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const newHeader = `<header class="site-header" id="global-header">
        <div class="container nav-container">
            <!-- Logo Section -->
            <a href="index.html" class="logo-link">
                <div class="logo-icon">eC</div>
                <div class="logo-text">eCampus</div>
                <div class="page-title-mobile-only">School Portal</div>
            </a>

            <!-- Mobile Actions (Right aligned on mobile) -->
            <div class="mobile-header-actions">
                <div class="user-profile-mini">
                    <div class="user-avatar" style="background-image: url('https://ui-avatars.com/api/?name=User&background=eff6ff&color=1e3a8a'); border-width: 1px;"></div>
                </div>
                <button class="mobile-menu-btn" aria-label="Toggle Navigation" id="mobile-menu-toggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="4" y1="12" x2="20" y2="12"></line>
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- Mobile Menu Overlay -->
            <div class="mobile-menu-overlay" id="mobile-overlay"></div>

            <!-- Navigation Links -->
            <nav class="nav-links" id="main-nav">
                <!-- Mobile Drawer Close Button -->
                <div class="drawer-header">
                    <div class="logo-link">
                        <div class="logo-icon">eC</div>
                        <div class="logo-text">eCampus</div>
                    </div>
                    <button class="drawer-close-btn" id="drawer-close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Primary Nav Items -->
                <div class="nav-group">
                    <div class="dropdown" id="resources-dropdown">
                        <button class="nav-link dropdown-toggle" aria-expanded="false" id="resources-toggle">
                            Resources 
                            <svg class="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div class="dropdown-menu" id="resources-menu">
                            <a href="notices.html" class="dropdown-item">Notice Board</a>
                            <a href="calendar.html" class="dropdown-item">School Calendar</a>
                            <a href="gallery.html" class="dropdown-item">Gallery</a>
                            <a href="about.html" class="dropdown-item">About Us</a>
                        </div>
                    </div>
                    
                    <a href="notices.html" class="nav-link desktop-hide-item">Notice Board</a>
                    <a href="calendar.html" class="nav-link desktop-hide-item">School Calendar</a>
                    <a href="careers.html" class="nav-link">Careers</a>
                    <a href="faq.html" class="nav-link">FAQ</a>
                </div>

                <!-- Call to Actions -->
                <div class="nav-actions">
                    <a href="admin.html" class="btn btn-outline-secondary">Admin Portal</a>
                    <a href="login.html" class="btn btn-primary-action nav-login-btn">Student Login</a>
                </div>
            </nav>

             <div class="desktop-header-profile">
                <button class="notification-btn" aria-label="Notifications" onclick="window.location.href='notices.html'">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    <span class="notification-badge" style="top:0; right:0;"></span>
                </button>
                <div class="user-profile-mini">
                    <div class="user-avatar" style="background-image: url('https://ui-avatars.com/api/?name=User&background=eff6ff&color=1e3a8a');"></div>
                </div>
            </div>

        </div>
    </header>`;

const excludeFiles = ['admin.html', 'dashboard-student.html', 'dashboard-teacher.html'];

fs.readdirSync(publicDir).forEach(file => {
    if (file.endsWith('.html') && !excludeFiles.includes(file)) {
        const filePath = path.join(publicDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Match from <header class="site-header"... to </header>
        const headerRegex = /<header class="site-header[^>]*>[\s\S]*?<\/header>/i;

        if (headerRegex.test(content)) {
            content = content.replace(headerRegex, newHeader);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log("Updated header in: " + file);
        } else {
            console.log("No header found in: " + file);
        }
    }
});
