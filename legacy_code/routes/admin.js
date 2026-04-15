const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAdmin } = require('../middleware/auth');

// Get dashboard statistics
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
        const [totalItems] = await db.query('SELECT COUNT(*) as count FROM items');
        const [lostItems] = await db.query('SELECT COUNT(*) as count FROM items WHERE status = "Lost"');
        const [foundItems] = await db.query('SELECT COUNT(*) as count FROM items WHERE status = "Found"');
        const [claimedItems] = await db.query('SELECT COUNT(*) as count FROM items WHERE status = "Claimed"');
        const [pendingClaims] = await db.query('SELECT COUNT(*) as count FROM claims WHERE status = "Pending"');

        // Recent items
        const [recentItems] = await db.query(`
            SELECT items.*, users.name as user_name
            FROM items
            LEFT JOIN users ON items.user_id = users.id
            ORDER BY items.created_at DESC
            LIMIT 5
        `);

        res.json({
            totalUsers: totalUsers[0].count,
            totalItems: totalItems[0].count,
            lostItems: lostItems[0].count,
            foundItems: foundItems[0].count,
            claimedItems: claimedItems[0].count,
            pendingClaims: pendingClaims[0].count,
            recentItems
        });
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, student_id, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Delete user
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const [user] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user[0].role === 'admin') {
            return res.status(400).json({ error: 'Cannot delete admin user' });
        }
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get all items (admin view)
router.get('/items', requireAdmin, async (req, res) => {
    try {
        const [items] = await db.query(`
            SELECT items.*, categories.name as category_name, users.name as user_name
            FROM items
            LEFT JOIN categories ON items.category_id = categories.id
            LEFT JOIN users ON items.user_id = users.id
            ORDER BY items.created_at DESC
        `);
        res.json(items);
    } catch (err) {
        console.error('Get admin items error:', err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Update item status
router.put('/items/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Lost', 'Found', 'Claimed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        await db.query('UPDATE items SET status = ? WHERE item_id = ?', [status, req.params.id]);

        // Notify item owner
        const [items] = await db.query('SELECT * FROM items WHERE item_id = ?', [req.params.id]);
        if (items.length > 0) {
            await db.query(
                'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
                [items[0].user_id, `Your item "${items[0].item_name}" status has been updated to "${status}" by admin.`]
            );
        }

        res.json({ message: 'Item status updated successfully' });
    } catch (err) {
        console.error('Update item status error:', err);
        res.status(500).json({ error: 'Failed to update item status' });
    }
});

// Delete item (admin)
router.delete('/items/:id', requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM items WHERE item_id = ?', [req.params.id]);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error('Delete item error:', err);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

// Get all categories
router.get('/categories', requireAdmin, async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Add category
router.post('/categories', requireAdmin, async (req, res) => {
    try {
        const { name, icon } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const [result] = await db.query('INSERT INTO categories (name, icon) VALUES (?, ?)', [name, icon || 'bi-tag']);
        res.status(201).json({ message: 'Category added successfully', id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Category already exists' });
        }
        console.error('Add category error:', err);
        res.status(500).json({ error: 'Failed to add category' });
    }
});

// Delete category
router.delete('/categories/:id', requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;
