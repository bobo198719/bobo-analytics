import mysql from 'mysql2/promise';

const getConn = async () => mysql.createConnection({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectTimeout: 5000
});

export async function PUT({ params, request }) {
    const { id } = params;
    try {
        const { status } = await request.json();
        const db = await getConn();
        
        // 1. Fetch table mapping to handle QR order cleanup
        const [rows] = await db.query("SELECT table_number FROM restaurant_tables WHERE id = ?", [id]);
        const tableNum = rows[0]?.table_number;

        // 2. Update core table status
        await db.query("UPDATE restaurant_tables SET status = ? WHERE id = ?", [status, id]);

        // 3. If clearing table, also clear associated QR orders (Emergency Sync V74)
        if (status === 'available' && tableNum) {
            await db.query("UPDATE restaurant_qr_orders SET status = 'paid' WHERE table_id = ? AND status != 'rejected'", [tableNum]);
        }

        await db.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
