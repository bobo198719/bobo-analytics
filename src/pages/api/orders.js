import { getMySQL, initTables } from "../../lib/mysql";

export const prerender = false;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function ALL({ request }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { method } = request;
    const db = getMySQL();

    try {
        await initTables();

        if (method === 'GET') {
            const [rows] = await db.query("SELECT * FROM orders ORDER BY created_at DESC");
            const orders = rows.map(r => ({
                ...r,
                products: typeof r.products === 'string' ? JSON.parse(r.products) : r.products,
                order_id: r.id // Map primary key to order_id for frontend
            }));
            return new Response(JSON.stringify(orders), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'POST') {
            const body = await request.json();
            const { customer_name, phone, products, amount, payment_method, status } = body;
            
            const [result] = await db.query(
                "INSERT INTO orders (customer_name, phone, products, amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)",
                [
                    customer_name || "Unknown",
                    phone || "",
                    JSON.stringify(products || []),
                    Number(amount) || 0,
                    payment_method || "COD",
                    status || "pending"
                ]
            );

            return new Response(JSON.stringify({ success: true, order: { id: result.insertId, order_id: result.insertId } }), {
                status: 201,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'PATCH') {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');
            if (!id) return new Response(JSON.stringify({ error: "Order ID required" }), { status: 400 });

            const body = await request.json();
            // Dynamically build update query for PATCH
            const fields = Object.keys(body).filter(k => ['status', 'payment_status', 'amount'].includes(k));
            if (fields.length === 0) return new Response(JSON.stringify({ error: "No valid fields to update" }), { status: 400 });

            const query = `UPDATE orders SET ${fields.map(f => `${f}=?`).join(', ')} WHERE id=?`;
            const values = [...fields.map(f => f === 'products' ? JSON.stringify(body[f]) : body[f]), id];

            await db.query(query, values);
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'DELETE') {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');
            if (!id) return new Response(JSON.stringify({ error: "Order ID required" }), { status: 400 });

            await db.query("DELETE FROM orders WHERE id = ?", [id]);
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: corsHeaders
            });
        }

        return new Response("Method not allowed", { status: 405 });

    } catch (error) {
        console.error("MySQL Orders API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
