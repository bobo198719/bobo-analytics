const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// 1. Permanent Storage Configuration
const STORAGE_DIR = "/var/www/storage/bakery/images";
if (!fs.existsSync(STORAGE_DIR)) {
    try {
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
        console.log("📁 Created permanent storage:", STORAGE_DIR);
    } catch (err) {
        console.warn("⚠️ Local environment check: Could not create Linux-style path, falling back to local public folder.");
    }
}

// 2. Multer Configuration (Memory storage for processing with Sharp)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB Limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Invalid format. Supported: JPG, PNG, WEBP."));
        }
    }
});

// 3. Optimized Upload Endpoint
router.post("/upload-product-image", (req, res) => {
    upload.single("image")(req, res, async (err) => {
        // Handle Multer errors (Size, Format)
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
            }
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No image provided" });
        }

        try {
            const id = uuidv4();
            const filename = `${id}.webp`;
            
            // Check if we are on VPS or Local
            const isVPS = fs.existsSync("/var/www/storage/bakery");
            const targetDir = isVPS ? STORAGE_DIR : path.join(__dirname, "..", "public", "menu-images");
            const filepath = path.join(targetDir, filename);

            console.log(`🛠️ Optimizing: ${req.file.originalname} -> ${filename}`);

            // Resize (1200px width), Convert to WebP, Maintain Quality
            await sharp(req.file.buffer)
                .resize(1200, null, { // 1200px width, auto height
                    withoutEnlargement: true,
                    fit: "inside"
                })
                .webp({ quality: 85, effort: 3 })
                .toFile(filepath);

            const publicUrl = isVPS 
                ? `https://srv1449576.hstgr.cloud/storage/bakery/images/${filename}`
                : `/menu-images/${filename}`;

            res.setHeader('Connection', 'close'); // Prevent timeout hang
            res.json({
                success: true,
                url: publicUrl,
                filename: filename
            });

        } catch (error) {
            console.error("💥 Image Processing Crash:", error);
            res.status(500).json({ error: "Image processing failed", details: error.message });
        }
    });
});

module.exports = router;
