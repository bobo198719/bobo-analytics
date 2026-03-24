import mysql from 'mysql2/promise';

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { id, name, price, description, category, image_path, bakery_slug, status, prep } = body;
        
        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics',
            connectTimeout: 10000
        });

        const finalSlug = bakery_slug || 'default_baker';
        const finalStatus = status || 'approved';
        const finalPrice = Number(price) || 0;
        const finalPrep = prep || '4h';

        // Check if updating an internal ID vs an auto-increment ID
        let dbId = null;
        if (id && !isNaN(id)) dbId = Number(id);

        if (dbId) {
            // Update Existing Product
            await connection.query(
                "UPDATE bakery_products SET name=?, description=?, price=?, category=?, image_url=?, status=?, prep=?, bakery_slug=? WHERE id=?",
                [name, description, finalPrice, category, image_path, finalStatus, finalPrep, finalSlug, dbId]
            );
            await connection.end();
            return new Response(JSON.stringify({ success: true, message: "Product updated in Direct Cloud Bridge" }));
        } else {
            // Insert New Product
            const [result] = await connection.query(
                "INSERT INTO bakery_products (name, description, price, category, image_url, status, prep, bakery_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [name, description, finalPrice, category, image_path, finalStatus, finalPrep, finalSlug]
            );
            const newId = result.insertId;
            await connection.end();
            return new Response(JSON.stringify({ success: true, id: newId, message: "Product created in Direct Cloud Bridge" }));
        }

    } catch (err) {
        console.error("[Bridge Save Error]:", err);
        return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
}

export async function DELETE({ url }) {
    try {
        const id = url.searchParams.get('id');
        if (!id) throw new Error("ID required");

        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics'
        });

        await connection.query("DELETE FROM bakery_products WHERE id = ?", [id]);
        await connection.end();
        
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
