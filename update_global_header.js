const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

// The new header HTML
const newHeaderHTML = `    <header class="site-header">
        <div class="container nav-container">
            <a href="index.html" class="logo-link">
                <div class="logo-icon">eC</div>
                <div class="logo-text">eCampus</div>
            </a>

            <button class="mobile-menu-btn" aria-label="Toggle Navigation">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <nav class="nav-links">
                <a href="index.html" class="nav-link">Home</a>
                <a href="about.html" class="nav-link">About Us</a>
                <a href="academics.html" class="nav-link">Academics</a>
                <a href="admissions.html" class="nav-link">Admissions</a>
                <a href="facilities.html" class="nav-link">Facilities</a>
                <a href="gallery.html" class="nav-link">Gallery</a>
                <a href="contact.html" class="nav-link">Contact</a>
                
                <div class="dropdown">
                    <button class="nav-link dropdown-toggle" aria-expanded="false">
                        More 
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>
                    <div class="dropdown-menu">
                        <a href="alumni.html" class="dropdown-item">Alumni</a>
                        <a href="careers.html" class="dropdown-item">Careers</a>
                        <a href="faq.html" class="dropdown-item">FAQ</a>
                        <a href="calendar.html" class="dropdown-item">Calendar</a>
                    </div>
                </div>

                <a href="login.html" class="btn btn-outline"
                    style="margin-left: 1rem; border-radius: 20px; padding: 0.5rem 1.5rem;">Login</a>
            </nav>
        </div>
    </header>`;

const excludeFiles = ['admin.html', 'student-dashboard.html', 'teacher-dashboard.html'];

function updateHeaderInFile(filePath) {
    const ext = path.extname(filePath);
    if (ext !== '.html') return;

    const baseName = path.basename(filePath);
    if (excludeFiles.includes(baseName)) return;

    let content = fs.readFileSync(filePath, 'utf8');

    // Make sure we only replace if there's a site-header
    if (!content.includes('<header class="site-header">')) {
        return;
    }

    const regex = /<header class="site-header">[\s\S]*?<\/header>/i;
    content = content.replace(regex, newHeaderHTML);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated header in: ' + baseName);
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file === 'assets') continue; // skip assets folder
            processDirectory(fullPath);
        } else {
            updateHeaderInFile(fullPath);
        }
    }
}

processDirectory(publicDir);
console.log("Done updating headers.");
