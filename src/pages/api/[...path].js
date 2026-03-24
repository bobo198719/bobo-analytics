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

        // 5. Bakery OS Products Recovery (Physical Memory Injection)
        if (pathname.includes('/api/products') || pathname.includes('/api/v1/products')) {
            const defaults = [
                { id:'p1', name:'Spider-Man Theme Cake', category:'Chocolate Cakes', price:1800, prep:'6h', description:'Premium chocolate sponge with hand-piped Spider-man web design.', status:'approved', image_path:'' },
                { id:'p2', name:'Classic Smiley Cake',   category:'Vanilla Cakes',   price:1200, prep:'4h', description:'Joyful vanilla cream cake with a classic smiley face design.',    status:'approved', image_path:'' },
                { id:'p3', name:'Luxury Cupcake Box',    category:'Cupcakes & Muffins',        price:950,  prep:'3h', description:'Set of 6 gourmet cupcakes with fresh berries and rich frosting.', status:'approved', image_path:'' },
                { id:'p4', name:'Doraemon Dream Cake',   category:'Fruit Cakes',     price:1500, prep:'5h', description:'Bespoke buttercream cake featuring full Doraemon edible art.', status:'approved', image_path:'' },
                { id:'p5', name:'Belgium Truffle Cake',  category:'Chocolate Cakes', price:1450, prep:'4h', description:'Dense chocolate sponge with 70% dark Belgian chocolate and silk ganache.', status:'approved', image_path:'' },
                { id:'p6', name:'Biscoff Cheesecake',    category:'Cheesecakes',        price:1600, prep:'8h', description:'Creamy Biscoff-infused cheesecake with a crunchy speculoos base.',  status:'approved', image_path:'' },
                { id:'p7', name:'Red Velvet Duo',        category:'Cupcakes & Muffins',        price:850,  prep:'2h', description:'Signature red velvet sponge with rich cream cheese frosting.', status:'approved', image_path:'' },
                { id:'p8', name:'Mango Delight Cake',    category:'Fruit Cakes',     price:1350, prep:'5h', description:'Fresh Alphonso mango chunks layered with soft vanilla sponge.', status:'approved', image_path:'' },
            ];
            return new Response(JSON.stringify(defaults), { status: 200, headers: {'Content-Type': 'application/json'} });
        }

        return new Response(JSON.stringify({ error: "VPS_OFFLINE_V56" }), { status: 200 });
    }
}
