import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { put } from "@vercel/blob";

export const prerender = false;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return new Response(JSON.stringify({ status: "active", engine: "Astro/Vercel" }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return new Response(JSON.stringify({ error: "No image provided" }), { 
        status: 400, headers: corsHeaders 
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 1. Optimize image (1080x1080, WebP, 85% quality)
    let optimizedBuffer = buffer;
    try {
      optimizedBuffer = await sharp(buffer)
        .resize(1080, 1080, { fit: "cover", position: "centre" })
        .toFormat("webp", { quality: 85 })
        .toBuffer();
    } catch (sharpError) {
      console.warn("Sharp optimization failed, using original buffer:", sharpError);
    }

    let finalUrl = "";
    
    // 2. Upload to Cloudinary if keys exist
    const canCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                         process.env.CLOUDINARY_API_KEY && 
                         !process.env.CLOUDINARY_API_KEY.includes('your_');

    if (canCloudinary) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "bakers-os", format: "webp" },
          (error, res) => error ? reject(error) : resolve(res)
        ).end(optimizedBuffer);
      });
      finalUrl = result.secure_url || result.url;
    } 
    // 3. Fallback to Vercel Blob
    else if (process.env.BLOB_READ_WRITE_TOKEN) {
      const filename = `bakers-os/${Date.now()}.webp`;
      const blob = await put(filename, optimizedBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      finalUrl = blob.url;
    } 
    else {
      throw new Error("No production-quality storage credentials found");
    }

    return new Response(JSON.stringify({ url: finalUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("Upload error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
