const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

// INVISIBLE CLOUD COMPATIBILITY ENGINE (V25)
// This file FIXES the data before it hits the un-restarted Hostinger server
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

    // 🟢 DATA HIJACK: Clean order payload for old/unrestarted Hostinger servers
    let finalBody = req.body;
    if (method === 'POST' && (pathname.includes('order') || pathname.includes('relay'))) {
        try {
            console.log("V25_CLOUDFIX: Cleaning payload for legacy server...");
            const { special_notes, ...cleanBody } = req.body;
            
            // Relocate notes to first item so they aren't lost
            if (special_notes && cleanBody.items && cleanBody.items.length > 0) {
                cleanBody.items[0].special_instructions = `${cleanBody.items[0].special_instructions || ''} [Note: ${special_notes}]`.trim();
            }
            finalBody = cleanBody;
        } catch(e) { console.error("CloudFix Error:", e); }
    }

    // 🟡 PROXY TO HOSTINGER
    try {
        const targetUrl = `${hostingerUrl}/api/${apiPath}`;
        const proxyRes = await fetch(targetUrl, {
            method: method,
            headers: relayHeaders,
            body: method !== 'GET' ? JSON.stringify(finalBody) : undefined
        });

        const data = await proxyRes.json();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        return res.status(proxyRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message, v: "V25-FAIL" });
    }
}
