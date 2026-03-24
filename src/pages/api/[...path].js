import menuItems from '../../data/restaurant_menu.json';

export async function ALL({ request, params }) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Only intercept paths that should go to the Hostinger API
    if (!pathname.includes('/api/')) {
        return undefined; // Let Vercel Astro handle page SSR untouched
    }

    const hostingerUrl = "http://srv1449576.hstgr.cloud:5000";
    
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

        // 5. Bakery OS Products Recovery (Master Resurrection Shield)
        if (pathname.includes('/api/products') || pathname.includes('/api/v1/products') || pathname.includes('/api/v2/products')) {
            const defaults = [
                { id:'p101', name:'Wednesday Addams Pop Culture Cake (Hiya)', category:'Celebration Cakes', price:1500, prep:'4h', description:'Signature Wedensday Addams themed chocolate cake with purple accents.', status:'approved', image_path:'/api/uploads/whatsapp-image-2026-03-13-at-10-59-57-jpeg-1773564631013.webp' },
                { id:'p102', name:'Under The Sea Baby Shark Cupcakes',   category:'Cupcakes & Muffins',   price:1500, prep:'4h', description:'Set of 12 premium cupcakes with hand-piped Baby Shark edible art.',    status:'approved', image_path:'/api/uploads/ww-jpeg-1773564633537.webp' },
                { id:'p103', name:'Sunny Yellow Floral Drip Cake',    category:'Celebration Cakes',        price:1500,  prep:'4h', description:'Yellow-themed celebration cake with elegant floral drip decor.', status:'approved', image_path:'/api/uploads/cake2-png-1773563690213.webp' },
                { id:'p104', name:'Sweet Pastel Baby Shower Cupcakes',   category:'Cupcakes & Muffins',     price:1500, prep:'4h', description:'Soft pastel fondant cupcakes for baby showers.', status:'approved', image_path:'/api/uploads/wewre-jpeg-1773564630497.webp' },
                { id:'p105', name:'Someone To Spoil Gender Reveal Cake',  category:'Celebration Cakes', price:1500, prep:'4h', description:'Premium gender reveal themed cake with rich buttercream filling.', status:'approved', image_path:'/api/uploads/whatsapp-image-2026-03-13-at-10-59-51-jpeg-1773564630772.webp' },
                { id:'p106', name:'Signature Flower Truffle Cake',    category:'Chocolate Cakes',        price:1500, prep:'4h', description:'UHD Signature Flower-themed chocolate truffle master bake.',  status:'approved', image_path:'https://xxxg3qmbgpwrfdqf.public.blob.vercel-storage.com/bakers-os/1773655591344.webp' }
            ];
            return new Response(JSON.stringify(defaults), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        return new Response(JSON.stringify({ error: "VPS_OFFLINE_V56" }), { status: 503 });
    }
}
