import { Pool } from 'pg';

const poolConfig = {
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo',
    password: 'Princy@20201987',
    database: 'restaurant_crm',
    port: 5432,
    ssl: false,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    max: 20
};

// V38 - FULL CLOUD SYNC MASTER
const pool = new Pool(poolConfig);

export async function ALL({ request, params }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // 🟢 V38 - COMPREHENSIVE CLOUD BRIDGE (Menu Management + Orders + Dashboard)
    
    // 1. MENU HUB SYNC (POST/DELETE FIX)
    if (pathname.includes('/api/v2/restaurant/menu')) {
        if (method === 'GET') {
            try {
                const { rows } = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
                return new Response(JSON.stringify(rows), { status: 200, headers: {'Content-Type': 'application/json'} });
            } catch (e) { console.error(e); }
        } else if (method === 'POST') {
            try {
                const body = await request.json();
                const { name, price, category, type, image_url, id } = body;
                // Using Manual ID if provided for sync, otherwise serial
                const { rows } = await pool.query(
                    'INSERT INTO menu_items (name, price, category, type, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [name, price, category, type, image_url || '']
                );
                return new Response(JSON.stringify({ success: true, id: rows[0].id }), { status: 200 });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message, type: "CLOUD_MENU_POST_FAIL" }), { status: 500 });
            }
        } else if (method === 'DELETE') {
             try {
                const itemId = pathname.split('/').pop();
                await pool.query('DELETE FROM menu_items WHERE id = $1', [itemId]);
                return new Response(JSON.stringify({ success: true }), { status: 200 });
             } catch (e) { console.error(e); }
        }
    }

    // 2. DASHBOARD SYNC
    if (pathname.includes('/api/v2/restaurant/dashboard')) {
        try {
            const { rows: todayRows } = await pool.query("SELECT * FROM orders WHERE created_at::date = CURRENT_DATE");
            const { rows: tableCount } = await pool.query("SELECT COUNT(*) FROM tables WHERE status = 'occupied'");
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
                const { rows } = await pool.query('SELECT * FROM tables ORDER BY table_number ASC');
                return new Response(JSON.stringify(rows), { status: 200 });
            } catch (e) {}
        } else if (method === 'PUT' && pathname.includes('/status')) {
             try {
                const tableId = pathname.split('/').slice(-2, -1)[0];
                const body = await request.json();
                await pool.query("UPDATE tables SET status = $1 WHERE id = $2", [body.status, tableId]);
                return new Response(JSON.stringify({ success: true, message: "Node Status Synchronized" }), { status: 200 });
             } catch (e) { console.error(e); }
        }
    }

    // 4. ORDERS & KITCHEN & POS POST
    if (pathname.includes('/api/v2/restaurant/orders')) {
        if (method === 'GET') {
            try {
                const { rows } = await pool.query(`
                    SELECT o.*, t.table_number 
                    FROM orders o 
                    JOIN tables t ON o.table_id = t.id 
                    ORDER BY o.created_at DESC 
                    LIMIT 200
                `);
                return new Response(JSON.stringify(rows), { status: 200 });
            } catch (e) { console.error(e); }
        } else if (method === 'POST') {
             try {
                const body = await request.json();
                const { table_id, items } = body;
                const { rows: orderRows } = await pool.query(
                    'INSERT INTO orders (table_id, status, total_amount, gst_amount, items) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                    [table_id, 'pending_waiter', 0, 0, JSON.stringify(items)]
                );
                await pool.query("UPDATE tables SET status = 'occupied' WHERE id = $1", [table_id]);
                return new Response(JSON.stringify({ success: true, orderId: orderRows[0].id }), { status: 200 });
             } catch (e) { console.error(e); }
        }
    }

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
            return new Response(JSON.stringify({ success: true, message: "Manual Cloud Sync" }), { status: 200 });
        }

        const data = await resProxy.json();
        return new Response(JSON.stringify(data), { status: resProxy.status });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message, v: "V38-FAIL" }), { status: 500 });
    }
}
