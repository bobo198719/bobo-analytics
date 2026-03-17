const db = require('./db');

async function fix() {
    try {
        console.log('--- DB UPDATE START ---');
        
        // 1. Alter table
        try {
            await db.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) DEFAULT '7387021958'");
            console.log("✅ Column 'phone' added to users table.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ Column 'phone' already exists.");
            } else {
                console.error("❌ Alter Error:", e.message);
            }
        }

        // 2. Update specific number
        await db.query("UPDATE users SET phone = '7387021958' WHERE bakery_slug = 'trivia-bakes'");
        console.log("✅ Number updated for trivia-bakes.");

        console.log('--- DB UPDATE END ---');
        process.exit(0);
    } catch (err) {
        console.error("🚨 GLOBAL ERROR:", err);
        process.exit(1);
    }
}

fix();
