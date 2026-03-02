const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_ecampus_2026');
        req.user = decoded; // Contains id, role, name from JWT payload
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        res.status(401).json({ success: false, message: 'Not authorized, token failed or expired' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'User role not authorized for this action' });
        }
        next();
    };
};

module.exports = { protect, authorize };
