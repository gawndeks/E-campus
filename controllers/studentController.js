const db = require('../config/db');
const jwt = require('jsonwebtoken');

const sendResponse = (res, statusCode, success, data, message = '') => {
    res.status(statusCode).json({ success, data, message });
};

// 1. Student Login (Using admission_no & DOB as password for simplicity without breaking schema constraint)
exports.studentLogin = async (req, res) => {
    const { admission_no, dob } = req.body;
    if (!admission_no || !dob) return sendResponse(res, 400, false, null, 'Admission No and DOB required');

    try {
        const [rows] = await db.execute(`
            SELECT s.*, c.name as class_name 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.admission_no = ? AND s.dob = ? AND s.status = 1 AND s.deleted_at IS NULL
        `, [admission_no, dob]);

        if (rows.length === 0) return sendResponse(res, 401, false, null, 'Invalid admission number or date of birth');

        const student = rows[0];
        const token = jwt.sign({ id: student.id, role: 'student', name: student.name }, process.env.JWT_SECRET || 'super_secret_jwt_key_ecampus_2026', { expiresIn: '8h' });

        sendResponse(res, 200, true, { token, student: { id: student.id, name: student.name, class: student.class_name } }, 'Login successful');
    } catch (err) {
        console.error(err);
        sendResponse(res, 500, false, null, 'Database error');
    }
};

// 2. Get Profile
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT s.admission_no, s.name, s.dob, s.gender, s.parent_name, s.parent_phone, s.address, c.name as class_name, sec.name as section_name
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE s.id = ? AND s.deleted_at IS NULL
        `, [req.user.id]);

        if (rows.length === 0) return sendResponse(res, 404, false, null, 'Student not found');
        sendResponse(res, 200, true, rows[0]);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

// 3. Update Profile Data
exports.updateProfile = async (req, res) => {
    const { parent_phone, address } = req.body;
    try {
        await db.execute("UPDATE students SET parent_phone=?, address=?, updated_at=NOW() WHERE id=?", [parent_phone, address, req.user.id]);
        sendResponse(res, 200, true, null, 'Profile updated successfully');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

// 4. Get Attendance
exports.getAttendance = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT date, status FROM attendance_students WHERE student_id = ? ORDER BY date DESC", [req.user.id]);
        sendResponse(res, 200, true, rows);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

// 5. Get Results / Marks
exports.getResults = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.name as exam_name, e.exam_date, sub.name as subject_name, er.marks, er.grade
            FROM exam_results er
            JOIN exams e ON er.exam_id = e.id
            JOIN subjects sub ON er.subject_id = sub.id
            WHERE er.student_id = ?
            ORDER BY e.exam_date DESC
        `, [req.user.id]);
        sendResponse(res, 200, true, rows);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

// 6. Get Timetable
exports.getTimetable = async (req, res) => {
    try {
        const [studentClass] = await db.execute("SELECT class_id, section_id FROM students WHERE id = ?", [req.user.id]);
        if (studentClass.length === 0) return sendResponse(res, 404, false, null, 'Student class not found');

        const { class_id, section_id } = studentClass[0];

        const [rows] = await db.execute(`
            SELECT t.day_of_week, t.start_time, t.end_time, sub.name as subject_name, teach.name as teacher_name
            FROM timetables t
            JOIN subjects sub ON t.subject_id = sub.id
            JOIN teachers teach ON t.teacher_id = teach.id
            WHERE t.class_id = ? AND (t.section_id = ? OR t.section_id IS NULL)
            ORDER BY FIELD(t.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'), t.start_time
        `, [class_id, section_id]);

        sendResponse(res, 200, true, rows);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};
