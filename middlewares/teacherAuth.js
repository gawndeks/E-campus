const jwt = require('jsonwebtoken');

const verifyTeacher = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        if (decoded.role !== 'teacher') {
            return res.status(403).json({ success: false, message: 'Forbidden: Valid teacher credentials required.' });
        }

        req.teacher = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Expired or invalid token.' });
    }
};

module.exports = { verifyTeacher };
