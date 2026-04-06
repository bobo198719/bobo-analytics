export async function POST({ request }) {
    try {
        const body = await request.json();
        const { tenantId, action, feature } = body;

        // Mock database logic for locking features by plan
        const plans = {
            'bobo_free': { tier: 'free', max_orders: 100, hardware_printing: false, kds_sync: false },
            'bobo_pro': { tier: 'pro', max_orders: 5000, hardware_printing: true, kds_sync: true },
            'bobo_enterprise': { tier: 'enterprise', max_orders: 999999, hardware_printing: true, kds_sync: true }
        };

        // Determine plan (defaulting to pro for this demo payload)
        const currentPlan = "bobo_enterprise"; 
        const planDetails = plans[currentPlan];

        if (action === "check_hardware") {
            if (!planDetails.hardware_printing) {
                return new Response(JSON.stringify({ 
                    allowed: false, 
                    error: "Hardware Printing is locked on the Free Tier. Upgrade to Pro." 
                }), { status: 403 });
            }
            return new Response(JSON.stringify({ allowed: true }), { status: 200 });
        }

        return new Response(JSON.stringify({ plan: currentPlan, limits: planDetails }), { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
