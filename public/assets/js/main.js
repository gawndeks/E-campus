/**
 * eCampus International School - Main JavaScript
 * Handles the updated Premium Slide Drawer Menu, Dropdowns, and Sticky Header
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
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /* ==========================================================================
       2. PREMIUM MOBILE SLIDE DRAWER MENU
       ========================================================================== */
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const drawerCloseBtn = document.getElementById('close-mobile-btn');
    const menuWrapper = document.getElementById('mobile-menu-wrapper');
    const menuBackdrop = document.getElementById('mobile-menu-backdrop');

    const toggleDrawer = (forceState) => {
        if (!menuWrapper) return;
        const isCurrentlyActive = menuWrapper.classList.contains('active');
        const newState = forceState !== undefined ? forceState : !isCurrentlyActive;

        if (newState) {
            menuWrapper.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            menuWrapper.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleDrawer(true));
    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', () => toggleDrawer(false));
    if (menuBackdrop) menuBackdrop.addEventListener('click', () => toggleDrawer(false));

    /* ==========================================================================
       3. MOBILE DROPDOWN ACCORDION
       ========================================================================== */
    const academicsToggle = document.getElementById('mobile-academics-toggle');
    const academicsGroup = academicsToggle?.closest('.mobile-dropdown-group');

    if (academicsToggle && academicsGroup) {
        academicsToggle.addEventListener('click', (e) => {
            e.preventDefault();
            academicsGroup.classList.toggle('active');
        });
    }

    /* ==========================================================================
       4. HIGHLIGHT ACTIVE NAV ITEM
       ========================================================================== */
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-link, .dropdown-item, .mobile-nav-link');

    navItems.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;

        if (linkHref === currentPath) {
            link.classList.add('active');
            if (link.style) {
                link.style.color = 'var(--nav-link-hover, #1f4e79)';
                link.style.fontWeight = '700';
            }

            // Also highlight parent if in dropdown
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const parentToggle = parentDropdown.querySelector('.dropdown-toggle');
                if (parentToggle) {
                    parentToggle.classList.add('active');
                    parentToggle.style.color = 'var(--nav-link-hover, #1f4e79)';
                }
            }

            // Mobile parent highlight
            const parentMobileDropdown = link.closest('.mobile-dropdown-group');
            if (parentMobileDropdown) {
                const parentMobileToggle = parentMobileDropdown.querySelector('.mobile-dropdown-toggle');
                if (parentMobileToggle) {
                    parentMobileToggle.style.color = '#1f4e79';
                }
            }
        }
    });
});
