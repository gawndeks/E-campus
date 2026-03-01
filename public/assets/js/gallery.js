/**
 * eCampus Gallery Logic
 * Controls Dynamic Filtering, Uploads, Fetching, and Lightbox Integrations
 */

document.addEventListener('DOMContentLoaded', () => {

    // Global session state mirroring classic-header.js
    const userRole = localStorage.getItem('user_role') || 'student';

    // UI Nodes
    const galleryGrid = document.getElementById('gallery-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const adminControls = document.getElementById('gallery-admin-controls');

    // Modal Nodes
    const uploadBtn = document.getElementById('open-upload-modal');
    const uploadOverlay = document.getElementById('upload-modal-overlay');
    const closeUploadBtn = document.getElementById('close-upload-modal');
    const uploadForm = document.getElementById('gallery-upload-form');

    // Lightbox Nodes
    const lightbox = document.getElementById('lightbox');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    let currentFilter = 'All';

    // Premium Fallback Mocked Dataset for testing the UI if server fails offline
    let fallbackGallery = [
        { id: 1, title: 'Annual Sports Meet 2025', image_path: 'https://images.unsplash.com/photo-1574629810360-7efbf5ce0d16?auto=format&fit=crop&q=80&w=800', category: 'Sports', created_at: new Date() },
        { id: 2, title: 'Science Lab Remodel', image_path: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800', category: 'Campus', created_at: new Date() },
        { id: 3, title: 'Cultural Dance Festival', image_path: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800', category: 'Cultural Activities', created_at: new Date() },
        { id: 4, title: 'Alumni Homecoming', image_path: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=800', category: 'Events', created_at: new Date() },
        { id: 5, title: 'Main Auditorium', image_path: 'https://images.unsplash.com/photo-1620805128795-933b9347d4e5?auto=format&fit=crop&q=80&w=800', category: 'Campus', created_at: new Date() },
        { id: 6, title: '10th Grade Graduation', image_path: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800', category: 'Events', created_at: new Date() }
    ];

    // 1. Initial Access Control
    if (userRole === 'admin' || userRole === 'teacher') {
        adminControls.style.display = 'block';
    }

    // 2. Load Gallery from API
    async function loadGallery() {
        galleryGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color:#64748b; padding:3rem;">Loading gallery...</div>`;
        try {
            const url = currentFilter === 'All' ? '/api/gallery' : `/api/gallery?category=${encodeURIComponent(currentFilter)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                renderGrid(data.gallery);
            } else {
                throw new Error("API explicitly returned failure flag.");
            }
        } catch (err) {
            console.warn("Backend API fetching dropped. Launching local fallback gallery dataset.");

            let filteredFallback = fallbackGallery;
            if (currentFilter !== 'All') {
                filteredFallback = fallbackGallery.filter(item => item.category === currentFilter);
            }
            renderGrid(filteredFallback);
        }
    }

    // 3. Render HTML Grid cards
    function renderGrid(images) {
        if (images.length === 0) {
            galleryGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 4rem; color: #94a3b8;">No photos found in this category.</div>`;
            return;
        }

        const isAdmin = (userRole === 'admin'); // Only Admins can delete

        galleryGrid.innerHTML = images.map(img => {
            const dateStr = new Date(img.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `
            <div class="gallery-card">
                <div class="gallery-image-wrapper" onclick="openLightbox('${img.image_path}', '${img.title}')">
                    <img src="${img.image_path}" alt="${img.title}" loading="lazy">
                </div>
                <div class="gallery-content">
                    <span class="g-category">${img.category || 'Collection'}</span>
                    <h4 class="g-title">${img.title}</h4>
                    <span class="g-date">${dateStr}</span>
                    ${isAdmin ? `<button class="delete-photo-btn" onclick="deletePhoto(${img.id})">Delete</button>` : ''}
                </div>
            </div>`;
        }).join('');
    }

    // 4. Attach Filtering Behavior
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            loadGallery();
        });
    });

    // 5. Lightbox Architecture
    window.openLightbox = (imagePath, title) => {
        lightboxImg.src = imagePath;
        lightboxCaption.textContent = title;
        lightbox.style.display = 'flex';
        // Minor delay to let display:flex apply before opacity transition
        setTimeout(() => lightbox.classList.add('active'), 10);
    };

    const closeBox = () => {
        lightbox.classList.remove('active');
        setTimeout(() => lightbox.style.display = 'none', 300);
    };

    lightboxClose.addEventListener('click', closeBox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeBox(); // Click outside image shuts modal
    });


    // 6. Upload Handlers
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            uploadOverlay.style.display = 'flex';
            setTimeout(() => uploadOverlay.classList.add('active'), 10);
        });

        const closeUpload = () => {
            uploadOverlay.classList.remove('active');
            setTimeout(() => uploadOverlay.style.display = 'none', 200);
        };
        closeUploadBtn.addEventListener('click', closeUpload);

        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = uploadForm.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = 'Uploading...';

            const formData = new FormData();
            formData.append('title', document.getElementById('upload-title').value);
            formData.append('category', document.getElementById('upload-category').value);
            formData.append('image', document.getElementById('upload-file').files[0]);
            formData.append('uploaded_by', localStorage.getItem('user_id') || 1);

            try {
                const res = await fetch('/api/gallery/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();

                if (data.success) {
                    alert('Photo uploaded securely!');
                    uploadForm.reset();
                    closeUpload();
                    loadGallery();
                } else {
                    alert('Upload failed: ' + data.message);
                }
            } catch (err) {
                console.warn('Backend API upload failed. Engaging Local Display mode:', err);

                // Local Fallback Upload Strategy: Render image to the UI seamlessly
                const fileObj = document.getElementById('upload-file').files[0];
                const reader = new FileReader();

                reader.onload = function (event) {
                    const localDataUrl = event.target.result;

                    // Unshift to the beginning so it's the newest item locally
                    fallbackGallery.unshift({
                        id: Date.now(),
                        title: document.getElementById('upload-title').value,
                        image_path: localDataUrl,
                        category: document.getElementById('upload-category').value,
                        created_at: new Date()
                    });

                    alert('Photo appended to your local gallery session successfully!');
                    uploadForm.reset();
                    closeUpload();
                    loadGallery();
                };

                if (fileObj) {
                    reader.readAsDataURL(fileObj);
                }
            } finally {
                btn.disabled = false;
                btn.textContent = 'Post to Gallery';
            }
        });
    }

    // 7. Dynamic Admin Deletion mapped globally to global scope
    window.deletePhoto = async (id) => {
        if (!confirm('Are you absolutely sure you want to delete this photo?')) return;

        try {
            const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                loadGallery(); // Reload board instantly upon success
            } else {
                throw new Error("Failed validation or server crash.");
            }
        } catch (err) {
            console.warn('Backend Delete failed. Attempting local memory purge:', id);

            // Remove locally injected photos seamlessly
            fallbackGallery = fallbackGallery.filter(photo => photo.id != id);
            loadGallery();
        }
    }

    // 8. Boot sequence
    loadGallery();

});
