const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/bakery/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        // Search in users table first
        const [users] = await db.query(
            "SELECT business_name as name, bakery_slug as slug, bakery_upi as upi, industry, phone, location FROM users WHERE bakery_slug = ?",
            [slug]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: "Bakery not found" });
        }

        const bakery = users[0];
        
        // Fetch real settings (UPI, etc) from site_settings (legacy/override)
        const [settingsRows] = await db.query("SELECT settings FROM site_settings WHERE tenant_id = ?", [slug]);
        let settings = {};
        if (settingsRows.length > 0) {
            settings = typeof settingsRows[0].settings === 'string' ? JSON.parse(settingsRows[0].settings) : settingsRows[0].settings;
        }
        
        const profileResponse = {
            name: bakery.name,
            slug: bakery.slug,
            upi: settings.upi || bakery.upi || "9354056262@ybl",
            location: settings.location || bakery.location || "Mumbai Vasai West", 
            logo: settings.logo || "/bakers-logo.png",
            phone: settings.phone || bakery.phone || "7387021958"
        };

        res.json(profileResponse);
    } catch (err) {
        console.error("Bakery Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
