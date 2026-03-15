const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const router = express.Router();

// Use memory storage so we can pipe directly into sharp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB
  },
});

const ROOT_DIR = path.join(__dirname, "..", "..", "..");
// Save directly to the top-level public folder for Astro/Static serving
const UPLOAD_DIR = path.join(ROOT_DIR, "public", "menu-images");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

router.post(
  "/products/upload-image",
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No image file uploaded",
        });
      }

      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1e9);
      const safeName = req.file.originalname.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const baseName = `${safeName}-${timestamp}`;

      const highPath = path.join(UPLOAD_DIR, `${baseName}.webp`);

      // Use sharp to generate 1080x1080 square crops in WebP
      const image = sharp(req.file.buffer);

      await image
        .resize(1080, 1080, { fit: "cover", position: "centre" })
        .toFormat("webp", { quality: 85 })
        .toFile(highPath);

      // Return ONLY the relative path for database storage as requested
      const relativePath = `/menu-images/${baseName}.webp`;

      return res.json({
        status: "success",
        files: {
          url: relativePath,
          thumbnailUrl: relativePath, // Same for now as it's optimized
          mediumUrl: relativePath,
          highResUrl: relativePath,
        },
      });
    } catch (error) {
      console.error("Product image upload failed:", error);
      return res.status(500).json({
        status: "error",
        message: "Image upload failed",
      });
    }
  }
);

module.exports = router;

