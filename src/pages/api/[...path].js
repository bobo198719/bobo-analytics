export async function ALL({ request, params }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Only intercept paths that should go to the Hostinger API
    if (!pathname.includes('/api/')) {
        return undefined; // Let Vercel Astro handle page SSR untouched
    }

    const hostingerUrl = "http://srv1449576.hstgr.cloud:5000";
    
    // 🔥 ROUTE TRANSLATION (V45 Mastery)
    let targetPath = pathname.replace('/api/v2/restaurant/', '/api/') + url.search;
    if (pathname.includes('/dashboard')) targetPath = '/api/dashboard' + url.search;

    try {
        const fetchOptions = {
            method,
            headers: { 'Content-Type': 'application/json' },
            // Optional: Forward body if it's a POST/PUT
            ...(method !== 'GET' && method !== 'HEAD' ? { body: await request.text() } : {})
        };

        const resProxy = await fetch(`${hostingerUrl}${targetPath}`, {
            ...fetchOptions,
            signal: AbortSignal.timeout(10000)
        });

        const data = await resProxy.json();
        return new Response(JSON.stringify(data), { status: 200, headers: {'Content-Type': 'application/json'} });

    } catch (err) {
        // 🆘 EMERGENCY CLOUD RECOVERY SHIELD
        
        // 1. Tables Recovery
        if (pathname.includes('/tables')) {
            return new Response(JSON.stringify([
                {id: 1, table_number: '1', status: 'available'},
                {id: 2, table_number: '2', status: 'available'},
                {id: 3, table_number: '3', status: 'available'},
                {id: 4, table_number: '4', status: 'available'}
            ]), { status: 200, headers: {'Content-Type': 'application/json'} });
        }
        
        // 2. Menu Recovery (MUST BE ARRAY)
        if (pathname.includes('/menu')) {
            return new Response(JSON.stringify([
                {id: 1, name: "Emergency Menu", price: 0, category: "System", image_url: ""}
            ]), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        // 3. Orders/KDS Recovery
        if (pathname.includes('/orders')) {
            return new Response(JSON.stringify([]), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        // 4. Dashboard Recovery
        if (pathname.includes('/dashboard')) {
            return new Response(JSON.stringify({ total_revenue: 0, orders_today: 0, active_tables: 0, kitchen_queue: 0, history: [], recent: [] }), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        return new Response(JSON.stringify({ error: "VPS_OFFLINE_V56" }), { status: 200 });
    }
}
