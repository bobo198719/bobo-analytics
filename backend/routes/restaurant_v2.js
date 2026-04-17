// restaurant_v2.js — Full MySQL rewrite (no PostgreSQL dependency)
const express = require('express');
const router = express.Router();
const db = require('../mysql_db');

/**
 * 1. MENU APIS
 */
router.get('/menu', async (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const fallbackPath = path.join(__dirname, '../data/restaurant_menu.json');

    try {
        const { rows } = await db.query('SELECT * FROM menu_items ORDER BY category ASC');
        if (rows && rows.length > 0) {
            return res.json(rows);
        }
        
        // Fallback to local JSON if DB is empty 
        if (fs.existsSync(fallbackPath)) {
            const localData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            return res.json(localData);
        }
        res.json([]);
    } catch (err) { 
        console.error("Menu DB Fail:", err.message);
        // Critical Fallback on DB Timeout/Error
        try {
            if (fs.existsSync(fallbackPath)) {
                const localData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
                return res.json(localData);
            }
        } catch (e) {
            console.error("Critical Fallback Error:", e.message);
        }
        res.status(500).json({ error: "Catalog Offline - Syncing..." }); 
    }
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

// GET single order (used by QR page for status tracking polling)
router.get('/orders/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM restaurant_orders WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Order not found' });
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 5. ANALYTICS & INSIGHTS (NEW)
 */
router.get('/analytics', async (req, res) => {
    try {
        // A. Sales Over Time (Last 30 Days)
        const [dailySales] = await db.rawPool.execute(`
            SELECT DATE(created_at) as date, SUM(total_amount) as total 
            FROM restaurant_orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            AND status NOT IN ('rejected', 'pending_waiter')
            GROUP BY DATE(created_at) ORDER BY date ASC
        `);

        // B. Top Products by Category
        const [topProducts] = await db.rawPool.execute(`
            SELECT category, name, COUNT(*) as sales_count, SUM(price) as total_revenue
            FROM (
                SELECT JSON_UNQUOTE(JSON_EXTRACT(item, '$.menu_name')) as name,
                       JSON_UNQUOTE(JSON_EXTRACT(item, '$.category')) as category,
                       CAST(JSON_EXTRACT(item, '$.price') AS DECIMAL(10,2)) as price
                FROM restaurant_orders,
                JSON_TABLE(items, '$[*]' COLUMNS (item JSON PATH '$')) as jt
                WHERE status NOT IN ('rejected', 'pending_waiter')
            ) as product_data
            GROUP BY category, name
            ORDER BY sales_count DESC
        `);

        // C. Busy Hour Analysis
        const [busyHours] = await db.rawPool.execute(`
            SELECT HOUR(created_at) as hour, COUNT(*) as order_count, SUM(total_amount) as revenue
            FROM restaurant_orders
            WHERE status NOT IN ('rejected', 'pending_waiter')
            GROUP BY HOUR(created_at)
            ORDER BY order_count DESC
        `);

        // D. Day of Week Analysis
        const [busyDays] = await db.rawPool.execute(`
            SELECT DAYNAME(created_at) as day, COUNT(*) as order_count
            FROM restaurant_orders
            GROUP BY DAYNAME(created_at)
            ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')
        `);

        // E. Category Yields
        const [catYields] = await db.rawPool.execute(`
            SELECT category, SUM(price) as revenue
            FROM (
                SELECT JSON_UNQUOTE(JSON_EXTRACT(item, '$.category')) as category,
                       CAST(JSON_EXTRACT(item, '$.price') AS DECIMAL(10,2)) as price
                FROM restaurant_orders,
                JSON_TABLE(items, '$[*]' COLUMNS (item JSON PATH '$')) as jt
                WHERE status NOT IN ('rejected', 'pending_waiter')
            ) as cat_data
            GROUP BY category
        `);

        // F. Period Summary (Daily, Weekly, Monthly, Yearly)
        const [periods] = await db.rawPool.execute(`
            SELECT 
                (SELECT SUM(total_amount) FROM restaurant_orders WHERE created_at >= CURDATE()) as daily,
                (SELECT SUM(total_amount) FROM restaurant_orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as weekly,
                (SELECT SUM(total_amount) FROM restaurant_orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as monthly,
                (SELECT SUM(total_amount) FROM restaurant_orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)) as yearly
            FROM DUAL
        `);

        res.json({
            dailySales,
            topProducts,
            busyHours,
            busyDays,
            catYields,
            periods: periods[0]
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 6. DASHBOARD
 */
router.get('/dashboard', async (req, res) => {
    try {
        const [rows] = await db.rawPool.execute('SELECT * FROM restaurant_orders WHERE DATE(created_at) = CURDATE()');
        const [activeTablesResult] = await db.rawPool.execute("SELECT COUNT(*) AS cnt FROM restaurant_tables WHERE status = 'occupied'");
        
        // Extended Dashboard: Weekly history for the chart
        const [history] = await db.rawPool.execute(`
            SELECT DATE_FORMAT(created_at, '%a') as date, SUM(total_amount) as total 
            FROM restaurant_orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND status NOT IN ('rejected', 'pending_waiter')
            GROUP BY DATE(created_at) ORDER BY created_at ASC
        `);

        // Extended Dashboard: Recent 5 orders
        const [recent] = await db.rawPool.execute(`
            SELECT o.id, o.status, t.table_number 
            FROM restaurant_orders o 
            JOIN restaurant_tables t ON o.table_id = t.id 
            ORDER BY o.created_at DESC LIMIT 5
        `);

        res.json({
            total_revenue: rows.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0).toFixed(2),
            orders_today: rows.length,
            active_tables: activeTablesResult[0]?.cnt || 0,
            kitchen_queue: rows.filter(o => o.status === 'pending_waiter' || o.status === 'confirmed').length,
            history,
            recent
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/seed-orders', async (req, res) => {
    try {
        const { orders } = req.body;
        console.log(`Seeding ${orders.length} orders...`);
        const values = orders.map(o => [o.table_id, o.status, parseFloat(o.total_amount), parseFloat(o.gst_amount), '', o.items, o.created_at]);
        await db.rawPool.query('INSERT INTO restaurant_orders (table_id, status, total_amount, gst_amount, special_notes, items, created_at) VALUES ?', [values]);
        res.json({ success: true, count: orders.length });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

/**
 * 7. SEED (for initial data)
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
