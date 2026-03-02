const db = require('../config/db');
const jwt = require('jsonwebtoken');

const sendResponse = (res, statusCode, success, data, message = '') => {
    res.status(statusCode).json({ success, data, message });
};

// 1. Teacher Login
exports.teacherLogin = async (req, res) => {
    const { email, phone } = req.body;
    if (!email || !phone) return sendResponse(res, 400, false, null, 'Email and phone required');

    try {
        const [rows] = await db.execute(`SELECT * FROM teachers WHERE email = ? AND phone = ? AND status = 1 AND deleted_at IS NULL`, [email, phone]);
        if (rows.length === 0) return sendResponse(res, 401, false, null, 'Invalid credentials');

        const teacher = rows[0];
        const token = jwt.sign({ id: teacher.id, role: 'teacher', name: teacher.name }, process.env.JWT_SECRET || 'super_secret_jwt_key_ecampus_2026', { expiresIn: '8h' });

        sendResponse(res, 200, true, { token, teacher: { id: teacher.id, name: teacher.name } }, 'Login successful');
    } catch (err) {
        console.error(err);
        sendResponse(res, 500, false, null, 'Database error');
    }
};

// 2. Fetch Assigned Classes & Subjects
exports.getClassesAndSubjects = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT ts.id, c.name as class_name, c.id as class_id, s.name as subject_name, s.id as subject_id
            FROM teacher_subjects ts
            JOIN classes c ON ts.class_id = c.id
            JOIN subjects s ON ts.subject_id = s.id
            WHERE ts.teacher_id = ?
        `, [req.user.id]);
        sendResponse(res, 200, true, rows);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

// 3. Mark Student Attendance
exports.submitAttendance = async (req, res) => {
    const { date, attendanceData } = req.body; // payload: [{student_id: 1, status: 'present'}]
    if (!date || !attendanceData || !Array.isArray(attendanceData)) return sendResponse(res, 400, false, null, 'Invalid attendance data');

    try {
        for (const record of attendanceData) {
            await db.execute(`
                INSERT INTO attendance_students (student_id, date, status) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE status = VALUES(status)
            `, [record.student_id, date, record.status]);
        }
        sendResponse(res, 200, true, null, 'Attendance recorded successfully');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

// 4. Upload Exam Marks
exports.uploadMarks = async (req, res) => {
    const { exam_id, subject_id, marksData } = req.body; // payload: [{student_id: 1, marks: 85, grade: 'A'}]
    if (!exam_id || !subject_id || !marksData || !Array.isArray(marksData)) return sendResponse(res, 400, false, null, 'Invalid marks data');

    try {
        for (const record of marksData) {
            await db.execute(`
                INSERT INTO exam_results (exam_id, student_id, subject_id, marks, grade) 
                VALUES (?, ?, ?, ?, ?) 
                ON DUPLICATE KEY UPDATE marks = VALUES(marks), grade = VALUES(grade)
            `, [exam_id, record.student_id, subject_id, record.marks, record.grade]);
        }
        sendResponse(res, 200, true, null, 'Marks uploaded successfully');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};
