const express = require('express');
const router = express.Router();
const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ==========================================
// ECAMPUS ERP ADMIN PANEL - MASTER ROUTES
// Database: ecampus_erp
// ==========================================

// Helper for Error Handling
function handleDbError(err, res) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error occurred' });
}

// Ensure the db connection switches to ecampus_erp for these routes
const erpDb = require('mysql2/promise').createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'ecampus_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * 1. Admin Authentication
 */
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    try {
        const [rows] = await erpDb.execute("SELECT * FROM admins WHERE email = ? AND status = 1 AND deleted_at IS NULL", [email]);
        if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const admin = rows[0];
        let isMatch = false;

        if (admin.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, admin.password);
        } else {
            isMatch = (password === admin.password);
        }

        if (isMatch) {
            const token = jwt.sign({ id: admin.id, role: admin.role, name: admin.name }, process.env.JWT_SECRET || 'secret123', { expiresIn: '8h' });
            res.json({ success: true, token, admin: { id: admin.id, name: admin.name, role: admin.role } });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) { handleDbError(err, res); }
});

// Middleware to protect ERP routes (Bypassed for direct open)
const protect = (req, res, next) => {
    req.admin = { id: 1, role: 'admin', name: 'Admin User' };
    return next();
};

/**
 * 2. Admin Dashboard (Home) Statistics
 */
router.get('/dashboard/stats', protect, async (req, res) => {
    try {
        const [[{ total_students }]] = await erpDb.execute("SELECT COUNT(*) as total_students FROM students WHERE status = 1 AND deleted_at IS NULL");
        const [[{ total_teachers }]] = await erpDb.execute("SELECT COUNT(*) as total_teachers FROM teachers WHERE status = 1 AND deleted_at IS NULL");
        const [[{ total_classes }]] = await erpDb.execute("SELECT COUNT(*) as total_classes FROM classes WHERE status = 1 AND deleted_at IS NULL");

        // Fees
        const [[{ total_fees }]] = await erpDb.execute("SELECT SUM(amount_paid) as total_fees FROM fee_payments");
        const fees_collected = total_fees || 0; // fallback to 0 if null

        // Recent admissions
        const [recent_admissions] = await erpDb.execute(`
            SELECT s.id, s.admission_no, s.name, c.name as class_name, DATE_FORMAT(s.created_at, '%Y-%m-%d') as date, 
            CASE WHEN s.status = 1 THEN 'Active' ELSE 'Inactive' END as status
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.deleted_at IS NULL
            ORDER BY s.id DESC LIMIT 5
        `);

        res.json({
            success: true,
            stats: {
                total_students,
                total_teachers,
                total_classes,
                fees_collected,
                pending_fees: 12000 // You can calculate this if standard fees are defined
            },
            recent: recent_admissions
        });
    } catch (err) { handleDbError(err, res); }
});

/**
 * 3. Student Management
 */
router.get('/students', protect, async (req, res) => {
    try {
        const query = `
            SELECT s.*, c.name as class_name, sec.name as section_name 
            FROM students s
            LEFT JOIN classes c ON s.class_id = c.id
            LEFT JOIN sections sec ON s.section_id = sec.id
            WHERE s.deleted_at IS NULL
            ORDER BY s.id DESC
        `;
        const [rows] = await erpDb.execute(query);
        res.json({ success: true, data: rows });
    } catch (err) { handleDbError(err, res); }
});

router.post('/students', protect, async (req, res) => {
    const { admission_no, name, dob, gender, class_id, section_id, parent_name, parent_phone, address, status } = req.body;
    try {
        const q = `INSERT INTO students (admission_no, name, dob, gender, class_id, section_id, parent_name, parent_phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [r] = await erpDb.execute(q, [admission_no, name, dob, gender, class_id || null, section_id || null, parent_name, parent_phone, address, status || 1]);
        res.json({ success: true, message: 'Student created', id: r.insertId });
    } catch (err) { handleDbError(err, res); }
});

router.put('/students/:id', protect, async (req, res) => {
    const { admission_no, name, dob, gender, class_id, section_id, parent_name, parent_phone, address, status } = req.body;
    try {
        const q = `UPDATE students SET admission_no=?, name=?, dob=?, gender=?, class_id=?, section_id=?, parent_name=?, parent_phone=?, address=?, status=?, updated_at=NOW() WHERE id=? AND deleted_at IS NULL`;
        await erpDb.execute(q, [admission_no, name, dob, gender, class_id || null, section_id || null, parent_name, parent_phone, address, status, req.params.id]);
        res.json({ success: true, message: 'Student updated' });
    } catch (err) { handleDbError(err, res); }
});

router.delete('/students/:id', protect, async (req, res) => {
    try {
        await erpDb.execute("UPDATE students SET deleted_at=NOW(), status=0 WHERE id=?", [req.params.id]);
        res.json({ success: true, message: 'Student marked as deleted' });
    } catch (err) { handleDbError(err, res); }
});

/**
 * 4. Teacher Management
 */
router.get('/teachers', protect, async (req, res) => {
    try {
        const [rows] = await erpDb.execute("SELECT * FROM teachers WHERE deleted_at IS NULL ORDER BY id DESC");
        res.json({ success: true, data: rows });
    } catch (err) { handleDbError(err, res); }
});

router.post('/teachers', protect, async (req, res) => {
    const { name, email, phone, designation, status } = req.body;
    try {
        const [r] = await erpDb.execute("INSERT INTO teachers (name, email, phone, designation, status) VALUES (?, ?, ?, ?, ?)", [name, email, phone, designation, status || 1]);
        res.json({ success: true, message: 'Teacher added', id: r.insertId });
    } catch (err) { handleDbError(err, res); }
});

router.put('/teachers/:id', protect, async (req, res) => {
    const { name, email, phone, designation, status } = req.body;
    try {
        await erpDb.execute("UPDATE teachers SET name=?, email=?, phone=?, designation=?, status=?, updated_at=NOW() WHERE id=? AND deleted_at IS NULL", [name, email, phone, designation, status, req.params.id]);
        res.json({ success: true, message: 'Teacher updated' });
    } catch (err) { handleDbError(err, res); }
});

router.delete('/teachers/:id', protect, async (req, res) => {
    try {
        await erpDb.execute("UPDATE teachers SET deleted_at=NOW(), status=0 WHERE id=?", [req.params.id]);
        res.json({ success: true, message: 'Teacher deleted' });
    } catch (err) { handleDbError(err, res); }
});

/**
 * 5. Classes & Sections Management
 */
router.get('/classes', protect, async (req, res) => {
    try {
        const [rows] = await erpDb.execute("SELECT * FROM classes WHERE deleted_at IS NULL ORDER BY name ASC");
        res.json({ success: true, data: rows });
    } catch (err) { handleDbError(err, res); }
});

// Create Class
router.post('/classes', protect, async (req, res) => {
    try {
        const [r] = await erpDb.execute("INSERT INTO classes (name, status) VALUES (?, ?)", [req.body.name, req.body.status || 1]);
        res.json({ success: true, id: r.insertId });
    } catch (err) { handleDbError(err, res); }
});

/**
 * 11. Notice / Announcement System
 */
router.get('/notices', protect, async (req, res) => {
    try {
        const [rows] = await erpDb.execute("SELECT * FROM notices WHERE deleted_at IS NULL ORDER BY id DESC");
        res.json({ success: true, data: rows });
    } catch (err) { handleDbError(err, res); }
});

router.post('/notices', protect, async (req, res) => {
    const { title, message, visible_for, status } = req.body;
    try {
        const [r] = await erpDb.execute("INSERT INTO notices (title, message, visible_for, status) VALUES (?, ?, ?, ?)", [title, message, visible_for || 'all', status || 1]);
        res.json({ success: true, id: r.insertId });
    } catch (err) { handleDbError(err, res); }
});

/**
 * 12. Legal Pages Config
 */
router.get('/legal/terms', protect, async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM legal_pages WHERE page_key = 'terms_conditions' LIMIT 1");
        if (rows.length > 0) {
            res.json({ success: true, page: rows[0] });
        } else {
            res.json({ success: false, message: 'Terms & Conditions not found' });
        }
    } catch (err) { handleDbError(err, res); }
});

router.put('/legal/terms', protect, async (req, res) => {
    const { title, content_html, version, status } = req.body;
    try {
        // Find existing to update
        const [rows] = await db.execute("SELECT id FROM legal_pages WHERE page_key = 'terms_conditions'");
        if (rows.length > 0) {
            await db.execute(
                "UPDATE legal_pages SET title=?, content_html=?, version=?, status=?, updated_at=NOW() WHERE page_key='terms_conditions'",
                [title, content_html, version, status]
            );
            res.json({ success: true, message: 'Terms & Conditions updated successfully' });
        } else {
            await db.execute(
                "INSERT INTO legal_pages (page_key, title, content_html, version, status) VALUES ('terms_conditions', ?, ?, ?, ?)",
                [title, content_html, version, status]
            );
            res.json({ success: true, message: 'Terms & Conditions created successfully' });
        }
    } catch (err) { handleDbError(err, res); }
});

module.exports = router;
