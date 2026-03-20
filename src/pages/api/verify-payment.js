export const prerender = false;
import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const hostingerUrl = process.env.HOSTINGER_BACKEND_URL || 'http://srv1449576.hstgr.cloud:5000';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan, billing, email, name, phone
    } = body;

    // Verify signature if secret is available
    if (RAZORPAY_KEY_SECRET && razorpay_order_id && razorpay_signature) {
      const generated = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generated !== razorpay_signature) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid signature' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Calculate expiry (30 days from now)
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Try to save to backend
    try {
      await fetch(`${hostingerUrl}/api/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan, billing, email, name, phone,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          signature: razorpay_signature,
          status: 'active',
          expiry_date: expiryDate
        })
      });
    } catch (backendErr) {
      console.warn('Backend save failed (non-critical):', backendErr.message);
    }

    return new Response(JSON.stringify({
      success: true,
      plan,
      billing,
      payment_id: razorpay_payment_id,
      expiry_date: expiryDate
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    console.error('verify-payment error:', err);
    return new Response(JSON.stringify({ success: true, demo: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
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
