import mysql from 'mysql2/promise';

export async function GET({ url }) {
    try {
        const tenantId = url.searchParams.get('tenantId') || 'default_baker';
        
        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics',
            connectTimeout: 10000
        });

        // Ensure table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bakery_recipes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                recipe_name VARCHAR(255) NOT NULL,
                ingredients TEXT NOT NULL,
                production_cost DECIMAL(10,2) DEFAULT 0,
                selling_price DECIMAL(10,2) DEFAULT 0,
                profit DECIMAL(10,2) DEFAULT 0,
                margin DECIMAL(5,2) DEFAULT 0,
                bakery_slug VARCHAR(100) DEFAULT 'default_baker',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const [rows] = await connection.query(
            "SELECT * FROM bakery_recipes WHERE bakery_slug = ? OR bakery_slug IS NULL ORDER BY created_at DESC", 
            [tenantId]
        );
        
        await connection.end();

        // Parse ingredients JSON
        const parsedRows = rows.map(r => ({
            ...r,
            ingredients: typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : r.ingredients
        }));

        return new Response(JSON.stringify(parsedRows), { status: 200 });

    } catch (err) {
        console.error("[Recipes Bridge Error]:", err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { recipeName, ingredients, productionCost, sellingPrice, profit, margin, bakery_slug } = body;
        
        const finalSlug = bakery_slug || 'default_baker';
        const ingredientsJson = JSON.stringify(ingredients);

        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics'
        });

        await connection.query(
            "INSERT INTO bakery_recipes (recipe_name, ingredients, production_cost, selling_price, profit, margin, bakery_slug) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [recipeName, ingredientsJson, productionCost, sellingPrice, profit, margin, finalSlug]
        );

        await connection.end();
        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (err) {
        console.error("[Recipes Save Error]:", err);
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

        await connection.query("DELETE FROM bakery_recipes WHERE id = ?", [id]);
        await connection.end();
        
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500 });
    }
}
