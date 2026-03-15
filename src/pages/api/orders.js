import { connectToDatabase } from "../../lib/mongoose";
import Order from "../../models/Order";

export const prerender = false;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function ALL({ request }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { method } = request;
    await connectToDatabase();

    try {
        if (method === 'GET') {
            const orders = await Order.find().sort({ created_at: -1 });
            return new Response(JSON.stringify(orders), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'POST') {
            const body = await request.json();
            const orderId = `BOBO-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
            
            const newOrder = new Order({
                ...body,
                order_id: orderId,
                status: body.status || "pending",
                payment_status: body.payment_status || "pending"
            });

            await newOrder.save();
            return new Response(JSON.stringify({ success: true, order: newOrder }), {
                status: 201,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'PATCH') {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');
            if (!id) return new Response(JSON.stringify({ error: "Order ID required" }), { status:400 });

            const body = await request.json();
            const order = await Order.findOneAndUpdate(
                { order_id: id },
                { $set: body },
                { new: true }
            );

            return new Response(JSON.stringify({ success: true, order }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'DELETE') {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');
            if (!id) return new Response(JSON.stringify({ error: "Order ID required" }), { status:400 });

            await Order.deleteOne({ order_id: id });
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: corsHeaders
            });
        }

        return new Response("Method not allowed", { status: 405 });

    } catch (error) {
        console.error("Orders API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
