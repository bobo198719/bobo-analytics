const mysql = require("mysql2/promise");
require("dotenv").config({ path: "c:/Users/c9518/OneDrive/Desktop/bobo-analytics/backend/.env" });

async function init() {
  try {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
    });
    console.log("Connected.");
    
    const tenants = ['default', 'default_baker', 'www'];
    
    for (const t of tenants) {
        console.log(`Checking tenant: ${t}`);
        const [rows] = await db.query("SELECT * FROM site_settings WHERE tenant_id = ?", [t]);
        if (rows.length === 0) {
            console.log(`Inserting empty settings for ${t}...`);
            await db.query("INSERT INTO site_settings (tenant_id, settings) VALUES (?, ?)", [t, JSON.stringify({})]);
        } else {
            console.log(`Tenant ${t} already exists.`);
        }
    }
    
    await db.end();
    console.log("Done.");
  } catch (err) {
    console.error("Error:", err.message);
  }
}
init();
