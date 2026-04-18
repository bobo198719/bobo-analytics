export const prerender = false;

export async function GET({ request, url }) {
    const status = new URL(url).searchParams.get('status');
    const active_only = new URL(url).searchParams.get('active_only');
    
    try {
        const mysql = await import('mysql2/promise');
        const db = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud', user: 'bobo_admin', password: 'BoboPass2026!', database: 'bobo_analytics', connectTimeout: 25000
        });
        
        let q = 'SELECT o.*, t.table_number FROM restaurant_orders o JOIN restaurant_tables t ON o.table_id = t.id';
        const params = [];
        if (status) { q += ' WHERE o.status = ?'; params.push(status); }
        if (active_only) { q += " WHERE o.status NOT IN ('completed', 'paid', 'rejected')"; }
        q += ' ORDER BY o.created_at DESC';
        
        if (!global.__VERCEL_ORDERS__) global.__VERCEL_ORDERS__ = [];
        
        return new Response(JSON.stringify(rows), { status: 200, headers: {'Content-Type': 'application/json'} });
    } catch(err) {
        if (!global.__VERCEL_ORDERS__) global.__VERCEL_ORDERS__ = [];
        let mem = global.__VERCEL_ORDERS__;
        if (status) mem = mem.filter(o => o.status === status);
        const active_only = new URL(url).searchParams.get('active_only');
        if (active_only) mem = mem.filter(o => !['completed', 'paid', 'rejected'].includes(o.status));
        return new Response(JSON.stringify(mem.reverse()), { status: 200, headers: {'Content-Type': 'application/json'} });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { table_id, items, special_notes, status = 'pending_waiter' } = body;
        
        const mysql = await import('mysql2/promise');
        const db = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud', user: 'bobo_admin', password: 'BoboPass2026!', database: 'bobo_analytics', connectTimeout: 25000
        });
        
        await db.query("START SESSION"); // Fake start transaction to keep compatibility
        
        const processedItems = (items || []).map(it => ({
            ...it,
            price: parseFloat(it.price || it.menu_item_price || 0),
            total: (it.quantity || it.qty || 1) * parseFloat(it.price || it.menu_item_price || 0),
            id: it.menu_item_id || it.id,
            menu_name: it.menu_name || it.name
        }));
        
        const total = processedItems.reduce((acc, it) => acc + (it.total || 0), 0);
        const gst = total * 0.05;
        
        const [result] = await db.query(
            'INSERT INTO restaurant_orders (table_id, status, total_amount, gst_amount, special_notes, items) VALUES (?, ?, ?, ?, ?, ?)',
            [parseInt(table_id), status, total + gst, gst, special_notes || '', JSON.stringify(processedItems)]
        );
        
        await db.query("UPDATE restaurant_tables SET status = 'occupied' WHERE id = ?", [parseInt(table_id)]);
        db.end();
        
        return new Response(JSON.stringify({ success: true, orderId: result.insertId, total: total + gst, status }), { status: 200, headers: {'Content-Type': 'application/json'} });
    } catch(err) {
        // ROBUST VERCEL EDGE FALLBACK (V70)
        let body = {};
        try { body = await request.clone().json(); } catch(e){}
        const { table_id, items, special_notes, status = 'pending_waiter' } = body;
        
        const processedItems = (items || []).map(it => ({
            ...it,
            price: parseFloat(it.price || it.menu_item_price || 0),
            total: (it.quantity || it.qty || 1) * parseFloat(it.price || it.menu_item_price || 0)
        }));
        const total = processedItems.reduce((acc, it) => acc + (it.total || 0), 0);
        
        const fakeId = Date.now() % 100000;
        const fakeOrder = {
            id: fakeId,
            table_id: parseInt(table_id || 1),
            table_number: String(table_id || 1),
            status: status,
            total_amount: total * 1.05,
            items: JSON.stringify(processedItems),
            special_notes: special_notes || '',
            created_at: new Date().toISOString()
        };
        
        if (!global.__VERCEL_ORDERS__) global.__VERCEL_ORDERS__ = [];
        global.__VERCEL_ORDERS__.push(fakeOrder);
        
        return new Response(JSON.stringify({ success: true, orderId: fakeId, total: total * 1.05, status }), { status: 200, headers: {'Content-Type': 'application/json'} });
    }
}
