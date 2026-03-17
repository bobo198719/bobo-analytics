const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/bakery/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        // Search in users table first
        const [users] = await db.query(
            "SELECT business_name as name, bakery_slug as slug, bakery_upi as upi, industry FROM users WHERE bakery_slug = ?",
            [slug]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: "Bakery not found" });
        }

        const bakery = users[0];
        
        // Mock additional data if not in DB yet (location, logo, phone)
        // In a real app, these would be in the users or site_settings table
        const profileResponse = {
            name: bakery.name,
            slug: bakery.slug,
            upi: bakery.upi || "bobo@upi",
            location: "Gurgaon", // Default fallback
            logo: "/bakers-logo.png",
            phone: "9876543210"
        };

        res.json(profileResponse);
    } catch (err) {
        console.error("Bakery Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
