export const prerender = false;

const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://187.124.97.144:5000";

export async function GET({ params, request }) {
    const { path } = params;
    const vpsUrl = `${hostingerUrl}/storage/${path}`;

    try {
        console.log(`📦 Proxying storage asset: ${vpsUrl}`);
        const response = await fetch(vpsUrl);

        if (!response.ok) {
            return new Response("Asset not found", { status: 404 });
        }

        const blob = await response.blob();
        const headers = new Headers();
        headers.set("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
        headers.set("Cache-Control", "public, max-age=31536000, immutable");

        return new Response(blob, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error("Vercel Storage Proxy Error:", error);
        return new Response("Failed to fetch asset", { status: 500 });
    }
}
