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
        const [rows] = await connection.query("SELECT * FROM products WHERE tenant_id = ? AND status = 'approved'", [tenantId]);
        await connection.end();

        return new Response(JSON.stringify(rows), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error("Direct Products Bridge Fail:", err);
        return new Response(JSON.stringify({ error: "DATABASE_CONNECTION_FAILED", details: err.message }), { status: 500 });
    }
}
