const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create MySQL Promise Pool locally for Teacher Modules pointing to ecampus_erp
const db = require('mysql2/promise').createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'ecampus_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const { verifyTeacher } = require('../middlewares/teacherAuth');

function handleDbError(err, res) {
    console.error('[Teacher API Exception]', err);
    res.status(500).json({ success: false, message: 'Database error occurred' });
}

// =====================================
// 1. TEACHER AUTHENTICATION
// =====================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Credentials missing' });

    try {
        const [rows] = await db.execute("SELECT * FROM teachers WHERE email = ? AND status = 1 AND deleted_at IS NULL", [email]);
        if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid Login' });

        const teacher = rows[0];

        // As a dev fallback, if a teacher has no password during ERP init, set 'teacher123'
        let isMatch = false;
        if (!teacher.password) {
            isMatch = (password === 'teacher123'); // Default fallback for newly inserted rows by Admin
        } else if (teacher.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, teacher.password);
        } else {
            isMatch = (password === teacher.password);
        }

        if (isMatch) {
            const token = jwt.sign({ id: teacher.id, role: 'teacher', name: teacher.name, email }, process.env.JWT_SECRET || 'secret123', { expiresIn: '12h' });
            res.json({ success: true, token, teacher: { id: teacher.id, name: teacher.name, email: teacher.email, designation: teacher.designation } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Request' });
        }
    } catch (err) { handleDbError(err, res); }
});

// =====================================
// 2. TEACHER DASHBOARD STATS
// =====================================
router.get('/dashboard', verifyTeacher, async (req, res) => {
    const teacherId = req.teacher.id;
    try {
        // Query 1: Total Classes Assigned
        const [[{ total_classes }]] = await db.execute("SELECT COUNT(DISTINCT class_id) as total_classes FROM teacher_subjects WHERE teacher_id = ?", [teacherId]);

        // Query 2: Pending Assignments Evaluation
        const [[{ evaluate_pending }]] = await db.execute(`
            SELECT COUNT(*) as evaluate_pending FROM assignment_submissions sub
            JOIN assignments a ON sub.assignment_id = a.id
            WHERE a.teacher_id = ? AND sub.status = 'submitted'
        `, [teacherId]);

        // Mock remaining counts to wire up UI immediately
        res.json({
            success: true,
            stats: {
                total_classes: total_classes || 0,
                total_students: 124,
                lectures_today: 4,
                pending_attendance: 1,
                evaluate_pending: evaluate_pending || 0
            }
        });
    } catch (err) { handleDbError(err, res); }
});

// =====================================
// 4. MY CLASSES
// =====================================
router.get('/classes', verifyTeacher, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT c.name as class_name, s.name as subject_name, s.code
            FROM teacher_subjects ts
            JOIN classes c ON ts.class_id = c.id
            JOIN subjects s ON ts.subject_id = s.id
            WHERE ts.teacher_id = ? AND c.deleted_at IS NULL
        `, [req.teacher.id]);
        res.json({ success: true, data: rows });
    } catch (err) { handleDbError(err, res); }
});

// =====================================
// 5. STUDENTS IN TEACHER CLASSES
// =====================================
router.get('/students', verifyTeacher, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT st.id, st.admission_no, st.name, st.gender, c.name as class_name, sc.name as section_name
            FROM students st
            JOIN classes c ON st.class_id = c.id
            JOIN sections sc ON st.section_id = sc.id
            WHERE st.class_id IN (SELECT class_id FROM teacher_subjects WHERE teacher_id = ?)
            AND st.deleted_at IS NULL
        `, [req.teacher.id]);
        res.json({ success: true, data: rows });
    } catch (err) { handleDbError(err, res); }
});

module.exports = router;
