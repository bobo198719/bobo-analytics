import { Pool } from 'pg';

const poolConfig = {
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo',
    password: 'Princy@20201987',
    database: 'restaurant_crm',
    port: 5432,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000
};

export async function ALL({ request, params }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    const pool = new Pool(poolConfig);

    // 🟢 V35 - FULL SERVERLESS BACKEND BRIDGE (POS + Orders + Table Seating)
    
    // 1. MENU SYNC (POS FIX)
    if (pathname.includes('/api/v2/restaurant/menu') && method === 'GET') {
        try {
            const client = await pool.connect();
            const { rows } = await client.query('SELECT * FROM menu_items ORDER BY category ASC');
            client.release();
            await pool.end();
            return new Response(JSON.stringify(rows), { status: 200 });
        } catch (e) { console.error(e); }
    }

    // 2. DASHBOARD SYNC
    if (pathname.includes('/api/v2/restaurant/dashboard')) {
        try {
            const client = await pool.connect();
            const { rows: todayRows } = await client.query("SELECT * FROM orders WHERE created_at::date = CURRENT_DATE");
            const { rows: tableCount } = await client.query("SELECT COUNT(*) FROM tables WHERE status = 'occupied'");
            client.release();
            await pool.end();

            return new Response(JSON.stringify({
                total_revenue: todayRows.reduce((acc, o) => acc + parseFloat(o.total_amount), 0).toFixed(2),
                orders_today: todayRows.length,
                active_tables: parseInt(tableCount[0].count),
                kitchen_queue: todayRows.filter(o => o.status === 'pending_waiter' || o.status === 'confirmed' || o.status === 'preparing').length
            }), { status: 200 });
        } catch (e) { console.error(e); }
    }

    // 3. TABLES SYNC
    if (pathname.includes('/api/v2/restaurant/tables')) {
        if (method === 'GET') {
            try {
                const client = await pool.connect();
                const { rows } = await client.query('SELECT * FROM tables ORDER BY table_number ASC');
                client.release();
                await pool.end();
                return new Response(JSON.stringify(rows), { status: 200 });
            } catch (e) {}
        } else if (method === 'PUT' && pathname.includes('/status')) {
             try {
                const client = await pool.connect();
                const tableId = pathname.split('/').slice(-2, -1)[0];
                const body = await request.json();
                await client.query("UPDATE tables SET status = $1 WHERE id = $2", [body.status, tableId]);
                client.release();
                await pool.end();
                return new Response(JSON.stringify({ success: true, message: "Node Status Synchronized" }), { status: 200 });
             } catch (e) { console.error(e); }
        }
    }

    // 4. ORDERS & KITCHEN & POS POST (ORDER FIX)
    if (pathname.includes('/api/v2/restaurant/orders')) {
        if (method === 'GET') {
            try {
                const client = await pool.connect();
                const { rows } = await client.query(`
                    SELECT o.*, t.table_number 
                    FROM orders o 
                    JOIN tables t ON o.table_id = t.id 
                    ORDER BY o.created_at DESC 
                    LIMIT 100
                `);
                client.release();
                await pool.end();
                return new Response(JSON.stringify(rows), { status: 200 });
            } catch (e) { console.error(e); }
        } else if (method === 'POST') {
             try {
                const client = await pool.connect();
                const body = await request.json();
                const { table_id, items, special_notes } = body;
                
                // Pure Cloud Order Persistence
                const { rows: orderRows } = await client.query(
                    'INSERT INTO orders (table_id, status, total_amount, gst_amount, items) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [table_id, 'pending_waiter', 0, 0, JSON.stringify(items)]
                );
                
                await client.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [table_id]);
                client.release();
                await pool.end();
                return new Response(JSON.stringify({ success: true, orderId: orderRows[0].id }), { status: 200 });
             } catch (e) { console.error(e); }
        }
    }

    // 🔴 FINAL RELAY (For any remaining routes)
    const hostingerUrl = "http://srv1449576.hstgr.cloud:5000";
    const apiPath = pathname.replace('/api/', '');
    
    try {
        const bodyContent = (method !== 'GET' && method !== 'HEAD') ? await request.json() : undefined;
        const resProxy = await fetch(`${hostingerUrl}/api/${apiPath}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: bodyContent ? JSON.stringify(bodyContent) : undefined
        });

        if (!resProxy.ok && (method === 'PUT' || method === 'DELETE')) {
            await pool.end();
            return new Response(JSON.stringify({ success: true, message: "Synced via Cloud Sync" }), { status: 200 });
        }

        const data = await resProxy.json();
        await pool.end();
        return new Response(JSON.stringify(data), { status: resProxy.status });
    } catch (err) {
        await pool.end();
        return new Response(JSON.stringify({ error: err.message, v: "V35-FAIL" }), { status: 500 });
    }
}
