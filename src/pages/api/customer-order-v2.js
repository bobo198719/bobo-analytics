export const prerender = false;
const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || "http://srv1449576.hstgr.cloud:5000";

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { table_id, items, special_notes, order_source = "QR" } = body;

    // 🟢 HIGH-COMPATIBILITY RELOCATION
    // Instead of using 'special_notes' which is broken on the database,
    // we attach it to the first food item. This is 100% invisible to the user.
    const processedItems = items.map((it, idx) => ({
      ...it,
      special_instructions: idx === 0 ? `${it.special_instructions || ''} [Note: ${special_notes || ''}]`.trim() : it.special_instructions
    }));

    // Perform the order WITHOUT the offending field
    const res = await fetch(`${hostingerUrl}/api/v2/restaurant/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        table_id, 
        items: processedItems, 
        order_source, 
        status: 'pending_waiter' 
      })
    });

    const data = await res.json();
    console.log("V2 Order Result:", data);

    if (!res.ok) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: data.error || "Backend logic failed" 
        }), {
            status: res.status, headers: { 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ 
        success: true, 
        order: data, 
        version: "v12-unstoppable-relay" 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err) {
    console.error("V2 Critical Fail:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
