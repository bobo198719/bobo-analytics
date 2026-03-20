export const prerender = false;
const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

// FINAL MASTER SYNCHRONIZER (V22)
export async function ALL({ request }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const searchParams = url.searchParams.toString();
    const apiPath = pathname.replace('/api/', '');

    // Setup headers once
    const relayHeaders = new Headers();
    request.headers.forEach((v, k) => {
        if (k.toLowerCase() !== 'host' && k.toLowerCase() !== 'cookie') {
            relayHeaders.set(k, v);
        }
    });
    relayHeaders.set("origin", "http://srv1449576.hstgr.cloud:5000");

    let requestBody = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try { requestBody = await request.arrayBuffer(); } catch(e) {}
    }

    try {
        const vpsUrl = `${hostingerUrl}/api/${apiPath}${searchParams ? '?' + searchParams : ''}`;

        const response = await fetch(vpsUrl, {
            method: request.method,
            headers: relayHeaders,
            body: requestBody
        });

        const responseData = await response.arrayBuffer();
        return new Response(responseData, {
            status: response.status,
            headers: {
                ...Object.fromEntries(response.headers.entries()),
                'Access-Control-Allow-Origin': '*',
                'X-Master-Sync': 'V22-Ready'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message, v: "V22-Fail" }), { 
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
}

export const GET = ALL; export const POST = ALL; export const PUT = ALL;
export const DELETE = ALL; export const PATCH = ALL; export const OPTIONS = ALL;
