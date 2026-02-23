export default async function handler(req, res) {

  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {

    const { message } = req.body;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are Bobo Analytics AI sales assistant. Help users understand analytics software, explain services, and guide them to request a demo."
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

    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "AI unavailable."
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Server error. Try again." });
  }
}
