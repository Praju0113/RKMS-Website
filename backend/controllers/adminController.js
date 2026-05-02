const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const pool = require('../database/mysql');

// Admin login
const adminLogin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // Check if admin exists
        const [admins] = await pool.query(
            'SELECT id, username, password FROM admins WHERE username = ? LIMIT 1',
            [username]
        );
        const admin = admins[0];
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = admin.password === password || await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get dashboard stats
const getDashboard = async (req, res) => {
    try {
        const [[memberCount]] = await pool.query('SELECT COUNT(*) AS total FROM members');
        const [[paymentCount]] = await pool.query("SELECT COUNT(*) AS total FROM payments WHERE status = 'completed'");
        const [[revenue]] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'completed'");
        const [[eventCount]] = await pool.query('SELECT COUNT(*) AS total FROM events');

        const [recentMembers] = await pool.query(
            `SELECT id, name, guardian_name, gotra_name, email, phone, membership_id, 
                    educational_qualification, profession, marital_status, blood_group, 
                    city, state, created_at
             FROM members
             ORDER BY created_at DESC
             LIMIT 5`
        );

        const [recentPayments] = await pool.query(
            `SELECT p.id, p.amount, p.type, p.created_at, m.name, m.email
             FROM payments p
             LEFT JOIN members m ON p.member_id = m.id
             WHERE p.status = 'completed'
             ORDER BY p.created_at DESC
             LIMIT 5`
        );

        res.status(200).json({
            success: true,
            stats: {
                totalMembers: memberCount.total,
                totalPayments: paymentCount.total,
                totalRevenue: Number(revenue.total),
                totalEvents: eventCount.total
            },
            recentMembers,
            recentPayments
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all members
const getMembers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [members] = await pool.query(
            `SELECT id, name, guardian_name, gotra_name, email, phone, membership_id, date_of_birth, 
                    educational_qualification, profession, marital_status, blood_group, address, city, state, pincode, 
                    aadhar_number, photo_url, is_active, created_at
             FROM members
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, skip]
        );

        const [[countResult]] = await pool.query('SELECT COUNT(*) AS total FROM members');
        const total = countResult.total;

        res.status(200).json({
            success: true,
            members,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all payments
const getPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [payments] = await pool.query(
            `SELECT p.id, p.amount, p.type, p.status, p.payment_id, p.order_id, p.created_at,
                    p.donor_name, p.donor_email, p.donor_phone, p.purpose, p.pan_number, p.address,
                    m.name, m.email, m.membership_id
             FROM payments p
             LEFT JOIN members m ON p.member_id = m.id
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, skip]
        );

        const [[countResult]] = await pool.query('SELECT COUNT(*) AS total FROM payments');
        const total = countResult.total;

        const paymentsNormalized = payments.map((p) => ({
            ...p,
            amount: Number(p.amount)
        }));

        res.status(200).json({
            success: true,
            payments: paymentsNormalized,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getEventRegistrations = async (req, res) => {
    try {
        const eventId = req.query.eventId;
        let query = `
            SELECT r.id, r.event_id, r.name, r.email, r.membership_id, r.payment_status, r.payment_amount, r.payment_id, r.created_at,
                   e.title AS event_title, e.date AS event_date
            FROM event_registrations r
            INNER JOIN events e ON e.id = r.event_id
        `;
        const params = [];

        if (eventId) {
            query += ' WHERE r.event_id = ?';
            params.push(Number(eventId));
        }

        query += ' ORDER BY r.created_at DESC';
        const [rows] = await pool.query(query, params);

        res.status(200).json({
            success: true,
            registrations: rows
        });
    } catch (error) {
        console.error('Get event registrations error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    adminLogin,
    getDashboard,
    getMembers,
    getPayments,
    getEventRegistrations,
};
