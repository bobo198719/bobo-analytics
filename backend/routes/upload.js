const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// 1. Permanent Storage Configuration
const STORAGE_DIR = "/var/www/storage/bakery/images";
const TEMP_DIR = path.join(__dirname, "..", "tmp");

// Ensure directories exist
[STORAGE_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (err) {
            console.warn(`⚠️ Could not create directory ${dir}, might be local env.`);
        }
    }
});

// 2. Multer Configuration (Disk storage for streaming)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isVPS = fs.existsSync("/var/www/storage/bakery");
        cb(null, isVPS ? STORAGE_DIR : path.join(__dirname, "..", "public", "menu-images"));
    },
    filename: (req, file, cb) => {
        const id = uuidv4();
        cb(null, `${id}-original${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB Limit per task
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
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ error: "File too large. Maximum size is 5MB." });
            }
            return res.status(400).json({ error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "No image provided" });
        }

        const originalPath = req.file.path;
        const id = uuidv4();
        const filename = `${id}.webp`;
        const targetDir = path.dirname(originalPath);
        const targetPath = path.join(targetDir, filename);

        try {
            const isWebP = req.file.mimetype === 'image/webp';
            const sizeInKb = req.file.size / 1024;

            // If it's already WebP and reasonably sized (under 500KB), just move it
            if (isWebP && sizeInKb < 500) {
                fs.renameSync(originalPath, targetPath);
            } else {
                // High-speed optimization with Sharp
                await sharp(originalPath)
                    .resize(1200, null, { 
                        withoutEnlargement: true,
                        fit: "inside"
                    })
                    .webp({ quality: 80, effort: 2 })
                    .toFile(targetPath);
                
                // Clean up original file
                if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
            }

            const isVPS = fs.existsSync("/var/www/storage/bakery");
            const publicUrl = isVPS 
                ? `https://srv1449576.hstgr.cloud/storage/bakery/images/${filename}`
                : `/menu-images/${filename}`;

            res.json({
                success: true,
                url: publicUrl,
                filename: filename
            });

        } catch (error) {
            console.error("💥 Image Processing Crash:", error);
            if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
            res.status(500).json({ error: "Image processing failed", details: error.message });
        }
    });
});

module.exports = router;
