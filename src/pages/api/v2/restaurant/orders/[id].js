export const prerender = false;

export async function GET({ params }) {
    const { id } = params;
    try {
        const mysql = await import('mysql2/promise');
        const db = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud', user: 'bobo_admin', password: 'BoboPass2026!', database: 'bobo_analytics', connectTimeout: 25000
        });
        
        const [rows] = await db.query('SELECT o.*, t.table_number FROM restaurant_orders o JOIN restaurant_tables t ON o.table_id = t.id WHERE o.id = ?', [id]);
        db.end();
        
        if (!rows.length) return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: {'Content-Type': 'application/json'} });
        return new Response(JSON.stringify(rows[0]), { status: 200, headers: {'Content-Type': 'application/json'} });
    } catch(err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }
}

export async function PATCH({ params, request }) {
    const { id } = params;
    try {
        const body = await request.json();
        const { status } = body;
        
        const mysql = await import('mysql2/promise');
        const db = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud', user: 'bobo_admin', password: 'BoboPass2026!', database: 'bobo_analytics', connectTimeout: 25000
        });
        
        await db.query('UPDATE restaurant_orders SET status = ? WHERE id = ?', [status, id]);
        
        if (status === 'completed' || status === 'paid' || status === 'rejected') {
            await db.query("UPDATE restaurant_tables SET status = 'available' WHERE id = (SELECT table_id FROM restaurant_orders WHERE id = ?)", [id]);
        }
        
        const [rows] = await db.query('SELECT * FROM restaurant_orders WHERE id = ?', [id]);
        db.end();
        
        const finalObj = rows[0] || { success: true, status };
        return new Response(JSON.stringify(finalObj), { status: 200, headers: {'Content-Type': 'application/json'} });
    } catch(err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }
}
