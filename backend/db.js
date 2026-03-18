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
    plan VARCHAR(50),
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error("Error creating saas_users table:", err);
  });
};


initDb();

module.exports = db.promise(); // Using promise-based wrapper for async/await
