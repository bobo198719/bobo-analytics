export const prerender = false;
const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

async function proxyHandler({ params, request }) {
    const { path } = params;
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const vpsUrl = `${hostingerUrl}/api/${path}${searchParams ? '?' + searchParams : ''}`;

    // Read body safely
    let requestBody = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try { requestBody = await request.arrayBuffer(); } catch(e) {}
    }

    // Build headers manually to avoid ReferenceError
    const relayHeaders = new Headers();
    request.headers.forEach((v, k) => {
        if (k.toLowerCase() !== 'host' && k.toLowerCase() !== 'cookie') {
            relayHeaders.set(k, v);
        }
    });
    relayHeaders.set("origin", "http://srv1449576.hstgr.cloud:5000");

    const pathStr = Array.isArray(path) ? path.join('/') : path;

    // 🟢 MASTER RELAY (V16): Special Order Bypass
    if (pathStr === 'v3-relay-order' && request.method === 'POST' && requestBody) {
        try {
            const bodyText = new TextDecoder().decode(requestBody);
            const jsonBody = JSON.parse(bodyText);
            const { table_id, items, special_notes, order_source = "QR" } = jsonBody;
            
            // Relocate notes
            const processedItems = items.map((it, idx) => ({
                ...it,
                special_instructions: idx === 0 ? `${it.special_instructions || ''} [Note: ${special_notes || ''}]`.trim() : it.special_instructions
            }));

            const relayRes = await fetch(`${hostingerUrl}/api/v2/restaurant/orders`, {
                method: 'POST',
                headers: relayHeaders,
                body: JSON.stringify({ table_id, items: processedItems, order_source, status: 'pending_waiter' })
            });

            const relayData = await relayRes.arrayBuffer();
            return new Response(relayData, {
                status: relayRes.status,
                headers: { ...Object.fromEntries(relayRes.headers.entries()), 'Access-Control-Allow-Origin': '*' }
            });
        } catch(e) { console.error("Relay Fail:", e); }
    }

    // 🟡 PROXY FETCH
    try {
        const response = await fetch(vpsUrl, {
            method: request.method,
            headers: relayHeaders,
            body: requestBody
        });

        const responseData = await response.arrayBuffer();
        return new Response(responseData, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers.entries()),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message, v: "V16-Fail" }), { 
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 🌐 EXPORT METHODS INDIVIDUALLY TO FIX VERCEL 500
export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
export const PATCH = proxyHandler;
export const OPTIONS = proxyHandler;
