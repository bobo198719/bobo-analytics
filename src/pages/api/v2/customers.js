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

        // Ensure table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bakery_customers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                email VARCHAR(255) DEFAULT NULL,
                bakery_slug VARCHAR(100) DEFAULT 'default_baker',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [rows] = await connection.query(
            "SELECT * FROM bakery_customers WHERE bakery_slug = ? OR bakery_slug IS NULL ORDER BY created_at DESC", 
            [tenantId]
        );
        
        await connection.end();
        return new Response(JSON.stringify(rows), { status: 200 });

    } catch (err) {
        console.error("[Customers Bridge Error]:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { name, phone, email, bakery_slug } = body;
        
        const finalSlug = bakery_slug || 'default_baker';

        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics'
        });

        await connection.query(
            "INSERT INTO bakery_customers (name, phone, email, bakery_slug) VALUES (?, ?, ?, ?)",
            [name, phone, email || '', finalSlug]
        );

        await connection.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (err) {
        console.error("[Customer Save Error]:", err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
