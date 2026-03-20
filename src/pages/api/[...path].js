export const prerender = false;
const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

// UNIFIED MASTER PROXY (V18) - FORCED SSR
export async function ALL({ request }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const searchParams = url.searchParams.toString();
    
    // 1. Path Calculation (Robust)
    const apiPath = pathname.replace('/api/', '');
    const vpsUrl = `${hostingerUrl}/api/${apiPath}${searchParams ? '?' + searchParams : ''}`;

    // 2. Setup Headers
    const relayHeaders = new Headers();
    request.headers.forEach((v, k) => {
        if (k.toLowerCase() !== 'host' && k.toLowerCase() !== 'cookie') {
            relayHeaders.set(k, v);
        }
    });
    relayHeaders.set("origin", "http://srv1449576.hstgr.cloud:5000");

    // 3. 🟢 MASTER RELAY: Order Hijack
    if (apiPath === 'v3-relay-order' && request.method === 'POST') {
        try {
            const body = await request.json();
            const { table_id, items, special_notes, order_source = "QR" } = body;
            
            // Relocate notes to first item for 100% schema compatibility
            const processedItems = (items || []).map((it, idx) => ({
                ...it,
                special_instructions: idx === 0 ? `${it.special_instructions || ''} [Note: ${special_notes || ''}]`.trim() : it.special_instructions
            }));

            console.log("Master Relay V18: Processing high-compatibility order...");
            
            const relayRes = await fetch(`${hostingerUrl}/api/v2/restaurant/orders`, {
                method: 'POST',
                headers: relayHeaders,
                body: JSON.stringify({
                    table_id,
                    items: processedItems,
                    order_source,
                    status: 'pending_waiter'
                })
            });

            const relayData = await relayRes.arrayBuffer();
            return new Response(relayData, {
                status: relayRes.status,
                headers: {
                    ...Object.fromEntries(relayRes.headers.entries()),
                    'Access-Control-Allow-Origin': '*',
                    'X-Master-Relay': 'V18-Active'
                }
            });
        } catch(e) { console.error("Relay Fail:", e); }
    }

    // 4. 🟡 STANDARD PROXY
    try {
        const body = request.method !== 'GET' && request.method !== 'HEAD' 
            ? await request.arrayBuffer() 
            : undefined;

        const response = await fetch(vpsUrl, {
            method: request.method,
            headers: relayHeaders,
            body
        });

        const responseData = await response.arrayBuffer();

        // Self-Healing
        let responseJson = null;
        try { responseJson = JSON.parse(new TextDecoder().decode(responseData)); } catch(e) {}

        if (response.status === 500 && responseJson?.error?.includes('special_notes')) {
            const originalBody = JSON.parse(new TextDecoder().decode(body));
            delete originalBody.special_notes;
            const healRes = await fetch(vpsUrl, {
                method: request.method,
                headers: relayHeaders,
                body: JSON.stringify(originalBody)
            });
            const healData = await healRes.arrayBuffer();
            return new Response(healData, {
                status: healRes.status,
                headers: { ...Object.fromEntries(healRes.headers.entries()), 'Access-Control-Allow-Origin': '*' }
            });
        }

        return new Response(responseData, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers.entries()),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message, v: "V18-Fail" }), { 
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

// 🌐 EXPORT FOR VERCEL
export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const DELETE = ALL;
export const PATCH = ALL;
export const OPTIONS = ALL;
