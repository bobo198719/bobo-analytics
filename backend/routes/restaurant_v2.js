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
        const { rows: dbItems } = await db.query('SELECT * FROM menu_items ORDER BY category ASC');
        
        let catalogItems = [];
        if (fs.existsSync(fallbackPath)) {
            catalogItems = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        }

        // Hybrid Merge: DB Items + Catalog Items (avoiding duplicates by name)
        const dbNames = new Set(dbItems.map(it => it.name.toLowerCase()));
        const uniqueCatalog = catalogItems.filter(it => !dbNames.has(it.name.toLowerCase()));
        
        return res.json([...dbItems, ...uniqueCatalog].slice(0, 1000)); // Limit to first 1k for speed
    } catch (err) { 
        console.error("Menu Sync Lag:", err.message);
        // Instant Fallback
        if (fs.existsSync(fallbackPath)) {
            return res.json(JSON.parse(fs.readFileSync(fallbackPath, 'utf8')));
        }
        res.json([]);
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
        if (rows.length > 0) return res.json(rows);
        
        // Default Provisioning if DB is isolated
        const defaults = Array.from({length: 12}, (_, i) => ({ id: i+1000, table_number: String(i+1), status: 'available' }));
        res.json(defaults);
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
        const { id } = req.params;
        const { rows } = await db.query('SELECT table_number FROM restaurant_tables WHERE id = ?', [id]);
        const tbl = rows[0];
        if (tbl) {
            const tableNum = String(tbl.table_number);
            for (const [key, val] of global.__QR_ORDERS__.entries()) {
                if (String(val.table_id) === tableNum) global.__QR_ORDERS__.delete(key);
            }
        }
        await db.query('DELETE FROM restaurant_tables WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/tables/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;
        
        // 1. Update SQL DB
        await db.query('UPDATE restaurant_tables SET status = ? WHERE id = ?', [status, id]);
        
        // 2. If status is 'available', clear associated optimistic orders
        if (status === 'available') {
            const { rows } = await db.query('SELECT table_number FROM restaurant_tables WHERE id = ?', [id]);
            const tbl = rows[0];
            if (tbl) {
                const tableNum = String(tbl.table_number);
                for (const [key, val] of global.__QR_ORDERS__.entries()) {
                    if (String(val.table_id) === tableNum) {
                        global.__QR_ORDERS__.delete(key);
                    }
                }
            }
        }

        const { rows } = await db.query('SELECT * FROM restaurant_tables WHERE id = ?', [id]);
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
 * 4.5 OPTIMISTIC QR ORDERS (IN-MEMORY ENGINE)
 */
if (!global.__QR_ORDERS__) global.__QR_ORDERS__ = new Map();

// Helper to push to MySQL safely (fire-and-forget)
const persistQrToDb = async (order) => {
    try {
        await db.query(
            'INSERT IGNORE INTO restaurant_qr_orders (order_id, table_id, items, total_amount, status) VALUES (?, ?, ?, ?, ?)',
            [order.order_id, order.table_id, JSON.stringify(order.items), order.total_amount, order.status]
        );
    } catch(e) {
        console.error("[QR DB Persist Error]:", e.message);
    }
};

router.get('/qr-orders', async (req, res) => {
    const { order_id, active_only } = req.query;
    if (order_id) {
        // High Speed Memory First
        const memOrder = global.__QR_ORDERS__.get(order_id);
        if (memOrder) return res.json({ order: memOrder });
        
        // Fallback to DB with high sensitivity (protect against hangs)
        const dbPromise = db.query('SELECT * FROM restaurant_qr_orders WHERE order_id = ?', [order_id])
            .then(([rows]) => {
                if (rows && rows[0]) {
                    global.__QR_ORDERS__.set(order_id, rows[0]);
                    return { order: rows[0] };
                }
                return { order: null };
            })
            .catch((err) => {
                console.error("[QR DB Fetch Error]:", err.message);
                return { order: null };
            });

        // racing with a 0.8s timeout for the tracker (tighter for production)
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ order: null, error: 'DB_LATENCY' }), 800));
        const result = await Promise.race([dbPromise, timeoutPromise]);
        return res.json(result);
    }
    if (active_only) {
        const allOrders = Array.from(global.__QR_ORDERS__.values())
            .filter(o => o.status !== 'paid')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return res.json({ orders: allOrders });
    }
    res.status(400).json({ error: 'Missing logic' });
});

router.post('/qr-orders', async (req, res) => {
    const { table, items, total, status } = req.body;
    const orderId = 'QR-' + Date.now() + '-' + Math.floor(Math.random() * 9999);
    const order = {
        order_id: orderId,
        table_id: String(table),
        items: items || [],
        total_amount: total || 0,
        status: status || 'placed',
        created_at: new Date().toISOString()
    };
    global.__QR_ORDERS__.set(orderId, order);
    persistQrToDb(order);
    
    if (global.broadcastNewOrder) {
        global.broadcastNewOrder(order);
    }
    res.json({ success: true, order_id: orderId });
});

router.patch('/qr-orders', async (req, res) => {
    const { order_id, status } = req.body;
    const order = global.__QR_ORDERS__.get(order_id);
    if (order) {
        order.status = status;
        global.__QR_ORDERS__.set(order_id, order);
        if (global.broadcastNewOrder) {
            // Re-using broadcast method for status change
            global.broadcastNewOrder(order);
        }
    }
    try {
        await db.query('UPDATE restaurant_qr_orders SET status = ? WHERE order_id = ?', [status, order_id]);
    } catch(e) {}
    res.json({ success: true });
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
        
        // Memory orders (Optimistic Engine)
        const memoryOrders = Array.from(global.__QR_ORDERS__.values());
        const memoryProfit = memoryOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        // Extended Dashboard: Weekly history for the chart
        const [history] = await db.rawPool.execute(`
            SELECT DATE_FORMAT(created_at, '%a') as date, SUM(total_amount) as total 
            FROM restaurant_orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            AND status NOT IN ('rejected', 'pending_waiter')
            GROUP BY DATE(created_at) ORDER BY created_at ASC
        `);

        // Merge today's memory into history
        const todayDay = new Intl.DateTimeFormat('en-US', {weekday: 'short'}).format(new Date()).toUpperCase();
        const finalHistory = (history || []).map(h => {
             if (h.date.toUpperCase() === todayDay) {
                 return { ...h, total: parseFloat(h.total || 0) + memoryProfit };
             }
             return h;
        });
        if (!finalHistory.find(h => h.date.toUpperCase() === todayDay)) {
             finalHistory.push({ date: todayDay, total: memoryProfit });
        }

        const [recent] = await db.rawPool.execute(`
            SELECT o.id, o.status, t.table_number 
            FROM restaurant_orders o 
            JOIN restaurant_tables t ON o.table_id = t.id 
            ORDER BY o.created_at DESC LIMIT 5
        `);

        res.json({
            total_revenue: (rows.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0) + memoryProfit).toFixed(2),
            orders_today: rows.length + memoryOrders.length,
            active_tables: activeTablesResult[0]?.cnt || 0,
            kitchen_queue: rows.filter(o => ['waiter_confirmed', 'kitchen_preparing'].includes(o.status)).length + 
                           memoryOrders.filter(o => ['waiter_confirmed', 'kitchen_preparing'].includes(o.status)).length,
            history: finalHistory,
            recent
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/seed-orders', async (req, res) => {
    try {
        const { orders } = req.body;
        console.log(`Seeding ${orders.length} orders...`);
        const values = orders.map(o => [o.table_id, o.status, parseFloat(o.total_amount), parseFloat(o.gst_amount), '', o.items, o.created_at]);
        await db.query('INSERT IGNORE INTO restaurant_orders (table_id, status, total_amount, gst_amount, waiter_name, items, created_at) VALUES ?', [values]);
        res.json({ success: true, count: orders.length });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/seed-menu', async (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const catalogPath = path.join(__dirname, '../data/restaurant_menu.json');

    try {
        if (!fs.existsSync(catalogPath)) throw new Error("Catalog File Missing");
        const items = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        
        // Use a pool to batch insert for speed (Standard MariaDB Batch)
        const values = items.map(it => [
            it.name, it.category, it.type, it.price, it.gst_percent || 5, it.image_url || ''
        ]);

        await db.query('DELETE FROM menu_items'); // Clear previous fragments
        await db.query(`
            INSERT INTO menu_items (name, category, type, price, gst_percent, image_url) 
            VALUES ?
        `, [values]);

        res.json({ success: true, count: items.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
