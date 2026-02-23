export async function POST({ request }) {
  try {
    const { message } = await request.json();

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are Bobo Analytics AI sales assistant. Help visitors understand analytics software and guide them to request a demo."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    return new Response(
      JSON.stringify({
        reply:
          data?.choices?.[0]?.message?.content ||
          "AI temporarily unavailable."
      }),
      { status: 200 }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ reply: "Server error." }),
      { status: 500 }
    );
  }
}
