import mysql from 'mysql2/promise';

const getConn = async () => mysql.createConnection({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectTimeout: 4000
});

export async function PUT({ params, request }) {
    const { id } = params;
    try {
        const { status } = await request.json();
        const db = await getConn();
        await db.query("UPDATE restaurant_tables SET status = ? WHERE id = ?", [status, id]);
        await db.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
