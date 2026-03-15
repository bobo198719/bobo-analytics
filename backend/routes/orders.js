const express = require("express");
const db = require("../db");

const router = express.Router();

router.post("/create-order", async (req, res) => {
    try {
        const { customer_name, phone, products, amount, payment_method } = req.body;
        
        await db.query(
            "INSERT INTO orders (customer_name, phone, products, amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)",
            [
                customer_name,
                phone,
                JSON.stringify(products),
                amount,
                payment_method,
                "pending"
            ]
        );

        res.json({ success: true });
    } catch (err) {
        console.error("MySQL Order Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Standard Route for compatibility with frontend fetch('/api/orders')
router.post("/", async (req, res) => {
    try {
        const { customer_name, phone, products, amount, payment_method, status } = req.body;
        
        const [result] = await db.query(
            "INSERT INTO orders (customer_name, phone, products, amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)",
            [
                customer_name,
                phone,
                JSON.stringify(products),
                amount,
                payment_method,
                status || "pending"
            ]
        );

        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/orders", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM orders ORDER BY created_at DESC");
        // Parse JSON products before sending
        const parsedRows = rows.map(row => ({
            ...row,
            products: typeof row.products === 'string' ? JSON.parse(row.products) : row.products
        }));
        res.json(parsedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM orders ORDER BY created_at DESC");
        const parsedRows = rows.map(row => ({
            ...row,
            products: typeof row.products === 'string' ? JSON.parse(row.products) : row.products
        }));
        res.json(parsedRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/", async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "Order ID required" });
        await db.query("DELETE FROM orders WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
