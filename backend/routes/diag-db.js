const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/diag-db", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, name, bakery_slug, image_url FROM bakery_products ORDER BY id DESC LIMIT 5");
        const [counts] = await db.query("SELECT COUNT(*) as total FROM bakery_products");
        res.json({ counts, samples: rows });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
