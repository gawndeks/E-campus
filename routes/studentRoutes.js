const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// 1. Student Login
router.post('/login', studentController.studentLogin);

// Custom Middleware: Fallback to mock student if token not provided, 
// ensuring existing raw frontend pages don't completely break before frontend JWT wiring is done.
const protectStudentFallback = (req, res, next) => {
    let hasToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer');
    if (hasToken) {
        return protect(req, res, (err) => {
            if (err) return next(err);
            authorize('student')(req, res, next);
        });
    } else {
        // Fallback bypass
        req.user = { id: 1, role: 'student', name: 'Demo Student' };
        return next();
    }
};

router.use(protectStudentFallback);

// 2. Profile fetch & update
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

// 3. Attendance fetch
router.get('/attendance', studentController.getAttendance);

// 4. Marks / Result fetch
router.get('/results', studentController.getResults);

// 5. Timetable fetch
router.get('/timetable', studentController.getTimetable);

module.exports = router;
