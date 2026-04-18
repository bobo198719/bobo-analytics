export const prerender = false;

const getConn = async () => {
    const mysql = await import('mysql2/promise');
    return mysql.createConnection({
        host: 'srv1449576.hstgr.cloud', user: 'bobo_admin', password: 'BoboPass2026!', database: 'bobo_analytics', connectTimeout: 200
    });
};

export async function DELETE({ params }) {
    const { id } = params;
    try {
        const db = await getConn();
        await db.query("DELETE FROM restaurant_menu WHERE id = ?", [id]);
        await db.end();
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: {'Content-Type': 'application/json'} });
    } catch(err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }
}

export async function PUT({ params, request }) {
    const { id } = params;
    try {
        const body = await request.json();
        const { name, category, price, description, is_available } = body;
        const db = await getConn();
        
        await db.query(
            "UPDATE restaurant_menu SET name = ?, category = ?, price = ?, description = ?, is_available = ? WHERE id = ?", 
            [name, category, price, description, is_available === false ? 0 : 1, id]
        );
        
        const [rows] = await db.query("SELECT * FROM restaurant_menu WHERE id = ?", [id]);
        await db.end();
        
        return new Response(JSON.stringify(rows[0] || {}), { status: 200, headers: {'Content-Type': 'application/json'} });
    } catch(err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }
}
