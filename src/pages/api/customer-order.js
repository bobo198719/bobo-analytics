export const prerender = false;
const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { table_id, items, special_notes, order_source = "QR" } = body;

    if (!table_id || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Missing table_id or items" }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    // Post order to backend
    const res = await fetch(`${hostingerUrl}/api/v2/restaurant/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table_id, items, special_notes, order_source, status: 'pending_waiter' })
    });

    const data = await res.json();
    if (!res.ok) {
        return new Response(JSON.stringify({ success: false, error: data.error || "Backend failed" }), {
            status: res.status, headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true, order: data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    console.error("Customer order error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
