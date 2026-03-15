import { getMySQL, initTables } from "../../lib/mysql";

export const prerender = false;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function ALL({ request }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { method } = request;
    const db = getMySQL();
    
    try {
        await initTables(); // Ensure tables exist

        if (method === 'GET') {
            const [rows] = await db.query("SELECT * FROM products ORDER BY created_at DESC");
            // Map table column names to frontend field names for backward compatibility
            const products = rows.map(r => ({
                ...r,
                image_url: r.image_path, // Mapping
                high_res_url: r.image_path,
                medium_url: r.image_path,
                thumbnail_url: r.image_path
            }));
            
            return new Response(JSON.stringify(products), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'POST') {
            const body = await request.json();
            const { id, name, price, desc, description, cat, category, image_path, image_url } = body;
            
            const finalName = name || "Unnamed Bake";
            const finalPrice = Number(price) || 0;
            const finalDesc = description || desc || "";
            const finalCat = category || cat || "General";
            const finalImg = image_path || image_url || "";

            if (id && !isNaN(id)) {
                // Update
                await db.query(
                    "UPDATE products SET name=?, description=?, price=?, category=?, image_path=? WHERE id=?",
                    [finalName, finalDesc, finalPrice, finalCat, finalImg, id]
                );
                return new Response(JSON.stringify({ success: true, message: "Updated" }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } else {
                // Insert
                const [result] = await db.query(
                    "INSERT INTO products (name, description, price, category, image_path) VALUES (?, ?, ?, ?, ?)",
                    [finalName, finalDesc, finalPrice, finalCat, finalImg]
                );
                return new Response(JSON.stringify({ success: true, id: result.insertId }), {
                    status: 201,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        if (method === 'DELETE') {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');
            if (!id) return new Response(JSON.stringify({ error: "Product ID required" }), { status: 400 });

            await db.query("DELETE FROM products WHERE id = ?", [id]);
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: corsHeaders
            });
        }

        return new Response("Method not allowed", { status: 405 });

    } catch (error) {
        console.error("MySQL Products API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
