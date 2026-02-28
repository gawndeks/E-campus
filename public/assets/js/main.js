/**
 * eCampus International School - Main JavaScript
 * Handles global interactions like sticky header, mobile nav
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Functionality
    const header = document.querySelector('.site-header');

    if (header) {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.add('scrolled'); // Force for demo aesthetics or logic? Actually let's just use it
                if (window.scrollY < 10) {
                    header.classList.remove('scrolled');
                }
            }
        };

        // Initial check
        handleScroll();

        // Listen to scroll
        window.addEventListener('scroll', handleScroll);
    }

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Toggle icon between hamburger and close
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuBtn.innerHTML = isExpanded
                ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
                : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? 'hidden' : '';
        });
    }

    // 3. Highlight Active Navigation Link based on current URL
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-link');

    navItems.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPath) {
            link.classList.add('active');
        } else {
            // Also handle index.html logic
            if ((currentPath === '' || currentPath === '/') && linkHref === 'index.html') {
                link.classList.add('active');
            }
        }
    });
});
