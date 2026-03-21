// restaurant_v2.js — Full MySQL rewrite (no PostgreSQL dependency)
const express = require('express');
const router = express.Router();
const db = require('../mysql_db');

/**
 * 1. MENU APIS
 */
router.get('/menu', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM menu_items ORDER BY category ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/menu', async (req, res) => {
    try {
        const { name, category, type, price, gst_percent, image_url } = req.body;
        const [result] = await db.rawPool.execute(
            'INSERT INTO menu_items (name, category, type, price, gst_percent, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category, type, price, gst_percent || 5, image_url]
        );
        const { rows } = await db.query('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 2. ORDER CREATION
 */
router.post('/orders', async (req, res) => {
    const conn = await db.rawPool.getConnection();
    try {
        await conn.beginTransaction();
        const { table_id, items, special_notes, status = 'pending_waiter' } = req.body;
        const db_table_id = parseInt(table_id);

        const processedItems = (items || []).map(it => ({
            ...it,
            price: parseFloat(it.price || it.menu_item_price || 0),
            total: (it.quantity || it.qty || 1) * parseFloat(it.price || it.menu_item_price || 0),
            id: it.menu_item_id || it.id,
            menu_name: it.menu_name || it.name
        }));

        const total = processedItems.reduce((acc, it) => acc + (it.total || 0), 0);
        const gst = total * 0.05;

        const [orderResult] = await conn.execute(
            'INSERT INTO restaurant_orders (table_id, status, total_amount, gst_amount, special_notes, items) VALUES (?, ?, ?, ?, ?, ?)',
            [db_table_id, status, total + gst, gst, special_notes || '', JSON.stringify(processedItems)]
        );
        const orderId = orderResult.insertId;

        await conn.execute("UPDATE restaurant_tables SET status = 'occupied' WHERE id = ?", [db_table_id]);
        await conn.commit();

        if (global.broadcastNewOrder) {
            global.broadcastNewOrder({ id: orderId, items: processedItems, table_id: db_table_id, status });
        }

        res.json({ success: true, orderId, total: total + gst, status });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

/**
 * 3. TABLE MANAGEMENT
 */
router.get('/tables', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM restaurant_tables ORDER BY table_number ASC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/tables', async (req, res) => {
    try {
        const { table_number } = req.body;
        const [result] = await db.rawPool.execute(
            'INSERT INTO restaurant_tables (table_number, status) VALUES (?, ?)',
            [table_number, 'available']
        );
        const { rows } = await db.query('SELECT * FROM restaurant_tables WHERE id = ?', [result.insertId]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/tables/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM restaurant_tables WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/tables/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE restaurant_tables SET status = ? WHERE id = ?', [status, req.params.id]);
        const { rows } = await db.query('SELECT * FROM restaurant_tables WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 4. ORDER MANAGEMENT
 */
router.get('/orders', async (req, res) => {
    try {
        const { status } = req.query;
        let q = 'SELECT o.*, t.table_number FROM restaurant_orders o JOIN restaurant_tables t ON o.table_id = t.id';
        const params = [];
        if (status) { q += ' WHERE o.status = ?'; params.push(status); }
        q += ' ORDER BY o.created_at DESC';
        const { rows } = await db.query(q, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE restaurant_orders SET status = ? WHERE id = ?', [status, id]);

        if (status === 'completed' || status === 'rejected') {
            await db.query("UPDATE restaurant_tables SET status = 'available' WHERE id = (SELECT table_id FROM restaurant_orders WHERE id = ?)", [id]);
        }
        const { rows } = await db.query('SELECT * FROM restaurant_orders WHERE id = ?', [id]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 5. DASHBOARD
 */
router.get('/dashboard', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM restaurant_orders WHERE DATE(created_at) = CURDATE()');
        const activeTablesResult = await db.query("SELECT COUNT(*) AS cnt FROM restaurant_tables WHERE status = 'occupied'");
        res.json({
            total_revenue: rows.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0).toFixed(2),
            orders_today: rows.length,
            active_tables: activeTablesResult.rows[0]?.cnt || 0,
            kitchen_queue: rows.filter(o => o.status === 'pending_waiter' || o.status === 'confirmed').length
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 6. SEED (for initial data)
 */
router.get('/seed', async (req, res) => {
    const cats = ['Starters','Mains','Desserts','Beverages','Chef Specials'];
    const adj = ['Truffle-Infused','Wood-Fired','Aged','Artisanal','Crispy','Braised','Aromatic','Charred','Glazed','Herb-Crusted'];
    const pro = ['Wagyu Beef','Salmon','Pork Belly','Chicken','Duck','Ribeye','Lobster','Prawns','Tofu','Mushroom Risotto'];
    const sty = ['Risotto','Medallion','Chop','Breast','Fillet','Skewer','Tartare','Tail'];
    const sid = ['with Asparagus','over Polenta','with Mash','in Red Wine Jus','with Carrots'];
    const des = ['Lava Cake','Tiramisu','Cheesecake','Panna Cotta','Souffle'];
    const bev = ['Mojito','Martini','Margarita','Craft Beer','Aged Wine'];
    const r = a => a[Math.floor(Math.random() * a.length)];
    try {
        const rows = [];
        for (let i = 0; i < 500; i++) {
            let cat = r(cats), name = '', type = 'veg';
            if (cat === 'Desserts') name = `${r(adj)} ${r(des)}`;
            else if (cat === 'Beverages') name = `${r(adj)} ${r(bev)}`;
            else { name = `${r(adj)} ${r(pro)} ${r(sty)} ${r(sid)}`; if (/Beef|Chicken|Pork|Duck/.test(name)) type = 'non-veg'; }
            rows.push([`${name} (#${1000+i})`, cat, type, Math.floor(Math.random()*40)*5+100, 5, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400']);
        }
        await db.rawPool.query('INSERT INTO menu_items (name,category,type,price,gst_percent,image_url) VALUES ?', [rows]);
        res.json({ success: true, count: 500, message: '500 Premium Menu Items Seeded!' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
