export const prerender = false;

export async function GET() {
    try {
        const mysql = await import('mysql2/promise');
        const db = await mysql.createConnection({
            host: 'srv1449576.hstgr.cloud', user: 'bobo_admin', password: 'BoboPass2026!', database: 'bobo_analytics', connectTimeout: 5000
        });
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS restaurant_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                table_id INT,
                status VARCHAR(50),
                total_amount DECIMAL(10,2),
                gst_amount DECIMAL(10,2),
                special_notes TEXT,
                items LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const [[stats]] = await db.query(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(total_amount) as total_revenue,
                SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as collected_revenue
            FROM restaurant_orders
        `);

        // Get daily revenue for charts
        const [daily] = await db.query(`
            SELECT DATE(created_at) as date, SUM(total_amount) as revenue 
            FROM restaurant_orders 
            GROUP BY DATE(created_at) 
            ORDER BY date DESC LIMIT 7
        `);
        
        await db.end();

        return new Response(JSON.stringify({
            metrics: {
                totalOrders: stats.total_orders || 0,
                revenue: Number(stats.total_revenue) || 0,
                collected: Number(stats.collected_revenue) || 0
            },
            daily: daily.reverse()
        }), { status: 200, headers: {'Content-Type': 'application/json'} });
    } catch(err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: {'Content-Type': 'application/json'} });
    }
}
