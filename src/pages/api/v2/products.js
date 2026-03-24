import mysql from 'mysql2/promise';

export async function GET({ url }) {
    try {
        const tenantId = url.searchParams.get('tenantId') || 'default_baker';
        
        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics',
            port: 3306,
            connectTimeout: 10000
        });

        // 1. Fetch products for this tenant
        let [dbRows] = await connection.query("SELECT * FROM bakery_products WHERE bakery_slug = ?", [tenantId]);
        
        // 2. Global Fallback if no specific tenant data
        if (dbRows.length === 0) {
            const [fallbackRows] = await connection.query("SELECT * FROM bakery_products LIMIT 50");
            dbRows = fallbackRows;
        }
        
        await connection.end();

        // 3. Transform paths for proxy
        const rows = dbRows.map(p => {
            if (p.image_url && !p.image_url.startsWith('http')) {
                const filename = p.image_url.split('/').pop();
                p.image_url = `/api/storage/bakery/images/${filename}`;
            }
            return p;
        });

        return new Response(JSON.stringify(rows), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error("Direct Products Bridge Fail:", err);
        return new Response(JSON.stringify({ error: "DATABASE_CONNECTION_FAILED", details: err.message }), { status: 500 });
    }
}
