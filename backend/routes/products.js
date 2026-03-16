const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/products", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM products ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Complementary single product fetch
router.get("/products/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Handle both / and /products depending on how it's mounted
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM products ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post(["/", "/products"], async (req, res) => {
    try {
        const { id, name, price, desc, description, cat, category, image_path, image_url } = req.body;
        const finalName = name || "";
        const finalDesc = description || desc || "";
        const finalPrice = Number(price) || 0;
        const finalCat = category || cat || "General";
        const finalImg = image_path || image_url || "";

        if (id && String(id).startsWith && !String(id).startsWith('bulk_')) {
            // Update
            await db.query(
                "UPDATE products SET name=?, description=?, price=?, category=?, image_path=? WHERE id=?",
                [finalName, finalDesc, finalPrice, finalCat, finalImg, id]
            );
            res.json({ success: true, message: "Product updated" });
        } else {
            // Insert
            const [result] = await db.query(
                "INSERT INTO products (name, description, price, category, image_path) VALUES (?, ?, ?, ?, ?)",
                [finalName, finalDesc, finalPrice, finalCat, finalImg]
            );
            res.json({ success: true, id: result.insertId });
        }
    } catch (err) {
        console.error("Product Save Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.delete(["/:id", "/products/:id"], async (req, res) => {
    try {
        await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
