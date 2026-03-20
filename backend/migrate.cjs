const { Pool } = require('pg');
const pool = new Pool({
  host: 'srv1449576.hstgr.cloud',
  user: 'bobo',
  password: 'Princy@20201987',
  database: 'restaurant_crm',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

console.log("Starting Migration...");
pool.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS special_notes TEXT')
  .then(() => { 
    console.log("Migration SUCCESS: Column added."); 
    process.exit(0); 
  })
  .catch(e => { 
    console.log("Migration Result:", e.message); 
    process.exit(0); 
  });
