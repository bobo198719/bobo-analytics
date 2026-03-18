const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  console.log("🚀 Starting SaaS Ecosystem Migration...");

  // 1. Ensure tables exist
  await db.execute(`
    CREATE TABLE IF NOT EXISTS saas_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      business_name VARCHAR(100),
      username VARCHAR(50) UNIQUE,
      password_hash VARCHAR(255),
      industry VARCHAR(50),
      plan_type VARCHAR(50) DEFAULT 'trial',
      status VARCHAR(20) DEFAULT 'active',
      amount_paid DECIMAL(10,2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE,
      password_hash TEXT,
      industry VARCHAR(50),
      role VARCHAR(50),
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Provision Initial Tenants & Master Admin
  const initialUsers = [
    { username: "admin", password: "password123", business_name: "SaaS Master Console", industry: "admin", plan: "master", role: "super_admin" },
    { username: "pharmacy_admin", password: "password123", business_name: "City Pharmacy", industry: "pharmacy", plan: "enterprise", role: "owner" },
    { username: "health_admin", password: "password123", business_name: "Apollo Hospital", industry: "healthcare", plan: "pro", role: "owner" },
    { username: "retail_admin", password: "password123", business_name: "Big Bazaar", industry: "retail", plan: "enterprise", role: "owner" },
    { username: "baker_admin", password: "password123", business_name: "Trivia Bakes", industry: "bakery", plan: "pro", role: "owner" }
  ];

  for (const user of initialUsers) {
    try {
      const hash = await bcrypt.hash(user.password, 10);
      
      // Mirror in saas_users
      await db.execute(
        "INSERT INTO saas_users (username, password_hash, business_name, industry, plan_type) VALUES (?, ?, ?, ?, ?)",
        [user.username, hash, user.business_name, user.industry, user.plan]
      );

      // Mirror in admin_users
      await db.execute(
        "INSERT INTO admin_users (username, password_hash, industry, role) VALUES (?, ?, ?, ?)",
        [user.username, hash, user.industry, user.role]
      );

      console.log(`✅ Provisioned & Tracked: ${user.username} (${user.industry})`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`⏭️ Tenant ${user.username} already exists, skipping.`);
      } else {
        console.error(`❌ Provisioning Error [${user.username}]:`, err.message);
      }
    }
  }

  // 3. Seed Medicine Master (If JSON exists)
  try {
     const medicineData = require("./medicineMaster.json");
     console.log("💊 Seeding Medicine Master...");
     for (const med of medicineData.medicines) {
       try {
         await db.execute(
           "INSERT INTO medicine_master (barcode, name, mrp, purchase_price, gst, category, manufacturer) VALUES (?, ?, ?, ?, ?, ?, ?)",
           [med.barcode, med.name, med.mrp, med.purchasePrice, med.gst, med.category, med.manufacturer]
         );
       } catch (e) { /* skip dups */ }
     }
  } catch (e) { /* skip silently if file not found */ }

  // 4. Sync Bakery Data
  console.log("🍰 Syncing Bakery Products...");
  try {
     await db.execute(`
       INSERT INTO bakery_products (name, description, price, category, image_url)
       SELECT name, description, price, category, image_path FROM products 
       WHERE (category LIKE '%Bake%' OR category LIKE '%Cake%')
       ON DUPLICATE KEY UPDATE description=VALUES(description)
     `);
  } catch(e) { /* skip silently if tables missing */ }

  await db.end();
  console.log("🏁 Migration Complete!");
}

migrate();
