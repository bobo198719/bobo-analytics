export async function GET({ params }) {
    const { id } = params;
    try {
        const url = 'http://187.124.97.144:5000/api/v2/restaurant/orders';
        const liveRes = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (liveRes.ok) {
            const orders = await liveRes.json();
            const order = orders.find(o => String(o.id) === String(id));
            if (order) {
                return new Response(JSON.stringify(order), { status: 200, headers: {'Content-Type': 'application/json'} });
            }
        }
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: {'Content-Type': 'application/json'} });
    } catch(e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }
}

export async function PATCH({ params, request }) {
    const { id } = params;
    try {
        const body = await request.json();
        const { status } = body;
        
        // Proxy PATCH to the native PUT /orders/:id/status endpoint
        const targetUrl = `http://187.124.97.144:5000/api/v2/restaurant/orders/${id}/status`;
        const liveRes = await fetch(targetUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
            signal: AbortSignal.timeout(5000)
        });
        
        if (liveRes.ok) {
            const data = await liveRes.json();
            return new Response(JSON.stringify(data), { status: 200, headers: {'Content-Type': 'application/json'} });
        }
        
        return new Response(JSON.stringify({ error: "Failed to update status" }), { status: res.status, headers: {'Content-Type': 'application/json'} });
    } catch(e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }
}
