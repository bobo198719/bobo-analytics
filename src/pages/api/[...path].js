export const prerender = false;

const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

export async function ALL({ params, request }) {
    const { path } = params;
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const vpsUrl = `${hostingerUrl}/api/${path}${searchParams ? '?' + searchParams : ''}`;

    // 1. Prepare Request Data
    let requestBody = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try {
            requestBody = await request.arrayBuffer();
        } catch(e) { console.error("Body read fail:", e); }
    }

    const requestHeaders = new Headers();
    request.headers.forEach((v, k) => {
        if (k.toLowerCase() !== 'host' && k.toLowerCase() !== 'cookie') {
            requestHeaders.set(k, v);
        }
    });
    requestHeaders.set("origin", "http://srv1449576.hstgr.cloud:5000");

    const pathStr = Array.isArray(path) ? path.join('/') : path;

    // 2. 🟢 MASTER RELAY (V15): Order Compatibility Logic
    if (pathStr === 'v3-relay-order' && request.method === 'POST' && requestBody) {
        try {
            const bodyText = new TextDecoder().decode(requestBody);
            const jsonBody = JSON.parse(bodyText);
            const { table_id, items, special_notes, order_source = "QR" } = jsonBody;
            
            // Relocate notes to first item
            const processedItems = items.map((it, idx) => ({
                ...it,
                special_instructions: idx === 0 ? `${it.special_instructions || ''} [Note: ${special_notes || ''}]`.trim() : it.special_instructions
            }));

            const relayRes = await fetch(`${hostingerUrl}/api/v2/restaurant/orders`, {
                method: 'POST',
                headers: requestHeaders,
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
                    'X-Relay-Status': 'V15-Relay-Success'
                }
            });
        } catch(e) { console.error("Master Relay Exception:", e); }
    }

    // 3. Standard Proxy Logic
    try {
        const response = await fetch(vpsUrl, {
            method: request.method,
            headers: requestHeaders,
            body: requestBody
        });

        const responseData = await response.arrayBuffer();

        // Self-Healing for legacy schema
        let responseJson = null;
        try { responseJson = JSON.parse(new TextDecoder().decode(responseData)); } catch(e) {}

        if (response.status === 500 && responseJson?.error?.includes('special_notes')) {
            console.warn("Proxy Recovery: Stripping special_notes...");
            const bodyText = new TextDecoder().decode(requestBody);
            const cleanBody = JSON.parse(bodyText);
            delete cleanBody.special_notes;

            const healRes = await fetch(vpsUrl, {
                method: request.method,
                headers: requestHeaders,
                body: JSON.stringify(cleanBody)
            });

            const healData = await healRes.arrayBuffer();
            return new Response(healData, {
                status: healRes.status,
                headers: {
                    ...Object.fromEntries(healRes.headers.entries()),
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Return standard response
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
        console.error("Master Proxy Final Catch:", err);
        return new Response(JSON.stringify({ error: err.message, v: "V15-Fail" }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
