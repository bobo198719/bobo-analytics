export const prerender = false;

const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://187.124.97.144:5000";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function ALL({ params, request }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { path } = params;
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    // Construct the target VPS URL
    const vpsUrl = `${hostingerUrl}/api/${path}${searchParams ? '?' + searchParams : ''}`;

    try {
        console.log(`📡 [Vercel Proxy] ${request.method} ${url.pathname} -> ${vpsUrl}`);

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('Host', new URL(hostingerUrl).host);

        let options = {
            method: request.method,
            headers: requestHeaders,
            redirect: 'follow'
        };

        if (!['GET', 'HEAD'].includes(request.method)) {
            options.body = await request.clone().arrayBuffer();
        }

        const response = await fetch(vpsUrl, options);
        let data = await response.arrayBuffer();

        // If it's JSON, rewrite absolute Hostinger URLs to relative proxied URLs
        const contentType = response.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
            let text = new TextDecoder().decode(data);
            const absoluteHostingerUrl = hostingerUrl.replace('http:', 'https:'); // Support both
            
            // Replace both HTTP and HTTPS versions of the VPS URL with relative paths
            text = text.replaceAll(hostingerUrl, "");
            text = text.replaceAll(absoluteHostingerUrl, "");
            
            // Also handle the cloud domain if it's different
            text = text.replaceAll("http://srv1449576.hstgr.cloud:5000", "");
            text = text.replaceAll("https://srv1449576.hstgr.cloud", "");
            
            data = new TextEncoder().encode(text);
        }

        const responseHeaders = new Headers(response.headers);
        // Overwrite CORS to follow Vercel proxy rules
        Object.keys(corsHeaders).forEach(key => responseHeaders.set(key, corsHeaders[key]));

        return new Response(data, {
            status: response.status,
            headers: responseHeaders
        });

    } catch (error) {
        console.error(`❌ [Vercel Proxy Error] ${url.pathname}:`, error);
        return new Response(JSON.stringify({ 
            error: "Failed to connect to Hostinger backend", 
            details: error.message,
            path: url.pathname
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
