import { put } from "@vercel/blob";

export const prerender = false;

// Optimization: This dedicated handler bypasses the catch-all proxy for maximum performance.
// Since the client (products.astro) already optimizes the image to WebP/1080px,
// we just need to securely relay it to the VPS or fallback storage.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
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
    let finalUrl = "";
    
    // 1. Upload to Hostinger VPS (Primary)
    // We attempt to send it directly to the VPS for permanent storage.
    const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";
    if (hostingerUrl) {
      try {
        const hFormData = new FormData();
        const blob = new Blob([buffer], { type: 'image/webp' });
        hFormData.append('image', blob, 'bake.webp');
        
        // Timeout set to 30s to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const hResponse = await fetch(`${hostingerUrl}/api/upload-product-image`, {
          method: 'POST',
          body: hFormData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (hResponse.ok) {
          const hResult = await hResponse.json();
          finalUrl = hResult.url || hResult.image || (hResult.filename ? `${hostingerUrl}/menu-images/${hResult.filename}` : "");
        } else {
          console.warn("VPS Upload Status:", hResponse.status);
        }
      } catch (hError) {
        console.warn("VPS connection failed or timed out. Falling back to edge storage.");
      }
    }

    // 2. Fallback to Vercel Blob (Ultra-fast Edge Storage)
    if (!finalUrl && process.env.BLOB_READ_WRITE_TOKEN) {
      const filename = `bakers-os/${Date.now()}.webp`;
      const blob = await put(filename, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      finalUrl = blob.url;
    } 

    if (!finalUrl) {
      throw new Error("Unable to save image to any storage provider.");
    }

    return new Response(JSON.stringify({ url: finalUrl, success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("Critical Upload Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}
