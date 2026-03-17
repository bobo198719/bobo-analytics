const express = require("express");
const db = require("../db");
const router = express.Router();
// const pushService = require("../services/notification"); // Will create this later

router.post("/broadcast", async (req, res) => {
    try {
        const { message, slug } = req.body;
        if (!slug || !message) return res.status(400).json({ error: "Slug and message are required" });

        const [followers] = await db.query(
            "SELECT * FROM followers WHERE bakery_slug = ?",
            [slug]
        );

        console.log(`📣 Broadcasting offer for ${slug}: ${message}`);
        console.log(`👥 Found ${followers.length} followers to notify.`);

        // For now, we log the broadcast. Actual push notification logic can be integrated here.
        followers.forEach(f => {
            // Mock notification send
            console.log(`[Push] Sending to follower ID ${f.id}: ${message}`);
        });

        res.json({ success: true, count: followers.length });
    } catch (err) {
        console.error("Broadcast Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
