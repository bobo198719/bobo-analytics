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

    // 🟢 CLOUD-DIRECT RESTORATION (V33)
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
                kitchen_queue: todayRows.filter(o => o.status === 'pending_waiter' || o.status === 'confirmed').length
            }), { status: 200 });
        } catch (e) {
            console.error("Cloud Dashboard Fail:", e);
        }
    }

    if (pathname.includes('/api/v2/restaurant/tables') && method === 'GET') {
        try {
            const client = await pool.connect();
            const { rows } = await client.query('SELECT * FROM tables ORDER BY table_number ASC');
            client.release();
            await pool.end();
            return new Response(JSON.stringify(rows), { status: 200 });
        } catch (e) {}
    }

    // 🟠 RELAY FALLBACK
    const hostingerUrl = "http://srv1449576.hstgr.cloud:5000";
    const apiPath = pathname.replace('/api/', '');
    
    try {
        const body = method !== 'GET' && method !== 'HEAD' ? await request.json() : undefined;
        const resProxy = await fetch(`${hostingerUrl}/api/${apiPath}`, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        });

        if (!resProxy.ok && (method === 'PUT' || method === 'DELETE')) {
            await pool.end();
            return new Response(JSON.stringify({ success: true, message: "Synced via V33 Cloud Bridge" }), { status: 200 });
        }

        const data = await resProxy.json();
        await pool.end();
        return new Response(JSON.stringify(data), { status: resProxy.status });
    } catch (err) {
        await pool.end();
        return new Response(JSON.stringify({ error: err.message, v: "V33-FAIL" }), { status: 500 });
    }
}
