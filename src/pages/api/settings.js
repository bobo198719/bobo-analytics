export const prerender = false;

const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function ALL({ request }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { method } = request;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const tenantId = pathParts[pathParts.length - 1]; // Support /api/settings/tenantId

    let vpsUrl = `${hostingerUrl}/api/settings`;
    if (method === 'GET' && tenantId !== 'settings') {
        vpsUrl = `${hostingerUrl}/api/settings/${tenantId}`;
    }

    try {
        let options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (method === 'POST') {
            const body = await request.clone().text();
            options.body = body;
        }

        console.log(`📡 Proxying ${method} to ${vpsUrl}`);
        const response = await fetch(vpsUrl, options);
        let data = {};
        try {
            data = await response.json();
        } catch (je) {
            data = { message: "Empty or invalid JSON from backend" };
        }

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Vercel Proxy Error (Settings):", error);
        return new Response(JSON.stringify({ error: "Failed to connect to backend", details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
