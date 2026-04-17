if (!global.__QR_ORDERS__) {
    global.__QR_ORDERS__ = new Map();
}

const DB_CONFIG = {
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectTimeout: 800, // FAST FAILURE
};

const persistToDb = async (order) => {
    try {
        const mysql = await import('mysql2/promise');
        const db = await mysql.createConnection(DB_CONFIG);
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
        // Silent fail (memory-first architecture)
    }
};

const syncStatusToDb = async (orderId, status) => {
    try {
        const mysql = await import('mysql2/promise');
        const db = await mysql.createConnection(DB_CONFIG);
        await db.query('UPDATE restaurant_qr_orders SET status = ? WHERE order_id = ?', [status, orderId]);
        await db.end();
    } catch (e) {}
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
            const mysql = await import('mysql2/promise');
            const db = await mysql.createConnection(DB_CONFIG);
            const [rows] = await db.query('SELECT * FROM restaurant_qr_orders WHERE order_id = ?', [orderId]);
            await db.end();
            if (rows[0]) global.__QR_ORDERS__.set(orderId, rows[0]);
            
            // VERY IMPORTANT: Return order ONLY if found, or null so tracker can clear it cleanly natively
            return new Response(JSON.stringify({ order: rows[0] || null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } catch (e) {
            // Even if DB times out, return null rather than 500 so UI can cleanly fallback
            return new Response(JSON.stringify({ order: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
    }

    if (activeOnly) {
        try {
            const mysql = await import('mysql2/promise');
            const db = await mysql.createConnection(DB_CONFIG);
            const [rows] = await db.query("SELECT * FROM restaurant_qr_orders WHERE status NOT IN ('paid', 'rejected')");
            await db.end();
            rows.forEach(r => global.__QR_ORDERS__.set(r.order_id, r));
        } catch (e) {}
        
        const allOrders = Array.from(global.__QR_ORDERS__.values())
            .filter(o => o.status !== 'paid')
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
        
        // Wait 200ms before returning to ensure Lambda doesn't freeze the persistToDb process instantly
        persistToDb(order);
        await new Promise(r => setTimeout(r, 200));

        // Proxy the broadcast via HTTP to the VPS instead so we don't hold the WS connection open
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
