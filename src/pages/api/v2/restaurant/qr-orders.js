import mysql from 'mysql2/promise';

const getConn = async () => mysql.createConnection({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectTimeout: 8000
});

export async function GET({ request }) {
    try {
        const url = new URL(request.url);
        const orderId = url.searchParams.get('order_id');
        const activeOnly = url.searchParams.get('active_only');
        const db = await getConn();

        // Self-heal table
        await db.query(`
            CREATE TABLE IF NOT EXISTS restaurant_qr_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE,
                table_id VARCHAR(20),
                items LONGTEXT,
                total_amount INT,
                status VARCHAR(50) DEFAULT 'placed', /* placed, waiter_confirmed, kitchen_preparing, kitchen_ready, served, paid */
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        if (orderId) {
            const [rows] = await db.query("SELECT * FROM restaurant_qr_orders WHERE order_id = ?", [orderId]);
            await db.end();
            return new Response(JSON.stringify({ order: rows[0] || null }), { status: 200 });
        } else if (activeOnly) {
            // Get all live orders for Waiter / Kitchen Dashboards
            const [rows] = await db.query("SELECT * FROM restaurant_qr_orders WHERE status != 'paid' ORDER BY created_at DESC");
            await db.end();
            return new Response(JSON.stringify({ orders: rows }), { status: 200 });
        }

        await db.end();
        return new Response(JSON.stringify({ error: "Missing Parameters" }), { status: 400 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { table, items, total } = body;
        
        const orderId = "QR-" + Math.floor(Math.random() * 1000000);
        const itemsJson = JSON.stringify(items);

        const db = await getConn();
        await db.query(
            "INSERT INTO restaurant_qr_orders (order_id, table_id, items, total_amount) VALUES (?, ?, ?, ?)",
            [orderId, table, itemsJson, total]
        );
        await db.end();

        return new Response(JSON.stringify({ success: true, order_id: orderId }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function PATCH({ request }) {
    try {
        const body = await request.json();
        const { order_id, status } = body;

        const db = await getConn();
        await db.query("UPDATE restaurant_qr_orders SET status = ? WHERE order_id = ?", [status, order_id]);
        await db.end();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
