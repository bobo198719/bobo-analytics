import mysql from 'mysql2/promise';

const getConn = async () => mysql.createConnection({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectTimeout: 800 // ⚡ FAILING FAST: 800ms timeout block instead of 8 seconds
});

export async function GET({ request }) {
    try {
        const db = await getConn();

        // Self-heal Tables list
        await db.query(`
            CREATE TABLE IF NOT EXISTS restaurant_tables (
                id INT AUTO_INCREMENT PRIMARY KEY,
                table_number VARCHAR(20) UNIQUE,
                status VARCHAR(50) DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Fetch Tables
        const [tables] = await db.query("SELECT * FROM restaurant_tables ORDER BY table_number ASC");

        // Fetch Active QR Orders to determine real-time status overlay
        const [qrOrders] = await db.query("SELECT table_id, status FROM restaurant_qr_orders WHERE status != 'paid' AND status != 'rejected'");

        // Map status overlay
        const mappedTables = tables.map(t => {
            const activeOrder = qrOrders.find(o => o.table_id === t.table_number);
            let finalStatus = t.status;
            
            if (activeOrder) {
                if (activeOrder.status === 'placed') finalStatus = 'ordered';
                else if (['waiter_confirmed', 'kitchen_preparing', 'kitchen_ready', 'served'].includes(activeOrder.status)) finalStatus = 'occupied';
            }
            
            return { ...t, status: finalStatus };
        });

        await db.end();
        return new Response(JSON.stringify(mappedTables), { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const { table_number } = await request.json();
        const db = await getConn();
        await db.query("INSERT IGNORE INTO restaurant_tables (table_number, status) VALUES (?, 'available')", [table_number]);
        await db.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function DELETE({ url }) {
    try {
        const id = url.pathname.split('/').pop();
        const db = await getConn();
        await db.query("DELETE FROM restaurant_tables WHERE id = ?", [id]);
        await db.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
