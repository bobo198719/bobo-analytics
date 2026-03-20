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

        // 🛠️ CHECK FOR REPAIR (MIGRATION)
        try { await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT'); } catch(e) {}

        const db_table_id = parseInt(table_id);
        const processedItems = items.map(it => ({
            ...it,
            price: parseFloat(it.price || it.menu_item_price),
            total: (it.quantity || it.qty) * parseFloat(it.price || it.menu_item_price),
            id: it.menu_item_id || it.id
        }));

        const total = processedItems.reduce((acc, it) => acc + it.total, 0);
        const gst = total * 0.05;

        // 🟢 ATTEMPT HIGH-MODERN INSERT
        let orderRows;
        try {
            const resInsert = await client.query(
                'INSERT INTO orders (table_id, status, total_amount, gst_amount, special_notes, items) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [db_table_id, status, total + gst, gst, special_notes || '', JSON.stringify(processedItems)]
            );
            orderRows = resInsert.rows;
        } catch (err) {
            if (err.message.includes('special_notes')) {
                console.warn("V24_FAILOVER: Stripping special_notes and retrying...");
                const resFallback = await client.query(
                    'INSERT INTO orders (table_id, status, total_amount, gst_amount, items) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [db_table_id, status, total + gst, gst, JSON.stringify(processedItems)]
                );
                orderRows = resFallback.rows;
            } else { throw err; }
        }

        const orderId = orderRows[0].id;

        // Create Order Items
        for (const pItem of processedItems) {
            await client.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, price, total, special_instructions) VALUES ($1, $2, $3, $4, $5, $6)',
                [orderId, pItem.id, pItem.quantity, pItem.price, pItem.total, pItem.special_instructions || '']
            );
        }

        await client.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [db_table_id]);
        await client.query('COMMIT');

        // Broadcast
        if (global.broadcastNewOrder) {
            global.broadcastNewOrder({ ...orderRows[0], items: processedItems });
        }

        res.json({ success: true, orderId, total: total + gst, status: orderRows[0].status });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("V24_CRITICAL_FAIL:", err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// GET Dashboards and other routes...
// (I'll keep the rest of the file as is)
router.get('/dashboard', async (req, res) => {
    try {
        const { rows } = await pg.query("SELECT * FROM orders WHERE created_at::date = CURRENT_DATE");
        res.json({
            total_revenue: rows.reduce((acc, o) => acc + parseFloat(o.total_amount), 0).toFixed(2),
            orders_today: rows.length,
            active_tables: (await pg.query("SELECT COUNT(*) FROM tables WHERE status = 'occupied'")).rows[0].count,
            kitchen_queue: rows.filter(o => o.status === 'pending_waiter').length
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/orders', async (req, res) => {
    try {
        const { rows } = await pg.query('SELECT o.*, t.table_number FROM orders o JOIN tables t ON o.table_id = t.id ORDER BY o.created_at DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
