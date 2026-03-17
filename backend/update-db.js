const db = require('./db');

async function fix() {
    try {
        console.log('--- DB UPDATE START ---');
        
        // 1. Add location column
        try {
            await db.query("ALTER TABLE users ADD COLUMN location VARCHAR(255) DEFAULT 'Mumbai Vasai West'");
            console.log("✅ Column 'location' added to users table.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ Column 'location' already exists.");
            } else {
                console.error("❌ Alter Error:", e.message);
            }
        }

        // 2. Update specific location
        await db.query("UPDATE users SET location = 'Mumbai Vasai West' WHERE bakery_slug = 'trivia-bakes'");
        console.log("✅ Location updated for trivia-bakes.");

        console.log('--- DB UPDATE END ---');
        process.exit(0);
    } catch (err) {
        console.error("🚨 GLOBAL ERROR:", err);
        process.exit(1);
    }
}

fix();
