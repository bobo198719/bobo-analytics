export async function GET() {
  return new Response(
    JSON.stringify({
      message: "Bobo Analytics AI API is running ✅",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST({ request }) {
  try {
    const { message } = await request.json();

    // TEMP AI RESPONSE (no external AI yet)
    const reply = `AI Assistant: You asked -> "${message}"`;

    return new Response(
      JSON.stringify({ reply }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ reply: "Error processing request." }),
      { status: 500 }
    );
  }
}
