import { getDb } from "../../lib/db";

export const prerender = false;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function ALL({ request }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { method } = request;
    const db = await getDb();
    const collection = db.collection('orders');

    try {
        if (method === 'GET') {
            const orders = await collection.find({}).toArray();
            // Sort by newest first (descending by created_at or _id)
            orders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            return new Response(JSON.stringify(orders), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'POST') {
            const body = await request.json();
            
            // Validate basic data
            if (!body.customer) {
                return new Response(JSON.stringify({ error: "Customer name required" }), { status: 400 });
            }

            // Generate BOBO-ORD-XXXXXX ID
            const orderId = body.id || `BOBO-ORD-${Math.floor(1000000 + Math.random() * 9000000)}`;
            
            const newOrder = {
                ...body,
                id: orderId,
                order_id: orderId, // requested field
                created_at: new Date().toISOString(),
                is_locked: true,
                status: body.status || 'Order Received',
                payment_status: body.payment_status || 'Pending'
            };

            await collection.insertOne(newOrder);
            return new Response(JSON.stringify({ success: true, order: newOrder }), {
                status: 201,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'PATCH') {
            const body = await request.json();
            const { id, ...updates } = body;
            
            if (!id) return new Response(JSON.stringify({ error: "Order ID required" }), { status:400 });

            await collection.updateOne({ id: id }, { $set: updates });
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: corsHeaders
            });
        }

        if (method === 'DELETE') {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');

            if (!id) return new Response(JSON.stringify({ error: "Order ID required" }), { status:400 });

            await collection.deleteOne({ id: id });
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: corsHeaders
            });
        }

        return new Response("Method not allowed", { status: 405 });

    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
