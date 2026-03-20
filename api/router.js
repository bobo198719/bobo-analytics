const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

export default async function handler(req, res) {
    const { url, method, headers, query } = req;
    const pathname = new URL(url, `http://${headers.host}`).pathname;
    const apiPath = pathname.replace('/api/', '');
    
    // Setup relay headers
    const relayHeaders = { ...headers };
    delete relayHeaders.host;
    delete relayHeaders.cookie;
    relayHeaders.origin = "http://srv1449576.hstgr.cloud:5000";

    // 🟢 MASTER RELAY: Order High-Compatibility Mode
    if (pathname.includes('relay-order') && method === 'POST') {
        try {
            const { table_id, items, special_notes, order_source = "QR" } = req.body;
            
            // Relocate notes
            const processedItems = (items || []).map((it, idx) => ({
                ...it,
                special_instructions: idx === 0 ? `${it.special_instructions || ''} [Note: ${special_notes || ''}]`.trim() : it.special_instructions
            }));

            const relayRes = await fetch(`${hostingerUrl}/api/v2/restaurant/orders`, {
                method: 'POST',
                headers: { ...relayHeaders, 'Content-Type': 'application/json' },
                body: JSON.stringify({ table_id, items: processedItems, order_source, status: 'pending_waiter' })
            });

            const data = await relayRes.json();
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(relayRes.status).json(data);
        } catch(e) { console.error("Relay Fail:", e); }
    }

    // 🟡 STANDARD PROXY
    try {
        const targetUrl = `${hostingerUrl}/api/${apiPath}`;
        const proxyRes = await fetch(targetUrl, {
            method: method,
            headers: relayHeaders,
            body: method !== 'GET' ? JSON.stringify(req.body) : undefined
        });

        const data = await proxyRes.json();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        return res.status(proxyRes.status).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message, v: "ROOT-API-Fail" });
    }
}
