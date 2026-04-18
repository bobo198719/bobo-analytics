import mysql from 'mysql2/promise';

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { order_id, items, total_amount, table_id, restaurant_id, saas_tenant_id } = body;

        // Note: For a real SaaS, authenticate the saas_tenant_id against the plan matrix
        // We will simulate a quick check here.
        if (!saas_tenant_id) {
            return new Response(JSON.stringify({ error: "SaaS Authentication Missing", code: "SAAS_AUTH_FAIL" }), { status: 401 });
        }

        const connection = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud',
            user: 'bobo_admin',
            password: 'BoboPass2026!',
            database: 'bobo_analytics',
            connectTimeout: 4000
        });

        // Ensure POS table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS restaurant_pos_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE,
                saas_tenant_id VARCHAR(100),
                restaurant_id VARCHAR(100),
                table_id VARCHAR(50),
                items LONGTEXT,
                total_amount DECIMAL(10,2),
                status VARCHAR(50) DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Generate the real invoice binding to local database matrix
        await connection.query(
            "INSERT INTO restaurant_pos_orders (order_id, saas_tenant_id, restaurant_id, table_id, items, total_amount) VALUES (?, ?, ?, ?, ?, ?)",
            [order_id, saas_tenant_id, restaurant_id || 'default_rest', table_id, JSON.stringify(items), total_amount]
        );

        await connection.end();
        return new Response(JSON.stringify({ success: true, message: "Invoice Matrix Synchronized", invoice_id: order_id }), { status: 200 });
    } catch (err) {
        console.error("[POS Order Matrix Error]:", err);
        return new Response(JSON.stringify({ error: "Hardware Sync Failure or Matrix offline" }), { status: 500 });
    }
}
