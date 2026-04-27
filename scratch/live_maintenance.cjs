const mysql = require('mysql2/promise');

async function reset() {
    const config = {
        host: 'srv1449576.hstgr.cloud',
        user: 'bobo_admin',
        password: 'BoboPass2026!',
        database: 'bobo_analytics'
    };

    const db = await mysql.createConnection(config);
    try {
        console.log("Resetting Table 1...");
        await db.query("UPDATE restaurant_tables SET status = 'available' WHERE table_number = '1'");
        await db.query("UPDATE restaurant_qr_orders SET status = 'paid' WHERE table_id = '1' AND status != 'paid'");
        
        console.log("Adding Table 7 and 8 if missing...");
        await db.query("INSERT IGNORE INTO restaurant_tables (table_number, status) VALUES ('7', 'available')");
        await db.query("INSERT IGNORE INTO restaurant_tables (table_number, status) VALUES ('8', 'available')");
        
        console.log("SUCCESS: Live Database Desynchronization Resolved.");
    } catch (e) {
        console.error("DB Error:", e.message);
    } finally {
        await db.end();
    }
}

reset();
