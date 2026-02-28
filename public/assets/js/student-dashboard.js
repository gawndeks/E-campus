document.addEventListener('DOMContentLoaded', () => {

    // --- Sidebar & Mobile Menu Navigation ---
    const navLinks = document.querySelectorAll('.desktop-sidebar-link[data-view], .bottom-nav-item[data-view]');
    const views = document.querySelectorAll('.student-view');

    // Currently unbuilt views map to the placeholder
    const unimplementedViews = [];

    function switchView(viewId, pushState = true) {
        // Hide all views
        views.forEach(view => {
            view.classList.remove('active');
            view.style.display = 'none';
        });

        // Determine target view
        let targetViewElement = document.getElementById(viewId);

        // Use placeholder if module is unbuilt
        if (unimplementedViews.includes(viewId) || !targetViewElement) {
            targetViewElement = document.getElementById('view-placeholder');

            // Adjust placeholder title dynamically if possible
            if (targetViewElement) {
                const titleEl = targetViewElement.querySelector('h3');
                if (titleEl) {
                    titleEl.textContent = viewId.replace('view-', '').toUpperCase() + ' Module Under Construction';
                }
            }
        }

        // Show new view with animation
        if (targetViewElement) {
            targetViewElement.style.display = 'block';

            // Allow CSS rendering frame before adding active class for fade-in effect
            setTimeout(() => {
                targetViewElement.classList.add('active');
            }, 10);
        }

        // Update active class on Sidebar Links
        document.querySelectorAll('.desktop-sidebar-link').forEach(link => link.classList.remove('active'));
        const activeSidebarLink = document.querySelector(`.desktop-sidebar-link[data-view="${viewId}"]`);
        if (activeSidebarLink) {
            activeSidebarLink.classList.add('active');

            // Update Page Title based on sidebar text
            const textSpan = activeSidebarLink.querySelector('.sidebar-text');
            if (textSpan) {
                const pageTitle = document.querySelector('.header-title');
                if (pageTitle) pageTitle.textContent = textSpan.textContent;
            }
        }

        // Update active class on Mobile Bottom Nav
        document.querySelectorAll('.bottom-nav-item').forEach(link => link.classList.remove('active'));
        const activeBottomNav = document.querySelector(`.bottom-nav-item[data-view="${viewId}"]`);
        if (activeBottomNav) activeBottomNav.classList.add('active');

        // Scroll to top of app
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update URL hash for history/refresh support
        if (pushState) {
            window.history.pushState({ view: viewId }, '', `#${viewId.replace('view-', '')}`);
        }
    }

    // Attach click listeners to all navigation elements
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.getAttribute('data-view');
            if (viewId) {
                switchView(viewId);
            }
        });
    });

    // Handle browser back/forward buttons (hash change)
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            switchView(`view-${hash}`, false);
        } else {
            // Default to overview if no hash
            switchView('view-overview', false);
        }
    });

    // On Load Check: if URL has a hash, load that view, else load overview
    const initialHash = window.location.hash.substring(1);
    if (initialHash) {
        switchView(`view-${initialHash}`, false);
    } else {
        switchView('view-overview', false);
    }
});
