import { put } from "@vercel/blob";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";

/**
 * NATIVE ASTRO API ROUTE: Image Upload System
 * Production-ready with Sharp optimization and Vercel Blob/Cloudinary storage.
 */
export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return new Response(JSON.stringify({ error: "No image file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 1. Optimize image (1080x1080, WebP, 85% quality)
    const optimizedBuffer = await sharp(buffer)
      .resize(1080, 1080, { fit: "cover", position: "centre" })
      .toFormat("webp", { quality: 85 })
      .toBuffer();

    let finalUrl = "";
    
    // Cloudinary Config (Check if real keys exist in ENV)
    const canCloudinary = process.env.CLOUDINARY_API_KEY && 
                          process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
                          process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

    if (canCloudinary) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "cake-menu" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(optimizedBuffer);
      });
      finalUrl = uploadResult;
    } 
    // Fallback to Vercel Blob (Using the key I retrieved earlier)
    else if (process.env.BLOB_READ_WRITE_TOKEN) {
      const filename = `bakers-os/${Date.now()}.webp`;
      const blob = await put(filename, optimizedBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      finalUrl = blob.url;
    } 
    else {
      throw new Error("No production-quality storage credentials found (Cloudinary/Vercel Blob)");
    }

    return new Response(JSON.stringify({
      status: "success",
      url: finalUrl,
      image_url: finalUrl, // Keep compatibility with products.astro
      files: { url: finalUrl, thumbnailUrl: finalUrl }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Native Upload Error:", error);
    return new Response(JSON.stringify({
      status: "error",
      message: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
