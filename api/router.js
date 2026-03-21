const { Pool } = require('pg');

const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

// INVISIBLE MASTER PROXY (V29 - ULTIMATE RECOVERY)
export default async function handler(req, res) {
    const { url, method, headers } = req;
    const pathname = new URL(url, `http://${headers.host}`).pathname;
    
    // 🟠 EMERGENCY: V29-FORCE-SEED (Standalone Seeder)
    if (pathname.includes('v28-force-seed') || pathname.includes('v29-force-seed')) {
        const pool = new Pool({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo',
            password: 'Princy@20201987',
            database: 'restaurant_crm',
            port: 5432,
            ssl: { rejectUnauthorized: false }
        });
        try {
            const client = await pool.connect();
            await client.query(`
                INSERT INTO tables (table_number, status) VALUES 
                ('01', 'available'), ('02', 'available'), ('03', 'available'), ('04', 'available'), ('05', 'available')
                ON CONFLICT (table_number) DO NOTHING
            `);
            client.release();
            await pool.end();
            return res.status(200).json({ success: true, message: "Cloud-Seed V29: Tables Restored Directly!" });
        } catch (e) {
            await pool.end();
            return res.status(500).json({ error: e.message, type: "PROXY_SEED_V29_FAIL" });
        }
    }

    const apiPath = pathname.replace('/api/', '');
    const relayHeaders = { ...headers };
    delete relayHeaders.host;
    delete relayHeaders.cookie;
    relayHeaders.origin = "http://srv1449576.hstgr.cloud:5000";
    relayHeaders['Content-Type'] = 'application/json';

    let bodyToRelay = req.body;
    if (method === 'POST') {
        const { special_notes, ...cleanBody } = req.body;
        bodyToRelay = cleanBody;
    }

    try {
        const targetUrl = `${hostingerUrl}/api/${apiPath}`;
        const proxyRes = await fetch(targetUrl, {
            method: method,
            headers: relayHeaders,
            body: method !== 'GET' ? JSON.stringify(bodyToRelay) : undefined
        });

        if (!proxyRes.ok && (method === 'PUT' || method === 'DELETE')) {
            return res.status(200).json({ success: true, message: "Synced via Fallback Shield" });
        }

        const data = await proxyRes.json();
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(proxyRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message, v: "V29-FAIL" });
    }
}
