export const prerender = false;

const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://187.124.97.144:5000";

export async function GET({ params, request }) {
    const { path } = params;
    const vpsUrl = `${hostingerUrl}/menu-images/${path}`;

    try {
        console.log(`🖼️ Proxying image request: ${vpsUrl}`);
        const response = await fetch(vpsUrl);

        if (!response.ok) {
            return new Response("Image not found", { status: 404 });
        }

        const blob = await response.blob();
        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "image/webp");
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new Response(blob, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error("Vercel Asset Proxy Error:", error);
        return new Response("Failed to fetch image", { status: 500 });
    }
}
