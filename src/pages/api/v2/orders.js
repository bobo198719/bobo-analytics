import mysql from 'mysql2/promise';

export async function GET({ url }) {
    try {
        const tenantId = url.searchParams.get('tenantId') || 'default_baker';
        
        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics',
            connectTimeout: 10000
        });

        // Ensure table exists (Self-healing)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bakery_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(255),
                phone VARCHAR(20),
                address TEXT,
                items LONGTEXT,
                amount INT,
                status VARCHAR(50) DEFAULT 'pending',
                type VARCHAR(20) DEFAULT 'Delivery',
                delivery_time TIME,
                bakery_slug VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [rows] = await connection.query(
            "SELECT * FROM bakery_orders WHERE bakery_slug = ? OR bakery_slug IS NULL ORDER BY created_at DESC", 
            [tenantId]
        );
        
        await connection.end();
        return new Response(JSON.stringify(rows), { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function PATCH({ request }) {
    try {
        const body = await request.json();
        const { id, status } = body;

        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics'
        });

        await connection.query("UPDATE bakery_orders SET status = ? WHERE id = ?", [status, id]);
        await connection.end();

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
