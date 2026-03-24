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

        // Ensure table exists with correct schema
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bakery_products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                description TEXT,
                price INT,
                category VARCHAR(100),
                image_url VARCHAR(500),
                status VARCHAR(50) DEFAULT 'approved',
                prep VARCHAR(50) DEFAULT '4h',
                bakery_slug VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check columns and add missing ones
        const [cols] = await connection.query("SHOW COLUMNS FROM bakery_products");
        const colNames = cols.map(c => c.Field);
        if (!colNames.includes('status')) await connection.query("ALTER TABLE bakery_products ADD COLUMN status VARCHAR(50) DEFAULT 'approved'");
        if (!colNames.includes('prep'))   await connection.query("ALTER TABLE bakery_products ADD COLUMN prep VARCHAR(50) DEFAULT '4h'");

        const finalSlug = bakery_slug || 'default_baker';
        const finalStatus = status || 'approved';
        const finalPrice = Number(price) || 0;
        const finalPrep = prep || '4h';

        // Check if updating via name+slug (for non-integer IDs)
        const [existing] = await connection.query(
            "SELECT id FROM bakery_products WHERE name = ? AND bakery_slug = ?",
            [name, finalSlug]
        );

        if (existing.length > 0) {
            // Update Existing Product
            await connection.query(
                "UPDATE bakery_products SET description=?, price=?, category=?, image_url=?, status=?, prep=? WHERE id=?",
                [description, finalPrice, category, image_path, finalStatus, finalPrep, existing[0].id]
            );
            await connection.end();
            return new Response(JSON.stringify({ success: true, message: "Product updated in Cloud Matrix" }));
        } else {
            // Insert New Product
            const [result] = await connection.query(
                "INSERT INTO bakery_products (name, description, price, category, image_url, status, prep, bakery_slug) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [name, description, finalPrice, category, image_path, finalStatus, finalPrep, finalSlug]
            );
            await connection.end();
            return new Response(JSON.stringify({ success: true, id: result.insertId, message: "Product created in Cloud Matrix" }));
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
