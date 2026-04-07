import mysql from 'mysql2/promise';

const getConn = async () => mysql.createConnection({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics'
});

export async function GET() {
    try {
        const db = await getConn();
        await db.query(`
            CREATE TABLE IF NOT EXISTS restaurant_staff_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50),
                event_type ENUM('login', 'logout', 'break_start', 'break_end'),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        const [logs] = await db.query("SELECT * FROM restaurant_staff_logs ORDER BY timestamp DESC LIMIT 50");
        await db.end();
        return new Response(JSON.stringify(logs), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const { username, event_type } = await request.json();
        const db = await getConn();
        await db.query("INSERT INTO restaurant_staff_logs (username, event_type) VALUES (?, ?)", [username, event_type]);
        await db.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
