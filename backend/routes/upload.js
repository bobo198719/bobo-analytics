const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const db = require("../db");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-product", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        const id = uuidv4();
        const filename = `cake-${id}.webp`;
        
        // Save to internal public folder within backend
        const uploadDir = path.join(__dirname, "..", "public", "menu-images");
        const filepath = path.join(uploadDir, filename);

        await sharp(req.file.buffer)
            .resize(1080, 1080, { fit: "cover", position: "centre" })
            .webp({ quality: 85 })
            .toFile(filepath);

        const imagePath = `/menu-images/${filename}`;

        const [result] = await db.query(
            "INSERT INTO products (name, description, price, category, image_path) VALUES (?, ?, ?, ?, ?)",
            [
                req.body.name || "Unnamed Bake",
                req.body.description || req.body.desc || "",
                Number(req.body.price) || 0,
                req.body.category || req.body.cat || "General",
                imagePath
            ]
        );

        res.json({ 
            success: true, 
            image: imagePath,
            productId: result.insertId 
        });

    } catch (error) {
        console.error("MySQL Upload Error:", error);
        res.status(500).json({ error: "Upload failed", details: error.message });
    }
});

module.exports = router;
