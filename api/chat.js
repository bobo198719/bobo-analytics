export const config = {
  runtime: "edge",
};

export default async function handler(req) {

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ message: "Only POST allowed" }),
      { status: 405 }
    );
  }

  const { message } = await req.json();

  try {

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
                "You are Bobo Analytics AI sales assistant. Help visitors understand analytics software and guide them to request a demo politely.",
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return new Response(
      JSON.stringify({
        reply: data.choices?.[0]?.message?.content || "AI error",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({ reply: "AI temporarily unavailable." }),
      { status: 500 }
    );

  }
}
