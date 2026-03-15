import sharp from "sharp";

export async function GET() {
  try {
    const version = sharp.versions;
    return new Response(JSON.stringify({ status: "ok", sharp: version }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ status: "error", message: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
