require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Test Database connection on startup
db.getConnection()
    .then(connection => {
        console.log('Successfully connected to MySQL Database ecampus_db.');
        connection.release();

        // Start Server
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MySQL database:', err.message);
        console.log('Please ensure MySQL is running and credentials in .env are correct.');
    });
