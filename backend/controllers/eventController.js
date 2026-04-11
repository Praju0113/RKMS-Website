const { validationResult } = require('express-validator');
const pool = require('../database/mysql');
const { uploadImage } = require('../services/imageService');

const ensureRegistrationTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS event_registrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            event_id INT NOT NULL,
            member_id INT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            membership_id VARCHAR(30),
            payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
            payment_amount DECIMAL(10,2) DEFAULT 0,
            payment_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
            FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
        )
    `);
};

// Get all events (public)
const getEvents = async (req, res) => {
    try {
        const [events] = await pool.query(
            `SELECT id, title, description, date, time, location, category, price, is_free, image_url, created_at
             FROM events
             WHERE is_active = 1
             ORDER BY date DESC`
        );
        res.status(200).json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Register for an event (public)
const registerEvent = async (req, res) => {
    try {
        await ensureRegistrationTable();
        const { id } = req.params;
        const { name, email, membershipId, paymentStatus, paymentAmount, paymentId } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        const [events] = await pool.query('SELECT id, price, is_free FROM events WHERE id = ? LIMIT 1', [id]);
        if (!events.length) {
            return res.status(404).json({ message: 'Event not found' });
        }
        const event = events[0];

        let memberId = null;
        if (membershipId) {
            const [members] = await pool.query('SELECT id FROM members WHERE membership_id = ? LIMIT 1', [membershipId]);
            memberId = members.length ? members[0].id : null;
        }

        const effectivePaymentStatus = paymentStatus || ((event.is_free || Number(event.price) === 0) ? 'completed' : 'pending');
        const amount = paymentAmount != null ? paymentAmount : Number(event.price || 0);

        const [result] = await pool.query(
            `INSERT INTO event_registrations
            (event_id, member_id, name, email, membership_id, payment_status, payment_amount, payment_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, memberId, name, email, membershipId || null, effectivePaymentStatus, amount, paymentId || null]
        );

        if (effectivePaymentStatus === 'completed' && amount > 0) {
            await pool.query(
                `INSERT INTO payments (member_id, event_id, type, amount, status, payment_id, order_id, donor_name, donor_email)
                 VALUES (?, ?, 'event', ?, 'completed', ?, ?, ?, ?)`,
                [memberId, id, amount, paymentId || null, `EVENT_ORDER_${Date.now()}`, name, email]
            );
        }

        await pool.query(
            `UPDATE events
             SET current_participants = (
                SELECT COUNT(*) FROM event_registrations WHERE event_id = ?
             )
             WHERE id = ?`,
            [id, id]
        );

        res.status(201).json({
            success: true,
            message: 'Event registration successful',
            registrationId: result.insertId
        });
    } catch (error) {
        console.error('Register event error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create event (admin only)
const createEvent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let imageUrl = null;
        if (req.file) {
            const uploadResult = await uploadImage(req.file);
            if (uploadResult.success) {
                imageUrl = uploadResult.imageUrl;
            } else {
                return res.status(400).json({ message: uploadResult.error });
            }
        } else if (req.body.image_url && /^https?:\/\//i.test(String(req.body.image_url).trim())) {
            imageUrl = String(req.body.image_url).trim();
        }

        const { title, description, date, location, category, price, is_free } = req.body;
        const isFree = is_free === true || is_free === 'true';
        const [result] = await pool.query(
            `INSERT INTO events (title, description, date, location, image_url, category, price, is_free, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [title, description, date, location, imageUrl, category || 'upcoming', Number(price || 0), isFree]
        );
        const [rows] = await pool.query('SELECT * FROM events WHERE id = ? LIMIT 1', [result.insertId]);
        const event = rows[0];

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update event (admin only)
const updateEvent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;

        let imageUrl;
        if (req.file) {
            const uploadResult = await uploadImage(req.file);
            if (uploadResult.success) {
                imageUrl = uploadResult.imageUrl;
            } else {
                return res.status(400).json({ message: uploadResult.error });
            }
        } else {
            const raw = req.body.image_url;
            const trimmed = raw != null && raw !== '' ? String(raw).trim() : '';
            if (trimmed && (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/uploads/'))) {
                imageUrl = trimmed;
            } else {
                const [[existing]] = await pool.query('SELECT image_url FROM events WHERE id = ? LIMIT 1', [id]);
                imageUrl = existing?.image_url ?? null;
            }
        }

        const { title, description, date, location, category, price, is_free } = req.body;
        const isFree = is_free === true || is_free === 'true';

        await pool.query(
            `UPDATE events
             SET title = ?, description = ?, date = ?, location = ?, image_url = ?, category = ?, price = ?, is_free = ?
             WHERE id = ?`,
            [title, description, date, location, imageUrl || null, category || 'upcoming', Number(price || 0), isFree, id]
        );
        const [rows] = await pool.query('SELECT * FROM events WHERE id = ? LIMIT 1', [id]);
        const event = rows[0];

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            event
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete event (admin only)
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM events WHERE id = ?', [id]);

        if (!result.affectedRows) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    registerEvent,
};
