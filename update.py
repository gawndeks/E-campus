import os
import re

HEADER_NEW = '''<header class="site-header classic-header">
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
                <a href="about.html" class="nav-link">About</a>
                <a href="academics.html" class="nav-link">Academics</a>
                <a href="admissions.html" class="nav-link">Admissions</a>
                <a href="facilities.html" class="nav-link">Facilities</a>
                <a href="gallery.html" class="nav-link">Gallery</a>
                <a href="contact.html" class="nav-link">Contact</a>
                
                <div class="dropdown">
                    <button class="nav-link dropdown-toggle" aria-haspopup="true" aria-expanded="false">
                        More
                        <svg class="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 2px;">
                            <path d="M6 9l6 6 6-6"/>
                        </svg>
                    </button>
                    <div class="dropdown-menu">
                        <a href="alumni.html" class="dropdown-item">Alumni</a>
                        <a href="careers.html" class="dropdown-item">Careers</a>
                        <a href="faq.html" class="dropdown-item">FAQ</a>
                        <a href="calendar.html" class="dropdown-item">Calendar</a>
                    </div>
                </div>

                <a href="login.html" class="btn btn-primary"
                    style="margin-left: 1rem; border-radius: 20px; padding: 0.5rem 1.5rem;">Login</a>
            </nav>
        </div>
    </header>'''

directory = 'e:/antiG/ecampus-school-website/public'
header_pattern = re.compile(r'<header class="site-header(.*?)</header>', re.S)

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update Header
        content = header_pattern.sub(HEADER_NEW, content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print(f"Updated all HTML files in {directory}")
