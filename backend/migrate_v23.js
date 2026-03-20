// V23 - DATABASE RECOVERY ENGINE
const { Pool } = require('./node_modules/pg');

const pool = new Pool({
  host: 'srv1449576.hstgr.cloud',
  user: 'bobo',
  password: 'Princy@20201987',
  database: 'restaurant_crm',
  port: 5432
});

async function run() {
  console.log("-----------------------------------------");
  console.log("BOBO AI | DATABASE RECOVERY COMMENCING");
  console.log("-----------------------------------------");
  try {
    console.log("📡 Connecting to Hostinger Postgre...");
    const client = await pool.connect();
    console.log("✅ Connection Established.");

    console.log("🛠️ Repairing Table: orders...");
    await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT');
    console.log("✅ SUCCESS: special_notes column exists.");

    console.log("-----------------------------------------");
    console.log("DATABASE IS NOW FULLY COMPATIBLE.");
    console.log("-----------------------------------------");
    client.release();
  } catch (err) {
    console.error("❌ REPAIR FAILED:", err.message);
    console.log("\nTIP: If it says 'Connection Timeout', her Hostinger DB is not open to external IPs.");
  } finally {
    await pool.end();
  }
}

run();
