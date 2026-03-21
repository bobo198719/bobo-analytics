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

app.get('/api/v2/restaurant/tables', async (req, res) => {
    try { const [r] = await rPool.execute('SELECT * FROM restaurant_tables ORDER BY table_number+0 ASC'); res.json(r); }
    catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/v2/restaurant/menu', async (req, res) => {
    try { const [r] = await rPool.execute('SELECT * FROM menu_items ORDER BY category ASC'); res.json(r); }
    catch(e) { res.status(500).json({ error: e.message }); }
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

app.get('/api/v2/restaurant/dashboard', async (req, res) => {
    try {
        const [orders] = await rPool.execute("SELECT * FROM restaurant_orders WHERE DATE(created_at)=CURDATE()");
        const [tables] = await rPool.execute("SELECT COUNT(*) AS cnt FROM restaurant_tables WHERE status='occupied'");
        res.json({
            total_revenue: orders.reduce((a,o)=>a+parseFloat(o.total_amount||0),0).toFixed(2),
            orders_today: orders.length, active_tables: tables[0]?.cnt||0,
            kitchen_queue: orders.filter(o=>['pending_waiter','confirmed','preparing'].includes(o.status)).length
        });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

console.log('🍽️  Restaurant V2 MySQL Routes → ACTIVE on port 5000');
// ═══════════════════════════════════════════════════════

`;

const content = fs.readFileSync(serverPath, 'utf8');

// Don't double-patch
if (content.includes('RESTAURANT V2 — MySQL')) {
    console.log('⚠️  Already patched! Skipping.');
    process.exit(0);
}

// Find last route, inject before app.listen
const listenPos = content.lastIndexOf('app.listen');
if (listenPos === -1) {
    console.error('❌ Could not find app.listen in server.js');
    process.exit(1);
}

const patched = content.slice(0, listenPos) + newRoutes + content.slice(listenPos);
fs.writeFileSync(serverPath, patched, 'utf8');
console.log('✅ /root/bobo-api/server.js patched with Restaurant V2 MySQL routes!');
console.log('🔁 Run: npm install mysql2 --prefix /root/bobo-api && pm2 restart all');
