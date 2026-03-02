require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// MVC Sub-Modules: Routes
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

// MVC Database Connection Pool
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Standardization Middlewares
app.use(cors());
app.use(express.json()); // Essential for parsing JSON payloads
app.use(express.urlencoded({ extended: true }));

// Serve static frontend UI framework correctly without breaking rules
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));

// =====================================
// 🚀 BACKEND MVC API ROUTING MOUNTS
// =====================================
// 1. Admin Panel Backend Endpoints
app.use('/api/admin', adminRoutes);

// 2. Student Module Endpoints
app.use('/api/student', studentRoutes);

// 3. Teacher Module Endpoints
app.use('/api/teacher', teacherRoutes);

// =====================================
// Centralized Error Handling Middleware
// =====================================
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? 'Unspecified' : err.message
    });
});

// Test Database connection on startup (MySQL pool via db connection file)
db.getConnection()
    .then(connection => {
        console.log('✅ Successfully connected to MySQL Database via connection pool.');
        connection.release();

        // Boot Server completely only if database is online
        app.listen(PORT, () => {
            console.log(`🚀 Production-ready Node.js Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Failed to connect to MySQL database:', err.message);
        console.log('Please ensure MySQL is running locally and DB_HOST / DB_USER inside .env are correct.');
    });
