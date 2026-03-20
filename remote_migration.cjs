const { Client } = require('pg');

async function repair() {
  const client = new Client({
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo',
    password: 'Princy@20201987',
    database: 'restaurant_crm',
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to Hostinger DB!");
    await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT');
    console.log("Migration Successful: special_notes added.");
  } catch (err) {
    console.error("Migration Failed:", err.message);
    console.log("Retrying without SSL...");
    // Retry without SSL if needed
    const clientNoSsl = new Client({
      host: 'srv1449576.hstgr.cloud',
      user: 'bobo',
      password: 'Princy@20201987',
      database: 'restaurant_crm',
      port: 5432
    });
    try {
      await clientNoSsl.connect();
      await clientNoSsl.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT');
      console.log("Migration Successful (No SSL)!");
    } catch(e) {
      console.error("Final Migration Attempt Failed:", e.message);
    }
  } finally {
    process.exit(0);
  }
}

repair();
