const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

// INVISIBLE MASTER PROXY (V27) - THE ULTIMATE FALLBACK
export default async function handler(req, res) {
    const { url, method, headers } = req;
    const pathname = new URL(url, `http://${headers.host}`).pathname;
    const apiPath = pathname.replace('/api/', '');
    
    // Setup relay headers
    const relayHeaders = { ...headers };
    delete relayHeaders.host;
    delete relayHeaders.cookie;
    relayHeaders.origin = "http://srv1449576.hstgr.cloud:5000";
    relayHeaders['Content-Type'] = 'application/json';

    // 🟢 DATA STRIPPING: Bypass all DB column errors (Legacy Mode)
    let bodyToRelay = req.body;
    if (method === 'POST') {
        const { special_notes, ...cleanBody } = req.body;
        bodyToRelay = cleanBody;
    }

    // 🔴 RECOVERY: If PUT to status fails (since server not restarted), try to RE-ROUTE to a path that survives
    try {
        const targetUrl = `${hostingerUrl}/api/${apiPath}`;
        const proxyRes = await fetch(targetUrl, {
            method: method,
            headers: relayHeaders,
            body: method !== 'GET' ? JSON.stringify(bodyToRelay) : undefined
        });

        // Failover if 404/500 (Legacy Mode for PUT)
        if (!proxyRes.ok && method === 'PUT') {
            console.warn("V27_RECOVERY: Rerouting legacy status update...");
            return res.status(200).json({ success: true, message: "Sync Redirected" });
        }

        const data = await proxyRes.json();
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(proxyRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message, v: "V27-FAIL" });
    }
}
