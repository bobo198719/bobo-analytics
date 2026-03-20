export const prerender = false;
const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

// UNIFIED MASTER PROXY (V19) - FORCED SSR & STREAM DURABILITY
export async function ALL({ request }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const searchParams = url.searchParams.toString();
    const apiPath = pathname.replace('/api/', '').split('?')[0];
    const vpsUrl = `${hostingerUrl}/api/${apiPath}${searchParams ? '?' + searchParams : ''}`;

    // Setup headers
    const relayHeaders = new Headers();
    request.headers.forEach((v, k) => {
        if (k.toLowerCase() !== 'host' && k.toLowerCase() !== 'cookie') {
            relayHeaders.set(k, v);
        }
    });
    relayHeaders.set("origin", "http://srv1449576.hstgr.cloud:5000");

    // CRITICAL: Consuming the body ONLY once at the top level
    let requestBodyBuffer = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try { requestBodyBuffer = await request.arrayBuffer(); } catch(e) {}
    }

    // 🟢 MASTER RELAY: Order Hijack (V19 - Absolute Match)
    if ((apiPath === 'v3-relay-order' || apiPath.includes('relay-order')) && request.method === 'POST' && requestBodyBuffer) {
        try {
            const bodyJson = JSON.parse(new TextDecoder().decode(requestBodyBuffer));
            const { table_id, items, special_notes, order_source = "QR" } = bodyJson;
            
            // Relocate notes to first item
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
                headers: { ...Object.fromEntries(relayRes.headers.entries()), 'Access-Control-Allow-Origin': '*', 'X-Relay': 'V19-Success' }
            });
        } catch(e) { console.error("Relay logic error:", e); }
    }

    // 🟡 STANDARD PROXY
    try {
        const response = await fetch(vpsUrl, {
            method: request.method,
            headers: relayHeaders,
            body: requestBodyBuffer
        });

        const responseData = await response.arrayBuffer();

        // Standard response with CORS
        return new Response(responseData, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers.entries()),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message, v: "V19-Proxy-Fail" }), { 
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 🌐 EXPORT FOR VERCEL
export const GET = ALL; export const POST = ALL; export const PUT = ALL;
export const DELETE = ALL; export const PATCH = ALL; export const OPTIONS = ALL;
