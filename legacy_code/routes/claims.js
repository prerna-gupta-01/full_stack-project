const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireLogin } = require('../middleware/auth');

// Submit a claim
router.post('/', requireLogin, async (req, res) => {
    try {
        const { item_id, message } = req.body;
        const user_id = req.session.user.id;

        if (!item_id || !message) {
            return res.status(400).json({ error: 'Item ID and message are required' });
        }

        // Check if item exists
        const [items] = await db.query('SELECT * FROM items WHERE item_id = ?', [item_id]);
        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        // Check if user already claimed
        const [existingClaims] = await db.query(
            'SELECT * FROM claims WHERE item_id = ? AND user_id = ?',
            [item_id, user_id]
        );
        if (existingClaims.length > 0) {
            return res.status(400).json({ error: 'You have already submitted a claim for this item' });
        }

        // Insert claim
        const [result] = await db.query(
            'INSERT INTO claims (item_id, user_id, message) VALUES (?, ?, ?)',
            [item_id, user_id, message]
        );

        // Notify item owner
        await db.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [items[0].user_id, `Someone has claimed the item "${items[0].item_name}" that you reported.`]
        );

        res.status(201).json({
            message: 'Claim submitted successfully',
            claim_id: result.insertId
        });
    } catch (err) {
        console.error('Create claim error:', err);
        res.status(500).json({ error: 'Failed to submit claim' });
    }
});

// Get claims for an item
router.get('/:itemId', async (req, res) => {
    try {
        const [claims] = await db.query(`
            SELECT claims.*, users.name as user_name, users.email as user_email
            FROM claims
            JOIN users ON claims.user_id = users.id
            WHERE claims.item_id = ?
            ORDER BY claims.claim_date DESC
        `, [req.params.itemId]);

        res.json(claims);
    } catch (err) {
        console.error('Get claims error:', err);
        res.status(500).json({ error: 'Failed to fetch claims' });
    }
});

// Update claim status
router.put('/:id', requireLogin, async (req, res) => {
    try {
        const { status } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be Approved or Rejected.' });
        }

        const [claims] = await db.query(`
            SELECT claims.*, items.user_id as item_owner_id, items.item_name
            FROM claims
            JOIN items ON claims.item_id = items.item_id
            WHERE claims.claim_id = ?
        `, [req.params.id]);

        if (claims.length === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        const claim = claims[0];

        // Only item owner or admin can update claim
        if (claim.item_owner_id !== req.session.user.id && req.session.user.role !== 'admin') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await db.query('UPDATE claims SET status = ? WHERE claim_id = ?', [status, req.params.id]);

        // If approved, mark item as claimed
        if (status === 'Approved') {
            await db.query('UPDATE items SET status = ? WHERE item_id = ?', ['Claimed', claim.item_id]);
        }

        // Notify claimer
        await db.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [claim.user_id, `Your claim for "${claim.item_name}" has been ${status.toLowerCase()}.`]
        );

        res.json({ message: `Claim ${status.toLowerCase()} successfully` });
    } catch (err) {
        console.error('Update claim error:', err);
        res.status(500).json({ error: 'Failed to update claim' });
    }
});

module.exports = router;
