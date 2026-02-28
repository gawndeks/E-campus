/**
 * eCampus International School - Gallery Lightbox Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       LIGHTBOX LOGIC
       ========================================================================== */
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close-btn');

    // Attach click listeners to all existing gallery items
    const attachLightboxEvent = (element) => {
        element.addEventListener('click', () => {
            if (!lightbox) return;
            const highResSrc = element.getAttribute('data-src');
            const caption = element.getAttribute('data-caption');
            if (highResSrc) {
                lightboxImg.src = highResSrc;
                lightboxCaption.textContent = caption || '';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    };

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => attachLightboxEvent(item));

    // Close Lightbox function
    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
                lightboxImg.src = '';
            }
        }, 300);
    };

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    /* ==========================================================================
       FRONTEND-ONLY ADD IMAGE UI
       ========================================================================== */
    const addImageForm = document.getElementById('add-image-form');
    const galleryGrid = document.getElementById('main-gallery-grid');

    if (addImageForm && galleryGrid) {
        addImageForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload

            const urlInput = document.getElementById('img-url').value;
            const captionInput = document.getElementById('img-caption').value;

            if (urlInput && captionInput) {
                // Create new gallery item
                const newItem = document.createElement('div');
                newItem.className = 'gallery-item reveal reveal-scale fade-in-up-smooth'; // instantly show animation state
                newItem.setAttribute('data-caption', captionInput);
                newItem.setAttribute('data-src', urlInput);

                newItem.innerHTML = `
                    <img src="${urlInput}" alt="${captionInput}" loading="lazy">
                    <div class="gallery-overlay">
                        <div class="gallery-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" stroke-width="2">
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                            </svg></div>
                    </div>
                `;

                // Add Lightbox Event to new item
                attachLightboxEvent(newItem);

                // Insert at the beginning of the grid
                galleryGrid.insertBefore(newItem, galleryGrid.firstChild);

                // Reset form
                addImageForm.reset();

                // Optional: Show a quick visual success feedback
                const submitBtn = addImageForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Added ✔';
                submitBtn.style.background = '#10b981'; // Emerald

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = ''; // restore to css rules
                }, 2000);
            }
        });
    }

});
