const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err.message);
  } else {
    console.log("✅ MySQL Connected Successfully via Hostinger");
    connection.release();
  }
});

// Initialize Tables
const initDb = () => {
  db.query(`CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price INT,
    category VARCHAR(100),
    image_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating products table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS bakery_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    price INT,
    category VARCHAR(100),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating bakery_products table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255),
    phone VARCHAR(20),
    products JSON,
    amount INT,
    payment_method VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating orders table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    business_name VARCHAR(255),
    industry VARCHAR(100),
    plan VARCHAR(50) DEFAULT 'starter',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating users table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(255) UNIQUE,
    settings JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating site_settings table:", err);
  });

  // Pharmacy Module Tables
  db.query(`CREATE TABLE IF NOT EXISTS pharmacies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pharmacy VARCHAR(255),
    pharmacyId VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    plan VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating pharmacies table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS inventory (
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
  )`, (err) => {
    if (err) console.error("Error creating inventory table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    gstin VARCHAR(50),
    customer_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating customers table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_name VARCHAR(255),
    role VARCHAR(100),
    phone VARCHAR(20),
    login_email VARCHAR(255),
    password_hash VARCHAR(255),
    permissions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating staff table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS barcode_stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barcode VARCHAR(100),
    product_id INT,
    stock INT,
    value DECIMAL(12,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating barcode_stock table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS medicine_master (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(255),
    mrp DECIMAL(10,2),
    purchase_price DECIMAL(10,2),
    gst DECIMAL(5,2),
    category VARCHAR(100),
    manufacturer VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating medicine_master table:", err);
  });
  db.query(`CREATE TABLE IF NOT EXISTS followers(
    id INT AUTO_INCREMENT PRIMARY KEY,
    bakery_slug VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating followers table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS saas_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    industry VARCHAR(50),
    business_name VARCHAR(255),
    owner_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    username VARCHAR(100),
    password_hash TEXT,
    plan_type VARCHAR(50) DEFAULT 'trial',
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    amount_paid INT DEFAULT 0,
    renewal_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating saas_users table:", err);
  });

  // Migrations for existing tables
  db.query(`ALTER TABLE saas_users ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50) DEFAULT 'trial'`, (err) => {
    if (err && err.errno !== 1060) console.warn("plan_type check.");
  });
  db.query(`ALTER TABLE saas_users ADD COLUMN IF NOT EXISTS amount_paid INT DEFAULT 0`, (err) => {
    if (err && err.errno !== 1060) console.warn("amount_paid check.");
  });
  db.query(`ALTER TABLE saas_users ADD COLUMN IF NOT EXISTS renewal_date DATE`, (err) => {
    if (err && err.errno !== 1060) console.warn("renewal_date check.");
  });
  db.query(`ALTER TABLE saas_users ADD COLUMN IF NOT EXISTS plain_password VARCHAR(255) DEFAULT NULL`, (err) => {
    if (err && err.errno !== 1060) console.warn("plain_password check.");
  });
  db.query(`ALTER TABLE saas_users ADD COLUMN IF NOT EXISTS owner_name VARCHAR(255) DEFAULT NULL`, (err) => {
    if (err && err.errno !== 1060) console.warn("owner_name check.");
  });

  db.query(`CREATE TABLE IF NOT EXISTS staff_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password_hash TEXT,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating staff_users table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS ai_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT,
    insight TEXT,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating ai_insights table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS saas_user_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    industry VARCHAR(50),
    business_name VARCHAR(255),
    username VARCHAR(100),
    plan_type VARCHAR(50),
    status VARCHAR(20),
    action VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating saas_user_history table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    price INT,
    duration INT,
    features TEXT
  )`, (err) => {
    if (err) console.error("Error creating plans table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount INT,
    method VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating payments table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255),
    owner_name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    industry VARCHAR(50),
    city VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating leads table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    type VARCHAR(50),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating activity_logs table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT,
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating alerts table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    ip_address VARCHAR(50),
    device VARCHAR(255),
    status VARCHAR(20),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating login_logs table:", err);
  });

  db.query(`CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    password_hash TEXT,
    industry VARCHAR(100),
    role VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating admin_users table:", err);
  });
};


initDb();

module.exports = db.promise(); // Using promise-based wrapper for async/await
