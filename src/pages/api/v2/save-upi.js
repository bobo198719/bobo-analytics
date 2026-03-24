import mysql from 'mysql2/promise';

export async function POST({ request }) {
    try {
        const { upi, tenantId = "default_baker" } = await request.json();
        
        if (!upi) return new Response(JSON.stringify({ error: "UPI required" }), { status: 400 });

        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics',
            port: 3306,
            connectTimeout: 10000
        });

        // 1. Get current settings
        const [rows] = await connection.query("SELECT settings FROM site_settings WHERE tenant_id = ?", [tenantId]);
        let settings = rows.length > 0 && rows[0].settings ? rows[0].settings : {};
        
        if (typeof settings === 'string') {
            try { settings = JSON.parse(settings); } catch(e) { settings = {}; }
        }
        
        // 2. Update UPI
        settings.upi = upi;

        // 3. Upsert
        await connection.query(
            "INSERT INTO site_settings (tenant_id, settings) VALUES (?, ?) ON DUPLICATE KEY UPDATE settings = ?",
            [tenantId, JSON.stringify(settings), JSON.stringify(settings)]
        );

        await connection.end();

        return new Response(JSON.stringify({ success: true, message: "UPI updated via Direct Vercel Bridge" }), { status: 200 });

    } catch (err) {
        console.error("Vercel DB Error:", err);
        return new Response(JSON.stringify({ error: "DATABASE_CONNECTION_FAILED", details: err.message }), { status: 500 });
    }
}

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

        const [rows] = await connection.query("SELECT settings FROM site_settings WHERE tenant_id = ?", [tenantId]);
        await connection.end();

        if (rows.length > 0) {
            let data = rows[0].settings;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch(e) {}
            }
            return new Response(JSON.stringify(data), { status: 200 });
        } else {
            return new Response(JSON.stringify({}), { status: 200 });
        }

    } catch (err) {
        return new Response(JSON.stringify({ error: "DATABASE_FETCH_FAILED", details: err.message }), { status: 500 });
    }
}
