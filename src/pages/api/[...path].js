export const prerender = false;

const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

export async function ALL({ params, request }) {
    const { path } = params;
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const vpsUrl = `${hostingerUrl}/api/${path}${searchParams ? '?' + searchParams : ''}`;

    try {
        const body = request.method !== 'GET' && request.method !== 'HEAD' 
            ? await request.arrayBuffer() 
            : undefined;

        const headers = new Headers(request.headers);
        headers.delete("host");
        headers.delete("cookie"); // Keep cookies local
        headers.set("origin", "http://srv1449576.hstgr.cloud:5000");

        let response = await fetch(vpsUrl, {
            method: request.method,
            headers: headers,
            body
        });

        let responseData = await response.arrayBuffer();
        let responseJson = null;
        try { responseJson = JSON.parse(new TextDecoder().decode(responseData)); } catch(e) {}

        // 🟢 HEALING LAYER: If backend fails due to missing column, strip and retry
        if (response.status === 500 && responseJson && responseJson.error && responseJson.error.includes('special_notes')) {
            console.warn("Proxy: Healing legacy schema failure...");
            try {
                const originalBody = JSON.parse(new TextDecoder().decode(body));
                delete originalBody.special_notes; // Strip the problematic field
                
                const healResponse = await fetch(vpsUrl, {
                    method: request.method,
                    headers: headers,
                    body: JSON.stringify(originalBody)
                });
                
                const healData = await healResponse.arrayBuffer();
                return new Response(healData, {
                    status: healResponse.status,
                    headers: {
                        ...Object.fromEntries(healResponse.headers.entries()),
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            } catch(e) { console.error("Healing failed:", e); }
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
    } catch (error) {
        console.error("PROXY_CRITICAL_FAILURE:", error);
        return new Response(JSON.stringify({ 
            error: error.message, 
            url: vpsUrl,
            stack: error.stack 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
