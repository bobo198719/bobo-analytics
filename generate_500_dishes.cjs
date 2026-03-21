const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgresql://bobo:Princy%4020201987@srv1449576.hstgr.cloud:5432/restaurant_crm?sslmode=no-verify",
    min: 0,
    max: 10
});

async function run() {
    try {
        const { rows } = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'menu_items';");
        console.log(rows);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

run();
