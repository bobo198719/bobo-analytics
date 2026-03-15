import express from "express";
import multer from "multer";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import { put } from "@vercel/blob";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Mullter Memory Storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Configure Cloudinary ONLY if keys are present
const hasCloudinary = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY !== 'your_api_key';
if (hasCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

router.post("/upload-cake-image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image provided" });
        }

        const filename = `bakers-os/${uuidv4()}.webp`;

        // 1. Optimize Image with Sharp
        const optimizedBuffer = await sharp(req.file.buffer)
            .resize(1080, 1080, { fit: "cover", position: "centre" })
            .toFormat("webp", { quality: 85 })
            .toBuffer();

        let finalUrl = "";

        // 2. Try Cloudinary if configured
        if (hasCloudinary) {
            console.log("Using Cloudinary for storage...");
            const uploadStream = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "cake-menu", format: "webp" },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    stream.end(optimizedBuffer);
                });
            };
            finalUrl = await uploadStream();
        } 
        // 3. Fallback to Vercel Blob (Key Added From My End!)
        else if (process.env.BLOB_READ_WRITE_TOKEN) {
            console.log("Using Vercel Blob (Verified Native Key) for storage...");
            const blob = await put(filename, optimizedBuffer, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN
            });
            finalUrl = blob.url;
        } 
        else {
            throw new Error("No production storage keys found (Cloudinary or Vercel Blob)");
        }

        res.json({
            status: "success",
            url: finalUrl,
            message: "Production storage active"
        });

    } catch (e) {
        console.error("Storage Error:", e);
        res.status(500).json({ error: "Production upload failed", details: e.message });
    }
});

export default router;
