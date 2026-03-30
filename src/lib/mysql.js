import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'srv1449576.hstgr.cloud',
  user: process.env.DB_USER || 'bobo_admin',
  password: process.env.DB_PASSWORD || 'BoboPass2026!',
  database: process.env.DB_NAME || 'bobo_analytics',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  connectionLimit: 20,
  waitForConnections: true,
  queueLimit: 0
});

export const getMySQL = () => pool;

// Auto-init tables for serverless environments
export const initTables = async () => {
  const db = pool;
  await db.query(`CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(255) UNIQUE,
    settings JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);

  // Pharmacy Module Tables
  await db.query(`CREATE TABLE IF NOT EXISTS pharmacies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pharmacy VARCHAR(255),
    pharmacyId VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    plan VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.query(`CREATE TABLE IF NOT EXISTS inventory (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    pharmacyId VARCHAR(100),
    barcode VARCHAR(100),
    product_name VARCHAR(255),
    category VARCHAR(100),
    manufacturer VARCHAR(100),
    hsn_code VARCHAR(50),
    pack_size VARCHAR(50),
    mrp DECIMAL(10,2),
    purchase_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    gst_percent DECIMAL(5,2),
    stock_qty INT DEFAULT 0,
    expiry_date VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.query(`CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    gstin VARCHAR(50),
    customer_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.query(`CREATE TABLE IF NOT EXISTS lead_pipeline (
    id VARCHAR(50) PRIMARY KEY,
    business_name VARCHAR(255),
    owner_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    industry VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
};

