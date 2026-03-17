const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/follow", async (req, res) => {
    try {
        const { slug } = req.body;
        if (!slug) return res.status(400).json({ error: "Slug is required" });

        await db.query(
            "INSERT INTO followers (bakery_slug) VALUES (?)",
            [slug]
        );
        res.json({ success: true, message: "Followed successfully" });
    } catch (err) {
        console.error("Follow Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Complementary GET for follower counts
router.get("/followers/count/:slug", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT COUNT(*) as count FROM followers WHERE bakery_slug = ?",
            [req.params.slug]
        );
        res.json({ count: rows[0].count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
