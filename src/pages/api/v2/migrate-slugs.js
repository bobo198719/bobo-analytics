import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics',
            connectTimeout: 20000
        });

        console.log("🛠️ Starting Global Migration: Tagging all untagged products as 'default_baker'...");
        
        const [result] = await connection.query(
            "UPDATE bakery_products SET bakery_slug = 'default_baker' WHERE bakery_slug IS NULL"
        );
        
        await connection.end();
        
        return new Response(JSON.stringify({ 
            success: true, 
            message: `Migration complete. Tagged ${result.affectedRows} products as 'default_baker'.` 
        }), { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}
