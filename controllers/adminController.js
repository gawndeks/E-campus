const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sendResponse = (res, statusCode, success, data, message = '') => {
    res.status(statusCode).json({ success, data, message });
};

// 1. Admin Auth
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return sendResponse(res, 400, false, null, 'Email and password required');

    try {
        const [rows] = await db.execute("SELECT * FROM admins WHERE email = ? AND status = 1 AND deleted_at IS NULL", [email]);
        if (rows.length === 0) return sendResponse(res, 401, false, null, 'Invalid credentials');

        const admin = rows[0];
        let isMatch = false;

        if (admin.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, admin.password);
        } else {
            isMatch = (password === admin.password);
        }

        if (isMatch) {
            const token = jwt.sign({ id: admin.id, role: admin.role, name: admin.name }, process.env.JWT_SECRET || 'super_secret_jwt_key_ecampus_2026', { expiresIn: '8h' });
            sendResponse(res, 200, true, { token, admin: { id: admin.id, name: admin.name, role: admin.role } }, 'Login successful');
        } else {
            sendResponse(res, 401, false, null, 'Invalid credentials');
        }
    } catch (err) {
        console.error(err);
        sendResponse(res, 500, false, null, 'Database error');
    }
};

// 2. Dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const [[{ total_students }]] = await db.execute("SELECT COUNT(*) as total_students FROM students WHERE status = 1 AND deleted_at IS NULL");
        const [[{ total_teachers }]] = await db.execute("SELECT COUNT(*) as total_teachers FROM teachers WHERE status = 1 AND deleted_at IS NULL");
        const [[{ total_classes }]] = await db.execute("SELECT COUNT(*) as total_classes FROM classes WHERE status = 1 AND deleted_at IS NULL");

        const [[{ total_fees }]] = await db.execute("SELECT SUM(amount_paid) as total_fees FROM fee_payments");

        const [recent_admissions] = await db.execute(`
            SELECT s.id, s.admission_no, s.name, c.name as class_name, DATE_FORMAT(s.created_at, '%Y-%m-%d') as date, 
            CASE WHEN s.status = 1 THEN 'Active' ELSE 'Inactive' END as status
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.deleted_at IS NULL
            ORDER BY s.id DESC LIMIT 5
        `);

        sendResponse(res, 200, true, {
            stats: {
                total_students,
                total_teachers,
                total_classes,
                fees_collected: total_fees || 0
            },
            recent: recent_admissions
        });
    } catch (err) { console.error(err); sendResponse(res, 500, false, null, 'Database error'); }
};

// 3. Students
exports.getStudents = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT s.*, c.name as class_name, sec.name as section_name 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE s.deleted_at IS NULL
            ORDER BY s.id DESC
        `);
        sendResponse(res, 200, true, rows);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

exports.createStudent = async (req, res) => {
    const { admission_no, name, dob, gender, class_id, section_id, parent_name, parent_phone, address, status } = req.body;
    try {
        const [r] = await db.execute(
            `INSERT INTO students (admission_no, name, dob, gender, class_id, section_id, parent_name, parent_phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [admission_no, name, dob, gender, class_id || null, section_id || null, parent_name, parent_phone, address, status || 1]
        );
        sendResponse(res, 201, true, { id: r.insertId }, 'Student created');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

exports.updateStudent = async (req, res) => {
    const { admission_no, name, dob, gender, class_id, section_id, parent_name, parent_phone, address, status } = req.body;
    try {
        await db.execute(
            `UPDATE students SET admission_no=?, name=?, dob=?, gender=?, class_id=?, section_id=?, parent_name=?, parent_phone=?, address=?, status=?, updated_at=NOW() WHERE id=? AND deleted_at IS NULL`,
            [admission_no, name, dob, gender, class_id || null, section_id || null, parent_name, parent_phone, address, status, req.params.id]
        );
        sendResponse(res, 200, true, null, 'Student updated');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

exports.deleteStudent = async (req, res) => {
    try {
        await db.execute("UPDATE students SET deleted_at=NOW(), status=0 WHERE id=?", [req.params.id]);
        sendResponse(res, 200, true, null, 'Student deleted');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

// 4. Teachers
exports.getTeachers = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM teachers WHERE deleted_at IS NULL ORDER BY id DESC");
        sendResponse(res, 200, true, rows);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

exports.createTeacher = async (req, res) => {
    const { name, email, phone, designation, status } = req.body;
    try {
        const [r] = await db.execute("INSERT INTO teachers (name, email, phone, designation, status) VALUES (?, ?, ?, ?, ?)", [name, email, phone, designation, status || 1]);
        sendResponse(res, 201, true, { id: r.insertId }, 'Teacher created');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

exports.updateTeacher = async (req, res) => {
    const { name, email, phone, designation, status } = req.body;
    try {
        await db.execute("UPDATE teachers SET name=?, email=?, phone=?, designation=?, status=?, updated_at=NOW() WHERE id=? AND deleted_at IS NULL", [name, email, phone, designation, status, req.params.id]);
        sendResponse(res, 200, true, null, 'Teacher updated');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

exports.deleteTeacher = async (req, res) => {
    try {
        await db.execute("UPDATE teachers SET deleted_at=NOW(), status=0 WHERE id=?", [req.params.id]);
        sendResponse(res, 200, true, null, 'Teacher deleted');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

// 5. Classes & Subjects
exports.getClasses = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM classes WHERE deleted_at IS NULL ORDER BY name ASC");
        sendResponse(res, 200, true, rows);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

exports.getSubjects = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM subjects WHERE deleted_at IS NULL ORDER BY name ASC");
        sendResponse(res, 200, true, rows);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

// 6. Notices
exports.getNotices = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM notices WHERE deleted_at IS NULL ORDER BY id DESC");
        sendResponse(res, 200, true, rows);
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};

exports.createNotice = async (req, res) => {
    const { title, message, visible_for, status } = req.body;
    try {
        const [r] = await db.execute("INSERT INTO notices (title, message, visible_for, status) VALUES (?, ?, ?, ?)", [title, message, visible_for || 'all', status || 1]);
        sendResponse(res, 201, true, { id: r.insertId }, 'Notice broadcasted');
    } catch (err) { sendResponse(res, 500, false, null, 'Database error'); }
};
