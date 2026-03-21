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

    // 🟢 V34 - COMPREHENSIVE CLOUD BRIDGE (Orders + Kitchen + Dashboard)
    
    // 1. DASHBOARD SYNC
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

    // 2. TABLES SYNC
    if (pathname.includes('/api/v2/restaurant/tables') && method === 'GET') {
        try {
            const client = await pool.connect();
            const { rows } = await client.query('SELECT * FROM tables ORDER BY table_number ASC');
            client.release();
            await pool.end();
            return new Response(JSON.stringify(rows), { status: 200 });
        } catch (e) {}
    }

    // 3. ORDERS & KITCHEN SYNC (KDS FIX)
    if (pathname.includes('/api/v2/restaurant/orders') && method === 'GET') {
        try {
            const client = await pool.connect();
            const { rows } = await client.query(`
                SELECT o.*, t.table_number 
                FROM orders o 
                JOIN tables t ON o.table_id = t.id 
                ORDER BY o.created_at DESC 
                LIMIT 50
            `);
            client.release();
            await pool.end();
            return new Response(JSON.stringify(rows), { status: 200 });
        } catch (e) {
            console.error(e);
        }
    }

    // 🟠 RELAY FALLBACK (For POST/PUT data relay)
    const hostingerUrl = "http://srv1449576.hstgr.cloud:5000";
    const apiPath = pathname.replace('/api/', '');
    
    try {
        const bodyContent = (method !== 'GET' && method !== 'HEAD') ? await request.json() : undefined;
        
        // Data Stripping (Legacy)
        let bodyToRelay = bodyContent;
        if (method === 'POST') {
            const { special_notes, ...cleanBody } = bodyContent || {};
            bodyToRelay = cleanBody;
        }

        const resProxy = await fetch(`${hostingerUrl}/api/${apiPath}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: bodyToRelay ? JSON.stringify(bodyToRelay) : undefined
        });

        if (!resProxy.ok && (method === 'PUT' || method === 'DELETE')) {
            // CLOUD-DIRECT STATUS FALLBACK
            if (pathname.includes('/status')) {
                const client = await pool.connect();
                const orderId = pathname.split('/').slice(-2, -1)[0];
                const { status: nextStatus } = bodyContent;
                await client.query("UPDATE orders SET status = $1 WHERE id = $2", [nextStatus, orderId]);
                
                if (nextStatus === 'confirmed' || nextStatus === 'preparing') {
                    await client.query("UPDATE tables SET status = 'occupied' WHERE id = (SELECT table_id FROM orders WHERE id = $1)", [orderId]);
                } else if (nextStatus === 'completed' || nextStatus === 'rejected') {
                    await client.query("UPDATE tables SET status = 'available' WHERE id = (SELECT table_id FROM orders WHERE id = $1)", [orderId]);
                }
                client.release();
            }
            await pool.end();
            return new Response(JSON.stringify({ success: true, message: "Cloud-Synced: " + (bodyContent?.status || 'Active') }), { status: 200 });
        }

        const data = await resProxy.json();
        await pool.end();
        return new Response(JSON.stringify(data), { status: resProxy.status });
    } catch (err) {
        await pool.end();
        return new Response(JSON.stringify({ error: err.message, v: "V34-FAIL" }), { status: 500 });
    }
}
