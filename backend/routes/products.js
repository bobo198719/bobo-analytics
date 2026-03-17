const express = require("express");
const db = require("../db");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/products", async (req, res) => {
    try {
        const { slug } = req.query;
        let query = "SELECT * FROM bakery_products";
        let params = [];
        
        if (slug) {
            query += " WHERE bakery_slug = ?";
            params.push(slug);
        }
        
        query += " ORDER BY created_at DESC";
        
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Complementary single product fetch
router.get("/products/:id", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM bakery_products WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Product not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Handle both / and /products depending on how it's mounted
router.get("/", async (req, res) => {
    try {
        const { slug } = req.query;
        let query = "SELECT * FROM bakery_products";
        let params = [];
        
        if (slug) {
            query += " WHERE bakery_slug = ?";
            params.push(slug);
        }
        
        query += " ORDER BY created_at DESC";
        
        const [rows] = await db.query(query, params);
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
                "UPDATE bakery_products SET name=?, description=?, price=?, category=?, image_url=? WHERE id=?",
                [finalName, finalDesc, finalPrice, finalCat, finalImg, id]
            );
            res.json({ success: true, message: "Product updated" });
        } else {
            // Insert
            const [result] = await db.query(
                "INSERT INTO bakery_products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)",
                [finalName, finalDesc, finalPrice, finalCat, finalImg]
            );
            res.json({ success: true, id: result.insertId });
        }
    } catch (err) {
        console.error("Product Save Error:", err);
        res.status(500).json({ error: err.message });
    }
});

router.delete("/products/:id", async (req, res) => {
    const id = req.params.id;
    try {
        // 1. Get product info safely
        const [rows] = await db.query("SELECT image_url FROM bakery_products WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ error: "Product not found" });

        const image_url = rows[0].image_url;

        // 2. Delete from DB
        await db.query("DELETE FROM bakery_products WHERE id = ?", [id]);
        
        res.json({ success: true, message: "Product deleted safely" });

        /* 3. async image cleanup (Safely) */
        if (image_url) {
            setTimeout(() => {
                try {
                    const filename = image_url.split("/").pop();
                    if (filename && filename !== 'cake-placeholder.png') {
                        const fullPath = path.join("/var/www/storage/bakery/images", filename);
                        if (fs.existsSync(fullPath)) {
                            fs.unlink(fullPath, (err) => {
                                if (err) console.error(`Failed to unlink ${fullPath}:`, err);
                            });
                        }
                    }
                } catch (e) {
                    console.error("Background cleanup error:", e);
                }
            }, 0);
        }
    } catch (err) {
        console.error("Delete failed:", err);
        res.status(500).json({ error: "Delete failed" });
    }
});

router.delete("/products/:id/image", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT image_url FROM bakery_products WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Product not found" });

        const imageUrl = rows[0].image_url;
        if (imageUrl && imageUrl.includes("/storage/")) {
            const filename = path.basename(imageUrl);
            const fullPath = path.join("/var/www/storage/bakery/images", filename);

            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (e) {
                    console.warn(`Could not delete file: ${fullPath}`, e);
                }
            }
        }

        await db.query("UPDATE bakery_products SET image_url = NULL WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: "Image deleted successfully" });
    } catch (err) {
        console.error("Image Delete Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
