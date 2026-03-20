const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
  ssl: {
    rejectUnauthorized: false // Required for many cloud hosts like Neon/Supabase
  }
});

// Initialization
const initTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS tables (
                id SERIAL PRIMARY KEY,
                table_number VARCHAR(50) UNIQUE NOT NULL,
                status VARCHAR(20) DEFAULT 'available'
            );
            
            CREATE TABLE IF NOT EXISTS menu_items (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                type VARCHAR(20), -- veg/nonveg
                price DECIMAL(10, 2) NOT NULL,
                gst_percent DECIMAL(5, 2) DEFAULT 5,
                image_url TEXT
            );
            
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                phone VARCHAR(20) UNIQUE,
                total_orders INT DEFAULT 0,
                total_spent DECIMAL(12, 2) DEFAULT 0
            );
            
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                table_id INT REFERENCES tables(id),
                customer_id INT REFERENCES customers(id),
                status VARCHAR(20) DEFAULT 'pending_waiter',
                total_amount DECIMAL(12, 2) NOT NULL,
                gst_amount DECIMAL(12, 2) NOT NULL,
                special_notes TEXT,
                items JSONB,
                waiter_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INT REFERENCES orders(id) ON DELETE CASCADE,
                menu_item_id INT REFERENCES menu_items(id),
                quantity INT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                total DECIMAL(12, 2) NOT NULL,
                special_instructions TEXT
            );
        `);
        // Migration: Ensure special_notes exists in orders
        try {
            await pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT');
        } catch(e) { console.log("Migration check: special_notes exists."); }

        console.log("🐘 Postgres Multi-Industry Schema Initialized");
    } catch (err) {
        console.error("❌ Postgres Connection Error:", err);
    }
};

initTables();

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
