const mysql = require("mysql2/promise");
require("dotenv").config();

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  console.log("🚀 Starting Migration...");

  // Add initial users for each industry
  const initialUsers = [
    { username: "pharmacy_admin", password: "password123", business_name: "City Pharmacy", industry: "pharmacy", plan: "enterprise" },
    { username: "health_admin", password: "password123", business_name: "Apollo Hospital", industry: "healthcare", plan: "pro" },
    { username: "retail_admin", password: "password123", business_name: "Big Bazaar", industry: "retail", plan: "enterprise" },
    { username: "baker_admin", password: "password123", business_name: "Trivia Bakes", industry: "bakers", plan: "pro" },
    { username: "cloth_admin", password: "BOBO_9FPOZI", business_name: "Fashion Hub", industry: "fashion", plan: "enterprise" }
  ];

  for (const user of initialUsers) {
    try {
      await db.execute(
        "INSERT INTO users (username, password, business_name, industry, plan) VALUES (?, ?, ?, ?, ?)",
        [user.username, user.password, user.business_name, user.industry, user.plan]
      );
      console.log(`✅ Created user: ${user.username}`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`⏭️ User ${user.username} already exists, skipping.`);
      } else {
        console.error(`❌ Error creating user ${user.username}:`, err.message);
      }
    }
  }

  await db.end();

  // Seed Medicine Master
  const db2 = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  const medicineData = require("./medicineMaster.json");
  console.log("💊 Seeding Medicine Master...");

  for (const med of medicineData.medicines) {
    try {
      await db2.execute(
        "INSERT INTO medicine_master (barcode, name, mrp, purchase_price, gst, category, manufacturer) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [med.barcode, med.name, med.mrp, med.purchasePrice, med.gst, med.category, med.manufacturer]
      );
      console.log(`✅ Seeded medicine: ${med.name}`);
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log(`⏭️ Medicine ${med.name} already exists, skipping.`);
      } else {
        console.error(`❌ Error seeding medicine ${med.name}:`, err.message);
      }
    }
  }

  await db2.end();
  console.log("🏁 Migration Complete!");
}

migrate();

