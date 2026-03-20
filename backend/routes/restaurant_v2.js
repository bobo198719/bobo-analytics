const express = require('express');
const router = express.Router();
const pg = require('../pg_db');

/**
 * 1. MENU APIs
 */
router.get('/menu', async (req, res) => {
    try {
        const { rows } = await pg.query('SELECT * FROM menu_items ORDER BY category ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/menu', async (req, res) => {
    try {
        const { name, category, type, price, gst_percent, image_url } = req.body;
        const { rows } = await pg.query(
            'INSERT INTO menu_items (name, category, type, price, gst_percent, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, category, type, price, gst_percent || 5, image_url]
        );
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 2. ORDER CREATION (V24 - High-Compatibility Dynamic Engine)
 */
router.post('/orders', async (req, res) => {
    const client = await pg.pool.connect();
    try {
        await client.query('BEGIN');
        const { table_id, items, special_notes, status = 'pending_waiter' } = req.body;

        try { await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT'); } catch(e) {}

        const db_table_id = parseInt(table_id);
        const processedItems = items.map(it => ({
            ...it,
            price: parseFloat(it.price || it.menu_item_price || it.total / (it.quantity || 1)),
            total: (it.quantity || it.qty) * parseFloat(it.price || it.menu_item_price || it.total / (it.quantity || 1)),
            id: it.menu_item_id || it.id,
            menu_name: it.menu_name || it.name
        }));

        const total = processedItems.reduce((acc, it) => acc + it.total, 0);
        const gst = total * 0.05;

        let orderRows;
        try {
            const resInsert = await client.query(
                'INSERT INTO orders (table_id, status, total_amount, gst_amount, special_notes, items) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [db_table_id, status, total + gst, gst, special_notes || '', JSON.stringify(processedItems)]
            );
            orderRows = resInsert.rows;
        } catch (err) {
            console.warn("V24_FAILOVER: Schema mismatch. Stripping notes.");
            const resFallback = await client.query(
                'INSERT INTO orders (table_id, status, total_amount, gst_amount, items) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [db_table_id, status, total + gst, gst, JSON.stringify(processedItems)]
            );
            orderRows = resFallback.rows;
        }

        const orderId = orderRows[0].id;
        for (const pItem of processedItems) {
            await client.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price, total, special_instructions) VALUES ($1, $2, $3, $4, $5, $6)',
                [orderId, pItem.id, pItem.quantity, pItem.price, pItem.total, pItem.special_instructions || '']
            );
        }

        await client.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [db_table_id]);
        await client.query('COMMIT');

        if (global.broadcastNewOrder) {
            global.broadcastNewOrder({ ...orderRows[0], items: processedItems, table_number: table_id });
        }

        res.json({ success: true, orderId, total: total + gst, status: orderRows[0].status });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("V24_FAIL:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

/**
 * 3. ORDER FETCH & STATUS (RESTORED)
 */
router.get('/orders', async (req, res) => {
    try {
        const { status } = req.query;
        let query = 'SELECT o.*, t.table_number FROM orders o JOIN tables t ON o.table_id = t.id';
        const params = [];
        if (status) {
            query += ' WHERE o.status = $1';
            params.push(status);
        }
        query += ' ORDER BY o.created_at DESC';
        const { rows } = await pg.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { rows } = await pg.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        
        if (status === 'completed' || status === 'rejected') {
            await pg.query("UPDATE tables SET status = 'available' WHERE id = (SELECT table_id FROM orders WHERE id = $1)", [id]);
        }
        
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 4. TABLES & DASHBOARD
 */
router.get('/tables', async (req, res) => {
    try {
        const { rows } = await pg.query('SELECT * FROM tables ORDER BY table_number ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/dashboard', async (req, res) => {
    try {
        const { rows } = await pg.query("SELECT * FROM orders WHERE created_at::date = CURRENT_DATE");
        res.json({
            total_revenue: rows.reduce((acc, o) => acc + parseFloat(o.total_amount), 0).toFixed(2),
            orders_today: rows.length,
            active_tables: (await pg.query("SELECT COUNT(*) FROM tables WHERE status = 'occupied'")).rows[0].count,
            kitchen_queue: rows.filter(o => o.status === 'pending_waiter' || o.status === 'confirmed').length
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
