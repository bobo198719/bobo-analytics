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

        const response = await fetch(vpsUrl, {
            method: request.method,
            headers: headers,
            body
        });

        const data = await response.arrayBuffer();

        return new Response(data, {
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
