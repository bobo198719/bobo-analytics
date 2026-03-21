// mysql_db.js — Drop-in MySQL2 replacement for pg_db.js
// Connects via Unix socket (root, no password) — works on VPS without env vars
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    socketPath: '/run/mysqld/mysqld.sock',
    user: 'root',
    password: '',
    database: 'bobo_analytics',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

// pg-compatible query interface: converts $1,$2 → ?,? placeholders
const query = async (text, params) => {
    const mysqlText = text.replace(/\$\d+/g, '?');
    const [rows] = await pool.execute(mysqlText, params || []);
    return { rows, rowCount: Array.isArray(rows) ? rows.length : 0 };
};

// pg-compatible pool.connect() for transactions
const poolCompat = {
    connect: async () => {
        const conn = await pool.getConnection();
        return {
            query: async (text, params) => {
                const mysqlText = text.replace(/\$\d+/g, '?');
                const [rows] = await conn.execute(mysqlText, params || []);
                return { rows };
            },
            release: () => conn.release()
        };
    }
};

// Initialize tables (MySQL syntax)
const initTables = async () => {
    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS restaurant_tables (
                id INT AUTO_INCREMENT PRIMARY KEY,
                table_number VARCHAR(50) UNIQUE NOT NULL,
                status VARCHAR(20) DEFAULT 'available'
            )
        `);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS menu_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                type VARCHAR(20) DEFAULT 'veg',
                price DECIMAL(10,2) NOT NULL,
                gst_percent DECIMAL(5,2) DEFAULT 5,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS restaurant_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                table_id INT,
                status VARCHAR(30) DEFAULT 'pending_waiter',
                total_amount DECIMAL(12,2) NOT NULL,
                gst_amount DECIMAL(12,2) NOT NULL,
                special_notes TEXT,
                items JSON,
                waiter_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (table_id) REFERENCES restaurant_tables(id)
            )
        `);
        console.log('✅ MySQL Restaurant Schema Ready');
    } catch (err) {
        console.warn('⚠️ MySQL init warning:', err.message);
    }
};

initTables();

module.exports = { query, pool: poolCompat, rawPool: pool };
