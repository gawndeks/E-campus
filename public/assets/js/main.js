/**
 * eCampus International School - Main JavaScript
 * Handles the updated Slide Drawer Menu, Dropdowns, and Sticky Header
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. STICKY HEADER (SHRINK ON SCROLL)
       ========================================================================== */
    const header = document.getElementById('global-header');

    if (header) {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled-header');
            } else {
                header.classList.remove('scrolled-header');
            }
        };

        handleScroll(); // Check on load
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /* ==========================================================================
       2. MOBILE SLIDE DRAWER MENU
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const drawerCloseBtn = document.getElementById('drawer-close');
    const mainNav = document.getElementById('main-nav');
    const overlay = document.getElementById('mobile-overlay');

    const toggleDrawer = (forceState) => {
        if (!mainNav || !overlay) return;

        const isCurrentlyActive = mainNav.classList.contains('active');
        const newState = forceState !== undefined ? forceState : !isCurrentlyActive;

        if (newState) {
            mainNav.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Stop background scrolling
        } else {
            mainNav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => toggleDrawer(true));
    }

    if (drawerCloseBtn) {
        drawerCloseBtn.addEventListener('click', () => toggleDrawer(false));
    }

    if (overlay) {
        overlay.addEventListener('click', () => toggleDrawer(false));
    }

    /* ==========================================================================
       3. MOBILE DROPDOWN ACCORDION (Resources)
       ========================================================================== */
    const resourcesDropdown = document.getElementById('resources-dropdown');
    const resourcesToggle = document.getElementById('resources-toggle');

    if (resourcesDropdown && resourcesToggle) {
        resourcesToggle.addEventListener('click', (e) => {
            // Only trigger accordion behavior on mobile explicitly
            if (window.innerWidth <= 1024) {
                e.preventDefault(); // Stop native link click if any
                resourcesDropdown.classList.toggle('drawer-expanded');

                // Update aria expanded
                const isExpanded = resourcesDropdown.classList.contains('drawer-expanded');
                resourcesToggle.setAttribute('aria-expanded', isExpanded);
            }
        });
    }

    /* ==========================================================================
       4. HIGHLIGHT ACTIVE NAV ITEM
       ========================================================================== */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-link, .dropdown-item');

    navItems.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;

        // Exact match
        if (linkHref === currentPath) {
            link.style.color = 'var(--primary)';
            link.style.fontWeight = '700';

            // If the active link is inside the dropdown, also highlight the parent "Resources" button
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const parentToggle = parentDropdown.querySelector('.dropdown-toggle');
                if (parentToggle) {
                    parentToggle.style.color = 'var(--primary)';
                    parentToggle.style.fontWeight = '700';
                }
            }
        }
        // Handle root
        else if ((currentPath === '' || currentPath === '/') && linkHref === 'index.html') {
            link.style.color = 'var(--primary)';
            link.style.fontWeight = '700';
        }
    });
});
