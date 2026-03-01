/**
 * eCampus Admin Data Fetcher
 * Real CRUD operations connected to Node.js backend
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Hook into the Navigation Clicks to Load Data dynamically
    const navLinks = document.querySelectorAll('.nav-sub-link, .nav-item, .nav-group-btn');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const viewId = link.getAttribute('data-view');
            if (viewId) {
                // Determine which data to load based on the view
                if (viewId === 'view-student-list') loadStudents();
                if (viewId === 'view-teacher-list') loadTeachers();
                if (viewId === 'view-academics-subjects') loadCourses();
                // Add more hooks here
            }
        });
    });

    // --- STUDENTS ---
    async function loadStudents() {
        try {
            const response = await fetch('/api/students');
            const result = await response.json();
            if (result.success) {
                renderStudentTable(result.data);
            }
        } catch (e) { console.error('Error loading students', e); }
    }

    function renderStudentTable(data) {
        const container = document.getElementById('view-student-list');
        if (!container) return;

        let html = `
        <div class="admin-card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Student List</h3>
                <input type="text" id="studentSearch" placeholder="Search students..." class="form-control" style="width:250px;">
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="live-student-body">`;

        data.forEach(student => {
            html += `
            <tr>
                <td>${student.id}</td>
                <td><strong>${student.name}</strong></td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td>
                    <button class="btn btn-sm btn-outline btn-delete" data-id="${student.id}" data-type="students">Delete</button>
                </td>
            </tr>`;
        });

        html += `</tbody></table></div></div>`;
        container.innerHTML = html;
        bindDeleteButtons();
        bindSearch('studentSearch', 'live-student-body');
    }

    // --- TEACHERS ---
    async function loadTeachers() {
        try {
            const response = await fetch('/api/teachers');
            const result = await response.json();
            if (result.success) {
                renderTeacherTable(result.data);
            }
        } catch (e) { console.error('Error loading teachers', e); }
    }

    function renderTeacherTable(data) {
        const container = document.getElementById('view-teacher-list');
        if (!container) return;

        let html = `
        <div class="admin-card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Teacher List</h3>
                <input type="text" id="teacherSearch" placeholder="Search teachers..." class="form-control" style="width:250px;">
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="live-teacher-body">`;

        data.forEach(teacher => {
            html += `
            <tr>
                <td>${teacher.id}</td>
                <td><strong>${teacher.name}</strong></td>
                <td>${teacher.email}</td>
                <td>${teacher.subject}</td>
                <td>
                    <button class="btn btn-sm btn-outline btn-delete" data-id="${teacher.id}" data-type="teachers">Delete</button>
                </td>
            </tr>`;
        });

        html += `</tbody></table></div></div>`;
        container.innerHTML = html;
        bindDeleteButtons();
        bindSearch('teacherSearch', 'live-teacher-body');
    }

    // --- COURSES ---
    async function loadCourses() {
        try {
            const response = await fetch('/api/courses');
            const result = await response.json();
            if (result.success) {
                renderCourseTable(result.data);
            }
        } catch (e) { console.error('Error loading courses', e); }
    }

    function renderCourseTable(data) {
        // Assume view-academics-subjects exists or fallback to creating it
        let container = document.getElementById('view-academics-subjects');
        if (!container) return;

        let html = `
        <div class="admin-card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Course List</h3>
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Teacher</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody id="live-course-body">`;

        data.forEach(course => {
            html += `
            <tr>
                <td>${course.course_code}</td>
                <td><strong>${course.course_name}</strong></td>
                <td>${course.teacher_name || 'N/A'}</td>
                <td>${course.description}</td>
            </tr>`;
        });

        html += `</tbody></table></div></div>`;
        container.innerHTML = html;
    }


    // --- UTILITIES ---
    function bindDeleteButtons() {
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.getAttribute('data-id');
                const type = btn.getAttribute('data-type');
                if (confirm('Are you sure you want to delete this record?')) {
                    const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
                    const resData = await res.json();
                    if (resData.success) {
                        alert('Deleted successfully');
                        if (type === 'students') loadStudents();
                        if (type === 'teachers') loadTeachers();
                    }
                }
            });
        });
    }

    function bindSearch(inputId, tbodyId) {
        const input = document.getElementById(inputId);
        const tbody = document.getElementById(tbodyId);
        if (!input || !tbody) return;

        input.addEventListener('keyup', function () {
            const filter = input.value.toLowerCase();
            const trs = tbody.getElementsByTagName('tr');
            for (let i = 0; i < trs.length; i++) {
                const text = trs[i].innerText.toLowerCase();
                trs[i].style.display = text.includes(filter) ? "" : "none";
            }
        });
    }
});
