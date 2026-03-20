const { Client } = require('pg');
const client = new Client({
  host: 'srv1449576.hstgr.cloud',
  user: 'bobo',
  password: 'Princy@20201987',
  database: 'restaurant_crm',
  port: 5432
});

async function repair() {
  try {
    console.log("Connecting to remote Postgre...");
    await client.connect();
    console.log("Connected! Running Repair...");
    await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT');
    console.log("✅ SUCCESS! Table Repaired Directly on Hostinger.");
  } catch (err) {
    console.error("❌ FAILED:", err.message);
  } finally {
    await client.end();
  }
}
repair();
