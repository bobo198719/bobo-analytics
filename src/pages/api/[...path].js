import menuItems from '../../data/restaurant_menu.json';

export async function ALL({ request, params }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Only intercept paths that should go to the Hostinger API
    if (!pathname.includes('/api/') || pathname.includes('/api/v2/')) {
        return undefined; // Let Vercel Astro handle its own high-performance V2 bridges
    }

    const hostingerUrl = "http://187.124.97.144:5000";
    
    // 🔥 ROUTE PARSE LOGIC
    let targetPath = pathname + url.search;
    
    // 🛠️ Asset Mapping Correction: Strip /api for static folders mounted at root on Hostinger
    const assetFolders = ['/storage/', '/menu-images/'];
    for (const folder of assetFolders) {
        if (targetPath.startsWith('/api' + folder)) {
            targetPath = targetPath.replace('/api/', '/');
            break;
        }
    }

    try {
        const fetchOptions = {
            method,
            headers: { 'Content-Type': 'application/json' },
            // Optional: Forward body if it's a POST/PUT
            ...(method !== 'GET' && method !== 'HEAD' ? { body: await request.text() } : {})
        };

        // Use longer timeout for seed operations
        const isSeed = pathname.includes('/seed');
        const timeoutMs = isSeed ? 60000 : 10000;

        const resProxy = await fetch(`${hostingerUrl}${targetPath}`, {
            ...fetchOptions,
            signal: AbortSignal.timeout(timeoutMs)
        });

        // 🖼️ BINARY ASSET SHIELD: If it's an image or other binary file, don't parse as JSON
        const contentType = resProxy.headers.get('Content-Type') || '';
        if (contentType.includes('image/') || contentType.includes('video/') || contentType.includes('application/pdf') || contentType.includes('octet-stream')) {
            const blob = await resProxy.arrayBuffer();
            return new Response(blob, {
                status: resProxy.status,
                headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=3600' }
            });
        }

        let data = await resProxy.json();
        
        // 🔒 CORE REPAIR: If backend returns settings as a string, parse it for the frontend
        if (pathname.includes('/api/settings') && typeof data === 'string') {
            try { data = JSON.parse(data); } catch(e) {}
        }

        return new Response(JSON.stringify(data), { 
            status: resProxy.status, 
            headers: {'Content-Type': 'application/json'} 
        });

    } catch (err) {
        // 🆘 EMERGENCY CLOUD RECOVERY SHIELD
        
        // 1. Tables Recovery
        // 0. Auth Bypass (V60 - Emergency Console Key)
        if (pathname.includes('/auth/login') && method === 'POST') {
            try {
                const body = JSON.parse(await request.clone().text());
                if ((body.email === 'admin@bobo.com' || body.username === 'admin') && body.password === 'password123') {
                    const mockToken = "EMERGENCY_RECOVERY_KEY_V60";
                    return new Response(JSON.stringify({ 
                        token: mockToken,
                        user: { id: 1, name: "Admin Master", email: "admin@bobo.com", role: "admin" }
                    }), { status: 200, headers: {'Content-Type': 'application/json'} });
                }
            } catch(e) { /* ignore */ }
        }

        if (pathname.includes('/tables')) {
            return new Response(JSON.stringify([
                {id: 1, table_number: '1', status: 'available'},
                {id: 2, table_number: '2', status: 'available'},
                {id: 3, table_number: '3', status: 'available'},
                {id: 4, table_number: '4', status: 'available'}
            ]), { status: 200, headers: {'Content-Type': 'application/json'} });
        }
        
        // 2. Menu Recovery (V59 - Static 500 Matrix)
        if (pathname.includes('/menu')) {
            try {
                return new Response(JSON.stringify(menuItems), { status: 200, headers: {'Content-Type': 'application/json'} });
            } catch(e) {
                return new Response(JSON.stringify([
                    {id: 1, name: "Emergency Matrix Down", price: 0, category: "System", image_url: ""}
                ]), { status: 200, headers: {'Content-Type': 'application/json'} });
            }
        }

        // 3. Orders/KDS Recovery
        if (pathname.includes('/orders')) {
            return new Response(JSON.stringify([]), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        // 4. Dashboard Recovery
        if (pathname.includes('/dashboard')) {
            return new Response(JSON.stringify({ total_revenue: 0, orders_today: 0, active_tables: 0, kitchen_queue: 0, history: [], recent: [] }), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        // 5. Bakery OS Products Recovery (Blank Slate Shield)
        if (pathname.includes('/api/products') || pathname.includes('/api/v1/products') || pathname.includes('/api/v2/products')) {
            const defaults = [];
            return new Response(JSON.stringify(defaults), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        return new Response(JSON.stringify({ error: "VPS_OFFLINE_V56", message: err.message }), { status: 503 });
    }
}
