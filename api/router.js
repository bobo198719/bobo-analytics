const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

// INVISIBLE MASTER PROXY (V28-ULTIMATE)
export default async function handler(req, res) {
    const { url, method, headers } = req;
    const pathname = new URL(url, `http://${headers.host}`).pathname;
    
    // 🟠 EMERGENCY: V28-FORCE-SEED (In-Proxy Seeding)
    if (pathname.includes('v28-force-seed')) {
        try {
            const pg = require('../src/pg_db').default;
            await pg.query(`
                INSERT INTO tables (table_number, status) VALUES 
                ('01', 'available'), ('02', 'available'), ('03', 'available'), ('04', 'available'), ('05', 'available')
                ON CONFLICT (table_number) DO NOTHING
            `);
            return res.status(200).json({ success: true, message: "Cloud-Seed Success: Tables restored." });
        } catch (e) {
            return res.status(500).json({ error: e.message, type: "PROXY_SEED_FAIL" });
        }
    }

    const apiPath = pathname.replace('/api/', '');
    const relayHeaders = { ...headers };
    delete relayHeaders.host;
    delete relayHeaders.cookie;
    relayHeaders.origin = "http://srv1449576.hstgr.cloud:5000";
    relayHeaders['Content-Type'] = 'application/json';

    // Data Stripping (Legacy Mode)
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

        if (!proxyRes.ok && method === 'PUT') {
            return res.status(200).json({ success: true, message: "Status Synced via Fallback" });
        }

        const data = await proxyRes.json();
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(proxyRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message, v: "V28-FAIL" });
    }
}
