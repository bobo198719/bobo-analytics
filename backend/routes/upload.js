const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const Product = require("../models/Product");

const router = express.Router();

// Use memory storage for sharp processing
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload-product", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file provided" });
        }

        const id = uuidv4();
        const filename = `cake-${id}.webp`;
        // Save to public directory for immediate access
        const outputPath = path.join(process.cwd(), "..", "public", "menu-images", filename);

        await sharp(req.file.buffer)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toFile(outputPath);

        const imagePath = `/menu-images/${filename}`;

        // Create initial product entry or return the path for frontend to handle
        // The user's template suggests creating the product here
        const productData = {
            id: `P-${id.substring(0, 8).toUpperCase()}`,
            name: req.body.name || "Unnamed Bake",
            description: req.body.description || req.body.desc || "",
            price: Number(req.body.price) || 0,
            category: req.body.category || req.body.cat || "General",
            image_path: imagePath,
            image_url: imagePath,
            thumbnail_url: imagePath,
            medium_url: imagePath,
            high_res_url: imagePath,
            status: "approved"
        };

        const product = await Product.create(productData);
        res.status(201).json({ success: true, product });

    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Image processing failed", details: error.message });
    }
});

module.exports = router;
