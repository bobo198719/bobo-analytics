export const prerender = false;

// Razorpay credentials — set in Vercel environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

const PLAN_PRICES = {
  starter: { monthly: 999, annual: 799 * 12 },
  growth:  { monthly: 1999, annual: 1599 * 12 },
  pro:     { monthly: 2999, annual: 2399 * 12 },
};

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { plan, billing = 'monthly', email, name, phone, amount: customAmount } = body;

    const planPrices = PLAN_PRICES[plan] || PLAN_PRICES.growth;
    const amount = customAmount || (billing === 'annual' ? planPrices.annual : planPrices.monthly);
    const amountPaise = amount * 100;

    // If no Razorpay secret, return demo order
    if (!RAZORPAY_KEY_SECRET || RAZORPAY_KEY_SECRET === '') {
      return new Response(JSON.stringify({
        razorpay_order_id: 'order_demo_' + Date.now(),
        amount: amountPaise,
        currency: 'INR',
        plan, billing, email, name,
        demo_mode: true
      }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Create real Razorpay order
    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        receipt: `receipt_${plan}_${Date.now()}`,
        notes: { plan, billing, email, name, phone }
      })
    });

    if (!rzpRes.ok) {
      const error = await rzpRes.text();
      throw new Error('Razorpay order creation failed: ' + error);
    }

    const order = await rzpRes.json();

    return new Response(JSON.stringify({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      plan, billing, email, name
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (err) {
    console.error('create-payment error:', err);
    return new Response(JSON.stringify({ 
      error: err.message,
      razorpay_order_id: 'order_fallback_' + Date.now(),
      demo_mode: true
    }), {
      status: 200, // Return 200 so frontend continues in demo mode
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
