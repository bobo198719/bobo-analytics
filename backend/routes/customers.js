const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/add", async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        await db.query(
            "INSERT INTO customers (customer_name, phone, email, address) VALUES (?, ?, ?, ?)",
            [name, phone || "", email || "", address || ""]
        );
        res.json({ success: true, message: "Customer/Lead added" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM customers ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
