const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bobo_analytics',
    waitForConnections: true,
    connectionLimit: 10
});

async function migrate() {
    console.log("🏢 Launching Bobo OS Enterprise Migration...");
    
    try {
        // 1. Create Restaurants Registry
        await pool.query(`
            CREATE TABLE IF NOT EXISTS restaurants (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                owner_id INT NOT NULL,
                address TEXT,
                status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
                plan_id VARCHAR(50) DEFAULT 'basic',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Create Staff & RBAC Node
        await pool.query(`
            CREATE TABLE IF NOT EXISTS restaurant_staff (
                id INT AUTO_INCREMENT PRIMARY KEY,
                restaurant_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                pin_code VARCHAR(4) NOT NULL,
                role ENUM('owner', 'manager', 'waiter', 'chef') DEFAULT 'waiter',
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
            )
        `);

        // 3. Add restaurant_id to core modules (if not exists)
        const tablesToUpdate = ['restaurant_tables', 'restaurant_orders', 'restaurant_menu', 'restaurant_categories'];
        
        for (const table of tablesToUpdate) {
            try {
                // Check if column exists
                const [cols] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE 'restaurant_id'`);
                if (cols.length === 0) {
                    console.log(`Updating ${table} for Multi-Restaurant support...`);
                    await pool.query(`ALTER TABLE ${table} ADD COLUMN restaurant_id INT DEFAULT 1 BEFORE id`);
                    await pool.query(`ALTER TABLE ${table} ADD INDEX (restaurant_id)`);
                }
            } catch (err) {
                console.error(`Error updating ${table}:`, err.message);
            }
        }

        // 4. Default Node Creation (First Restaurant)
        const [existing] = await pool.query("SELECT * FROM restaurants LIMIT 1");
        if (existing.length === 0) {
            console.log("Setting up Default Restaurant #1...");
            await pool.query("INSERT INTO restaurants (name, owner_id) VALUES ('Grand Cafe Bobo', 1)");
            await pool.query("INSERT INTO restaurant_staff (restaurant_id, name, pin_code, role) VALUES (1, 'Admin', '1111', 'owner')");
        }

        console.log("✅ Enterprise Matrix Migration Successful.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration Fail:", err.message);
        process.exit(1);
    }
}

migrate();
Line 1: const mysql = require('mysql2/promise');
