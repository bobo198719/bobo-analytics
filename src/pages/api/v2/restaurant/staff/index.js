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
            CREATE TABLE IF NOT EXISTS restaurant_staff (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                role ENUM('manager', 'chef', 'waiter') NOT NULL,
                permission ENUM('entire', 'limited') DEFAULT 'limited',
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        const [staff] = await db.query("SELECT * FROM restaurant_staff ORDER BY created_at DESC");
        await db.end();
        return new Response(JSON.stringify(staff), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const { username, password, role, permission } = await request.json();
        const db = await getConn();
        await db.query(
            "INSERT INTO restaurant_staff (username, password, role, permission) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, role = ?, permission = ?",
            [username, password, role, permission || 'limited', password, role, permission || 'limited']
        );
        await db.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
