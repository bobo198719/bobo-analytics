import { connectToDatabase } from "../../lib/mongoose";
import Product from "../../models/Product";

export const prerender = false;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
            const products = await Product.find().sort({ created_at: -1 });
            return new Response(JSON.stringify(products), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'POST') {
            const body = await request.json();
            
            // Generate a unique ID if not provided
            const productId = body.id || `P-${Math.floor(100000 + Math.random() * 900000)}`;
            
            const productData = {
                ...body,
                id: productId,
                updated_at: new Date().toISOString(),
                status: body.status || 'approved'
            };

            // Use findOneAndUpdate for upsert
            const product = await Product.findOneAndUpdate(
                { id: productId },
                { $set: productData },
                { upsert: true, new: true }
            );

            return new Response(JSON.stringify({ success: true, product }), {
                status: body.id ? 200 : 201,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'DELETE') {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');

            if (!id) return new Response(JSON.stringify({ error: "Product ID required" }), { status:400 });

            await Product.deleteOne({ id: id });
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: corsHeaders
            });
        }

        return new Response("Method not allowed", { status: 405 });

    } catch (error) {
        console.error("Products API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
