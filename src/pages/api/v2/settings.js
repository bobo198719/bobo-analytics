import mysql from 'mysql2/promise';

export async function GET({ url }) {
    try {
        const slug = url.searchParams.get('slug') || 'default_baker';
        
        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics',
            connectTimeout: 10000
        });

        // Ensure table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bakery_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                bizName VARCHAR(255),
                phone VARCHAR(50),
                address TEXT,
                upi_id VARCHAR(100),
                bizLogo TEXT,
                brandColor VARCHAR(20),
                heroTitle VARCHAR(255),
                heroSubtitle TEXT,
                heroBg TEXT,
                bakery_slug VARCHAR(100) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [rows] = await connection.query("SELECT * FROM bakery_settings WHERE bakery_slug = ?", [slug]);
        await connection.end();

        if (rows.length === 0) {
            return new Response(JSON.stringify({ bizName: "Baker OS", phone: "", address: "" }), { status: 200 });
        }
        
        return new Response(JSON.stringify(rows[0]), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { bizName, phone, address, upi_id, bakery_slug } = body;
        
        const finalSlug = bakery_slug || 'default_baker';

        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics'
        });

        const [existing] = await connection.query("SELECT id FROM bakery_settings WHERE bakery_slug = ?", [finalSlug]);

        if (existing.length > 0) {
            await connection.query(
                "UPDATE bakery_settings SET bizName=?, phone=?, address=?, upi_id=? WHERE bakery_slug=?",
                [bizName, phone, address, upi_id, finalSlug]
            );
        } else {
            await connection.query(
                "INSERT INTO bakery_settings (bizName, phone, address, upi_id, bakery_slug) VALUES (?, ?, ?, ?, ?)",
                [bizName, phone, address, upi_id, finalSlug]
            );
        }

        await connection.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
