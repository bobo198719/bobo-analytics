const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  console.log("BOBO OS | SEEDING SAAS TELEMETRY...");

  try {
    // 1. Seed Leads
    await db.query(`
      INSERT INTO leads (business_name, owner_name, phone, email, industry, city, status) 
      VALUES 
      ('The Golden Crust', 'Rahul Sharma', '9876543210', 'rahul@goldencrust.com', 'Bakery', 'Mumbai', 'pending'),
      ('Healthy Bites', 'Priya Gupta', '9123456780', 'priya@healthybites.in', 'Restaurant', 'Delhi', 'pending'),
      ('Tech Pharmacy', 'Arun Varma', '9988776655', 'arun@techpharma.com', 'Pharmacy', 'Bangalore', 'pending'),
      ('Urban Retail', 'Sanjay Mehra', '9001122334', 'sanjay@urbanretail.com', 'Retail', 'Pune', 'provisioned')
    `);

    // 2. Seed Activity Logs
    await db.query(`
      INSERT INTO activity_logs (message, type) 
      VALUES 
      ('New lead registered from Mumbai: The Golden Crust', 'signup'),
      ('Infrastructure provisioned for Urban Retail', 'provisioning'),
      ('Payment received from BakeHouse #241', 'payment'),
      ('System maintenance completed for Node-Delhi-4', 'system')
    `);

    // 3. Seed Alerts
    await db.query(`
      INSERT INTO alerts (message, severity) 
      VALUES 
      ('High latency detected in Mumbai-2 sector', 'warning'),
      ('Unauthorized access attempt blocked from IP 192.168.1.1', 'critical'),
      ('New lead queue exceeding threshold (limit 10)', 'info')
    `);

    // 4. Seed some sample saas_users if empty
    const [users] = await db.query("SELECT COUNT(*) as count FROM saas_users");
    if (users[0].count < 2) {
      await db.query(`
        INSERT INTO saas_users (business_name, owner_name, username, email, phone, industry, password_hash, plain_password, status, amount_paid)
        VALUES 
        ('BakeMaster Pro', 'John Doe', 'bakemaster', 'john@bakemaster.com', '1234567890', 'Bakery', '$2b$10$X.X.X', 'password123', 'active', 4999),
        ('RestoFlow HQ', 'Jane Smith', 'restoflow', 'jane@restoflow.com', '0987654321', 'Restaurant', '$2b$10$X.X.X', 'password123', 'active', 0)
      `);
    }

    console.log("✅ SUCCESS! SaaS Telemetry seeded successfully.");
  } catch (err) {
    console.error("❌ FAILED:", err.message);
  } finally {
    await db.end();
  }
}

seed();
