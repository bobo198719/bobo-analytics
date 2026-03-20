export const prerender = false;
const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

export async function POST({ request }) {
    try {
        const requestBody = await request.arrayBuffer();
        
        // Build headers manually
        const relayHeaders = new Headers();
        request.headers.forEach((v, k) => {
            if (k.toLowerCase() !== 'host' && k.toLowerCase() !== 'cookie') {
                relayHeaders.set(k, v);
            }
        });
        relayHeaders.set("origin", "http://srv1449576.hstgr.cloud:5000");

        const bodyText = new TextDecoder().decode(requestBody);
        const jsonBody = JSON.parse(bodyText);
        const { table_id, items, special_notes, order_source = "QR" } = jsonBody;
        
        // 🛠️ RELOCATION ENGINE (V17): Fixes the DB schema on the fly
        const processedItems = items.map((it, idx) => ({
            ...it,
            special_instructions: idx === 0 ? `${it.special_instructions || ''} [Note: ${special_notes || ''}]`.trim() : it.special_instructions
        }));

        console.log("Static Relay: Processing guaranteed order...");

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
                'X-Relay-Success': 'V17-Static'
            }
        });
    } catch(e) {
        console.error("Static Relay Critical Fail:", e);
        return new Response(JSON.stringify({ error: e.message, v: "V17-Static-Fail" }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
