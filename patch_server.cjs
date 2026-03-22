// patch_server.cjs — Injects MySQL-based /api/v2/restaurant/* routes into /root/bobo-api/server.js
const fs = require('fs');
const path = require('path');

const serverPath = '/root/bobo-api/server.js';

const newRoutes = `
// ═══════════════════════════════════════════════════════
// 🍽️  RESTAURANT V2 — MySQL via Unix Socket (Auto-Patched)
// ═══════════════════════════════════════════════════════
const mysql2 = require('mysql2/promise');
const rPool = mysql2.createPool({
    socketPath: '/run/mysqld/mysqld.sock',
    user: 'root', password: '', database: 'bobo_analytics', connectionLimit: 5
});

app.get('/api/v2/restaurant/menu', async (req, res) => {
    try { const [r] = await rPool.execute('SELECT * FROM menu_items ORDER BY category ASC'); res.json(r); }
    catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/v2/restaurant/menu', async (req, res) => {
    try {
        const { name, category, type, price, gst_percent, image_url } = req.body;
        const [result] = await rPool.execute(
            'INSERT INTO menu_items (name, category, type, price, gst_percent, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category, type, price, gst_percent || 5, image_url || '']
        );
        const [rows] = await rPool.execute('SELECT * FROM menu_items WHERE id = ?', [result.insertId]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/v2/restaurant/tables', async (req, res) => {
    try { const [r] = await rPool.execute('SELECT * FROM restaurant_tables ORDER BY table_number+0 ASC'); res.json(r); }
    catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/v2/restaurant/tables', async (req, res) => {
    try {
        const { table_number } = req.body;
        const [result] = await rPool.execute('INSERT INTO restaurant_tables (table_number, status) VALUES (?, ?)', [table_number, 'available']);
        const [rows] = await rPool.execute('SELECT * FROM restaurant_tables WHERE id = ?', [result.insertId]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/v2/restaurant/tables/:id', async (req, res) => {
    try { await rPool.execute('DELETE FROM restaurant_tables WHERE id = ?', [req.params.id]); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/v2/restaurant/tables/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await rPool.execute('UPDATE restaurant_tables SET status = ? WHERE id = ?', [status, req.params.id]);
        const [rows] = await rPool.execute('SELECT * FROM restaurant_tables WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/v2/restaurant/orders', async (req, res) => {
    const conn = await rPool.getConnection();
    try {
        await conn.beginTransaction();
        const { table_id, items, special_notes, status = 'pending_waiter' } = req.body;
        const rows = (items || []).map(it => ({
            ...it, price: parseFloat(it.price || it.menu_item_price || 0),
            quantity: it.quantity || it.qty || 1
        }));
        const sub = rows.reduce((a, i) => a + i.price * i.quantity, 0);
        const gst = sub * 0.05;
        const [result] = await conn.execute(
            'INSERT INTO restaurant_orders (table_id,status,total_amount,gst_amount,special_notes,items) VALUES (?,?,?,?,?,?)',
            [parseInt(table_id)||1, status, sub+gst, gst, special_notes||'', JSON.stringify(rows)]
        );
        await conn.execute("UPDATE restaurant_tables SET status='occupied' WHERE id=?", [parseInt(table_id)||1]);
        await conn.commit();
        res.json({ success: true, orderId: result.insertId, id: result.insertId, total: sub+gst, status });
    } catch(e) { await conn.rollback(); res.status(500).json({ error: e.message }); }
    finally { conn.release(); }
});

app.get('/api/v2/restaurant/orders', async (req, res) => {
    try {
        const { status } = req.query;
        let q = 'SELECT o.*,t.table_number FROM restaurant_orders o LEFT JOIN restaurant_tables t ON o.table_id=t.id';
        const p = [];
        if (status) { q += ' WHERE o.status=?'; p.push(status); }
        q += ' ORDER BY o.created_at DESC';
        const [r] = await rPool.execute(q, p);
        res.json(r);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/v2/restaurant/orders/:id', async (req, res) => {
    try {
        const [r] = await rPool.execute('SELECT * FROM restaurant_orders WHERE id=?', [req.params.id]);
        if (!r.length) return res.status(404).json({ error: 'Not found' });
        res.json(r[0]);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/v2/restaurant/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await rPool.execute('UPDATE restaurant_orders SET status=? WHERE id=?', [status, req.params.id]);
        if (['completed','rejected'].includes(status)) {
            const [o] = await rPool.execute('SELECT table_id FROM restaurant_orders WHERE id=?', [req.params.id]);
            if (o[0]) await rPool.execute("UPDATE restaurant_tables SET status='available' WHERE id=?", [o[0].table_id]);
        }
        const [r] = await rPool.execute('SELECT * FROM restaurant_orders WHERE id=?', [req.params.id]);
        res.json(r[0]);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/v2/restaurant/analytics', async (req, res) => {
    try {
        const [dailySales] = await rPool.execute("SELECT DATE(created_at) as date, SUM(total_amount) as total FROM restaurant_orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status NOT IN ('rejected', 'pending_waiter', 'pending') GROUP BY DATE(created_at) ORDER BY date ASC");
        const [topProducts] = await rPool.execute("SELECT category, name, COUNT(*) as sales_count, SUM(price) as total_revenue FROM (SELECT JSON_UNQUOTE(JSON_EXTRACT(item, '$.menu_name')) as name, JSON_UNQUOTE(JSON_EXTRACT(item, '$.category')) as category, CAST(JSON_EXTRACT(item, '$.price') AS DECIMAL(10,2)) as price FROM restaurant_orders, JSON_TABLE(items, '$[*]' COLUMNS (item JSON PATH '$')) as jt WHERE status NOT IN ('rejected', 'pending_waiter', 'pending')) as product_data GROUP BY category, name ORDER BY sales_count DESC");
        const [busyHours] = await rPool.execute("SELECT HOUR(created_at) as hour, COUNT(*) as order_count, SUM(total_amount) as revenue FROM restaurant_orders WHERE status NOT IN ('rejected', 'pending_waiter', 'pending') GROUP BY HOUR(created_at) ORDER BY order_count DESC");
        const [busyDays] = await rPool.execute("SELECT DAYNAME(created_at) as day, COUNT(*) as order_count FROM restaurant_orders GROUP BY DAYNAME(created_at) ORDER BY FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')");
        const [catYields] = await rPool.execute("SELECT category, SUM(price) as revenue FROM (SELECT JSON_UNQUOTE(JSON_EXTRACT(item, '$.category')) as category, CAST(JSON_EXTRACT(item, '$.price') AS DECIMAL(10,2)) as price FROM restaurant_orders, JSON_TABLE(items, '$[*]' COLUMNS (item JSON PATH '$')) as jt WHERE status NOT IN ('rejected', 'pending_waiter', 'pending')) as cat_data GROUP BY category");
        const [periods] = await rPool.execute("SELECT (SELECT SUM(total_amount) FROM restaurant_orders WHERE created_at >= CURDATE() AND status NOT IN ('rejected', 'pending_waiter', 'pending')) as daily, (SELECT SUM(total_amount) FROM restaurant_orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status NOT IN ('rejected', 'pending_waiter', 'pending')) as weekly, (SELECT SUM(total_amount) FROM restaurant_orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status NOT IN ('rejected', 'pending_waiter', 'pending')) as monthly, (SELECT SUM(total_amount) FROM restaurant_orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR) AND status NOT IN ('rejected', 'pending_waiter', 'pending')) as yearly FROM DUAL");
        res.json({ dailySales, topProducts, busyHours, busyDays, catYields, periods: periods[0] });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/v2/restaurant/dashboard', async (req, res) => {
    try {
        const [rows] = await rPool.execute('SELECT * FROM restaurant_orders WHERE DATE(created_at) = CURDATE()');
        const [activeTablesResult] = await rPool.execute("SELECT COUNT(*) AS cnt FROM restaurant_tables WHERE status = 'occupied'");
        const [history] = await rPool.execute("SELECT DATE_FORMAT(created_at, '%a') as date, SUM(total_amount) as total FROM restaurant_orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status NOT IN ('rejected', 'pending_waiter') GROUP BY DATE(created_at) ORDER BY created_at ASC");
        const [recent] = await rPool.execute("SELECT o.id, o.status, t.table_number FROM restaurant_orders o JOIN restaurant_tables t ON o.table_id = t.id ORDER BY o.created_at DESC LIMIT 5");
        res.json({ total_revenue: rows.reduce((acc, o) => acc + parseFloat(o.total_amount || 0), 0).toFixed(2), orders_today: rows.length, active_tables: activeTablesResult[0]?.cnt || 0, kitchen_queue: rows.filter(o => o.status === 'pending_waiter' || o.status === 'confirmed').length, history, recent });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/v2/restaurant/seed-orders', async (req, res) => {
    try {
        const { orders } = req.body;
        const values = orders.map(o => [o.table_id, o.status, parseFloat(o.total_amount), parseFloat(o.gst_amount), '', JSON.stringify(o.items), o.created_at]);
        await rPool.query('INSERT INTO restaurant_orders (table_id, status, total_amount, gst_amount, special_notes, items, created_at) VALUES ?', [values]);
        res.json({ success: true, count: orders.length });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

console.log('🍽️  Restaurant V3 MySQL & Management Routes → ACTIVE on port 5000');
// ═══════════════════════════════════════════════════════

`;

const content = fs.readFileSync(serverPath, 'utf8');

// If already V2 patched, replace it with V3
if (content.includes('RESTAURANT V2 — MySQL')) {
    console.log('🔄 Upgrading existing V2 patch to V3...');
    const startIdx = content.indexOf('// ═══════════════════════════════════════════════════════');
    const endIdx = content.lastIndexOf('// ═══════════════════════════════════════════════════════') + 59;
    const upgraded = content.slice(0, startIdx) + newRoutes + content.slice(endIdx);
    fs.writeFileSync(serverPath, upgraded, 'utf8');
    console.log('✅ /root/bobo-api/server.js upgraded to Restaurant V3!');
} else {
    // Find last route, inject before app.listen
    const listenPos = content.lastIndexOf('app.listen');
    if (listenPos === -1) {
        console.error('❌ Could not find app.listen in server.js');
        process.exit(1);
    }
    const patched = content.slice(0, listenPos) + newRoutes + content.slice(listenPos);
    fs.writeFileSync(serverPath, patched, 'utf8');
    console.log('✅ /root/bobo-api/server.js patched with Restaurant V3 MySQL routes!');
}

console.log('🔁 Run: pm2 restart all');
