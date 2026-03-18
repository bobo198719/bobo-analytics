const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT || '3306')
        });

        console.log("🔍 Checking saas_users...");
        const [rows] = await db.query('SELECT username, industry, status, plan_type FROM saas_users');
        console.table(rows);

        console.log("\n🔍 Checking admin_users (Central Logins)...");
        const [rows2] = await db.query('SELECT username, industry, role, status FROM admin_users');
        console.table(rows2);

        await db.end();
    } catch (err) {
        console.error("❌ DB Check Failed:", err.message);
    }
})();
