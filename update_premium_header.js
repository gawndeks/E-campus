const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

const newHeaderHTML = `    <!-- Premium Global Header -->
    <header class="site-header" id="global-header">
        <div class="header-container">
            <!-- Logo area -->
            <a href="index.html" class="brand-logo">
                <div class="brand-icon">eC</div>
                <div class="brand-text">eCampus</div>
            </a>

            <!-- Desktop Navigation -->
            <nav class="desktop-nav" id="desktop-nav">
                <ul class="nav-list">
                    <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
                    <li class="nav-item"><a href="about.html" class="nav-link">About</a></li>
                    <li class="nav-item dropdown" id="academics-dropdown">
                        <a href="academics.html" class="nav-link dropdown-toggle" aria-haspopup="true">
                            Academics
                            <svg class="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </a>
                        <ul class="dropdown-menu">
                            <li><a href="academics.html" class="dropdown-item">Programs & Classes</a></li>
                            <li><a href="calendar.html" class="dropdown-item">Academic Calendar</a></li>
                            <li><a href="gallery.html" class="dropdown-item">Campus Gallery</a></li>
                            <li><a href="notices.html" class="dropdown-item">Notice Board</a></li>
                        </ul>
                    </li>
                    <li class="nav-item"><a href="admissions.html" class="nav-link">Admissions</a></li>
                    <li class="nav-item"><a href="contact.html" class="nav-link">Contact</a></li>
                </ul>
                
                <div class="header-actions">
                    <a href="admin.html" class="btn-ghost">Admin</a>
                    <a href="login.html" class="btn-primary-solid">Student Login</a>
                </div>
            </nav>

            <!-- Mobile Menu Toggle -->
            <button class="mobile-toggle-btn" id="mobile-menu-btn" aria-label="Toggle menu">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </button>
        </div>
    </header>

    <!-- Mobile Navigation Overlay -->
    <div class="mobile-menu-wrapper" id="mobile-menu-wrapper">
        <div class="mobile-menu-backdrop" id="mobile-menu-backdrop"></div>
        <div class="mobile-menu-panel">
            <div class="mobile-menu-header">
                <div class="brand-logo">
                    <div class="brand-icon">eC</div>
                    <div class="brand-text">eCampus</div>
                </div>
                <button class="close-mobile-btn" id="close-mobile-btn" aria-label="Close menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="mobile-menu-body">
                <ul class="mobile-nav-list">
                    <li><a href="index.html" class="mobile-nav-link">Home</a></li>
                    <li><a href="about.html" class="mobile-nav-link">About</a></li>
                    <li class="mobile-dropdown-group">
                        <button class="mobile-nav-link mobile-dropdown-toggle" id="mobile-academics-toggle">
                            Academics
                            <svg class="dropdown-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <ul class="mobile-dropdown-menu" id="mobile-academics-menu">
                            <li><a href="academics.html" class="mobile-nav-link sub-link">Programs & Classes</a></li>
                            <li><a href="calendar.html" class="mobile-nav-link sub-link">Academic Calendar</a></li>
                            <li><a href="gallery.html" class="mobile-nav-link sub-link">Campus Gallery</a></li>
                            <li><a href="notices.html" class="mobile-nav-link sub-link">Notice Board</a></li>
                        </ul>
                    </li>
                    <li><a href="admissions.html" class="mobile-nav-link">Admissions</a></li>
                    <li><a href="contact.html" class="mobile-nav-link">Contact</a></li>
                </ul>
            </div>
            <div class="mobile-menu-footer">
                <a href="login.html" class="btn-primary-solid full-width" style="margin-bottom:0.75rem;">Student Login</a>
                <a href="admin.html" class="btn-ghost full-width">Admin Portal</a>
            </div>
        </div>
    </div>`;

const excludeFiles = ['admin.html', 'student-dashboard.html', 'teacher-dashboard.html'];

function updateHeaderInFile(filePath) {
    const ext = path.extname(filePath);
    if (ext !== '.html') return;

    const baseName = path.basename(filePath);
    if (excludeFiles.includes(baseName)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Replace header 
    const regexHeader = /<header\s+class="site-header(?:[^"]*)">[\s\S]*?<\/header>/i;
    const regexOverlay = /<div class="mobile-menu-overlay"\s*id="mobile-overlay"><\/div>/i;

    if (content.match(regexHeader)) {
        content = content.replace(regexOverlay, '');
        content = content.replace(regexHeader, newHeaderHTML);

        // Ensure CSS is linked 
        if (!content.includes('premium-header.css')) {
            content = content.replace('</head>', '    <link rel="stylesheet" href="assets/css/premium-header.css">\n</head>');
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated premium header in: ' + baseName);
    }
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file === 'assets') continue;
            if (file === 'components') continue;
            processDirectory(fullPath);
        } else {
            updateHeaderInFile(fullPath);
        }
    }
}

processDirectory(publicDir);
console.log("Done updating headers to the premium layout.");
