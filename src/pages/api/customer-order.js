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

    // 🟢 PRIMARY ATTEMPT
    let res = await fetch(`${hostingerUrl}/api/v2/restaurant/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        table_id, 
        items, 
        special_notes: special_notes || "", 
        order_source, 
        status: 'pending_waiter' 
      })
    });

    let data = await res.json();

    // 🔴 HEALING LAYER: If primary fail, retry without complex fields
    if (res.status !== 200) {
        console.warn("Retrying order in simple mode...");
        const healRes = await fetch(`${hostingerUrl}/api/v2/restaurant/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                table_id, 
                items, 
                order_source, 
                status: 'pending_waiter' 
            })
        });
        
        if (healRes.ok) {
            data = await healRes.json();
            res = healRes;
        }
    }

    if (!res.ok) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: data.error || "Backend failed",
            debug_v: "v9-healing-active" 
        }), {
            status: res.status, headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true, order: data, debug_v: "v9-healing-active" }), {
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
