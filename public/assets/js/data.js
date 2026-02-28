/**
 * eCampus International School - Data & Forms Logic
 * Handles Form Validations and Mock Data rendering (Notices)
 */

document.addEventListener('DOMContentLoaded', () => {

    /* --- Form Validations --- */

    // Admission Form
    const admissionForm = document.getElementById('admission-form');
    if (admissionForm) {
        admissionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = admissionForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            submitBtn.innerText = 'Submitting...';
            submitBtn.disabled = true;

            const formData = {
                studentName: document.getElementById('student_name').value,
                parentName: document.getElementById('parent_name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                classApplying: document.getElementById('class').value,
                message: document.getElementById('message').value
            };

            fetch('/api/admissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(res => res.json())
                .then(data => {
                    const msgBox = document.getElementById('form-success-message');
                    msgBox.style.display = 'block';
                    if (data.success) {
                        msgBox.style.color = '#166534';
                        msgBox.style.background = '#dcfce7';
                        msgBox.innerText = 'Admission enquiry submitted successfully. We will contact you soon.';
                        admissionForm.reset();
                    } else {
                        msgBox.style.color = '#991b1b';
                        msgBox.style.background = '#fef2f2';
                        msgBox.innerText = data.message || 'An error occurred.';
                    }

                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;

                    setTimeout(() => {
                        msgBox.style.display = 'none';
                    }, 5000);
                })
                .catch(err => {
                    console.error(err);
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;

            const formData = {
                name: document.getElementById('contact_name').value,
                email: document.getElementById('contact_email').value,
                subject: document.getElementById('contact_subject').value,
                message: document.getElementById('contact_message').value
            };

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
                .then(res => res.json())
                .then(data => {
                    const msgBox = document.getElementById('contact-success-message');
                    msgBox.style.display = 'block';
                    if (data.success) {
                        msgBox.style.color = '#166534';
                        msgBox.style.background = '#dcfce7';
                        msgBox.innerText = 'Your message has been sent successfully. Thank you!';
                        contactForm.reset();
                    } else {
                        msgBox.style.color = '#991b1b';
                        msgBox.style.background = '#fef2f2';
                        msgBox.innerText = data.message || 'An error occurred.';
                    }

                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;

                    setTimeout(() => {
                        msgBox.style.display = 'none';
                    }, 5000);
                })
                .catch(err => {
                    console.error(err);
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    /* --- Dynamic Notices Rendering --- */

    function renderNotices(notices, containerId, limit = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = ''; // Clear loading state

        if (!notices || notices.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 3rem; color: var(--text-muted);">No notices available at the moment.</p>';
            return;
        }

        const noticesToRender = limit ? notices.slice(0, limit) : notices;

        noticesToRender.forEach(notice => {
            // Utility to get nice month name
            let month = 'MMM';
            let day = 'DD';
            if (notice.date) {
                const parts = notice.date.split(' ');
                if (parts.length === 2) {
                    day = parts[0].padStart(2, '0');
                    month = parts[1].substring(0, 3).toUpperCase();
                } else {
                    // fallback parse
                    const d = new Date(notice.date + " 2026");
                    if (!isNaN(d)) {
                        day = d.getDate().toString().padStart(2, '0');
                        month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
                    }
                }
            }

            // Determine badge color based on category
            let badgeBg = '#f1f5f9';
            let badgeColor = '#475569';
            if (notice.type === 'Examination') {
                badgeBg = '#fee2e2'; badgeColor = '#ef4444';
            } else if (notice.type === 'Event') {
                badgeBg = '#e0f2fe'; badgeColor = '#0284c7';
            } else if (notice.type === 'General') {
                badgeBg = '#e0e7ff'; badgeColor = '#4f46e5';
            }

            const noticeHTML = `
                <div class="notice-row hover-bg-light" style="padding: 1.5rem; display: flex; align-items: flex-start; gap: 1.5rem; border-bottom: 1px solid var(--border-light); cursor: pointer; transition: background 0.3s ease;" onclick="openNoticeModal('${encodeURIComponent(notice.title)}', '${encodeURIComponent(notice.date)}', '${encodeURIComponent(notice.content)}', '${notice.type}', '${badgeBg}', '${badgeColor}')">
                    <div style="background: var(--primary-light); color: white; padding: 0.75rem 1rem; border-radius: var(--radius-md); text-align: center; min-width: 80px; flex-shrink: 0; box-shadow: inset 0 -3px 0 rgba(0,0,0,0.1);">
                        <div style="font-size: 1.5rem; font-weight: 800; line-height: 1;">${day}</div>
                        <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; margin-top: 2px;">${month}</div>
                    </div>
                    <div style="flex-grow: 1;">
                        <span style="display: inline-block; padding: 0.25rem 0.75rem; background: ${badgeBg}; color: ${badgeColor}; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">${notice.type}</span>
                        <h4 style="font-size: 1.15rem; margin-bottom: 0.35rem; color: var(--text-main); font-weight: 600;">${notice.title}</h4>
                        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${notice.content}</p>
                    </div>
                    <div style="flex-shrink: 0; color: var(--primary); opacity: 0.5;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                </div>
            `;
            container.innerHTML += noticeHTML;
        });
    }

    // Modal Logic
    window.openNoticeModal = function (title, date, content, type, badgeBg, badgeColor) {
        const modal = document.getElementById('notice-modal');
        if (!modal) return;

        document.getElementById('modal-title').innerText = decodeURIComponent(title);
        document.getElementById('modal-date').innerText = "Posted on: " + decodeURIComponent(date);
        document.getElementById('modal-content').innerText = decodeURIComponent(content);

        const badge = document.getElementById('modal-badge');
        badge.innerText = type;
        badge.style.backgroundColor = badgeBg;
        badge.style.color = badgeColor;

        modal.classList.add('active');
    };

    // Close modal on click outside
    const modalOverlay = document.getElementById('notice-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // Fetch notices once and render where needed
    if (document.getElementById('notices-container') || document.getElementById('home-notices-container')) {
        fetch('/api/notices')
            .then(res => res.json())
            .then(data => {
                const notices = data.success ? data.notices : [];
                // Render all on notices page
                renderNotices(notices, 'notices-container');
                // Render top 3 on home page
                renderNotices(notices, 'home-notices-container', 3);
            })
            .catch(err => {
                console.error('Error fetching notices:', err);
                const errHtml = '<p style="text-align:center; padding: 2rem; color: #ef4444;">Failed to load notices from the server.</p>';
                if (document.getElementById('notices-container')) document.getElementById('notices-container').innerHTML = errHtml;
                if (document.getElementById('home-notices-container')) document.getElementById('home-notices-container').innerHTML = errHtml;
            });
    }

});
