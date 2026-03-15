import { getDb } from "../../lib/db";

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
    const db = await getDb();
    const collection = db.collection('products');

    try {
        if (method === 'GET') {
            const products = await collection.find({}).toArray();
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

            // Use updateOne with upsert:true to handle both new and existing products correctly
            await collection.updateOne(
                { id: productId },
                { $set: productData },
                { upsert: true }
            );

            return new Response(JSON.stringify({ success: true, product: productData }), {
                status: body.id ? 200 : 201,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'DELETE') {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');

            if (!id) return new Response(JSON.stringify({ error: "Product ID required" }), { status:400 });

            // deleteOne is now supported in our lib/db.js mock and real MongoDB
            await collection.deleteOne({ id: id });
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
