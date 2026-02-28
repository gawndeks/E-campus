/**
 * eCampus International School - Gallery Lightbox Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close-btn');

    if (!lightbox) return; // Only run on gallery page

    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    // Clear out mock markup and show loading
    galleryGrid.innerHTML = '<p style="text-align:center; padding: 2rem; color: var(--text-muted); grid-column: 1/-1;">Loading gallery...</p>';

    // Fetch Gallery from Backend
    fetch('/api/gallery')
        .then(res => res.json())
        .then(data => {
            if (data.success && data.images && data.images.length > 0) {
                galleryGrid.innerHTML = ''; // clear loading
                data.images.forEach((img, index) => {
                    const delay = (index % 5) * 100; // stagger animation

                    const el = document.createElement('div');
                    el.className = `gallery-item reveal reveal-scale delay-${delay}`;
                    el.setAttribute('data-caption', img.title);
                    el.setAttribute('data-src', img.image_path);

                    el.innerHTML = `
                        <img src="${img.image_path}" alt="${img.title}" loading="lazy">
                        <div class="gallery-overlay">
                            <div class="gallery-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" stroke-width="2">
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                </svg></div>
                        </div>
                    `;
                    galleryGrid.appendChild(el);

                    // Add click event for lightbox
                    el.addEventListener('click', () => {
                        const highResSrc = el.getAttribute('data-src');
                        const caption = el.getAttribute('data-caption');
                        if (highResSrc) {
                            lightboxImg.src = highResSrc;
                            lightboxCaption.textContent = caption || '';
                            lightbox.classList.add('active');
                            document.body.style.overflow = 'hidden';
                        }
                    });
                });
            } else {
                galleryGrid.innerHTML = '<p style="text-align:center; padding: 2rem; color: var(--text-muted); grid-column: 1/-1;">No images found in the gallery.</p>';
            }
        })
        .catch(err => {
            console.error('Failed to load gallery:', err);
            galleryGrid.innerHTML = '<p style="text-align:center; padding: 2rem; color: #ef4444; grid-column: 1/-1;">Failed to load gallery images.</p>';
        });

    // Close Lightbox function
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
                lightboxImg.src = '';
            }
        }, 300);
    };

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});
