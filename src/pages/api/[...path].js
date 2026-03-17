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

        const response = await fetch(vpsUrl, {
            method: request.method,
            headers: request.headers,
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
    } catch (e) {
        console.error("🚨 OpenAI Error Details:", {
            message: e.message,
            stack: e.stack,
            type: e.type,
            code: e.code
        });
        return new Response(JSON.stringify({
            error: "AI Generation Failed",
            details: e.message,
            hint: !process.env.OPENAI_API_KEY ? "Missing OPENAI_API_KEY in .env" : "Check OpenAI credits or model availability"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
