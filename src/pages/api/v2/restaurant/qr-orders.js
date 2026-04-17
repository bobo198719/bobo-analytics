// ⚡ PROXY TO EXPRESS BACKEND FOR PERSISTENT STATE & WEBSOCKETS
const BACKEND_URL = process.env.NODE_ENV === 'production' 
    ? 'http://187.124.97.144:5000/api/v2/restaurant/qr-orders' 
    : 'http://127.0.0.1:5000/api/v2/restaurant/qr-orders';

export async function GET({ request, url }) {
    try {
        const response = await fetch(BACKEND_URL + url.search);
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ order: null }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function PATCH({ request }) {
    try {
        const body = await request.json();
        const response = await fetch(BACKEND_URL, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
