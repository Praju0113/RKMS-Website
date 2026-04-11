const jwt = require('jsonwebtoken');
const pool = require('../database/mysql');

// Protect routes - Admin only
const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get admin from database
        const [rows] = await pool.query(
            'SELECT id, username, created_at FROM admins WHERE id = ? LIMIT 1',
            [decoded.id]
        );
        const admin = rows[0];

        if (!admin) {
            return res.status(401).json({ message: 'Invalid token. Admin not found.' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid token.' });
    }
};

module.exports = { protect };
