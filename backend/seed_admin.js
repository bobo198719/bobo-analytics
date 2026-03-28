const db = require("./db");
const bcrypt = require("bcrypt");

async function seedAdmin() {
    try {
        const username = "admin@bobo.com";
        const password = "password123";
        const hash = await bcrypt.hash(password, 10);
        
        await db.query(`
            INSERT INTO admin_users (username, password_hash, industry, role, status)
            VALUES (?, ?, 'admin', 'superadmin', 'active')
            ON DUPLICATE KEY UPDATE password_hash = ?
        `, [username, hash, hash]);
        
        console.log("✅ Admin user seeded: admin@bobo.com / password123");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding admin:", err.message);
        process.exit(1);
    }
}

seedAdmin();
