// qr-orders.js — Optimistic In-Memory Order Engine
// Orders stored instantly in memory → zero-latency response.
// DB persistence happens silently in background — customer never waits.

if (!global.__QR_ORDERS__) global.__QR_ORDERS__ = new Map();

const DB_CONFIG = {
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectTimeout: 3000,
};

// Fire-and-forget — never blocks the response
const persistToDb = async (order) => {
    try {
        const mysql = await import('mysql2/promise');
        const db = await Promise.race([
            mysql.createConnection(DB_CONFIG),
            new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), 3000))
        ]);
        await db.query(`
            CREATE TABLE IF NOT EXISTS restaurant_qr_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE,
                table_id VARCHAR(20),
                items LONGTEXT,
                total_amount INT,
                status VARCHAR(50) DEFAULT 'placed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await db.query(
            'INSERT IGNORE INTO restaurant_qr_orders (order_id, table_id, items, total_amount, status) VALUES (?, ?, ?, ?, ?)',
            [order.order_id, order.table_id, JSON.stringify(order.items), order.total_amount, order.status]
        );
        await db.end();
    } catch (e) {
        console.warn('QR DB persist skipped (offline):', e.message);
    }
};

const syncStatusToDb = async (orderId, status) => {
    try {
        const mysql = await import('mysql2/promise');
        const db = await Promise.race([
            mysql.createConnection(DB_CONFIG),
            new Promise((_, r) => setTimeout(() => r(new Error('TIMEOUT')), 3000))
        ]);
        await db.query('UPDATE restaurant_qr_orders SET status = ? WHERE order_id = ?', [status, orderId]);
        await db.end();
    } catch (e) { /* silent */ }
};

export async function GET({ request }) {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');
    const activeOnly = url.searchParams.get('active_only');

    if (orderId) {
        // Check memory first (instant)
        const memOrder = global.__QR_ORDERS__.get(orderId);
        if (memOrder) {
            return new Response(JSON.stringify({ order: memOrder }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        // Fallback: try DB
        try {
            const mysql = await import('mysql2/promise');
            const db = await mysql.createConnection(DB_CONFIG);
            const [rows] = await db.query('SELECT * FROM restaurant_qr_orders WHERE order_id = ?', [orderId]);
            await db.end();
            if (rows[0]) global.__QR_ORDERS__.set(orderId, rows[0]);
            return new Response(JSON.stringify({ order: rows[0] || null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response(JSON.stringify({ order: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
    }

    if (activeOnly) {
        const allOrders = Array.from(global.__QR_ORDERS__.values())
            .filter(o => o.status !== 'paid')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return new Response(JSON.stringify({ orders: allOrders }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Missing Parameters' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
}

export async function POST({ request }) {
    const body = await request.json();
    const { table, items, total } = body;

    // ⚡ INSTANT: Create order in memory
    const orderId = 'QR-' + Date.now() + '-' + Math.floor(Math.random() * 9999);
    const order = {
        order_id: orderId,
        table_id: String(table),
        items: items || [],
        total_amount: total || 0,
        status: 'placed',
        created_at: new Date().toISOString()
    };

    global.__QR_ORDERS__.set(orderId, order);

    // Persist to DB silently in background (non-blocking)
    persistToDb(order);

    return new Response(JSON.stringify({ success: true, order_id: orderId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function PATCH({ request }) {
    const body = await request.json();
    const { order_id, status } = body;

    // ⚡ INSTANT: Update memory
    const order = global.__QR_ORDERS__.get(order_id);
    if (order) {
        order.status = status;
        global.__QR_ORDERS__.set(order_id, order);
    }

    // Sync to DB in background
    syncStatusToDb(order_id, status);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
