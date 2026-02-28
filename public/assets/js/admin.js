/**
 * eCampus International School - Admin Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    // Helper: Check if we are on the admin page by looking for specific elements
    const noticesTableBody = document.querySelector('.admin-table tbody');
    if (!noticesTableBody) return;

    // Load Notices for Admin Table
    function loadAdminNotices() {
        noticesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading notices...</td></tr>';

        fetch('/api/notices')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.notices.length > 0) {
                    noticesTableBody.innerHTML = '';
                    data.notices.forEach(notice => {
                        let badgeBg = '#f1f5f9';
                        let badgeColor = '#475569';
                        if (notice.type === 'Examination') {
                            badgeBg = '#fee2e2'; badgeColor = '#ef4444';
                        } else if (notice.type === 'Event') {
                            badgeBg = '#e0f2fe'; badgeColor = '#0284c7';
                        } else if (notice.type === 'General') {
                            badgeBg = '#e0e7ff'; badgeColor = '#4f46e5';
                        }

                        const statusHtml = `<span style="color: #16a34a; font-weight: 500;">● Published</span>`; // simplistic status mocking 

                        const rowHtml = `
                            <tr>
                                <td>${notice.date}</td>
                                <td><span style="padding: 0.25rem 0.5rem; background: ${badgeBg}; color: ${badgeColor}; border-radius: 4px; font-size: 0.75rem;">${notice.type}</span></td>
                                <td>${notice.title}</td>
                                <td>${statusHtml}</td>
                                <td>
                                    <button style="border: none; background: none; color: var(--primary); font-weight: 600; cursor: pointer; margin-right: 0.75rem; transition: color 0.3s ease;">Edit</button>
                                    <button style="border: none; background: none; color: #ef4444; font-weight: 600; cursor: pointer; transition: color 0.3s ease;">Delete</button>
                                </td>
                            </tr>
                        `;
                        noticesTableBody.innerHTML += rowHtml;
                    });
                } else {
                    noticesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No notices found.</td></tr>';
                }
            })
            .catch(err => {
                console.error('Failed to load admin notices:', err);
                noticesTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #ef4444;">Failed to load notices.</td></tr>';
            });
    }

    // Call immediately
    loadAdminNotices();

    // Gallery Upload Mock/Functionality Setup
    // Using simple mock alert for upload area since actual file upload UI requires a hidden file input. 
    // We will inject a hidden file input and wire it up to make a real fetch call to the backend.

    const uploadArea = document.querySelector('.admin-card[onclick*="Opens file dialog."]');
    if (uploadArea) {
        // Remove the inline onclick mock
        uploadArea.removeAttribute('onclick');

        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Here we would prompt for a title ideally, but for simplicity:
                const title = prompt("Enter a title for the gallery image:", "New Gallery Image");
                if (title !== null) {
                    const formData = new FormData();
                    formData.append('image', file);
                    formData.append('title', title);

                    uploadArea.innerHTML = `<h3 style="margin-bottom: 0.5rem; font-size: 1.25rem; color: var(--primary);">Uploading...</h3><p style="color: var(--text-muted);">Please wait.</p>`;

                    // Need an auth token from somewhere to upload as admin. 
                    // Typically this is retrieved from localStorage.
                    const token = localStorage.getItem('adminToken') || '';

                    fetch('/api/gallery/upload', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                alert("Image uploaded successfully!");
                            } else {
                                alert("Failed to upload: " + (data.message || "Unknown error"));
                            }
                            // Reset upload area UI
                            setTimeout(() => window.location.reload(), 1500);
                        })
                        .catch(err => {
                            console.error("Upload error:", err);
                            alert("An error occurred during upload.");
                            setTimeout(() => window.location.reload(), 1500);
                        });
                }
            }
            // clear input
            fileInput.value = '';
        });
    }

});
