if (!global.__QR_ORDERS__) {
    global.__QR_ORDERS__ = new Map();
}

const DB_CONFIG = {
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectTimeout: 5000,
};

// Use a global pool to persist connections across serverless invocations
let pool;
const getPool = async () => {
    if (pool) return pool;
    const mysql = await import('mysql2/promise');
    pool = mysql.createPool({
        ...DB_CONFIG,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
    });
    return pool;
};

const persistToDb = async (order) => {
    try {
        const db = await getPool();
        // MIGRATION: Ensure total_amount is decimal (V72)
        try { await db.query("ALTER TABLE restaurant_qr_orders MODIFY total_amount DECIMAL(10,2)"); } catch(e) {}
        await db.query(
            'INSERT IGNORE INTO restaurant_qr_orders (order_id, table_id, items, total_amount, status) VALUES (?, ?, ?, ?, ?)',
            [order.order_id, order.table_id, JSON.stringify(order.items), order.total_amount, order.status]
        );
        // Note: Do not call db.end() on a pool unless shutting down the app
    } catch (e) {
        console.error("[DB Persist Error]:", e.message);
    }
};

const syncStatusToDb = async (orderId, status) => {
    try {
        const db = await getPool();
        await db.query('UPDATE restaurant_qr_orders SET status = ? WHERE order_id = ?', [status, orderId]);
    } catch (e) {
        console.error("[DB Sync Error]:", e.message);
    }
};

export async function GET({ request, url }) {
    const orderId = url.searchParams.get('order_id');
    const activeOnly = url.searchParams.get('active_only');

    if (orderId) {
        const memOrder = global.__QR_ORDERS__.get(orderId);
        if (memOrder) {
            return new Response(JSON.stringify({ order: memOrder }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        try {
            const db = await getPool();
            const [rows] = await db.query('SELECT * FROM restaurant_qr_orders WHERE order_id = ?', [orderId]);
            if (rows[0]) global.__QR_ORDERS__.set(orderId, rows[0]);
            return new Response(JSON.stringify({ order: rows[0] || null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            return new Response(JSON.stringify({ order: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
    }

    if (activeOnly) {
        let rows = [];
        try {
            const db = await getPool();
            const [fetchedRows] = await db.query("SELECT * FROM restaurant_qr_orders WHERE status NOT IN ('paid', 'rejected')");
            rows = fetchedRows;
            rows.forEach(r => global.__QR_ORDERS__.set(r.order_id, r));
        } catch (e) {
            console.error("[QR Orders DB Fail]:", e.message);
        }
        
        const sourceData = rows.length > 0 ? rows : Array.from(global.__QR_ORDERS__.values());
        const allOrders = sourceData
            .filter(o => o.status !== 'paid' && o.status !== 'rejected')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return new Response(JSON.stringify({ orders: allOrders }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400 });
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { table, items, total } = body;

        const orderId = 'QR-' + Date.now() + '-' + Math.floor(Math.random() * 9999);
        const order = {
            order_id: orderId,
            table_id: String(table),
            items: items || [],
            total_amount: total || 0,
            status: body.status || 'placed',
            created_at: new Date().toISOString()
        };

        global.__QR_ORDERS__.set(orderId, order);
        await persistToDb(order);

        try {
            fetch('http://187.124.97.144:5000/api/v2/restaurant/admin/broadcast', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ type: 'NEW_ORDER', order })
            }).catch(() => {});
        } catch(e) {}

        return new Response(JSON.stringify({ success: true, order_id: orderId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch(err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function PATCH({ request }) {
    try {
        const body = await request.json();
        const { order_id, status } = body;

        const order = global.__QR_ORDERS__.get(order_id);
        if (order) {
            order.status = status;
            global.__QR_ORDERS__.set(order_id, order);

            try {
                fetch('http://187.124.97.144:5000/api/v2/restaurant/admin/broadcast', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ type: 'STATUS_CHANGE', order })
                }).catch(() => {});
            } catch(e) {}
        }

        syncStatusToDb(order_id, status);

        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch(err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
