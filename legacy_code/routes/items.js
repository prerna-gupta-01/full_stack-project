const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// Get all items (with search, filter, status)
router.get('/', async (req, res) => {
    try {
        const { search, category, status, user_id } = req.query;
        let query = `
            SELECT items.*, categories.name as category_name, users.name as user_name
            FROM items
            LEFT JOIN categories ON items.category_id = categories.id
            LEFT JOIN users ON items.user_id = users.id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ' AND (items.item_name LIKE ? OR items.description LIKE ? OR items.location LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (category) {
            query += ' AND items.category_id = ?';
            params.push(category);
        }
        if (status) {
            query += ' AND items.status = ?';
            params.push(status);
        }
        if (user_id) {
            query += ' AND items.user_id = ?';
            params.push(user_id);
        }

        query += ' ORDER BY items.created_at DESC';

        const [items] = await db.query(query, params);
        res.json(items);
    } catch (err) {
        console.error('Get items error:', err);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Get categories
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
        res.json(categories);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Get single item
router.get('/:id', async (req, res) => {
    try {
        const [items] = await db.query(`
            SELECT items.*, categories.name as category_name, users.name as user_name, users.email as user_email
            FROM items
            LEFT JOIN categories ON items.category_id = categories.id
            LEFT JOIN users ON items.user_id = users.id
            WHERE items.item_id = ?
        `, [req.params.id]);

        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(items[0]);
    } catch (err) {
        console.error('Get item error:', err);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});

// Create item
router.post('/', requireLogin, (req, res) => {
    const upload = req.app.get('upload');
    upload.single('image')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        try {
            const { item_name, category_id, description, location, date, status, contact_info } = req.body;

            if (!item_name || !description || !location || !date || !status) {
                return res.status(400).json({ error: 'Required fields: item_name, description, location, date, status' });
            }

            const image = req.file ? '/uploads/' + req.file.filename : null;
            const user_id = req.session.user.id;

            const [result] = await db.query(
                `INSERT INTO items (item_name, category_id, description, location, date, image, status, contact_info, user_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [item_name, category_id || null, description, location, date, image, status, contact_info || req.session.user.email, user_id]
            );

            // Create notification
            await db.query(
                'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
                [user_id, `Your ${status.toLowerCase()} item "${item_name}" has been posted successfully.`]
            );

            res.status(201).json({
                message: 'Item reported successfully',
                item_id: result.insertId
            });
        } catch (err) {
            console.error('Create item error:', err);
            res.status(500).json({ error: 'Failed to create item' });
        }
    });
});

// Update item
router.put('/:id', requireLogin, async (req, res) => {
    try {
        const { status } = req.body;
        const [items] = await db.query('SELECT * FROM items WHERE item_id = ?', [req.params.id]);

        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Only owner or admin can update
        if (items[0].user_id !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.query('UPDATE items SET status = ? WHERE item_id = ?', [status, req.params.id]);
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        console.error('Update item error:', err);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Delete item
router.delete('/:id', requireLogin, async (req, res) => {
    try {
        const [items] = await db.query('SELECT * FROM items WHERE item_id = ?', [req.params.id]);

        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Only owner or admin can delete
        if (items[0].user_id !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.query('DELETE FROM items WHERE item_id = ?', [req.params.id]);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error('Delete item error:', err);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

module.exports = router;
