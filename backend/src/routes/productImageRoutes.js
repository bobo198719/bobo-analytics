const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { v2: cloudinary } = require("cloudinary");
const { put } = require("@vercel/blob");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Use memory storage for Buffer processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// Configure Cloudinary only if real keys are provided
const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// THE NEW PRODUCTION-GRADE ROUTE
// Matches the Astro page call to /api/upload-cake-image
router.post("/upload-cake-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No image file uploaded" });
    }

    // 1. Optimize for 1080x1080 WebP
    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(1080, 1080, { fit: "cover", position: "centre" })
      .toFormat("webp", { quality: 85 })
      .toBuffer();

    let finalUrl = "";
    const filename = `bakers-os/${Date.now()}.webp`;

    // 2. Storage Strategy
    if (hasCloudinary) {
      // Use Cloudinary
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cake-menu" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          stream.end(optimizedBuffer);
        });
      };
      finalUrl = await uploadStream();
    } else if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Use Vercel Blob (Verified Workaround for live storage)
      const blob = await put(filename, optimizedBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      finalUrl = blob.url;
    } else {
      // Local Fallback (Only works for non-Vercel environments)
      const ROOT_DIR = path.join(__dirname, "..", "..", "..");
      const UPLOAD_DIR = path.join(ROOT_DIR, "public", "menu-images");
      if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      const localFilename = `${Date.now()}.webp`;
      fs.writeFileSync(path.join(UPLOAD_DIR, localFilename), optimizedBuffer);
      finalUrl = `/menu-images/${localFilename}`;
    }

    return res.json({
      status: "success",
      url: finalUrl,
      files: { url: finalUrl, thumbnailUrl: finalUrl }
    });

  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
