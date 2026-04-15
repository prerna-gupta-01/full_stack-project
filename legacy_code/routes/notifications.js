const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// Get user notifications
router.get('/', requireLogin, async (req, res) => {
    try {
        const [notifications] = await db.query(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [req.session.user.id]
        );
        res.json(notifications);
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', requireLogin, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [req.params.id, req.session.user.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Mark notification error:', err);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Mark all as read
router.put('/read-all', requireLogin, async (req, res) => {
    try {
        await db.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [req.session.user.id]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Mark all notifications error:', err);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
});

module.exports = router;
