export const prerender = false;

const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function ALL({ request }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { method } = request;
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const vpsUrl = `${hostingerUrl}/api/products${searchParams ? '?' + searchParams : ''}`;

    try {
        let options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (method === 'POST' || method === 'PATCH') {
            const body = await request.clone().text();
            options.body = body;
        }

        const response = await fetch(vpsUrl, options);
        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Vercel Proxy Error (Products):", error);
        return new Response(JSON.stringify({ error: "Failed to connect to backend", details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
