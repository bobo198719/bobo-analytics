import mysql from 'mysql2/promise';

const getConn = async () => mysql.createConnection({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    connectTimeout: 8000
});

export async function DELETE({ params }) {
    const { id } = params;
    try {
        const db = await getConn();
        await db.query("DELETE FROM restaurant_tables WHERE id = ?", [id]);
        await db.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
