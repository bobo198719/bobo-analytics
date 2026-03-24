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

        // 3. Transform paths for proxy only if they are local filenames
        const rows = dbRows.map(p => {
            const rawImg = p.image_url || p.image_path || "";
            
            // If it's already a full cloud URL (like Vercel Blob), keep it!
            if (rawImg.startsWith('http')) {
                p.image_url = rawImg;
            } else if (rawImg && rawImg.length > 0) {
                // If it's just a filename, point to the Hostinger Proxy (via secure /api/uploads)
                const filename = rawImg.split('/').pop();
                p.image_url = `/api/uploads/${filename}`;
            }
            return p;
        });

        console.log(`[Bridge] Dispatched ${rows.length} products for ${tenantId}`);

        return new Response(JSON.stringify(rows), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error("Direct Products Bridge Fail:", err);
        return new Response(JSON.stringify({ error: "DATABASE_CONNECTION_FAILED", details: err.message }), { status: 500 });
    }
}
