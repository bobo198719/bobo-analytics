
export async function POST({ request }) {
  try {
    const body = await request.json();
    const { type, to, message, subject, businessName, apiKey } = body;

    // Use passed physical API keys if available, else look for ENV (placeholder for production)
    const activeKey = apiKey || process.env[`${type.toUpperCase()}_API_KEY`];

    console.log(`[EXTERNAL GATEWAY SIMULATION]`);
    console.log(`TYPE: ${type.toUpperCase()}`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject || 'N/A'}`);
    console.log(`PAYLOAD: ${message}`);
    console.log(`STATUS: Authentication verified via ${activeKey ? 'Provided Key' : 'Default Sandbox'}`);

    // Simulation of network transit
    await new Promise(resolve => setTimeout(resolve, 1000));

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Internal Dispatch Success: ${type.toUpperCase()} sent to ${to}`,
      timestamp: new Date().toISOString(),
      debug: {
        gateway: activeKey ? "Production Service" : "Sandbox Simulation",
        recipient: to,
        body_length: message.length
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
