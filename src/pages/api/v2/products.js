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

        // 1. Fetch products for this tenant (or untagged legacy products)
        // Aggressive inclusion for default_baker to ensure no products are missed during the transition
        let [dbRows] = await connection.query(
            "SELECT * FROM bakery_products WHERE bakery_slug = ? OR bakery_slug IS NULL OR bakery_slug = ''", 
            [tenantId]
        );
        
        // 2. Global Fallback if absolutely no products found
        if (dbRows.length === 0) {
            const [fallbackRows] = await connection.query("SELECT * FROM bakery_products ORDER BY id DESC LIMIT 50");
            dbRows = fallbackRows;
        }
        
        await connection.end();

        // 3. Transform paths for proxy only if they are local filenames or broken internal URLs
        const rows = dbRows.map(p => {
            const rawImg = p.image_url || p.image_path || "";
            
            // Pattern 1: Vercel Cloud Storage (KEEP)
            if (rawImg.includes('blob.vercel-storage.com')) {
                p.image_url = rawImg;
            } 
            // Pattern 2: Broken Internal Hostinger URLs (FIX: Route through Proxy)
            else if (rawImg.includes('srv1449576.hstgr.cloud')) {
                const filename = rawImg.split('/').pop();
                p.image_url = `/api/uploads/${filename}`;
            }
            // Pattern 3: Local relative paths or filenames (FIX: Route through Proxy)
            else if (rawImg && rawImg.length > 0) {
                const filename = rawImg.split('/').pop();
                p.image_url = `/api/uploads/${filename}`;
            }
            return p;
        });

        console.log(`[Bridge] Dispatched ${rows.length} products for ${tenantId}. Sample: ${rows[0]?.image_url}`);

        return new Response(JSON.stringify(rows), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error("Direct Products Bridge Fail:", err);
        return new Response(JSON.stringify({ error: "DATABASE_CONNECTION_FAILED", details: err.message }), { status: 500 });
    }
}
