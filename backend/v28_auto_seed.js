const { Pool } = require('./node_modules/pg');

const pool = new Pool({
  host: 'srv1449576.hstgr.cloud',
  user: 'bobo',
  password: 'Princy@20201987',
  database: 'restaurant_crm',
  port: 5432
});

async function seed() {
  console.log("BOBO AI | AUTO-PROVISIONING FLOOR...");
  try {
    const client = await pool.connect();
    console.log("Connected to Postgre.");
    
    await client.query(`
        INSERT INTO tables (table_number, status) VALUES 
        ('01', 'available'),
        ('02', 'available'),
        ('03', 'available'),
        ('04', 'available'),
        ('05', 'available')
        ON CONFLICT (table_number) DO NOTHING
    `);
    
    console.log("✅ SUCCESS! 5 Nodes Provisioned in Database.");
    client.release();
  } catch (err) {
    console.error("❌ FAILED:", err.message);
  } finally {
    await pool.end();
  }
}

seed();
