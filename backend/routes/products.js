const express = require("express");
const db = require("../db");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/products", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM bakery_products ORDER BY created_at DESC");
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
        const [rows] = await db.query("SELECT * FROM bakery_products ORDER BY created_at DESC");
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
        const [product] = await db.query("SELECT image_url FROM bakery_products WHERE id = ?", [id]);
        await db.query("DELETE FROM bakery_products WHERE id = ?", [id]);
        
        res.json({ success: true });

        /* async image cleanup */
        setTimeout(() => {
            if (product[0]?.image_url) {
                const file = product[0].image_url.split("/").pop();
                const fullPath = path.join("/var/www/storage/bakery/images", file);
                fs.unlink(fullPath, () => {});
            }
        }, 0);
    } catch (err) {
        console.error("Delete failed:", err);
        res.status(500).json({ error: "Delete failed" });
    }
});

router.delete("/products/:id/image", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT image_path FROM products WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Product not found" });

        const imagePath = rows[0].image_path;
        if (imagePath && (imagePath.includes("/storage/") || imagePath.includes("/menu-images/"))) {
            // Extract filename from URL/Path
            const filename = path.basename(imagePath);
            let fullPath = "";
            
            if (imagePath.includes("/storage/")) {
                fullPath = path.join("/var/www/storage/bakery/images", filename);
            } else {
                fullPath = path.join(__dirname, "..", "public", "menu-images", filename);
            }

            if (fs.existsSync(fullPath)) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (e) {
                    console.warn(`Could not delete file: ${fullPath}`, e);
                }
            }
        }

        await db.query("UPDATE products SET image_path = NULL WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: "Image deleted successfully" });
    } catch (err) {
        console.error("Image Delete Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
