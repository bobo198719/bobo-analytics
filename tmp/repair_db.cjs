const mysql = require("mysql2/promise");

// Config hardcoded since local run has trouble finding backend node_modules
const dbConfig = {
    host: 'srv1449576.hstgr.cloud',
    user: 'bobo_admin',
    password: 'BoboPass2026!',
    database: 'bobo_analytics',
    port: 3306
};

async function repair() {
    console.log("🛠 Starting Bobo Analytics Database Repair...");
    
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("✅ Connected to database.");

        // 1. Repair Product Image Paths
        console.log("🔄 Checking product image paths...");
        const [products] = await connection.execute("SELECT id, name, image_path FROM products");
        
        for (const product of products) {
            let path = product.image_path;
            if (path && (path.includes("http://") || path.includes("https://"))) {
                // Extract only the part after /storage/
                const storageIndex = path.indexOf("/storage/");
                if (storageIndex !== -1) {
                    const newPath = path.substring(storageIndex);
                    if (newPath !== path) {
                        console.log(`📏 Repairing path for product "${product.name}" (ID: ${product.id}): ${path} -> ${newPath}`);
                        await connection.execute("UPDATE products SET image_path = ? WHERE id = ?", [newPath, product.id]);
                    }
                }
            }
        }

        // 2. Ensure default_baker settings exist
        console.log("🔄 Checking site settings for 'default_baker'...");
        const [settings] = await connection.execute("SELECT id FROM site_settings WHERE tenant_id = 'default_baker'");
        
        if (settings.length === 0) {
            console.log("📝 Creating default settings for 'default_baker'...");
            const defaultSettings = {
                bizName: "Trivia Bakes",
                bizLogo: "/bakers-logo.png",
                heroTitle: "Handcrafted <span class=\"accent-text\">Delights</span> for Every Moment",
                heroSubtitle: "Premium cakes and pastries baked with love and delivered to your doorstep.",
                contactPhone: "+91 73870 21958",
                contactAddress: "Available for Collection & Delivery",
                aboutTitle: "Our Baking Story",
                aboutP1: "We believe in using only the finest ingredients to create unforgettable sweet experiences."
            };
            await connection.execute(
                "INSERT INTO site_settings (tenant_id, settings) VALUES (?, ?)",
                ['default_baker', JSON.stringify(defaultSettings)]
            );
        } else {
            console.log("✅ 'default_baker' settings already exist.");
        }

        console.log("🎊 Database repair completed successfully!");

    } catch (err) {
        console.error("❌ Repair failed:", err);
    } finally {
        if (connection) await connection.end();
    }
}

repair();
